/* eslint-disable max-params */
// @flow
import 'image-capture';
import './createImageBitmap';

import { getCurrentConference } from '../base/conference';
import { getLocalParticipant, getParticipantCount } from '../base/participants';
import { getLocalVideoTrack } from '../base/tracks';
import { getBaseUrl } from '../base/util';

import {
    ADD_FACE_LANDMARKS,
    ADD_TO_FACE_EXPRESSIONS_BUFFER,
    CLEAR_FACE_EXPRESSIONS_BUFFER,
    SET_MAX_NO_FACES,
    START_FACE_LANDMARKS_DETECTION,
    STOP_FACE_LANDMARKS_DETECTION,
    UPDATE_FACE_COORDINATES
} from './actionTypes';
import {
    DETECTION_TYPES,
    INIT_WORKER,
    WEBHOOK_SEND_TIME_INTERVAL
} from './constants';
import {
    getDetectionInterval,
    sendDataToWorker,
    sendFaceBoxToParticipants,
    sendFaceExpressionsWebhook,
    getAgeAverage,
    getMostOccurredGender
} from './functions';
import logger from './logger';

declare var APP: Object;

/**
 * Object containing  a image capture of the local track.
 */
let imageCapture;

/**
 * Object where the face landmarks worker is stored.
 */
let worker;

/**
 * The last face expression received from the worker.
 */
let lastFaceExpression;

/**
 * The last face expression timestamp.
 */
let lastFaceExpressionTimestamp;

/**
 * How many duplicate consecutive expression occurred.
 * If a expression that is not the same as the last one it is reset to 0.
 */
let duplicateConsecutiveExpressions = 0;

/**
 * Variable that keeps the interval for sending expressions to webhook.
 */
let webhookSendInterval;

/**
 * Variable that keeps the interval for detecting faces in a frame.
 */
let detectionInterval;

let ages = [];

let genders = [];

/**
 * Loads the worker that detects the face landmarks.
 *
 * @returns {void}
 */
export function loadWorker() {
    return function(dispatch: Function, getState: Function) {
        if (worker) {
            logger.info('Worker has already been initialized');

            return;
        }

        if (navigator.product === 'ReactNative') {
            logger.warn('Unsupported environment for face recognition');

            return;
        }

        const baseUrl = `${getBaseUrl()}libs/`;
        let workerUrl = `${baseUrl}face-landmarks-worker.min.js`;

        const workerBlob = new Blob([ `importScripts("${workerUrl}");` ], { type: 'application/javascript' });

        workerUrl = window.URL.createObjectURL(workerBlob);
        worker = new Worker(workerUrl, { name: 'Face Recognition Worker' });
        worker.onmessage = function(e: Object) {
            const { age, faceExpression, faceBox, gender, noFaces } = e.data;

            if (age) {
                ages.push(age);
            }

            if (gender) {
                genders.push(gender);
            }

            if (noFaces) {
                const state = getState();
                const { maxNoFaces } = state['features/face-landmarks'];

                if (noFaces > maxNoFaces) {
                    dispatch(setMaxNoFaces(noFaces));
                }
            }

            if (faceExpression) {
                if (faceExpression === lastFaceExpression) {
                    duplicateConsecutiveExpressions++;
                } else {
                    if (lastFaceExpression && lastFaceExpressionTimestamp) {
                        dispatch(addFaceLandmarks(
                            {
                                faceExpression: lastFaceExpression,
                                duration: duplicateConsecutiveExpressions + 1,
                                timestamp: lastFaceExpressionTimestamp,
                                age: getAgeAverage(ages),
                                gender: getMostOccurredGender(genders)
                            }
                        ));
                        genders = [];
                        ages = [];
                    }
                    lastFaceExpression = faceExpression;
                    lastFaceExpressionTimestamp = Date.now();
                    duplicateConsecutiveExpressions = 0;
                }
            }

            if (faceBox) {
                const state = getState();
                const conference = getCurrentConference(state);
                const localParticipant = getLocalParticipant(state);

                if (getParticipantCount(state) > 1) {
                    sendFaceBoxToParticipants(conference, faceBox);
                }

                dispatch({
                    type: UPDATE_FACE_COORDINATES,
                    faceBox,
                    id: localParticipant.id
                });
            }

            APP.API.notifyFaceLandmarkDetected(faceBox, faceExpression);
        };

        const { faceLandmarks } = getState()['features/base/config'];
        const detectionTypes = [
            DETECTION_TYPES.AGE,
            faceLandmarks?.enableFaceCentering && DETECTION_TYPES.FACE_BOX,
            faceLandmarks?.enableFaceExpressionsDetection && DETECTION_TYPES.FACE_EXPRESSIONS,
            DETECTION_TYPES.GENDER,
            DETECTION_TYPES.NUMBER_FACES
        ].filter(Boolean);

        worker.postMessage({
            type: INIT_WORKER,
            baseUrl,
            detectionTypes
        });

        dispatch(startFaceLandmarksDetection());
    };
}

