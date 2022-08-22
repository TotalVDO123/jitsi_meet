/* eslint-disable lines-around-comment  */
import { Component } from 'react';
// @ts-ignore
import { WithTranslation } from 'react-i18next';

import {
    createRecordingDialogEvent,
    sendAnalytics
    // @ts-ignore
} from '../../../analytics';
// @ts-ignore
import { ColorSchemeRegistry } from '../../../base/color-scheme';
// @ts-ignore
import {
    _abstractMapStateToProps
    // @ts-ignore
} from '../../../base/dialog';
// @ts-ignore
import { StyleType } from '../../../base/styles';
// @ts-ignore
import { authorizeDropbox, updateDropboxToken } from '../../../dropbox';
// @ts-ignore
import { isVpaasMeeting } from '../../../jaas/functions';
// @ts-ignore
import { RECORDING_TYPES } from '../../constants';
// @ts-ignore
import { supportsLocalRecording } from '../../functions';

/**
 * The type of the React {@code Component} props of
 * {@link AbstractStartRecordingDialogContent}.
 */
export interface Props extends WithTranslation {

    /**
     * Style of the dialogs feature.
     */
    _dialogStyles: StyleType,

    /**
     * Whether to hide the storage warning or not.
     */
    _hideStorageWarning: boolean,

    /**
     * Whether local recording is available or not.
     */
    _localRecordingAvailable: boolean,

    /**
     * Whether local recording is enabled or not.
     */
    _localRecordingEnabled: boolean,

    /**
     * Whether we won't notify the other participants about the recording.
     */
    _localRecordingNoNotification: boolean,

    /**
     * Whether self local recording is enabled or not.
     */
    _localRecordingSelfEnabled: boolean,

    /**
     * The color-schemed stylesheet of this component.
     */
    _styles: StyleType,

    /**
     * The redux dispatch function.
     */
    dispatch: Function,

    /**
     * Whether to show file recordings service, even if integrations
     * are enabled.
     */
    fileRecordingsServiceEnabled: boolean,

    /**
     * Whether to show the possibility to share file recording with other people (e.g. Meeting participants), based on
     * the actual implementation on the backend.
     */
    fileRecordingsServiceSharingEnabled: boolean,

    /**
     * If true the content related to the integrations will be shown.
     */
    integrationsEnabled: boolean,

    /**
     * <tt>true</tt> if we have valid oauth token.
     */
    isTokenValid: boolean,

    /**
     * <tt>true</tt> if we are in process of validating the oauth token.
     */
    isValidating: boolean,

    /**
     * Whether or not the current meeting is a vpaas one.
     */
    isVpaas: boolean,

    /**
     * Whether or not we should only record the local streams.
     */
    localRecordingOnlySelf: boolean,

    /**
     * The function will be called when there are changes related to the
     * switches.
     */
    onChange: Function,

    /**
     * Callback to change the local recording only self setting.
     */
    onLocalRecordingSelfChange: Function,

    /**
     * Callback to be invoked on sharing setting change.
     */
    onSharingSettingChanged: Function,

    /**
     * The currently selected recording service of type: RECORDING_TYPES.
     */
    selectedRecordingService: string | null,

    /**
     * Boolean to set file recording sharing on or off.
     */
    sharingSetting: boolean,

    /**
     * Number of MiB of available space in user's Dropbox account.
     */
    spaceLeft: number | null,

    /**
     * The display name of the user's Dropbox account.
     */
    userName: string | null
}

/**
 * React Component for getting confirmation to start a file recording session.
 *
 * @augments Component
 */
class AbstractStartRecordingDialogContent<P extends Props> extends Component<P> {
    /**
     * Initializes a new {@code AbstractStartRecordingDialogContent} instance.
     *
     * @inheritdoc
     */
    constructor(props: P) {
        super(props);

        // Bind event handler; it bounds once for every instance.
        this._onSignIn = this._onSignIn.bind(this);
        this._onSignOut = this._onSignOut.bind(this);
        this._onDropboxSwitchChange = this._onDropboxSwitchChange.bind(this);
        this._onRecordingServiceSwitchChange = this._onRecordingServiceSwitchChange.bind(this);
        this._onLocalRecordingSwitchChange = this._onLocalRecordingSwitchChange.bind(this);
    }

