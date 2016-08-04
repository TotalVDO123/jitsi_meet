/* global config,  XMLHttpRequest, console, APP */

import TranscriptionService from "./AbstractTranscriptionService";
import Transcriber from "../transcriber";
import Word from "../word";

/**
 * Implements a TranscriptionService for a Sphinx4 http server
 */
var SphinxService = function() {
    //set the correct url
    this.url = getURL();
};

/**
 * Subclass of AbstractTranscriptionService
 */
SphinxService.prototype = Object.create(TranscriptionService.prototype);

/**
 * Set the right constructor
 */
SphinxService.constructor = SphinxService;

/**
 * Overrides the sendRequest method from AbstractTranscriptionService
 * it will send the audio stream the a Sphinx4 server to get the transcription
 *
 * @param byteArray the recorder audio stream an an array of bytes
 * @param callback the callback function retrieving the server response
 */
SphinxService.prototype.sendRequest = function(byteArray, callback) {
    console.log("sending an audio file  to " + this.url);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState === XMLHttpRequest.DONE && request.status === 200)
        {
            callback(request.responseText);
        }
    };
    request.open("POST", this.url);
    request.setRequestHeader("Content-Type",
        APP.transcriber.getAudioRecorder().getFileType());
    request.send(byteArray);
};

/**
 * Overrides the parseRequest method from AbstractTranscriptionService
 * It will parse the answer from the server in the expected format
 *
 * @param answer the answer retrieved from the Sphinx4 server
 */
SphinxService.prototype.parseRequest = function(answer) {
    var result = answer.result;
    var array = [];
    result.forEach(function(word){
        array.push(new Word(word.word, word.start, word.end,
            word.filler));
    });
    return array;
};

/**
 * Gets the URL to the Sphinx4 server from the config file. If it's not there,
 * it will throw an error
 *
 * @returns {string} the URL to the sphinx4 server
 */
function getURL() {
    var message = "config does not contain an url to a " +
    "Sphinx4 https server";
    if(config.sphinxURL === undefined){
        throw new Error(message);
    }
    else {
        var toReturn = config.sphinxURL;
        if(toReturn.includes !== undefined && toReturn.includes("https://")){
            return config.sphinxURL;
        }
        else{
            throw new Error(message);
        }
    }
}

module.exports = SphinxService;