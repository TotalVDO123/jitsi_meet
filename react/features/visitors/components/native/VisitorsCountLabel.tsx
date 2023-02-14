import React from 'react';
import { useSelector } from 'react-redux';

import { IReduxState } from '../../../app/types';
import { IconUsers } from '../../../base/icons/svg';
// eslint-disable-next-line lines-around-comment
// @ts-ignore
import Label from '../../../base/label/components/native/Label';
import BaseTheme from '../../../base/ui/components/BaseTheme.native';
import { getVisitorsShortText } from '../../functions';

const styles = {
    raisedHandsCountLabel: {
        alignItems: 'center',
        backgroundColor: BaseTheme.palette.warning02,
        borderRadius: BaseTheme.shape.borderRadius,
        flexDirection: 'row',
        marginLeft: BaseTheme.spacing[0],
        marginBottom: BaseTheme.spacing[0]
    },

    raisedHandsCountLabelText: {
        color: BaseTheme.palette.uiBackground,
        paddingLeft: BaseTheme.spacing[2]
    }
};

const VisitorsCountLabel = () => {
    const visitorsMode = useSelector((state: IReduxState) => state['features/visitors'].enabled);
    const visitorsCount = useSelector((state: IReduxState) =>
        state['features/visitors'].count || 0);

    return visitorsMode && (
        <Label
            icon = { IconUsers }
            iconColor = { BaseTheme.palette.uiBackground }
            style = { styles.raisedHandsCountLabel }
            text = { `${getVisitorsShortText(visitorsCount)}` }
            textStyle = { styles.raisedHandsCountLabelText } />
    );
};

export default VisitorsCountLabel;
