import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getUnreadCount } from '../functions';

/**
 * Combine with ParticipantsCounter
 */
class ChatCounter extends Component {
    static propTypes = {
        /**
         * The number of unread chat messages in the conference.
         */
        _count: PropTypes.number
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <span className = 'badge-round'>
                <span id = 'numberOfParticipants'>
                    { this.props._count || null }
                </span>
            </span>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code ChatCounter}'s
 * props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _count: number
 * }}
 */
function _mapStateToProps(state) {
    return {
        _count: getUnreadCount(state)
    };
}

export default connect(_mapStateToProps)(ChatCounter);
