import {
    CLEAR_DEVICE_ERRORS,
    MEDIA_PERMISSION_PROMPT_VISIBILITY_CHANGED,
    SUSPEND_DETECTED
} from './actionTypes';

/**
 * Signals to remove cached device errors from the store.
 *
 * @returns {{
 *     type: CLEAR_DEVICE_ERRORS
 * }}
 * @public
 */
export function clearDeviceErrors() {
    return {
        type: CLEAR_DEVICE_ERRORS
    };
}

/**
 * Signals that the prompt for media permission is visible or not.
 *
 * @param {boolean} isVisible - If the value is true - the prompt for media
 * permission is visible otherwise the value is false/undefined.
 * @param {string} browser - The name of the current browser.
 * @returns {{
 *     type: MEDIA_PERMISSION_PROMPT_VISIBILITY_CHANGED,
 *     browser: {string},
 *     isVisible: {boolean}
 * }}
 * @public
 */
export function mediaPermissionPromptVisibilityChanged(isVisible, browser) {
    return {
        type: MEDIA_PERMISSION_PROMPT_VISIBILITY_CHANGED,
        browser,
        isVisible
    };
}

/**
 * Signals that suspend was detected.
 *
 * @returns {{
 *     type: SUSPEND_DETECTED
 * }}
 * @public
 */
export function suspendDetected() {
    return {
        type: SUSPEND_DETECTED
    };
}
