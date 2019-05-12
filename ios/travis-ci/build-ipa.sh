#!/bin/bash
set -e

# The script is based on tutorial written by Antonis Tsakiridis published at:
# https://medium.com/@atsakiridis/continuous-deployment-for-ios-using-travis-ci-55dcea342d9
#
# It is intended to be executed through the Travis CI REST API call, as it
# requires few arguments which are mandatory with no default values provided:
# PR_REPO_SLUG - the Github name of the repo to be merged into the origin/master
# PR_BRANCH - the branch to be merged, if set to "master" no merge will happen
# IPA_DEPLOY_LOCATION - the location understandable by the "scp" command
# executed at the end of the script to deploy the output .ipa file
# LIB_JITSI_MEET_PKG (optional) - the npm package for lib-jitsi-meet which will
# be put in place of the current version in the package.json file.
#
# Other than that the script requires the following env variables to be set
# (reading the tutorial mentioned above will help in understanding the
# variables):
#
# APPLE_CERT_URL - the URL pointing to Apple certificate (set to
# http://developer.apple.com/certificationauthority/AppleWWDRCA.cer by default)
# DEPLOY_SSH_CERT_URL - the SSH private key used by the 'scp' command to deploy
# the .ipa. It is expected to be encrypted with the $ENCRYPTION_PASSWORD.
# ENCRYPTION_PASSWORD - the password used to decrypt certificate/key files used
# in the script.
# IOS_DEV_CERT_KEY_URL - URL pointing to provisioning profile certificate key
# file (development-key.p12.enc from the tutorial) encrypted with the
# $ENCRYPTION_PASSWORD.
# IOS_DEV_CERT_URL - URL pointing to provisioning profile certificate file
# (development-cert.cer.enc from the tutorial) encrypted with the
# $ENCRYPTION_PASSWORD.
# IOS_DEV_PROV_PROFILE_URL - URL pointing to provisioning profile file
# (profile-development-olympus.mobileprovision.enc from the tutorial) encrypted
# with the $ENCRYPTION_PASSWORD.
# IOS_SIGNING_CERT_PASSWORD - the password to the provisioning profile
# certificate key (used to open development-key.p12 from the tutorial).
# IOS_TEAM_ID - the team ID inserted into build-ipa-.plist.template file in
# place of "YOUR_TEAM_ID".

# Travis will not print the last echo if there's no sleep 1
function echoSleepAndExit1() {
    echo $1
    sleep 1
    exit 1
}

echo "TRAVIS_BRANCH=${TRAVIS_BRANCH}"
echo "TRAVIS_REPO_SLUG=${TRAVIS_REPO_SLUG}"

if [ -z $PR_REPO_SLUG ]; then
    echoSleepAndExit1 "No PR_REPO_SLUG defined"
fi
if [ -z $PR_BRANCH ]; then
    echoSleepAndExit1 "No PR_BRANCH defined"
fi
if [ -z $IPA_DEPLOY_LOCATION ]; then
    echoSleepAndExit1 "No IPA_DEPLOY_LOCATION defined"
fi

if [ -z $APPLE_CERT_URL ]; then
    APPLE_CERT_URL="http://developer.apple.com/certificationauthority/AppleWWDRCA.cer"
fi

echo "PR_REPO_SLUG=${PR_REPO_SLUG} PR_BRANCH=${PR_BRANCH}"

# do the marge and git log

if [ $PR_BRANCH != "master" ]; then
    echo "Will merge ${PR_REPO_SLUG}/${PR_BRANCH} into master"
    git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
    git fetch origin master
    git checkout master
    git pull https://github.com/${PR_REPO_SLUG}.git $PR_BRANCH --no-edit
fi

