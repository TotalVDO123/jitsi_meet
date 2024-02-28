import React from 'react';
import { connect } from 'react-redux';

import { translate } from '../../../base/i18n/functions';
import Dialog from '../../../base/ui/components/web/Dialog';
import AbstractDemoteToVisitorDialog from '../AbstractDemoteToVisitorDialog';

/**
 * Dialog to confirm a remote participant demote action.
 */
class DemoteToVisitorDialog extends AbstractDemoteToVisitorDialog {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                ok = {{ translationKey: 'dialog.demoteParticipantButton' }}
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.demoteParticipantTitle'>
                <div>
                    { this.props.t('dialog.demoteParticipantDialog') }
                </div>
            </Dialog>
        );
    }
}

export default translate(connect()(DemoteToVisitorDialog));
