// @flow

import { ColorPalette, createStyleSheet } from '../../../base/styles';
import BaseTheme from '../../../base/ui/components/BaseTheme.native';

export const dialogStyles = createStyleSheet({
    question: {
        borderWidth: 1,
        borderColor: BaseTheme.palette.border05,
        borderRadius: BaseTheme.shape.borderRadius,
        color: BaseTheme.palette.text03,
        fontSize: 14,
        marginHorizontal: BaseTheme.spacing[3],
        marginBottom: BaseTheme.spacing[3],
        padding: BaseTheme.spacing[3]
    },

    optionContainer: {
        flexDirection: 'column',
        marginTop: BaseTheme.spacing[3],
        marginHorizontal: BaseTheme.spacing[3]
    },

    optionFieldLabel: {
        color: BaseTheme.palette.text03,
        marginBottom: BaseTheme.spacing[2]
    },

    field: {
        color: BaseTheme.palette.text03,
        borderWidth: 1,
        borderColor: BaseTheme.palette.border05,
        borderRadius: BaseTheme.shape.borderRadius,
        fontSize: 14,
        padding: BaseTheme.spacing[3]
    }
});

export const resultsStyles = createStyleSheet({
    title: {
        fontSize: 24,
        fontWeight: 'bold'
    },

    barContainer: {
        backgroundColor: '#ccc',
        borderRadius: 3,
        width: '100%',
        height: 6,
        marginTop: 2
    },

    bar: {
        backgroundColor: ColorPalette.blue,
        borderRadius: 3,
        height: 6
    },

    voters: {
        borderRadius: 3,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 2,
        marginHorizontal: 8,
        marginVertical: 4
    },

    voter: {
        color: BaseTheme.palette.text01
    },

    answerContainer: {
        marginVertical: 2,
        maxWidth: '100%'
    },

    answerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    answer: {
        color: BaseTheme.palette.text01,
        flexShrink: 1
    },

    answerVoteCount: {
        paddingLeft: 10
    },

    chatQuestion: {
        fontWeight: 'bold'
    }
});

export const chatStyles = createStyleSheet({
    questionFieldLabel: {
        color: BaseTheme.palette.text03,
        marginBottom: BaseTheme.spacing[2],
        marginLeft: BaseTheme.spacing[3]
    },

    noPollContent: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '4%'
    },

    noPollText: {
        flex: 1,
        color: BaseTheme.palette.text03,
        textAlign: 'center',
        maxWidth: '70%'
    },

    pollItemContainer: {
        borderRadius: 4,
        borderColor: '#2183ad',
        borderWidth: 2,
        padding: 16,
        marginBottom: 8
    },

    pollCreateContainer: {
        flex: 1
    },

    pollCreateSubContainer: {
        flex: 1,
        marginTop: BaseTheme.spacing[3]
    },

    pollCreateButtonsContainer: {
        marginHorizontal: BaseTheme.spacing[3],
        marginVertical: '8%'
    },

    pollCreateButton: {
        flex: 1,
        padding: 4,
        marginHorizontal: BaseTheme.spacing[2]
    },

    pollSendLabel: {
        color: BaseTheme.palette.text01
    },

    pollSendDisabledLabel: {
        color: BaseTheme.palette.text03
    },

    buttonRow: {
        flexDirection: 'row'
    },

    answerContent: {
        paddingBottom: 8
    },

    switchRow: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 6
    },

    switchLabel: {
        color: BaseTheme.palette.text01,
        marginLeft: BaseTheme.spacing[2]
    },

    pollCreateAddButton: {
        margin: BaseTheme.spacing[2],
        padding: BaseTheme.spacing[1]
    },

    toggleText: {
        color: ColorPalette.blue,
        paddingTop: BaseTheme.spacing[3]
    },

    createPollButton: {
        padding: 4,
        marginHorizontal: BaseTheme.spacing[4],
        marginVertical: '8%'
    },

    pollPane: {
        flex: 1,
        padding: 8
    },

    pollPaneContainer: {
        backgroundColor: BaseTheme.palette.ui01,
        flex: 1
    },

    bottomLinks: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});
