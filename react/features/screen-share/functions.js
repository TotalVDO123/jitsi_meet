// @flow

import { isWindows } from '../base/environment';
import { browser } from '../base/lib-jitsi-meet';
import { getLocalVideoTrack } from '../base/tracks';

/**
 * Is the current screen sharing session audio only.
 *
 * @param {Object} state - The state of the application.
 * @returns {boolean}
 */
export function isAudioOnlySharing(state: Object) {
    return isScreenAudioShared(state) && !isScreenVideoShared(state);
}

/**
 * State of audio sharing.
 *
 * @param {Object} state - The state of the application.
 * @returns {boolean}
 */
export function isScreenAudioShared(state: Object) {
    return state['features/screen-share'].isSharingAudio;
}

/**
 * Returns the visibility of the audio only screen share button. Currently only chrome browser and electron on
 * windows supports this functionality.
 *
 * @returns {boolean}
 */
export function isScreenAudioSupported() {
    return browser.isChrome() || (browser.isElectron() && isWindows());
}

/**
 * Is any screen media currently being shared, audio or video.
 *
 * @param {Object} state - The state of the application.
 * @returns {boolean}
 */
export function isScreenMediaShared(state: Object) {
    return isScreenAudioShared(state) || isScreenVideoShared(state);
}

/**
 * Is screen sharing currently active.
 *
 * @param {Object} state - The state of the application.
 * @returns {boolean}
 */
export function isScreenVideoShared(state: Object) {
    const localVideo = getLocalVideoTrack(state['features/base/tracks']);

    return localVideo && localVideo.videoType === 'desktop';
}