    /**
     * Implements the Component's componentDidMount method.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (!this._shouldRenderNoIntegrationsContent()
            && !this._shouldRenderIntegrationsContent()
            && !this._shouldRenderFileSharingContent()) {
            this._onLocalRecordingSwitchChange();
        }
    }

    /**
     * Implements {@code Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps: Props) {
        // Auto sign-out when the use chooses another recording service.
        if (prevProps.selectedRecordingService === RECORDING_TYPES.DROPBOX
                && this.props.selectedRecordingService !== RECORDING_TYPES.DROPBOX && this.props.isTokenValid) {
            this._onSignOut();
        }
    }

    /**
     * Whether the file sharing content should be rendered or not.
     *
     * @returns {boolean}
     */
    _shouldRenderFileSharingContent() {
        const {
            fileRecordingsServiceEnabled,
            fileRecordingsServiceSharingEnabled,
            isVpaas,
            selectedRecordingService
        } = this.props;

        if (!fileRecordingsServiceEnabled
            || !fileRecordingsServiceSharingEnabled
            || isVpaas
            || selectedRecordingService !== RECORDING_TYPES.JITSI_REC_SERVICE) {
            return false;
        }

        return true;
    }

    /**
     * Whether the no integrations content should be rendered or not.
     *
     * @returns {boolean}
     */
    _shouldRenderNoIntegrationsContent() {
        // show the non integrations part only if fileRecordingsServiceEnabled
        // is enabled
        if (!this.props.fileRecordingsServiceEnabled) {
            return false;
        }

        return true;
    }

    /**
     * Whether the integrations content should be rendered or not.
     *
     * @returns {boolean}
     */
    _shouldRenderIntegrationsContent() {
        if (!this.props.integrationsEnabled) {
            return false;
        }

        return true;
    }

    /**
     * Handler for onValueChange events from the Switch component.
     *
     * @returns {void}
     */
    _onRecordingServiceSwitchChange() {
        const {
            onChange,
            selectedRecordingService
        } = this.props;

        // act like group, cannot toggle off
        if (selectedRecordingService === RECORDING_TYPES.JITSI_REC_SERVICE) {
            return;
        }

        onChange(RECORDING_TYPES.JITSI_REC_SERVICE);
    }

    /**
     * Handler for onValueChange events from the Switch component.
     *
     * @returns {void}
     */
    _onDropboxSwitchChange() {
        const {
            isTokenValid,
            onChange,
            selectedRecordingService
        } = this.props;

        // act like group, cannot toggle off
        if (selectedRecordingService === RECORDING_TYPES.DROPBOX) {
            return;
        }

        onChange(RECORDING_TYPES.DROPBOX);

        if (!isTokenValid) {
            this._onSignIn();
        }
    }

    /**
     * Handler for onValueChange events from the Switch component.
     *
     * @returns {void}
     */
    _onLocalRecordingSwitchChange() {
        const {
            _localRecordingAvailable,
            onChange,
            selectedRecordingService
        } = this.props;

        if (!_localRecordingAvailable) {
            return;
        }

        // act like group, cannot toggle off
        if (selectedRecordingService
            === RECORDING_TYPES.LOCAL) {
            return;
        }

        onChange(RECORDING_TYPES.LOCAL);
    }

    /**
     * Sings in a user.
     *
     * @returns {void}
     */
    _onSignIn() {
        sendAnalytics(createRecordingDialogEvent('start', 'signIn.button'));
        this.props.dispatch(authorizeDropbox());
    }

    /**
     * Sings out an user from dropbox.
     *
     * @returns {void}
     */
    _onSignOut() {
        sendAnalytics(createRecordingDialogEvent('start', 'signOut.button'));
        this.props.dispatch(updateDropboxToken());
    }
}

/**
 * Maps part of the redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The own props of the component.
 * @returns {Props}
 */
export function mapStateToProps(state: any, ownProps: Props) {
    const localRecordingAvailable
        = ownProps._localRecordingEnabled && supportsLocalRecording();

    return {
        ..._abstractMapStateToProps(state),
        isVpaas: isVpaasMeeting(state),
        _hideStorageWarning: state['features/base/config'].recordingService?.hideStorageWarning,
        _localRecordingAvailable: localRecordingAvailable,
        _localRecordingEnabled: !state['features/base/config'].localRecording?.disable,
        _localRecordingSelfEnabled: !state['features/base/config'].localRecording?.disableSelfRecording,
        _localRecordingNoNotification: !state['features/base/config'].localRecording?.notifyAllParticipants,
        _styles: ColorSchemeRegistry.get(state, 'StartRecordingDialogContent')
    };
}

export default AbstractStartRecordingDialogContent;
