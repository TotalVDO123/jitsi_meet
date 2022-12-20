import { IReduxState } from '../../app/types';

import { IConfig, IDeeplinkingConfig, IDeeplinkingMobileConfig, IDeeplinkingPlatformConfig } from './configType';
import { TOOLBAR_BUTTONS } from './constants';

export * from './functions.any';

/**
 * Removes all analytics related options from the given configuration, in case of a libre build.
 *
 * @param {*} config - The configuration which needs to be cleaned up.
 * @returns {void}
 */
export function _cleanupConfig(config: IConfig) { // eslint-disable-line @typescript-eslint/no-unused-vars
}

/**
 * Returns the replaceParticipant config.
 *
 * @param {Object} state - The state of the app.
 * @returns {boolean}
 */
export function getReplaceParticipant(state: IReduxState): string | undefined {
    return state['features/base/config'].replaceParticipant;
}

/**
 * Returns the list of enabled toolbar buttons.
 *
 * @param {Object} state - The redux state.
 * @returns {Array<string>} - The list of enabled toolbar buttons.
 */
export function getToolbarButtons(state: IReduxState): Array<string> {
    const { toolbarButtons } = state['features/base/config'];

    return Array.isArray(toolbarButtons) ? toolbarButtons : TOOLBAR_BUTTONS;
}

/**
 * Checks if the specified button is enabled.
 *
 * @param {string} buttonName - The name of the button.
 * {@link interfaceConfig}.
 * @param {Object|Array<string>} state - The redux state or the array with the enabled buttons.
 * @returns {boolean} - True if the button is enabled and false otherwise.
 */
export function isToolbarButtonEnabled(buttonName: string, state: IReduxState | Array<string>) {
    const buttons = Array.isArray(state) ? state : getToolbarButtons(state);

    return buttons.includes(buttonName);
}

/**
 * Returns whether audio level measurement is enabled or not.
 *
 * @param {Object} state - The state of the app.
 * @returns {boolean}
 */
export function areAudioLevelsEnabled(state: IReduxState): boolean {
    // Default to false for React Native as audio levels are of no interest to the mobile app.
    return navigator.product !== 'ReactNative' && !state['features/base/config'].disableAudioLevels;
}

/**
 * Sets the defaults for deeplinking.
 *
 * @param {IDeeplinkingConfig} deeplinking - The deeplinking config.
 * @returns {void}
 */
export function _setDeeplinkingDefaults(deeplinking: IDeeplinkingConfig) {
    const {
        desktop = {} as IDeeplinkingPlatformConfig,
        android = {} as IDeeplinkingMobileConfig,
        ios = {} as IDeeplinkingMobileConfig
    } = deeplinking;

    desktop.appName = desktop.appName || 'Jitsi Meet';

    ios.appName = ios.appName || 'Jitsi Meet';
    ios.appScheme = ios.appScheme || 'org.jitsi.meet';
    ios.downloadLink = ios.downloadLink
        || 'https://itunes.apple.com/us/app/jitsi-meet/id1165103905';
    if (ios.dynamicLink) {
        ios.dynamicLink.apn = ios.dynamicLink.apn || 'org.jitsi.meet';
        ios.dynamicLink.appCode = ios.dynamicLink.appCode || 'w2atb';
        ios.dynamicLink.ibi = ios.dynamicLink.ibi || 'com.atlassian.JitsiMeet.ios';
        ios.dynamicLink.isi = ios.dynamicLink.isi || '1165103905';
    }

    android.appName = android.appName || 'Jitsi Meet';
    android.appScheme = android.appScheme || 'org.jitsi.meet';
    android.downloadLink = android.downloadLink
        || 'https://play.google.com/store/apps/details?id=org.jitsi.meet';
    android.appPackage = android.appPackage || 'org.jitsi.meet';
    if (android.dynamicLink) {
        android.dynamicLink.apn = android.dynamicLink.apn || 'org.jitsi.meet';
        android.dynamicLink.appCode = android.dynamicLink.appCode || 'w2atb';
        android.dynamicLink.ibi = android.dynamicLink.ibi || 'com.atlassian.JitsiMeet.ios';
        android.dynamicLink.isi = android.dynamicLink.isi || '1165103905';
    }
}
