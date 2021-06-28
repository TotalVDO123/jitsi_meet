// @flow

import { CLEAR_REACTIONS_MESSAGE, SET_REACTIONS_MESSAGE, SET_REACTION_QUEUE } from './actionTypes';
import { type ReactionEmojiProps } from './functions.any';

/**
 * Sets the reaction queue.
 *
 * @param {Array} value - The new queue.
 * @returns {Function}
 */
function setReactionQueue(value: Array<ReactionEmojiProps>) {
    return {
        type: SET_REACTION_QUEUE,
        value
    };
}

/**
 * Appends the reactions message to the chat and resets the state.
 *
 * @returns {void}
 */
export function flushReactionsToChat() {
    return {
        type: CLEAR_REACTIONS_MESSAGE
    };
}

/**
 * Adds a new reaction to the reactions message.
 *
 * @param {boolean} value - The new reaction.
 * @returns {Function}
 */
export function addReactionsMessage(value: string) {
    return {
        type: SET_REACTIONS_MESSAGE,
        reaction: value
    };
}

/**
 * Adds a reaction to the end of the queue.
 *
 * @param {Object} store - The redux store.
 * @param {string} reaction - Reaction to be added to queue.
 * @returns {void}
 */
export function pushReaction(store: Object, reaction: string) {
    const queue = store.getState()['features/toolbox'].reactions.queue;

    store.dispatch(setReactionQueue([ ...queue, {
        reaction,
        uid: window.Date.now()
    } ]));
}

/**
 * Removes a reaction from the queue.
 *
 * @param {number} uid - Id of the reaction to be removed.
 * @returns {void}
 */
export function removeReaction(uid: number) {
    return (dispatch: Function, getState: Function) => {
        const queue = getState()['features/toolbox'].reactions.queue;

        dispatch(setReactionQueue(queue.filter(reaction => reaction.uid !== uid)));
    };
}
