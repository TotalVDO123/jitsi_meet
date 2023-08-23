import React, { Component } from 'react';
import { connect } from 'react-redux';

import { IReduxState, IStore } from '../../../app/types';
import ConfirmDialog from '../../../base/dialog/components/native/ConfirmDialog';
import { translate } from '../../../base/i18n/functions';
import { cancelWaitForOwner, login } from '../../actions.native';


/**
 * The type of the React {@code Component} props of {@link WaitForOwnerDialog}.
 */
interface IProps {

    /**
     * Whether to show alternative cancel button text.
     */
    _alternativeCancelText?: boolean;

    /**
     * Redux store dispatch function.
     */
    dispatch: IStore['dispatch'];

    /**
     * Invoked to obtain translated strings.
     */
    t: Function;
}

/**
 * The dialog is display in XMPP password + guest access configuration, after
 * user connects from anonymous domain and the conference does not exist yet.
 *
 * See {@link LoginDialog} description for more details.
 */
class WaitForOwnerDialog extends Component<IProps> {
    /**
     * Initializes a new WaitForWonderDialog instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onCancel = this._onCancel.bind(this);
        this._onLogin = this._onLogin.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <ConfirmDialog
                cancelLabel = { this.props._alternativeCancelText ? 'dialog.WaitingForHostButton' : 'dialog.Cancel' }
                confirmLabel = 'dialog.IamHost'
                descriptionKey = 'dialog.WaitForHostMsg'
                onCancel = { this._onCancel }
                onSubmit = { this._onLogin } />
        );
    }

    /**
     * Called when the cancel button is clicked.
     *
     * @private
     * @returns {void}
     */
    _onCancel() {
        this.props.dispatch(cancelWaitForOwner());
    }

    /**
     * Called when the OK button is clicked.
     *
     * @private
     * @returns {void}
     */
    _onLogin() {
        this.props.dispatch(login());

        return true;
    }
}

/**
 * Maps (parts of) the redux state to the associated
 * {@code WaitForOwnerDialog}'s props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {IProps}
 */
function mapStateToProps(state: IReduxState) {
    const { membersOnly, lobbyWaitingForHost } = state['features/base/conference'];

    return {
        _alternativeCancelText: membersOnly && lobbyWaitingForHost
    };
}

export default translate(connect(mapStateToProps)(WaitForOwnerDialog));
