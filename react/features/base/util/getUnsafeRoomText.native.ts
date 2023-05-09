import React from 'react';
import { Text } from 'react-native';

import Link from '../react/components/native/Link';
import BaseTheme from '../ui/components/BaseTheme.native';
import { IReduxState } from '../../app/types';
import { SECURITY_URL } from './contants';

/**
 * Gets the unsafe room text for the given context.
 *
 * @param {Function} t - The translation function.
 * @param {'meeting'|'prejoin'|'welcome'} context - The given context of the warining.
 * @returns {Text}
 */
export default function getUnsafeRoomText(state: IReduxState, t: Function, context: 'meeting' | 'prejoin' | 'welcome') {
    const securityUrl = state['features/base/config'].legalUrls?.security ?? SECURITY_URL;
    const link = React.createElement(Link, {
        url: securityUrl,
        children: 'here',
        style: { color: BaseTheme.palette.action01 } });

    const options = {
        recommendAction: t(`security.unsafeRoomActions.${context}`)
    };

    return React.createElement(Text, { children: [ t('security.insecureRoomNameWarningNative', options), link, '.' ] });
}
