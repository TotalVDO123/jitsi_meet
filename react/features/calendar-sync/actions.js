// @flow

import { loadGoogleAPI } from '../google-api';

import {
    CLEAR_CALENDAR_INTEGRATION,
    REFRESH_CALENDAR,
    SET_CALENDAR_AUTH_STATE,
    SET_CALENDAR_AUTHORIZATION,
    SET_CALENDAR_EVENTS,
    SET_CALENDAR_INTEGRATION,
    SET_CALENDAR_PROFILE_EMAIL
} from './actionTypes';
import { _getCalendarIntegration, isCalendarEnabled } from './functions';

const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 * Sets the initial state of calendar integration by loading third party APIs
 * and filling out any data that needs to be fetched.
 *
 * @returns {Function}
 */
export function bootstrapCalendarIntegration(): Function {
    return (dispatch, getState) => {
        const {
            googleApiApplicationClientID
        } = getState()['features/base/config'];
        const {
            integration,
            integrationType
        } = getState()['features/calendar-sync'];

        if (!isCalendarEnabled()) {
            return Promise.reject();
        }

        return Promise.resolve()
            .then(() => {
                if (googleApiApplicationClientID) {
                    return dispatch(
                        loadGoogleAPI(googleApiApplicationClientID));
                }
            })
            .then(() => {
                if (!integrationType || integration) {
                    return;
                }

                const integrationToLoad
                    = _getCalendarIntegration(integrationType);

                if (!integrationToLoad) {
                    dispatch(clearCalendarIntegration());

                    return;
                }

                return dispatch(integrationToLoad._isSignedIn())
                    .then(signedIn => {
                        if (signedIn) {
                            dispatch(setIntegration(integrationType));
                            dispatch(updateProfile(integrationType));
                        } else {
                            dispatch(clearCalendarIntegration());
                        }
                    });
            });
    };
}

/**
 * Resets the state of calendar integration so stored events and selected
 * calendar type are cleared.
 *
 * @returns {{
 *     type: CLEAR_CALENDAR_INTEGRATION
 * }}
 */
export function clearCalendarIntegration() {
    return {
        type: CLEAR_CALENDAR_INTEGRATION
    };
}

/**
 * Sends an action to refresh the entry list (fetches new data).
 *
 * @param {boolean} forcePermission - Whether to force to re-ask for
 * the permission or not.
 * @param {boolean} isInteractive - If true this refresh was caused by
 * direct user interaction, false otherwise.
 * @returns {{
 *     type: REFRESH_CALENDAR,
 *     forcePermission: boolean,
 *     isInteractive: boolean
 * }}
 */
export function refreshCalendar(
        forcePermission: boolean = false, isInteractive: boolean = true) {
    return {
        type: REFRESH_CALENDAR,
        forcePermission,
        isInteractive
    };
}

/**
 * Sends an action to update the current calendar api auth state in redux.
 * This is used only for microsoft implementation to store it auth state.
 *
 * @param {number} newState - The new state.
 * @returns {{
 *     type: SET_CALENDAR_AUTH_STATE,
 *     msAuthState: Object
 * }}
 */
export function setCalendarAPIAuthState(newState: ?Object) {
    return {
        type: SET_CALENDAR_AUTH_STATE,
        msAuthState: newState
    };
}

/**
 * Sends an action to signal that a calendar access has been requested. For more
 * info, see {@link SET_CALENDAR_AUTHORIZATION}.
 *
 * @param {string | undefined} authorization - The result of the last calendar
 * authorization request.
 * @returns {{
 *     type: SET_CALENDAR_AUTHORIZATION,
 *     authorization: ?string
 * }}
 */
export function setCalendarAuthorization(authorization: ?string) {
    return {
        type: SET_CALENDAR_AUTHORIZATION,
        authorization
    };
}

/**
 * Sends an action to update the current calendar list in redux.
 *
 * @param {Array<Object>} events - The new list.
 * @returns {{
 *     type: SET_CALENDAR_EVENTS,
 *     events: Array<Object>
 * }}
 */
export function setCalendarEvents(events: Array<Object>) {
    return {
        type: SET_CALENDAR_EVENTS,
        events
    };
}

/**
 * Sends an action to update the current calendar profile email state in redux.
 *
 * @param {number} newEmail - The new email.
 * @returns {{
 *     type: SET_CALENDAR_PROFILE_EMAIL,
 *     email: Object
 * }}
 */
export function setCalendarProfileEmail(newEmail: ?string) {
    return {
        type: SET_CALENDAR_PROFILE_EMAIL,
        email: newEmail
    };
}

/**
 * Sets the calendar integration type to be used by web.
 *
 * @param {string|undefined} calendarType - The calendar type.
 * @returns {Function}
 */
export function setIntegration(calendarType: string): Function {
    return (dispatch: Dispatch<*>) => {
        const integration = _getCalendarIntegration(calendarType);

        return dispatch({
            type: SET_CALENDAR_INTEGRATION,
            integration,
            integrationType: calendarType
        });
    };
}

/**
 * Signals signing in to the specified calendar integration.
 *
 * @param {string} calendarType - The calendar integration which should be
 * signed into.
 * @returns {Function}
 */
export function signIn(calendarType: string): Function {
    return (dispatch: Dispatch<*>) => {
        const integration = _getCalendarIntegration(calendarType);

        if (!integration) {
            return Promise.reject('No supported integration found');
        }

        return dispatch(integration.load())
            .then(() => dispatch(integration.signIn()))
            .then(() => dispatch(setIntegration(calendarType)))
            .then(() => dispatch(updateProfile(calendarType)))
            .catch(error => {
                logger.error(
                    'Error occurred while signing into calendar integration',
                    error);

                return Promise.reject(error);
            });
    };
}


/**
 * Signals signing out of the current calendar integration and resetting the
 * calendar state.
 *
 * @returns {Function}
 */
export function signOut(): Function {
    return (dispatch: Dispatch<*>, getState: Function) => {
        const { integration } = getState()['features/calendar-sync'];

        const signOutPromise = integration
            ? dispatch(integration.signOut()) : Promise.resolve();

        return signOutPromise
            .then(() => dispatch(clearCalendarIntegration()))
            .catch(error => {
                logger.error(
                    'Error occurred while signing out of calendar integration',
                    error);

                return Promise.reject(error);
            });
    };
}

/**
 * Signals to get current profile data linked to the current calendar
 * integration that is in use.
 *
 * @param {string} calendarType - The calendar integration to which the profile
 * should be updated.
 * @returns {Function}
 */
export function updateProfile(calendarType: string): Function {
    return (dispatch: Dispatch<*>) => {
        const integration = _getCalendarIntegration(calendarType);

        if (!integration) {
            return Promise.reject('No integration found');
        }

        return dispatch(integration.updateProfile())
            .then(email => {
                dispatch(setCalendarProfileEmail(email));
            });
    };
}
