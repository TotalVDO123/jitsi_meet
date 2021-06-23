// @flow

import { MiddlewareRegistry } from '../base/redux';
import { addReactionsMessage } from '../chat/actions.any';

import {
    CLEAR_TOOLBOX_TIMEOUT,
    SET_TOOLBOX_TIMEOUT,
    SET_FULL_SCREEN,
    SET_REACTIONS_MESSAGE,
    CLEAR_REACTIONS_MESSAGE
} from './actionTypes';
import { flushReactionsToChat } from './actions.any';


declare var APP: Object;

/**
 * Middleware which intercepts Toolbox actions to handle changes to the
 * visibility timeout of the Toolbox.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const { dispatch, getState } = store;

    switch (action.type) {
    case CLEAR_TOOLBOX_TIMEOUT: {
        const { timeoutID } = getState()['features/toolbox'];

        clearTimeout(timeoutID);
        break;
    }

    case SET_FULL_SCREEN:
        return _setFullScreen(next, action);

    case SET_TOOLBOX_TIMEOUT: {
        const { timeoutID } = getState()['features/toolbox'];
        const { handler, timeoutMS } = action;

        clearTimeout(timeoutID);
        action.timeoutID = setTimeout(handler, timeoutMS);

        break;
    }

    case SET_REACTIONS_MESSAGE: {
        const { timeoutID, message } = getState()['features/toolbox'].reactions;
        const { reaction } = action;

        clearTimeout(timeoutID);
        action.message = `${message}${reaction}`;
        action.timeoutID = setTimeout(() => {
            dispatch(flushReactionsToChat());
        }, 500);

        break;
    }

    case CLEAR_REACTIONS_MESSAGE: {
        const { message } = getState()['features/toolbox'].reactions;

        dispatch(addReactionsMessage(message));

        break;
    }
    }

    return next(action);
});

type DocumentElement = {
    +requestFullscreen?: Function,
    +mozRequestFullScreen?: Function,
    +webkitRequestFullscreen?: Function
}

/**
 * Makes an external request to enter or exit full screen mode.
 *
 * @param {Dispatch} next - The redux dispatch function to dispatch the
 * specified action to the specified store.
 * @param {Action} action - The redux action SET_FULL_SCREEN which is being
 * dispatched in the specified store.
 * @private
 * @returns {Object} The value returned by {@code next(action)}.
 */
function _setFullScreen(next, action) {
    if (typeof APP === 'object') {
        const { fullScreen } = action;

        if (fullScreen) {
            const documentElement: DocumentElement
                = document.documentElement || {};

            if (typeof documentElement.requestFullscreen === 'function') {
                documentElement.requestFullscreen();
            } else if (
                typeof documentElement.mozRequestFullScreen === 'function') {
                documentElement.mozRequestFullScreen();
            } else if (
                typeof documentElement.webkitRequestFullscreen === 'function') {
                documentElement.webkitRequestFullscreen();
            }
        } else {
            /* eslint-disable no-lonely-if */

            // $FlowFixMe
            if (typeof document.exitFullscreen === 'function') {
                document.exitFullscreen();

            // $FlowFixMe
            } else if (typeof document.mozCancelFullScreen === 'function') {
                document.mozCancelFullScreen();

            // $FlowFixMe
            } else if (typeof document.webkitExitFullscreen === 'function') {
                document.webkitExitFullscreen();
            }

            /* eslint-enable no-loney-if */
        }
    }

    return next(action);
}
