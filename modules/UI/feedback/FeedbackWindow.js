/* global $, APP, interfaceConfig, AJS */

const labels = {
    1: 'Very Bad',
    2: 'Bad',
    3: 'Not Bad',
    4: 'Good',
    5: 'Very Good'
};
/**
 * Toggles the appropriate css class for the given number of stars, to
 * indicate that those stars have been clicked/selected.
 *
 * @param starCount the number of stars, for which to toggle the css class
 */
function toggleStars(starCount) {
    let labelEl = $('#starLabel');
    let label = starCount >= 0 ?
        labels[starCount + 1] :
        '';

    $('#stars > a').each(function(index, el) {
        if (index <= starCount) {
            el.classList.add("starHover");
        } else
            el.classList.remove("starHover");
    });
    labelEl.text(label);
};

/**
 * Constructs the html for the rated feedback window.
 *
 * @returns {string} the contructed html string
 */
function createRateFeedbackHTML() {
    let rateExperience
            = APP.translation.translateString('dialog.rateExperience'),
        feedbackHelp = APP.translation.translateString('dialog.feedbackHelp');

    let starClassName = (interfaceConfig.ENABLE_FEEDBACK_ANIMATION)
        ? "icon-star shake-rotate"
        : "icon-star";

    return `
        <form id="feedbackForm"
            action="javascript:false;" onsubmit="return false;">
            <div class="rating">
                <div class="star-label">
                    <p id="starLabel">&nbsp;</p>
                </div>
                <div id="stars" class="feedback-stars">
                    <a class="star-btn">
                        <i class=${ starClassName }></i>
                    </a>
                    <a class="star-btn">
                        <i class=${ starClassName }></i>
                    </a>
                    <a class="star-btn">
                        <i class=${ starClassName }></i>
                    </a>
                    <a class="star-btn">
                        <i class=${ starClassName }></i>
                    </a>
                    <a class="star-btn">
                        <i class=${ starClassName }></i>
                    </a>
                </div>
            </div>
            <div class="details">
                <textarea id="feedbackTextArea"
                    placeholder="${ feedbackHelp }"></textarea>
            </div>
        </form>`;
};

/**
 * Callback for Rate Feedback
 *
 * @param Feedback
 */
let onLoadRateFunction = function (Feedback) {
    $('#stars > a').each((index, el) => {
        el.onmouseover = function(){
            toggleStars(index);
        };
        el.onmouseleave = function(){
            toggleStars(Feedback.feedbackScore - 1);
        };
        el.onclick = function(){
            Feedback.feedbackScore = index + 1;
        };
    });

    // Init stars to correspond to previously entered feedback.
    if (Feedback.feedbackScore > 0) {
        toggleStars(Feedback.feedbackScore - 1);
    }

    if (Feedback.feedbackMessage && Feedback.feedbackMessage.length > 0)
        $('#feedbackTextArea').text(Feedback.feedbackMessage);

    $('#feedbackTextArea').focus();
};

function onFeedbackSubmitted(Feedback) {
    let form = $('#feedbackForm');
    let message = form.find('textarea').val();

    APP.conference.sendFeedback(
        Feedback.feedbackScore,
        message);

    // TODO: make sendFeedback return true or false. (done in Kostya's PR)
    Feedback.submitted = true;

    //Remove history is submitted
    //Feedback.feedbackScore = -1;
    //Feedback.feedbackMessage ='';
    Feedback.hide();
}

/**
 * @class Dialog
 *
 */
export default class Dialog {

    constructor() {
        this.feedbackScore = -1;
        this.feedbackMessage = '';
        this.submitted = false;

        this.setDefoulOptions();
    }

    setDefoulOptions() {
        var self = this;

        this.options = {
            titleKey: 'dialog.rateExperience',
            msgString: createRateFeedbackHTML(),
            submitFunction: function() {onFeedbackSubmitted(self);},
            loadedFunction: function() {onLoadRateFunction(self);},
            wrapperClass: 'feedback',
            size: 'medium'
        };
    }

    setFeedbackMessage() {
        let message = $('#feedbackTextArea').val();

        this.feedbackMessage = message;
    }

    show(cb) {
        if (typeof cb !== 'function') {
            cb = function() { };
        }
        let options = this.options;

        options.closeFunction = function() {
            cb();
        };
        this.window = APP.UI.messageHandler.openTwoButtonDialog(options);
    }

    hide() {
        this.setFeedbackMessage();
    }
}
