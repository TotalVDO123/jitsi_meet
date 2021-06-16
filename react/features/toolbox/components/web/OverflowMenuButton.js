/* @flow */

import InlineDialog from '@atlaskit/inline-dialog';
import React, { Component } from 'react';

import { createToolbarEvent, sendAnalytics } from '../../../analytics';
import { translate } from '../../../base/i18n';
import { IconHorizontalPoints } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { getReactionsQueue } from '../../functions.web';

import Drawer from './Drawer';
import DrawerPortal from './DrawerPortal';
import ReactionEmoji from './ReactionEmoji';
import ToolbarButton from './ToolbarButton';

/**
 * The type of the React {@code Component} props of {@link OverflowMenuButton}.
 */
type Props = {

    /**
     * A child React Element to display within {@code InlineDialog}.
     */
    children: React$Node,

    /**
     * Whether or not the OverflowMenu popover should display.
     */
    isOpen: boolean,

    /**
     * Callback to change the visibility of the overflow menu.
     */
    onVisibilityChange: Function,

    /**
     * Whether to display the OverflowMenu as a drawer.
     */
    overflowDrawer: boolean,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    /**
     * The array of reactions to be displayed.
     */
    reactionsQueue: Array
};

/**
 * A React {@code Component} for opening or closing the {@code OverflowMenu}.
 *
 * @extends Component
 */
class OverflowMenuButton extends Component<Props> {
    /**
     * Initializes a new {@code OverflowMenuButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onCloseDialog = this._onCloseDialog.bind(this);
        this._onToggleDialogVisibility
            = this._onToggleDialogVisibility.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { children, isOpen, overflowDrawer, reactionsQueue } = this.props;

        return (
            <div className = 'toolbox-button-wth-dialog'>
                {
                    overflowDrawer ? (
                        <>
                            {this._renderToolbarButton()}
                            <DrawerPortal>
                                <Drawer
                                    isOpen = { isOpen }
                                    onClose = { this._onCloseDialog }>
                                    {children}
                                </Drawer>
                                {<div className = 'reactions-animations-container'>
                                    {reactionsQueue.map(({ reaction, uid }, index) => (<ReactionEmoji
                                        index = { index }
                                        key = { uid }
                                        reaction = { reaction }
                                        uid = { uid } />))}
                                </div>}
                            </DrawerPortal>
                        </>
                    ) : (
                        <InlineDialog
                            content = { children }
                            isOpen = { isOpen }
                            onClose = { this._onCloseDialog }
                            placement = 'top-end'>
                            {this._renderToolbarButton()}
                        </InlineDialog>
                    )
                }
            </div>
        );
    }

    _renderToolbarButton: () => React$Node;

    /**
     * Renders the actual toolbar overflow menu button.
     *
     * @returns {ReactElement}
     */
    _renderToolbarButton() {
        const { isOpen, t } = this.props;

        return (
            <ToolbarButton
                accessibilityLabel =
                    { t('toolbar.accessibilityLabel.moreActions') }
                icon = { IconHorizontalPoints }
                onClick = { this._onToggleDialogVisibility }
                toggled = { isOpen }
                tooltip = { t('toolbar.moreActions') } />
        );
    }

    _onCloseDialog: () => void;

    /**
     * Callback invoked when {@code InlineDialog} signals that it should be
     * close.
     *
     * @private
     * @returns {void}
     */
    _onCloseDialog() {
        this.props.onVisibilityChange(false);
    }

    _onToggleDialogVisibility: () => void;

    /**
     * Callback invoked to signal that an event has occurred that should change
     * the visibility of the {@code InlineDialog} component.
     *
     * @private
     * @returns {void}
     */
    _onToggleDialogVisibility() {
        sendAnalytics(createToolbarEvent('overflow'));

        this.props.onVisibilityChange(!this.props.isOpen);
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code OverflowMenuButton} component.
 *
 * @param {Object} state - The Redux state.
 * @returns {Props}
 */
function mapStateToProps(state) {
    const { overflowDrawer } = state['features/toolbox'];

    return {
        overflowDrawer,
        reactionsQueue: getReactionsQueue(state)
    };
}

export default translate(connect(mapStateToProps)(OverflowMenuButton));
