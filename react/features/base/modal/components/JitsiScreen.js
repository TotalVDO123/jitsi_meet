// @flow

import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StyleType } from '../../styles';

import styles from './styles';

import { JitsiKeyboardAvoidingView } from './';


type Props = {

    /**
     * Additional style to be appended to the KeyboardAvoidingView content container.
     */
    contentContainerStyle?: StyleType,

    /**
     * The children component(s) of the Modal, to be rendered.
     */
    children: React$Node,

    /**
     * Optional function that renders a footer component, if needed.
     */
    footerComponent?: Function,

    /**
     * Is the screen rendering a tab navigator?
     */
    hasTabNavigator?: boolean,

    /**
     * Additional style to be appended to the KeyboardAvoidingView containing the content of the modal.
     */
    style?: StyleType
}

const JitsiScreen = ({
    contentContainerStyle,
    children,
    footerComponent,
    hasTabNavigator = false,
    style
}: Props) => (
    <View
        style = { styles.jitsiScreenContainer }>
        <JitsiKeyboardAvoidingView
            contentContainerStyle = { contentContainerStyle }
            hasTabNavigator = { hasTabNavigator }
            style = { style }>
            <SafeAreaView
                edges = { [
                    'bottom',
                    'left',
                    'right'
                ] }
                style = { styles.safeArea }>
                { children }
            </SafeAreaView>
            { footerComponent && footerComponent() }
        </JitsiKeyboardAvoidingView>
    </View>
);


export default JitsiScreen;
