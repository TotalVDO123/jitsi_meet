// @flow

import { createScreenshotCaptureEffect } from '../stream-effects/screenshot-capture';
import { getLocalVideoTrack } from '../../features/base/tracks';

import { SET_SCREENSHOT_CAPTURE } from './actionTypes';

/**
 * Marks the on-off state of screenshot captures.
 *
 * @param {boolean} enabled - Whether to turn screen captures on or off.
 * @returns {{
    *      type: START_SCREENSHOT_CAPTURE,
    *      payload: enabled
    * }}
*/
function setScreenshotCapture(enabled) {
    return {
        type: SET_SCREENSHOT_CAPTURE,
        payload: enabled
    };
}

/**
* Action that toggles the screenshot captures.
*
* @param {boolean} enabled - Bool that represents the intention to start/stop screenshot captures.
* @returns {Promise}
*/
export function toggleScreenshotCaptureEffect(enabled: boolean) {
    return function(dispatch: (Object) => Object, getState: () => any) {
        const state = getState();

        if (state['features/screenshot-capture'].capturesEnabled !== enabled) {
            const { jitsiTrack } = getLocalVideoTrack(state['features/base/tracks']);

            // Screenshot capture effect doesn't return a modified stream. Therefore, we don't have to
            // switch the stream at the conference level, starting/stopping the effect will suffice here.
            return createScreenshotCaptureEffect(state)
                .then(effect => {
                    enabled ? effect.startEffect(jitsiTrack.getOriginalStream()) : effect.stopEffect();
                    dispatch(setScreenshotCapture(enabled));
                });
        }

        return Promise.resolve();
    };
}