/**
 * Starts the recognition and detection of face expressions.
 *
 * @param {Track | undefined} track - Track for which to start detecting faces.
 * @returns {Function}
 */
export function startFaceLandmarksDetection(track) {
    return async function(dispatch: Function, getState: Function) {
        if (!worker) {
            return;
        }

        const state = getState();
        const { recognitionActive } = state['features/face-landmarks'];

        if (recognitionActive) {
            logger.log('Face recognition already active.');

            return;
        }

        const localVideoTrack = track || getLocalVideoTrack(state['features/base/tracks']);

        if (localVideoTrack === undefined) {
            logger.warn('Face landmarks detection is disabled due to missing local track.');

            return;
        }

        const stream = localVideoTrack.jitsiTrack.getOriginalStream();

        dispatch({ type: START_FACE_LANDMARKS_DETECTION });
        logger.log('Start face recognition');

        const firstVideoTrack = stream.getVideoTracks()[0];
        const { faceLandmarks } = state['features/base/config'];

        imageCapture = new ImageCapture(firstVideoTrack);

        detectionInterval = setInterval(() => {
            sendDataToWorker(
                worker,
                imageCapture,
                faceLandmarks?.faceCenteringThreshold
            );
        }, getDetectionInterval(state));

        if (faceLandmarks?.enableFaceExpressionsDetection) {
            webhookSendInterval = setInterval(async () => {
                const result = await sendFaceExpressionsWebhook(getState());

                if (result) {
                    dispatch(clearFaceExpressionBuffer());
                }
            }, WEBHOOK_SEND_TIME_INTERVAL);
        }
    };
}

/**
 * Stops the recognition and detection of face expressions.
 *
 * @returns {void}
 */
export function stopFaceLandmarksDetection() {
    return function(dispatch: Function) {
        if (lastFaceExpression && lastFaceExpressionTimestamp) {
            dispatch(
                addFaceLandmarks(
                    lastFaceExpression,
                    duplicateConsecutiveExpressions + 1,
                    lastFaceExpressionTimestamp
                )
            );
        }

        clearInterval(webhookSendInterval);
        clearInterval(detectionInterval);

        duplicateConsecutiveExpressions = 0;
        webhookSendInterval = null;
        detectionInterval = null;
        imageCapture = null;

        dispatch({ type: STOP_FACE_LANDMARKS_DETECTION });
        logger.log('Stop face recognition');
    };
}

/**
 * Adds new face landmarks.
 *
 * @param  {string} faceLandmarks - Face landmarks object.
 * @returns {Object}
 */
function addFaceLandmarks({ faceExpression, duration, timestamp, age, gender }) {
    return function(dispatch: Function, getState: Function) {
        const finalDuration = duration * getDetectionInterval(getState()) / 1000;

        dispatch({
            type: ADD_FACE_LANDMARKS,
            faceExpression,
            duration: finalDuration,
            timestamp,
            age,
            gender
        });
    };
}

/**
 * Adds a face expression with its timestamp to the face expression buffer.
 *
 * @param  {Object} faceExpression - Object containing face expression string and its timestamp.
 * @returns {Object}
 */
export function addToFaceExpressionsBuffer(faceExpression: Object) {
    return {
        type: ADD_TO_FACE_EXPRESSIONS_BUFFER,
        faceExpression
    };
}

/**
 * Clears the face expressions array in the state.
 *
 * @returns {Object}
 */
function clearFaceExpressionBuffer() {
    return {
        type: CLEAR_FACE_EXPRESSIONS_BUFFER
    };
}

/**
 * Sets the maximum number of faced detected.
 *
 * @param {number} maxNoFaces - Maximum number of faces.
 * @returns {number}
 */
function setMaxNoFaces(maxNoFaces: number) {
    return {
        type: SET_MAX_NO_FACES,
        maxNoFaces
    };
}
