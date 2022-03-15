// @flow

import { i18next } from '../i18n';
import { I18NEXT_INITIALIZED, LANGUAGE_CHANGED } from '../i18n/actionTypes';
import { MiddlewareRegistry } from '../redux';

import { setLanguageDirection } from './actions';
import { detectDirectionBasedOnLanguage } from './functions';

/**
 * Middleware that captures I18NEXT_INITIALIZED and LANGUAGE_CHANGED actions and
 * change the direction of the app based on the language that is set.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case I18NEXT_INITIALIZED:
    case LANGUAGE_CHANGED :{

        // XXX Right now, removing the following line will mess up with the app layout.
        // Remove the following line only for testing purposes.
        break;

        // eslint-disable-next-line no-unreachable
        const { language } = i18next;
        const direction = detectDirectionBasedOnLanguage(language);

        // Make sure the dir attribute is set on the body, otherwise native components will break.
        document.getElementsByTagName('body')[0].dir = direction;

        store.dispatch(setLanguageDirection(direction));
        break;
    }
    }

    return next(action);
});
