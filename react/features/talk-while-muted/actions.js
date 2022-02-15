// @flow

import { SET_CURRENT_NOTIFICATION_UID } from './actionTypes.ts';

/**
 * Sets UID of the the pending notification to use it when hiding
 * the notification is necessary, or unsets it when undefined (or no param) is
 * passed.
 *
 * @param {?number} uid - The UID of the notification.
 * @returns {{
 *     type: SET_CURRENT_NOTIFICATION_UID,
 *     uid: number
 * }}
 */
export function setCurrentNotificationUid(uid: ?number) {
    return {
        type: SET_CURRENT_NOTIFICATION_UID,
        uid
    };
}
