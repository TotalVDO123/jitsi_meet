import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';

import HelpView from '../../../../../welcome/components/native/HelpView';
import PrivacyView from '../../../../../welcome/components/native/PrivacyView';
import TermsView from '../../../../../welcome/components/native/TermsView';
import SettingsView
    from '../../../../../welcome/components/native/settings/components/SettingsView';
import { screen } from '../../../routes';
import {
    linkScreenOptions,
    navigationContainerTheme,
    settingsScreenOptions
} from '../../../screenOptions';
import {
    settingsNavigationContainerRef
} from '../SettingsNavigationContainerRef';

const SettingsStack = createStackNavigator();


const SettingsNavigationContainer = () => {
    const { t } = useTranslation();

    return (
        <NavigationContainer
            independent = { true }
            ref = { settingsNavigationContainerRef }
            theme = { navigationContainerTheme }>
            <SettingsStack.Navigator
                initialRouteName = { screen.settings.main }>
                <SettingsStack.Screen
                    component = { SettingsView }
                    name = { screen.settings.main }
                    options = {{
                        ...settingsScreenOptions,
                        title: t('settings.title')
                    }} />
                <SettingsStack.Screen
                    component = { HelpView }
                    name = { screen.settings.links.help }
                    options = {{
                        ...linkScreenOptions,
                        title: t('helpView.header')
                    }} />
                <SettingsStack.Screen
                    component = { TermsView }
                    name = { screen.settings.links.terms }
                    options = {{
                        ...linkScreenOptions,
                        title: t('termsView.header')
                    }} />
                <SettingsStack.Screen
                    component = { PrivacyView }
                    name = { screen.settings.links.privacy }
                    options = {{
                        ...linkScreenOptions,
                        title: t('privacyView.header')
                    }} />
            </SettingsStack.Navigator>
        </NavigationContainer>
    );
};

export default SettingsNavigationContainer;
