// @flow

import React, { useEffect } from 'react';

import JitsiScreenWebView from '../../base/modal/components/JitsiScreenWebView';
import { screen } from '../../conference/components/native/routes';
import { renderArrowBackButton } from '../../welcome';

import styles from './styles';

type Props = {

    /**
     * Default prop for navigating between screen components(React Navigation).
     */
    navigation: Object
}

/**
 * The URL at which the privacy policy is available to the user.
 */
const PRIVACY_URL = 'https://jitsi.org/meet/privacy';

const PrivacyView = ({ navigation }: Props) => {

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () =>
                renderArrowBackButton(() =>
                    navigation.navigate(screen.welcome.main))
        });
    });

    return (
        <JitsiScreenWebView
            source = { PRIVACY_URL }
            style = { styles.privacyViewContainer } />
    );
};

export default PrivacyView;
