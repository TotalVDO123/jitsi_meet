import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';
import { useDispatch } from 'react-redux';

import { openSheet } from '../../../../../base/dialog';
import { participantMatchesSearch } from '../../../../functions';
import CollapsibleList from '../../../native/CollapsibleList';

import BreakoutRoomContextMenu from './BreakoutRoomContextMenu';
import BreakoutRoomParticipantItem from './BreakoutRoomParticipantItem';

type Props = {

    /**
     * Room to display.
     */
    room: Object,

    /**
     * Participants search string.
     */
    searchString: string
}

/**
 * Returns a key for a passed item of the list.
 *
 * @param {Object} item - The participant.
 * @returns {string} - The user ID.
 */
function _keyExtractor(item: Object) {
    return item.jid;
}


export const CollapsibleRoom = ({ room, searchString }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const _openContextMenu = useCallback(() => {
        dispatch(openSheet(BreakoutRoomContextMenu, { room }));
    }, [ room ]);
    const roomParticipantsNr = Object.values(room.participants || {}).length;
    const title
        = `${room.name
    || t('breakoutRooms.mainRoom')} (${roomParticipantsNr})`;

    return (
        <CollapsibleList
            onLongPress = { _openContextMenu }
            title = { title }>
            <FlatList
                bounces = { false }
                data = { Object.values(room.participants || {}) }
                horizontal = { false }
                keyExtractor = { _keyExtractor }

                // For FlatList as a nested list of any other FlatList or SectionList
                // we have to pass a unique value to this prop

                /* eslint-disable-next-line react/jsx-no-bind */
                listKey = { (item, index) => `key_${index}` }

                /* eslint-disable-next-line react/jsx-no-bind */
                renderItem = { ({ item: participant }) => participantMatchesSearch(participant, searchString)
                    && <BreakoutRoomParticipantItem
                        item = { participant }
                        room = { room } /> }
                scrollEnabled = { false }
                showsHorizontalScrollIndicator = { false }
                windowSize = { 2 } />
        </CollapsibleList>
    );
};
