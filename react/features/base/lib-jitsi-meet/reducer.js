// @flow

import { ReducerRegistry } from '../redux';

import {
    LIB_DID_DISPOSE,
    LIB_DID_INIT,
    LIB_INIT_ERROR
} from './actionTypes.ts';

/**
 * The default/initial redux state of the feature base/lib-jitsi-meet.
 *
 * @type {Object}
 */
const DEFAULT_STATE = {};

ReducerRegistry.register(
    'features/base/lib-jitsi-meet',
    (state = DEFAULT_STATE, action) => {
        switch (action.type) {
        case LIB_DID_DISPOSE:
            return DEFAULT_STATE;

        case LIB_DID_INIT:
            return {
                ...state,
                initError: undefined,
                initialized: true
            };

        case LIB_INIT_ERROR:
            return {
                ...state,
                initError: action.error,
                initialized: false
            };

        default:
            return state;
        }
    });
