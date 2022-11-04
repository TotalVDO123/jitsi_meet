// @flow

import {
    ENDPOINT_MESSAGE_RECEIVED,
    REMOVE_TRANSCRIPT_MESSAGE,
    SEND_TRANSCRIPT_BITE,
    SEND_TRANSCRIPT_MESSAGE, SEND_TRANSCRIPT_TEXT,
    SET_REQUESTING_SUBTITLES,
    TOGGLE_REQUESTING_SUBTITLES,
    UPDATE_TRANSCRIPT_MESSAGE
} from './actionTypes';
import {Dispatch} from 'react';

/**
 * Signals that a participant sent an endpoint message on the data channel.
 *
 * @param {Object} participant - The participant details sending the message.
 * @param {Object} json - The json carried by the endpoint message.
 * @returns {{
 *      type: ENDPOINT_MESSAGE_RECEIVED,
 *      participant: Object,
 *      json: Object
 * }}
 */
export function endpointMessageReceived(participant: Object, json: Object) {
    return {
        type: ENDPOINT_MESSAGE_RECEIVED,
        participant,
        json
    };
}

/**
 * Signals that a transcript has to be removed from the state.
 *
 * @param {string} transcriptMessageID - The message_id to be removed.
 * @returns {{
 *      type: REMOVE_TRANSCRIPT_MESSAGE,
 *      transcriptMessageID: string,
 * }}
 */
export function removeTranscriptMessage(transcriptMessageID: string) {
    return {
        type: REMOVE_TRANSCRIPT_MESSAGE,
        transcriptMessageID
    };
}

/**
 * Signals that a transcript with the given message_id to be added or updated
 * is received.
 *
 * @param {string} transcriptMessageID -The transcript message_id to be updated.
 * @param {Object} newTranscriptMessage - The updated transcript message.
 * @returns {{
 *      type: UPDATE_TRANSCRIPT_MESSAGE,
 *      transcriptMessageID: string,
 *      newTranscriptMessage: Object
 * }}
 */
export function updateTranscriptMessage(transcriptMessageID: string,
                                        newTranscriptMessage: Object) {
    return {
        type: UPDATE_TRANSCRIPT_MESSAGE,
        transcriptMessageID,
        newTranscriptMessage
    };
}

/**
 * Signals that the local user has toggled the ClosedCaption button.
 *
 * @returns {{
 *      type: TOGGLE_REQUESTING_SUBTITLES
 * }}
 */
export function toggleRequestingSubtitles() {
    return {
        type: TOGGLE_REQUESTING_SUBTITLES
    };
}

/**
 * Signals that the local user has enabled or disabled the subtitles.
 *
 * @param {boolean} enabled - The new state of the subtitles.
 * @returns {{
 *    type: SET_REQUESTING_SUBTITLES,
 *    enabled: boolean
 * }}
 */
export function setRequestingSubtitles(enabled: boolean) {
    return {
        type: SET_REQUESTING_SUBTITLES,
        enabled
    };
}

/**
 * It is used to show the details of transcriber data
 *
 * @returns {{
 *    type: SEND_TRANSCRIPT_MESSAGE,
 *    data: bite
 * }}
 * @param bite
 */
export function showTranscriptData(bite) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        dispatch({
            type: SEND_TRANSCRIPT_MESSAGE,
            data: bite
        });
    };
}

/**
 * It is used to show the details of transcriber data
 *
 * @returns {{
 *    type: SEND_TRANSCRIPT_BITE,
 *    data: bite
 * }}
 * @param bite
 */
export function showTranscriptionBite(bite) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        dispatch({
            type: SEND_TRANSCRIPT_BITE,
            data: bite
        });
    };
}

export function sendTranscriptText(text) {
    console.log('texttttt', text);
    return (dispatch: Dispatch<any>, getState: Function) => {
        dispatch({
            type: SEND_TRANSCRIPT_TEXT,
            data: text
        })
    }
}

