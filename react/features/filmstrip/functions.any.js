// @flow

import { setRemoteParticipants } from './actions';

/**
 * Computes the reorderd list of the remote participants.
 *
 * @param {*} store - The redux store.
 * @param {string} participantId - The endpoint id of the participant that joined the call.
 * @returns {void}
 * @private
 */
 export function updateRemoteParticipants(store: Object, participantId: ?number) {
    const state = store.getState();
    const { enableThumbnailReordering = true } = state['features/base/config'];
    let reorderedParticipants = [];

    if (!enableThumbnailReordering) {
        if (participantId) {
            const { remoteParticipants } = state['features/filmstrip'];

            reorderedParticipants = [ ...remoteParticipants, participantId ];
            store.dispatch(setRemoteParticipants(reorderedParticipants));
        }

        return;
    }

    const { fakeParticipants, sortedRemoteParticipants, speakersList } = state['features/base/participants'];
    const { remoteScreenShares } = state['features/video-layout'];
    const screenShares = (remoteScreenShares || []).slice();
    const speakers = new Map(speakersList);
    const remoteParticipants = new Map(sortedRemoteParticipants);
    const sharedVideos = fakeParticipants ? Array.from(fakeParticipants.keys()) : [];

    for (const screenshare of screenShares) {
        remoteParticipants.delete(screenshare);
        speakers.delete(screenshare);
    }
    for (const sharedVideo of sharedVideos) {
        remoteParticipants.delete(sharedVideo);
        speakers.delete(sharedVideo);
    }
    for (const speaker of speakers.keys()) {
        remoteParticipants.delete(speaker);
    }

    // Always update the order of the thumnails.
    reorderedParticipants = [
        ...screenShares.reverse(),
        ...sharedVideos,
        ...Array.from(speakers.keys()),
        ...Array.from(remoteParticipants.keys())
    ];

    store.dispatch(setRemoteParticipants(reorderedParticipants));
}

/**
 * Private helper to calculate the reordered list of remote participants when a participant leaves.
 *
 * @param {*} store - The redux store.
 * @param {string} participantId - The endpoint id of the participant leaving the call.
 * @returns {void}
 * @private
 */
export function updateRemoteParticipantsOnLeave(store: Object, participantId: ?string = null) {
    if (!participantId) {
        return;
    }
    const state = store.getState();
    const { remoteParticipants } = state['features/filmstrip'];
    const reorderedParticipants = new Set(remoteParticipants);

    reorderedParticipants.delete(participantId)
        && store.dispatch(setRemoteParticipants(Array.from(reorderedParticipants)));
}
