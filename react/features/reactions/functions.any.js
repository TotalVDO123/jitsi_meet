// @flow

import { getLocalParticipant } from '../base/participants';
import { extractFqnFromPath } from '../dynamic-branding/functions';

import { REACTIONS } from './constants';
import logger from './logger';

/**
 * Returns the queue of reactions.
 *
 * @param {Object} state - The state of the application.
 * @returns {boolean}
 */
export function getReactionsQueue(state: Object) {
    return state['features/reactions'].queue;
}

/**
 * Returns reaction key from the reaction message.
 *
 * @param {string} message - The reaction message.
 * @returns {string}
 */
export function getReactionKeyByMessage(message: string) {
    return Object.keys(REACTIONS).filter(key => REACTIONS[key].message === `:${message}:`)[0];
}

/**
 * Gets reactions key array from concatenated message.
 *
 * @param {string} message - The reaction message.
 * @returns {Array}
 */
export function messageToKeyArray(message: string) {
    let formattedMessage = message.replace(/::/g, '-');

    formattedMessage = formattedMessage.replace(/:/g, '');
    const messageArray = formattedMessage.split('-');

    return messageArray.map(reactionMessage => getReactionKeyByMessage(reactionMessage));
}

/**
 * Sends reactions to the backend.
 *
 * @param {Object} state - The redux state object.
 * @param {Array} reactions - Reactions array to be sent.
 * @returns {void}
 */
export async function sendReactionsWebhook(state: Object, reactions: Array<string>) {
    const url = state['features/base/config'].reactionsWebhookUrl;
    const conference = state['features/base/conference'].conference;
    const jwt = state['features/base/jwt'].jwt;
    const locationURL = state['features/base/connection'].locationURL;
    const localParticipant = getLocalParticipant(state);

    const headers = {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
    };


    const reqBody = {
        meetingFqn: extractFqnFromPath(locationURL.pathname),
        sessionId: conference.sessionId,
        submitted: Date.now(),
        reactions,
        participantId: localParticipant.id,
        participantName: localParticipant.name
    };

    if (url) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(reqBody)
            });

            if (!res.ok) {
                logger.error('Status error:', res.status);
            }
        } catch (err) {
            logger.error('Could not send request', err);
        }
    }
}
