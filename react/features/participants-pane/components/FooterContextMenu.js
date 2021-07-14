// @flow

import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { requestDisableModeration, requestEnableModeration } from '../../av-moderation/actions';
import {
    isEnabled as isAvModerationEnabled,
    isSupported as isAvModerationSupported
} from '../../av-moderation/functions';
import { openDialog } from '../../base/dialog';
import { Icon, IconCheck, IconVideoOff } from '../../base/icons';
import { MEDIA_TYPE } from '../../base/media';
import { getLocalParticipant } from '../../base/participants';
import { MuteEveryonesVideoDialog } from '../../video-menu/components';

import {
    ContextMenu,
    ContextMenuItem,
    ContextMenuItemGroup
} from './web/styled';

const useStyles = makeStyles(() => {
    return {
        contextMenu: {
            bottom: 'auto',
            margin: '0',
            padding: '8px 0',
            right: 0,
            top: '-8px',
            transform: 'translateY(-100%)',
            width: '283px'
        },
        drawer: {
            width: '100%',
            top: 0,

            '& > div': {
                lineHeight: '32px'
            }
        },
        text: {
            color: '#C2C2C2',
            padding: '10px 16px 10px 52px'
        },
        paddedAction: {
            marginLeft: '36px;'
        }
    };
});

type Props = {

    /**
     * Whether the menu is displayed inside a drawer.
     */
    inDrawer?: boolean,

    /**
     * Callback for the mouse leaving this item.
     */
    onMouseLeave?: Function
};

export const FooterContextMenu = ({ inDrawer, onMouseLeave }: Props) => {
    const dispatch = useDispatch();
    const isModerationSupported = useSelector(isAvModerationSupported());
    const isModerationEnabled = useSelector(isAvModerationEnabled(MEDIA_TYPE.AUDIO));
    const { id } = useSelector(getLocalParticipant);
    const { t } = useTranslation();

    const disable = useCallback(() => dispatch(requestDisableModeration()), [ dispatch ]);

    const enable = useCallback(() => dispatch(requestEnableModeration()), [ dispatch ]);

    const classes = useStyles();

    const muteAllVideo = useCallback(
        () => dispatch(openDialog(MuteEveryonesVideoDialog, { exclude: [ id ] })), [ dispatch ]);

    return (
        <ContextMenu
            className = { clsx(classes.contextMenu, inDrawer && clsx(classes.drawer)) }
            onMouseLeave = { onMouseLeave }>
            <ContextMenuItemGroup>
                <ContextMenuItem
                    id = 'participants-pane-context-menu-stop-video'
                    onClick = { muteAllVideo }>
                    <Icon
                        size = { 20 }
                        src = { IconVideoOff } />
                    <span>{ t('participantsPane.actions.stopEveryonesVideo') }</span>
                </ContextMenuItem>
            </ContextMenuItemGroup>
            { isModerationSupported ? (
                <ContextMenuItemGroup>
                    <div className = { classes.text }>
                        {t('participantsPane.actions.allow')}
                    </div>
                    { isModerationEnabled ? (
                        <ContextMenuItem
                            id = 'participants-pane-context-menu-stop-moderation'
                            onClick = { disable }>
                            <span className = { classes.paddedAction }>
                                { t('participantsPane.actions.startModeration') }
                            </span>
                        </ContextMenuItem>
                    ) : (
                        <ContextMenuItem
                            id = 'participants-pane-context-menu-start-moderation'
                            onClick = { enable }>
                            <Icon
                                size = { 20 }
                                src = { IconCheck } />
                            <span>{ t('participantsPane.actions.startModeration') }</span>
                        </ContextMenuItem>
                    )}
                </ContextMenuItemGroup>
            ) : undefined
            }
        </ContextMenu>
    );
};
