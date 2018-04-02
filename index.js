/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const SKILL_NAME = 'MIT Facts';
const GET_FACT_MESSAGE = "Here's your fact: ";
const HELP_MESSAGE = 'You can say tell me a fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const SPEECH_TAGS = '<prosody pitch="x-low">' // this is if you want to modify the voice, for example
const END_SPEECH_TAGS = '</prosody>'

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/data
//=========================================================================================================================================
const data = [
    'MIT was founded April 10, 1861, two days before the start of the Civil War..',
    'In 1958, Oliver Smoot (class of ’62) with his Lambda Chi Alpha brothers measured the Harvard bridge in units of Smoots. Members of the fraternity maintain the painted marks.',
    'While Tony Stark is said to have graduated from MIT “summa cum laude,” MIT does not have any class ranking for its students.',
    'The Infinite Corridor lines up with the plane of the ecliptic twice a year, filling the 0.16 mile hallway with sunlight.',
    'The first human cancer gene discovery took place at MIT. Weinberg found the ras oncogene.',
    'A Pirate’s License can be granted to MIT students who complete pistol, archery, fencing and sailing classes. While the license existed for 20 years unofficially, it was made official in 2012.',
    'MIT Invented the first computer in Cambridge in 1928. You can view Whirlwind I at the MIT Museum.',
    'MIT’s program in architecture was the first established in the U.S.',
    'Tetazoo, an East Campus floor, stands for The Third East Traveling Animal Zoo. Known for hacking and a reckless attitude, it’s uncertain if these students are actually zoological.',
    'There is a secret climbing gym on the third floor of MITs Morse Hall. Can you find it?',
    'MIT has earned 203 Academic All America citations, the most for any Division 3 program in the nation.',
    'MIT has over 500 student groups, 33 varsity sports teams, and 168 acres of land along and across the Charles River.',
    'MITs beaver mascot is named MIT spelled backwards.',
    'The (arguably) absolute best lab at MIT is the App Inventor Lab. They do cool things like democratize programming, artificial intelligence and other technology. Oh, and they have a lot of fun!'
];

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewFactIntent');
    },
    'GetNewFactIntent': function () {
        const factArr = data;
        const factIndex = Math.floor(Math.random() * factArr.length);
        const randomFact = factArr[factIndex];
        const speechOutput = SPEECH_TAGS + GET_FACT_MESSAGE + randomFact + END_SPEECH_TAGS;

        this.response.cardRenderer(SKILL_NAME, randomFact);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
