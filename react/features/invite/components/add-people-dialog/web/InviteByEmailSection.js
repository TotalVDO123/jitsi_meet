// @flow

import React, { useState } from 'react';

import { translate } from '../../../../base/i18n';
import {
    Icon,
    IconArrowDownSmall,
    IconCopy,
    IconEmail,
    IconGoogle,
    IconOutlook,
    IconYahoo
} from '../../../../base/icons';
import { Tooltip } from '../../../../base/tooltip';
import { copyText, openURLInBrowser } from '../../../../base/util';

type Props = {

    /**
     * The encoded invitation subject.
     */
    inviteSubject: string,

    /**
     * The encoded invitation text to be sent.
     */
    inviteText: string,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,
};

/**
 * Component that renders email invite options.
 *
 * @returns {React$Element<any>}
 */
function InviteByEmailSection({ inviteSubject, inviteText, t }: Props) {
    const [ isActive, setIsActive ] = useState(false);
    const encodedInviteSubject = encodeURIComponent(inviteSubject);
    const encodedInviteText = encodeURIComponent(inviteText);

    /**
     * Copies the conference invitation to the clipboard.
     *
     * @returns {void}
     */
    function _onCopyText() {
        copyText(inviteText);
    }

    /**
     * Copies the conference invitation to the clipboard.
     *
     * @param {Object} e - The key event to handle.
     *
     * @returns {void}
     */
    function _onCopyTextKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            copyText(inviteText);
        }
    }

    /**
     * Opens an email provider containing the conference invite.
     *
     * @param {string} url - The url to be opened.
     * @returns {Function}
     */
    function _onSelectProvider(url) {
        return function() {
            openURLInBrowser(url, true);
        };
    }

    /**
     * Opens an email provider containing the conference invite.
     *
     * @param {string} url - The url to be opened.
     * @returns {Function}
     */
    function _onProviderKeyPress(url) {
        return function(e) {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                openURLInBrowser(url, true);
            }
        };
    }

    /**
     * Toggles the email invite drawer.
     *
     * @returns {void}
     */
    function _onToggleActiveState() {
        setIsActive(!isActive);
    }

    /**
     * Toggles the email invite drawer.
     *
     * @param {Object} e - The key event to handle.
     *
     * @returns {void}
     */
    function _onToggleActiveStateKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setIsActive(!isActive);
        }
    }

    /**
     * Renders clickable elements that each open an email client
     * containing a conference invite.
     *
     * @returns {React$Element<any>}
     */
    function renderEmailIcons() {
        const PROVIDER_MAPPING = [
            {
                icon: IconEmail,
                tooltipKey: 'addPeople.defaultEmail',
                url: `mailto:?subject=${encodedInviteSubject}&body=${encodedInviteText}`
            },
            {
                icon: IconGoogle,
                tooltipKey: 'addPeople.googleEmail',
                url: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedInviteSubject}&body=${encodedInviteText}`
            },
            {
                icon: IconOutlook,
                tooltipKey: 'addPeople.outlookEmail',
                // eslint-disable-next-line max-len
                url: `https://outlook.office.com/mail/deeplink/compose?subject=${encodedInviteSubject}&body=${encodedInviteText}`
            },
            {
                icon: IconYahoo,
                tooltipKey: 'addPeople.yahooEmail',
                url: `https://compose.mail.yahoo.com/?To=&Subj=${encodedInviteSubject}&Body=${encodedInviteText}`
            }
        ];

        return (
            <>
                {
                    PROVIDER_MAPPING.map(({ icon, tooltipKey, url }, idx) => (
                        <Tooltip
                            content = { t(tooltipKey) }
                            key = { idx }
                            position = 'top'>
                            <div
                                aria-label = { t(tooltipKey) }
                                onClick = { _onSelectProvider(url) }
                                onKeyPress = { _onProviderKeyPress(url) }
                                role = 'button'
                                tabIndex = { 0 }>
                                <Icon src = { icon } />
                            </div>
                        </Tooltip>
                    ))
                }
            </>
        );

    }

    return (
        <>
            <div>
                <div
                    aria-expanded = { isActive }
                    aria-label = { t('addPeople.shareInvite') }
                    className = { `invite-more-dialog email-container${isActive ? ' active' : ''}` }
                    onClick = { _onToggleActiveState }
                    onKeyPress = { _onToggleActiveStateKeyPress }
                    role = 'button'
                    tabIndex = { 0 }>
                    <span>{t('addPeople.shareInvite')}</span>
                    <Icon src = { IconArrowDownSmall } />
                </div>
                <div className = { `invite-more-dialog icon-container${isActive ? ' active' : ''}` }>
                    <Tooltip
                        content = { t('addPeople.copyInvite') }
                        position = 'top'>
                        <div
                            aria-label = { t('addPeople.copyInvite') }
                            className = 'copy-invite-icon'
                            onClick = { _onCopyText }
                            onKeyPress = { _onCopyTextKeyPress }
                            role = 'button'
                            tabIndex = { 0 }>
                            <Icon src = { IconCopy } />
                        </div>
                    </Tooltip>
                    {renderEmailIcons()}
                </div>
            </div>
        </>
    );
}

export default translate(InviteByEmailSection);
