/* eslint-disable lines-around-comment */
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React, { ReactElement, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { IState } from '../../../../../app/types';
import ListItem from '../../../../../base/components/participants-pane-list/ListItem';
import Icon from '../../../../../base/icons/components/Icon';
import { IconArrowDown, IconArrowUp } from '../../../../../base/icons/svg';
import { isLocalParticipantModerator } from '../../../../../base/participants/functions';
// @ts-ignore
import { showOverflowDrawer } from '../../../../../toolbox/functions.web';
import { ACTION_TRIGGER } from '../../../../constants';
// @ts-ignore
import { participantMatchesSearch } from '../../../../functions';
import ParticipantActionEllipsis from '../../../web/ParticipantActionEllipsis';
import ParticipantItem from '../../../web/ParticipantItem';

type Props = {

    /**
     * Type of trigger for the breakout room actions.
     */
    actionsTrigger?: string,

    /**
     * React children.
     */
    children: ReactElement,

    /**
     * Is this item highlighted/raised.
     */
    isHighlighted?: boolean,

    /**
     * Callback for when the mouse leaves this component.
     */
    onLeave?: (e?: React.MouseEvent) => void,

    /**
     * Callback to raise menu. Used to raise menu on mobile long press.
     */
    onRaiseMenu: Function,

    /**
     * The raise context for the participant menu.
     */
    participantContextEntity?: {
        jid: string
    },

    /**
     * Callback to raise participant context menu.
     */
    raiseParticipantContextMenu: Function,

    /**
     * Room reference.
     */
    room: {
        id: string;
        name: string;
        participants: {
            [jid: string]: {
                displayName: string;
                jid: string;
            }
        };
    },

    /**
     * Participants search string.
     */
    searchString: string,

    /**
     * Toggles the room participant context menu.
     */
    toggleParticipantMenu: Function
}

const useStyles = makeStyles((theme: any) => {
    return {
        container: {
            boxShadow: 'none'
        },

        roomName: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            ...theme.typography.labelButton,
            lineHeight: `${theme.typography.labelButton.lineHeight}px`,
            padding: '12px 0'
        },

        arrowContainer: {
            backgroundColor: theme.palette.ui03,
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            marginRight: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }
    };
});

export const CollapsibleRoom = ({
    actionsTrigger = ACTION_TRIGGER.HOVER,
    children,
    isHighlighted,
    onRaiseMenu,
    onLeave,
    participantContextEntity,
    raiseParticipantContextMenu,
    room,
    searchString,
    toggleParticipantMenu
}: Props) => {
    const { t } = useTranslation();
    const styles = useStyles();
    const [ collapsed, setCollapsed ] = useState(false);
    const toggleCollapsed = useCallback(() => {
        setCollapsed(!collapsed);
    }, [ collapsed ]);
    const raiseMenu = useCallback(target => {
        onRaiseMenu(target);
    }, [ onRaiseMenu ]);
    const { defaultRemoteDisplayName } = useSelector((state: IState) => state['features/base/config']);
    const overflowDrawer: boolean = useSelector(showOverflowDrawer);
    const moderator = useSelector(isLocalParticipantModerator);

    const arrow = (<div className = { styles.arrowContainer }>
        <Icon
            size = { 14 }
            src = { collapsed ? IconArrowDown : IconArrowUp } />
    </div>);

    const roomName = (<span className = { styles.roomName }>
        {`${room.name || t('breakoutRooms.mainRoom')} (${Object.keys(room?.participants
            || {}).length})`}
    </span>);

    const raiseParticipantMenu = useCallback(({ participantID, displayName }) => moderator
    && raiseParticipantContextMenu({
        room,
        jid: participantID,
        participantName: displayName
    }), [ room, moderator ]);

    return (
        <>
            <ListItem
                actions = { children }
                className = { clsx(styles.container, 'breakout-room-container') }
                icon = { arrow }
                isHighlighted = { isHighlighted }
                onClick = { toggleCollapsed }
                onLongPress = { raiseMenu }
                onMouseLeave = { onLeave }
                testId = { room.id }
                textChildren = { roomName }
                trigger = { actionsTrigger } />
            {!collapsed && room?.participants
                && Object.values(room?.participants || {}).map(p =>
                    participantMatchesSearch(p, searchString) && (
                        <ParticipantItem
                            actionsTrigger = { ACTION_TRIGGER.HOVER }
                            displayName = { p.displayName || defaultRemoteDisplayName }
                            isHighlighted = { participantContextEntity?.jid === p.jid }
                            key = { p.jid }
                            local = { false }
                            openDrawerForParticipant = { raiseParticipantMenu }
                            overflowDrawer = { overflowDrawer }
                            participantID = { p.jid }>
                            {!overflowDrawer && moderator && (
                                <ParticipantActionEllipsis
                                    accessibilityLabel = { t('breakoutRoom.more') }
                                    onClick = { toggleParticipantMenu({ room,
                                        jid: p.jid,
                                        participantName: p.displayName }) } />
                            )}
                        </ParticipantItem>
                    ))
            }
        </>
    );
};
