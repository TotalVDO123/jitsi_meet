-- Token authentication
-- Copyright (C) 2015 Atlassian

local basexx = require "basexx";
local have_async, async = pcall(require, "util.async");
local hex = require "util.hex";
local jwt = require "luajwtjitsi";
local jid = require "util.jid";
local json_safe = require "cjson.safe";
local path = require "util.paths";
local sha256 = require "util.hashes".sha256;
local main_util = module:require "util";
local http_get_with_retry = main_util.http_get_with_retry;
local extract_subdomain = main_util.extract_subdomain;

local nr_retries = 3;

-- TODO: Figure out a less arbitrary default cache size.
local cacheSize = module:get_option_number("jwt_pubkey_cache_size", 128);

local Util = {}
Util.__index = Util

--- Constructs util class for token verifications.
-- Constructor that uses the passed module to extract all the
-- needed configurations.
-- If confuguration is missing returns nil
-- @param module the module in which options to check for configs.
-- @return the new instance or nil
function Util.new(module)
    local self = setmetatable({}, Util)

    self.appId = module:get_option_string("app_id");
    self.appSecret = module:get_option_string("app_secret");
    self.asapKeyServer = module:get_option_string("asap_key_server");
    self.signatureAlgorithm = module:get_option_string("signature_algorithm");
    self.allowEmptyToken = module:get_option_boolean("allow_empty_token");

    self.cache = require"util.cache".new(cacheSize);

    --[[
        Multidomain can be supported in some deployments. In these deployments
        there is a virtual conference muc, which address contains the subdomain
        to use. Those deployments are accessible
        by URL https://domain/subdomain.
        Then the address of the room will be:
        roomName@conference.subdomain.domain. This is like a virtual address
        where there is only one muc configured by default with address:
        conference.domain and the actual presentation of the room in that muc
        component is [subdomain]roomName@conference.domain.
        These setups relay on configuration 'muc_domain_base' which holds
        the main domain and we use it to substract subdomains from the
        virtual addresses.
        The following confgurations are for multidomain setups and domain name
        verification:
     --]]

    -- optional parameter for custom muc component prefix,
    -- defaults to "conference"
    self.muc_domain_prefix = module:get_option_string(
        "muc_mapper_domain_prefix", "conference");
    -- domain base, which is the main domain used in the deployment,
    -- the main VirtualHost for the deployment
    self.muc_domain_base = module:get_option_string("muc_mapper_domain_base");
    -- The "real" MUC domain that we are proxying to
    if self.muc_domain_base then
        self.muc_domain = module:get_option_string(
            "muc_mapper_domain",
            self.muc_domain_prefix.."."..self.muc_domain_base);
    end
    -- whether domain name verification is enabled, by default it is disabled
    self.enableDomainVerification = module:get_option_boolean(
        "enable_domain_verification", false);

    if self.allowEmptyToken == true then
        module:log("warn", "WARNING - empty tokens allowed");
    end

    if self.appId == nil then
        module:log("error", "'app_id' must not be empty");
        return nil;
    end

    if self.appSecret == nil and self.asapKeyServer == nil then
        module:log("error", "'app_secret' or 'asap_key_server' must be specified");
        return nil;
    end

    if self.signatureAlgorithm == nil then
        module:log("error", "'signature_algorithm' must not be empty");
        return nil;
    end

    --array of accepted issuers: by default only includes our appId
    self.acceptedIssuers = module:get_option_array('asap_accepted_issuers',{self.appId})

    --array of accepted audiences: by default only includes our appId
    self.acceptedAudiences = module:get_option_array('asap_accepted_audiences',{'*'})

    self.requireRoomClaim = module:get_option_boolean('asap_require_room_claim', true);

    if self.asapKeyServer and not have_async then
        module:log("error", "requires a version of Prosody with util.async");
        return nil;
    end

    return self
end

function Util:set_asap_key_server(asapKeyServer)
    self.asapKeyServer = asapKeyServer;
end

function Util:set_asap_accepted_issuers(acceptedIssuers)
    self.acceptedIssuers = acceptedIssuers;
end

