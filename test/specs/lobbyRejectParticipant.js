const LobbyNotification = require("../page-objects/notifications/LobbyNotification");
import { v4 as uuidv4 } from "uuid";
//const LobbyRejectNotification = require("../page-objects/notifications/LobbyRejectNotification")
const Toolbox = require("../page-objects/Toolbox");
const SecurityDialog = require("../page-objects/SecurityDialog");
import {
    ENTER_KEY,
    FIRST_PARTICIPANT,
    SECOND_PARTICIPANT
} from "../helpers/constants"
import createBrowserSession from "../helpers/createBrowserSession";
import openParticipantsPane from "../helpers/openParticipantsPane";
import createMeetingUrl from "../helpers/createMeetingUrl"
import createMeetingRoom from "../helpers/createMeetingRoom";

describe('Activate lobby and admit participant', () => {
    let meetingUrl;
    let Participant;
    it('should open jitsi-meet app and enable lobby', async () => {
        meetingUrl = await createMeetingUrl();
        await createMeetingRoom(meetingUrl)
        const prejoinTextInput = await $('.prejoin-input-area input');
        await prejoinTextInput.setValue(FIRST_PARTICIPANT);
        await browser.keys(ENTER_KEY);
        const toolbox = await Toolbox.ToolboxView;
        await expect(toolbox).toBeDisplayed();
        const toolbarSecurityOption = await Toolbox.MoreActionOption;
        await expect(toolbarSecurityOption).toBeDisplayed();
        await toolbarSecurityOption.click();
        const overflowMenu = await Toolbox.OverflowMenu;
        await expect(overflowMenu).toBeDisplayed();
        const securityOptionsButton = await Toolbox.SecurityOptionButton;
        await expect(securityOptionsButton).toBeDisplayed();
        await securityOptionsButton.click();
        const securityDialog = await SecurityDialog.SecurityDialogView;
        await expect(securityDialog).toBeDisplayed();
        const lobbySwitch = await SecurityDialog.LobbySwitch;
        await expect(lobbySwitch).toBeDisplayed();
        await lobbySwitch.click();
        const lobbyEnabled = await SecurityDialog.LobbyEnabled;
        await expect(lobbyEnabled).toBeDisplayed();
        const securityDialogCloseButton = await SecurityDialog.SecurityDialogCloseButton;
        await expect(securityDialogCloseButton).toBeDisplayed();
        await securityDialogCloseButton.click();
    });
    it('should open jitsi-meet with same room name where second participant wants to join', async () => {
        Participant = await createBrowserSession()
        await Participant.url(meetingUrl);
        const prejoinTextInput = await Participant.$('.prejoin-input-area input');
        await prejoinTextInput.setValue(SECOND_PARTICIPANT);
        await Participant.keys(ENTER_KEY);
    });
    it('Moderator should reject the user that wants to join the meeting', async () => {
        const notification = await LobbyNotification.Notification;
        await expect(notification).toBeDisplayed();
        const lobbyAdmitBtn = await LobbyNotification.AdmitLobby;
        await expect(lobbyAdmitBtn).toBeDisplayed();
        const lobbyRejectBtn = await LobbyNotification.RejectLobby;
        await expect(lobbyRejectBtn).toBeDisplayed();
        await lobbyRejectBtn.click();
        // TODO: Find a solution to select Participant.LobbyNotification.Notidication
        // instead of Participant.$('#notifications-container').
        const rejectNotification = await Participant.$('#notifications-container');
        await expect(rejectNotification).toBeDisplayed();
        // TODO: Find a solution to select Participant.LobbyRejectNotification.Notidication
        // instead of Participant.$('[data-testid="lobby.joinRejectedMessage"]').
        const rejectedMessage = await Participant.$('[data-testid="lobby.joinRejectedMessage"]')
        await expect(rejectedMessage).toBeDisplayed();
        await browser.deleteSession();
        await Participant.deleteSession();
    });
});