# Link this lib-jitsi-meet checkout in jitsi-meet through the package.json
if [ ! -z ${LIB_JITSI_MEET_PKG} ];
then
    echo "Adjusting lib-jitsi-meet package in package.json to ${LIB_JITSI_MEET_PKG}"
    # escape for the sed
    LIB_JITSI_MEET_PKG=$(echo $LIB_JITSI_MEET_PKG | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
    sed -i.bak -e "s/\"lib-jitsi-meet.*/\"lib-jitsi-meet\"\: \"${LIB_JITSI_MEET_PKG}\",/g" package.json
    echo "Package.json lib-jitsi-meet line:"
    grep lib-jitsi-meet package.json
else
    echo "LIB_JITSI_MEET_PKG var not set - will not modify the package.json"
fi

git log -20 --graph --pretty=format':%C(yellow)%h%Cblue%d%Creset %s %C(white) %an, %ar%Creset'

# certificates

CERT_DIR="ios/travis-ci/certs"

mkdir $CERT_DIR

curl -L -o ${CERT_DIR}/AppleWWDRCA.cer 'http://developer.apple.com/certificationauthority/AppleWWDRCA.cer'
curl -L -o ${CERT_DIR}/dev-cert.cer.enc ${IOS_DEV_CERT_URL}
curl -L -o ${CERT_DIR}/dev-key.p12.enc ${IOS_DEV_CERT_KEY_URL}
curl -L -o ${CERT_DIR}/dev-profile.mobileprovision.enc ${IOS_DEV_PROV_PROFILE_URL}
curl -L -o ${CERT_DIR}/dev-watch-profile.mobileprovision.enc ${IOS_DEV_WATCH_PROV_PROFILE_URL}
curl -L -o ${CERT_DIR}/id_rsa.enc ${DEPLOY_SSH_CERT_URL}

openssl aes-256-cbc -k "$ENCRYPTION_PASSWORD" -in ${CERT_DIR}/dev-cert.cer.enc -d -a -out ${CERT_DIR}/dev-cert.cer
openssl aes-256-cbc -k "$ENCRYPTION_PASSWORD" -in ${CERT_DIR}/dev-key.p12.enc -d -a -out ${CERT_DIR}/dev-key.p12
openssl aes-256-cbc -k "$ENCRYPTION_PASSWORD" -in ${CERT_DIR}/dev-profile.mobileprovision.enc -d -a -out ${CERT_DIR}/dev-profile.mobileprovision
openssl aes-256-cbc -k "$ENCRYPTION_PASSWORD" -in ${CERT_DIR}/dev-watch-profile.mobileprovision.enc -d -a -out ${CERT_DIR}/dev-watch-profile.mobileprovision
openssl aes-256-cbc -k "$ENCRYPTION_PASSWORD" -in ${CERT_DIR}/id_rsa.enc -d -a -out ${CERT_DIR}/id_rsa
chmod 0600 ${CERT_DIR}/id_rsa

security create-keychain -p $ENCRYPTION_PASSWORD ios-build.keychain
security default-keychain -s ios-build.keychain
security unlock-keychain -p $ENCRYPTION_PASSWORD ios-build.keychain
security set-keychain-settings -t 3600 -l ~/Library/Keychains/ios-build.keychain

echo "importing Apple cert"
security import ${CERT_DIR}/AppleWWDRCA.cer -k ios-build.keychain -A
echo "importing dev-cert.cer"
security import ${CERT_DIR}/dev-cert.cer -k ios-build.keychain -A
echo "importing dev-key.p12"
security import ${CERT_DIR}/dev-key.p12 -k ios-build.keychain -P $IOS_SIGNING_CERT_PASSWORD -A

echo "will set-key-partition-list"
# Fix for OS X Sierra that hungs in the codesign step
security set-key-partition-list -S apple-tool:,apple: -s -k $ENCRYPTION_PASSWORD ios-build.keychain > /dev/null
echo "done set-key-partition-list"

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

cp "${CERT_DIR}/dev-profile.mobileprovision"  ~/Library/MobileDevice/Provisioning\ Profiles/
cp "${CERT_DIR}/dev-watch-profile.mobileprovision"  ~/Library/MobileDevice/Provisioning\ Profiles/

npm install

# Ever since the Apple Watch app has been added the bitcode for WebRTC needs to be downloaded in order to build successfully
./node_modules/react-native-webrtc/tools/downloadBitcode.sh

cd ios
pod update
pod install
cd ..

mkdir -p /tmp/jitsi-meet/

xcodebuild archive -quiet -workspace ios/jitsi-meet.xcworkspace -scheme jitsi-meet -configuration Release -archivePath /tmp/jitsi-meet/jitsi-meet.xcarchive

sed -e "s/YOUR_TEAM_ID/${IOS_TEAM_ID}/g" ios/travis-ci/build-ipa.plist.template > ios/travis-ci/build-ipa.plist

IPA_EXPORT_DIR=/tmp/jitsi-meet/jitsi-meet-ipa

xcodebuild -quiet -exportArchive -archivePath /tmp/jitsi-meet/jitsi-meet.xcarchive -exportPath $IPA_EXPORT_DIR  -exportOptionsPlist ios/travis-ci/build-ipa.plist

echo "Will try deploy the .ipa to: ${IPA_DEPLOY_LOCATION}"

scp -i ${CERT_DIR}/id_rsa -o StrictHostKeyChecking=no -o LogLevel=DEBUG "${IPA_EXPORT_DIR}/jitsi-meet.ipa" "${IPA_DEPLOY_LOCATION}"
