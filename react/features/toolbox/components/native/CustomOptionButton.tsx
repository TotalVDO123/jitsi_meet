import React from 'react';
import { connect } from 'react-redux';

import AbstractButton, { IProps as AbstractButtonProps } from '../../../base/toolbox/components/AbstractButton';
import Icon from '../../../base/icons/components/Icon';
import { translate } from '../../../base/i18n/functions';


interface IProps extends AbstractButtonProps {
    icon: Function;
    id?: string;
    handlePress?: Function;
    notifyPress?: string;
    text: string;
}

/**
 * Component that renders a custom button.
 *
 * @returns {Component}
 */
class CustomOptionButton extends AbstractButton<IProps> {
    iconSrc = this.props.icon;
    id = this.props.id;
    handlePress = this.props.handlePress;
    notifyPress = this.props.notifyPress;
    text = this.props.text;

    /**
     * Custom icon component.
     *
     * @param {any} props - Icon's props.
     * @returns {img}
     */
    icon = (props: any) => (
        <Icon
            { ...props }
            size = { 24 }
            src = { this.iconSrc } />
    );

    handleClick = this.handlePress;
    notifyMode = this.notifyPress;
    label = this.text;
}

export default translate(connect()(CustomOptionButton));
