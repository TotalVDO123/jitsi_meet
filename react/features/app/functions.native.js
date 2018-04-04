/* @flow */
import { NativeModules } from 'react-native';

export * from './getRouteToRender';

/**
 * Returns application name.
 *
 * @returns {string} The application name.
 */
export function getName() {
    return NativeModules.AppInfo.name;
}

/**
 * Returns the path to Jitsi Meet SDK bundle on iOS. On Android it will be
 * undefined.
 *
 * @returns {string|undefined}
 */
export function getSdkBundlePath() {
    // FIXME now this is clearly a "sounds location"
    return NativeModules.AppInfo.sdkBundlePath || 'asset:/sounds';
}
