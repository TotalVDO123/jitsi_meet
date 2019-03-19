// @flow

import { openDialog } from '../base/dialog';
import { FEEDBACK_REQUEST_IN_PROGRESS } from '../../../modules/UI/UIErrors';

import { CANCEL_FEEDBACK, SUBMIT_FEEDBACK } from './actionTypes';
import { FeedbackDialog } from './components';

declare var config: Object;
declare var interfaceConfig: Object;

/**
 * Caches the passed in feedback in the redux store.
 *
 * @param {number} score - The quality score given to the conference.
 * @param {string} message - A description entered by the participant that
 * explains the rating.
 * @returns {{
 *     type: CANCEL_FEEDBACK,
 *     message: string,
 *     score: number
 * }}
 */
export function cancelFeedback(score: number, message: string) {
    return {
        type: CANCEL_FEEDBACK,
        message,
        score
    };
}

/**
 * Potentially open the {@code FeedbackDialog}. It will not be opened if it is
 * already open or feedback has already been submitted.
 *
 * @param {JistiConference} conference - The conference for which the feedback
 * would be about. The conference is passed in because feedback can occur after
 * a conference has been left, so references to it may no longer exist in redux.
 * @returns {Promise} Resolved with value - false if the dialog is enabled and
 * resolved with true if the dialog is disabled or the feedback was already
 * submitted. Rejected if another dialog is already displayed.
 */
export function maybeOpenFeedbackDialog(conference: Object) {
    type R = {
        feedbackSubmitted: boolean,
        showThankYou: boolean
    };

    return (dispatch: Dispatch<*>, getState: Function): Promise<R> => {
        const state = getState();

        if (interfaceConfig.filmStripOnly || config.iAmRecorder) {
            // Intentionally fall through the if chain to prevent further action
            // from being taken with regards to showing feedback.
        } else if (state['features/base/dialog'].component === FeedbackDialog) {
            // Feedback is currently being displayed.

            return Promise.reject(FEEDBACK_REQUEST_IN_PROGRESS);
        } else if (state['features/feedback'].submitted) {
            // Feedback has been submitted already.

            return Promise.resolve({
                feedbackSubmitted: true,
                showThankYou: true
            });
        } else if (conference.isCallstatsEnabled()) {
            return new Promise(resolve => {
                dispatch(openFeedbackDialog(conference, {
                    onClose: () => {
                        const { submitted } = getState()['features/feedback'];

                        resolve({
                            feedbackSubmitted: submitted,
                            showThankYou: false
                        });
                    },
                    timeout: interfaceConfig.FEEDBACK_TIMEOUT
                }));
            });
        }

        // If the feedback functionality isn't enabled we show a "thank you"
        // message. Signaling it (true), so the caller of requestFeedback can
        // act on it.
        return Promise.resolve({
            feedbackSubmitted: false,
            showThankYou: true
        });
    };
}

/**
 * Opens {@code FeedbackDialog}.
 *
 * @param {JitsiConference} conference - The JitsiConference that is being
 * rated. The conference is passed in because feedback can occur after a
 * conference has been left, so references to it may no longer exist in redux.
 * @param {Object} options - The feedback dialog's properties.
 * @param {Function} [options.onClose] - An optional callback to invoke when
 * the dialog is closed.
 * @param {number} [options.timeout] - How many milliseconds will the dialog be
 * displayed, before being automatically dismissed. Zero or negative means
 * never.
 * @returns {Object}
 */
export function openFeedbackDialog(conference: Object, options: Object = { }) {
    let timeout = options.timeout;

    if (typeof timeout === 'undefined') {
        timeout = 60000;
    }

    return openDialog(FeedbackDialog, {
        conference,
        onClose: options.onClose,
        timeout
    });
}

/**
 * Send the passed in feedback.
 *
 * @param {number} score - An integer between 1 and 5 indicating the user
 * feedback. The negative integer -1 is used to denote no score was selected.
 * @param {string} message - Detailed feedback from the user to explain the
 * rating.
 * @param {JitsiConference} conference - The JitsiConference for which the
 * feedback is being left.
 * @returns {{
 *     type: SUBMIT_FEEDBACK
 * }}
 */
export function submitFeedback(
        score: number,
        message: string,
        conference: Object) {
    conference.sendFeedback(score, message);

    return {
        type: SUBMIT_FEEDBACK
    };
}
