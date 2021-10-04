// @flow

import { getCurrentConference } from '../base/conference';
import { JitsiConferenceEvents } from '../base/lib-jitsi-meet';
import { StateListenerRegistry } from '../base/redux';
import {
    NOTIFICATION_TIMEOUT,
    NOTIFICATION_TYPE,
    showNotification
} from '../notifications';

import {
    receiveAnswer,
    receivePoll,
    receivePolls,
    hidePoll,
    showPoll
} from './actions';
import {
    COMMAND_NEW_POLL,
    COMMAND_NEW_POLLS,
    COMMAND_SHOW_POLL,
    COMMAND_HIDE_POLL,
    COMMAND_ANSWER_POLL,
    COMMAND_OLD_POLLS
} from './constants';
import { formatNewPollData, getNewPollId } from './functions';
import type { Answer, Poll } from './types';


const parsePollData = (pollData): Poll | null => {
    if (typeof pollData !== 'object' || pollData === null) {
        return null;
    }
    const { id, senderId, senderName, question, answers, hidden } = pollData;

    if (typeof id !== 'string' || typeof senderId !== 'string' || typeof senderName !== 'string'
        || typeof question !== 'string' || !(answers instanceof Array)) {
        return null;
    }

    const answersParsed = [];

    for (const answer of answers) {
        const voters = new Map();

        for (const [ voterId, voter ] of Object.entries(answer.voters)) {
            if (typeof voter !== 'string') {
                return null;
            }
            voters.set(voterId, voter);
        }

        answersParsed.push({
            name: answer.name,
            voters
        });
    }

    return {
        senderId,
        senderName,
        question,
        hidden,
        showResults: true,
        lastVote: null,
        answers: answersParsed
    };
};

StateListenerRegistry.register(
    state => getCurrentConference(state),
    (conference, store, previousConference) => {
        if (conference && conference !== previousConference) {
            const receiveMessage = (_, data) => {
                switch (data.type) {
                case COMMAND_NEW_POLL: {
                    const { pollId } = data;
                    const poll = formatNewPollData(data);

                    store.dispatch(receivePoll(pollId, poll, true));

                    if (!poll.hidden) {
                        store.dispatch(showNotification({
                            appearance: NOTIFICATION_TYPE.NORMAL,
                            titleKey: 'polls.notification.title',
                            descriptionKey: 'polls.notification.description'
                        }, NOTIFICATION_TIMEOUT));
                    }
                    break;
                }
                case COMMAND_NEW_POLLS: {
                    const { polls } = data;
                    const newPollsData = polls.map(poll => formatNewPollData(poll));
                    const newPollIds = polls.map(() => getNewPollId());
console.log('newPollsData xxxxx: ', newPollsData);
console.log('newPollIds xxxxx: ', newPollIds);
                    store.dispatch(receivePolls(newPollIds, newPollsData, true));

                    if (newPollsData.some(poll => !poll.hidden)) {
                        store.dispatch(showNotification({
                            appearance: NOTIFICATION_TYPE.NORMAL,
                            titleKey: 'polls.notification.title',
                            descriptionKey: 'polls.notification.description'
                        }, NOTIFICATION_TIMEOUT));
                    }
                    break;

                }

                case COMMAND_SHOW_POLL: {
                    const { pollId } = data;

                    store.dispatch(showPoll(pollId));
                    store.dispatch(showNotification({
                        appearance: NOTIFICATION_TYPE.NORMAL,
                        titleKey: 'polls.notification.title',
                        descriptionKey: 'polls.notification.description'
                    }, NOTIFICATION_TIMEOUT));
                    break;

                }

                case COMMAND_HIDE_POLL: {
                    const { pollId } = data;

                    store.dispatch(hidePoll(pollId));
                    break;

                }

                case COMMAND_ANSWER_POLL: {
                    const { pollId, answers, voterId, voterName } = data;

                    const receivedAnswer: Answer = {
                        voterId,
                        voterName,
                        pollId,
                        answers
                    };

                    store.dispatch(receiveAnswer(pollId, receivedAnswer));
                    break;

                }

                case COMMAND_OLD_POLLS: {
                    const { polls } = data;

                    for (const pollData of polls) {
                        const poll = parsePollData(pollData);

                        if (poll === null) {
                            console.warn('[features/polls] Invalid old poll data');
                        } else {
                            store.dispatch(receivePoll(pollData.id, poll, false));
                        }
                    }
                    break;
                }
                }
            };

            conference.on(JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED, receiveMessage);
            conference.on(JitsiConferenceEvents.NON_PARTICIPANT_MESSAGE_RECEIVED, receiveMessage);
        }
    }
);