function Util:set_asap_accepted_audiences(acceptedAudiences)
    self.acceptedAudiences = acceptedAudiences;
end

function Util:set_asap_require_room_claim(checkRoom)
    self.requireRoomClaim = checkRoom;
end

function Util:clear_asap_cache()
    self.cache = require"util.cache".new(cacheSize);
end

--- Returns the public key by keyID
-- @param keyId the key ID to request
-- @return the public key (the content of requested resource) or nil
function Util:get_public_key(keyId)
    local content = self.cache:get(keyId);
    if content == nil then
        -- If the key is not found in the cache.
        module:log("debug", "Cache miss for key: %s", keyId);
        local keyurl = path.join(self.asapKeyServer, hex.to(sha256(keyId))..'.pem');
        module:log("debug", "Fetching public key from: %s", keyurl);
        content = http_get_with_retry(keyurl, nr_retries);
        if content ~= nil then
            self.cache:set(keyId, content);
        end
        return content;
    else
        -- If the key is in the cache, use it.
        module:log("debug", "Cache hit for key: %s", keyId);
        return content;
    end
end

--- Verifies token and process needed values to be stored in the session.
-- Token is obtained from session.auth_token.
-- Stores in session the following values:
-- session.jitsi_meet_room - the room name value from the token
-- session.jitsi_meet_domain - the domain name value from the token
-- session.jitsi_meet_context_user - the user details from the token
-- session.jitsi_meet_context_group - the group value from the token
-- session.jitsi_meet_context_features - the features value from the token
-- @param session the current session
-- @param acceptedIssuers optional list of accepted issuers to check
-- @return false and error
function Util:process_and_verify_token(session, acceptedIssuers)
    if not acceptedIssuers then
        acceptedIssuers = self.acceptedIssuers;
    end

    if session.auth_token == nil then
        if self.allowEmptyToken then
            return true;
        else
            return false, "not-allowed", "token required";
        end
    end

    local key;
    if session.public_key then
        -- We're using an public key stored in the session
        module:log("debug","Public key was found on the session");
        key = session.public_key;
    elseif self.asapKeyServer and session.auth_token ~= nil then
        -- We're fetching an public key from an ASAP server
        local dotFirst = session.auth_token:find("%.");
        if not dotFirst then return nil, "Invalid token" end
        local header, err = json_safe.decode(basexx.from_url64(session.auth_token:sub(1,dotFirst-1)));
        if err then
            return false, "not-allowed", "bad token format";
        end
        local kid = header["kid"];
        if kid == nil then
            return false, "not-allowed", "'kid' claim is missing";
        end
        local alg = header["alg"];
        if alg == nil then
            return false, "not-allowed", "'alg' claim is missing";
        end
        if alg.sub(alg,1,2) ~= "RS" then
            return false, "not-allowed", "'kid' claim only support with RS family";
        end
        key = self:get_public_key(kid);
        if key == nil then
            return false, "not-allowed", "could not obtain public key";
        end
    elseif self.appSecret ~= nil then
        -- We're using a symmetric secret
        key = self.appSecret
    end

    if key == nil then
        return false, "not-allowed", "signature verification key is missing";
    end

    -- now verify the whole token
    local claims, msg = jwt.verify(
        session.auth_token,
        signatureAlgorithm,
        key,
        acceptedIssuers,
        self.acceptedAudiences
    )
    if claims ~= nil then
        if self.requireRoomClaim then
            local roomClaim = claims["room"];
            if roomClaim == nil then
                return false, "'room' claim is missing";
            end
        end

        -- Binds room name to the session which is later checked on MUC join
        session.jitsi_meet_room = claims["room"];
        -- Binds domain name to the session
        session.jitsi_meet_domain = claims["sub"];

        -- Binds the user details to the session if available
        if claims["context"] ~= nil then
          if claims["context"]["user"] ~= nil then
            session.jitsi_meet_context_user = claims["context"]["user"];
          end

          if claims["context"]["group"] ~= nil then
            -- Binds any group details to the session
            session.jitsi_meet_context_group = claims["context"]["group"];
          end

          if claims["context"]["features"] ~= nil then
            -- Binds any features details to the session
            session.jitsi_meet_context_features = claims["context"]["features"];
          end
          if claims["context"]["room"] ~= nil then
            session.jitsi_meet_context_room = claims["context"]["room"]
          end
        end
        return true;
    else
        return false, "not-allowed", msg;
    end
