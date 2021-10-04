// @flow

/**
 * The type of the action which signals that a new Poll was received.
 *
 * {
 *     type: RECEIVE_POLL,
 *     poll: Poll,
 *     pollId: string,
 *     notify: boolean
 * }
 *
 */
export const RECEIVE_POLL = 'RECEIVE_POLL';

/**
 * The type of the action which signals that new were received.
 *
 * {
 *     type: RECEIVE_POLLS,
 *     polls: Object,
 *     notify: boolean
 * }
 *
 */
export const RECEIVE_POLLS = 'RECEIVE_POLLS';

/**
 * The type of the action which signals that a Poll was hided.
 *
 * {
 *     type: HIDE_POLL,
 *     pollId: string
 * }
 *
 */
export const HIDE_POLL = 'HIDE_POLL';

/**
 * The type of the action which signals that a Poll was shown.
 *
 * {
 *     type: SHOW_POLL,
 *     pollId: string
 * }
 *
 */
export const SHOW_POLL = 'SHOW_POLL';

/**
 * The type of the action which signals that a new Answer was received.
 *
 * {
 *     type: RECEIVE_ANSWER,
 *     answer: Answer,
 *     pollId: string,
 * }
 */
export const RECEIVE_ANSWER = 'RECEIVE_ANSWER';

/**
 * The type of the action which registers a vote.
 *
 * {
 *     type: REGISTER_VOTE,
 *     answers: Array<boolean> | null,
 *     pollId: string
 * }
 */
export const REGISTER_VOTE = 'REGISTER_VOTE';

/**
 * The type of the action which retracts a vote.
 *
 * {
 *     type: RETRACT_VOTE,
 *     pollId: string,
 * }
 */
export const RETRACT_VOTE = 'RETRACT_VOTE';

/**
 * The type of the action triggered when the poll tab in chat pane is closed
 *
 * {
 *     type: RESET_NB_UNREAD_POLLS,
 * }
 */
export const RESET_NB_UNREAD_POLLS = 'RESET_NB_UNREAD_POLLS';
