// @flow

import { toState } from '../base/redux';

declare var APP: Object;

/**
 * Determines whether the {@code WelcomePage} is enabled by the user either
 * herself or through her deployment configuration.
 *
 * @param {Function|Object} stateful - The redux state or {@link getState}
 * function.
 * @returns {boolean} If the {@code WelcomePage} is enabled by the user, then
 * {@code true}; otherwise, {@code false}.
 */
export function isWelcomePageEnabled(stateful: Function | Object) {
    return (
        typeof APP === 'undefined'
            ? true
            : toState(stateful)['features/base/config'].enableWelcomePage);
}


