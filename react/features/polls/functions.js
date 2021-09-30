// @flow

/**
 * Should poll results be shown.
 *
 * @param {Object} state - Global state.
 * @param {string} id - Id of the poll.
 * @returns {boolean} Should poll results be shown.
 */
export const shouldShowResults = (state: Object, id: string) => Boolean(state['features/polls']?.polls[id].showResults);


/**
 * Selector for calculating the number of unread poll messages.
 *
 * @param {Object} state - The redux state.
 * @returns {number} The number of unread messages.
 */
export function getUnreadPollCount(state: Object) {
    const { nbUnreadPolls } = state['features/polls'];

    return nbUnreadPolls;
}

/**
 * Get whether the polls moderation is enabled or not.
 *
 * @param {Object} state - The redux state.
 * @returns {boolean} The enabled flag.
 */
export function isPollsModerationEnabled(state: Object) {
    const enablePollsModeration = state['features/base/config']?.enablePollsModeration === true;

    return enablePollsModeration;
}