end

--- Verifies room name and domain if necesarry.
-- Checks configs and if necessary checks the room name extracted from
-- room_address against the one saved in the session when token was verified.
-- Also verifies domain name from token against the domain in the room_address,
-- if enableDomainVerification is enabled.
-- @param session the current session
-- @param room_address the whole room address as received
-- @return returns true in case room was verified or there is no need to verify
--         it and returns false in case verification was processed
--         and was not successful
function Util:verify_room(session, room_address)
    if self.allowEmptyToken and session.auth_token == nil then
        module:log(
            "debug",
            "Skipped room token verification - empty tokens are allowed");
        return true;
    end

    -- extract room name using all chars, except the not allowed ones
    local room,_,_ = jid.split(room_address);
    if room == nil then
        log("error",
            "Unable to get name of the MUC room ? to: %s", room_address);
        return true;
    end

    local auth_room = session.jitsi_meet_room;
    if auth_room then
        auth_room = string.lower(auth_room);
    end
    if not self.enableDomainVerification then
        -- if auth_room is missing, this means user is anonymous (no token for
        -- its domain) we let it through, jicofo is verifying creation domain
        if auth_room and room ~= auth_room and auth_room ~= '*' then
            return false;
        end

        return true;
    end

    local room_address_to_verify = jid.bare(room_address);
    local room_node = jid.node(room_address);
    -- parses bare room address, for multidomain expected format is:
    -- [subdomain]roomName@conference.domain
    local target_subdomain, target_room = extract_subdomain(room_node);

    -- if we have '*' as room name in token, this means all rooms are allowed
    -- so we will use the actual name of the room when constructing strings
    -- to verify subdomains and domains to simplify checks
    local room_to_check;
    if auth_room == '*' then
        -- authorized for accessing any room assign to room_to_check the actual
        -- room name
        if target_room ~= nil then
            -- we are in multidomain mode and we were able to extract room name
            room_to_check = target_room;
        else
            -- no target_room, room_address_to_verify does not contain subdomain
            -- so we get just the node which is the room name
            room_to_check = room_node;
        end
    else
        -- no wildcard, so check room against authorized room from the token
        if session.jitsi_meet_context_room and (session.jitsi_meet_context_room["regex"] == true or session.jitsi_meet_context_room["regex"] == "true") then
            if target_room ~= nil then
                -- room with subdomain
                room_to_check = target_room:match(auth_room);
            else
                room_to_check = room_node:match(auth_room);
            end
        else
            -- not a regex
            room_to_check = auth_room;
        end
        module:log("debug", "room to check: %s", room_to_check)
        if not room_to_check then
            return false
        end
    end

    local auth_domain = string.lower(session.jitsi_meet_domain);
    local subdomain_to_check;
    if target_subdomain then
        if auth_domain == '*' then
            -- check for wildcard in JWT claim, allow access if found
            subdomain_to_check = target_subdomain;
        else
            -- no wildcard in JWT claim, so check subdomain against sub in token
            subdomain_to_check = auth_domain;
        end
        -- from this point we depend on muc_domain_base,
        -- deny access if option is missing
        if not self.muc_domain_base then
            module:log("warn", "No 'muc_domain_base' option set, denying access!");
            return false;
        end

        return room_address_to_verify == jid.join(
            "["..subdomain_to_check.."]"..room_to_check, self.muc_domain);
    else
        if auth_domain == '*' then
            -- check for wildcard in JWT claim, allow access if found
            subdomain_to_check = self.muc_domain;
        else
            -- no wildcard in JWT claim, so check subdomain against sub in token
            subdomain_to_check = self.muc_domain_prefix.."."..auth_domain;
        end
        -- we do not have a domain part (multidomain is not enabled)
        -- verify with info from the token
        return room_address_to_verify == jid.join(room_to_check, subdomain_to_check);
    end
end

return Util;
