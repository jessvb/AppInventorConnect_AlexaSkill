/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * 
 * This skill can produce random facts about MIT and connect with App Inventor.
 **/

'use strict';

//=========================================================================================================================================
// Constants:
//=========================================================================================================================================

// Replace with your app ID (OPTIONAL).  You can find this value at the top of
// your skill's page on http://developer.amazon.com.  Make sure to enclose your
// value in quotes, like this: const APP_ID =
// 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

// for MIT facts:
const SKILL_NAME = 'MIT Facts';
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE =
    'You can say tell me a fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const SPEECH_TAGS = '<prosody pitch="x-low">'  // this is if you want to modify
                                               // the voice, for example
const END_SPEECH_TAGS = '</prosody>'

// for App Inventor and CloudDB:
const urlHostPort = 'rediss://clouddb.appinventor.mit.edu:6381';
const authKey = require('./authKey');
const redis = require('redis');
const SET_SUB_SCRIPT_SHA1 = '765978e4c340012f50733280368a0ccc4a14dfb7';
const SET_SUB_SCRIPT = 'local key = KEYS[1];' +
    'local value = ARGV[1];' +
    'local topublish = cjson.decode(ARGV[2]);' +
    'local project = ARGV[3];' +
    'local newtable = {};' +
    'table.insert(newtable, key);' +
    'table.insert(newtable, topublish);' +
    'redis.call("publish", project, cjson.encode(newtable));' +
    'return redis.call(\'set\', project .. ":" .. key, value);';

// for connecting with Alexa:
const Alexa = require('alexa-sdk');

//=========================================================================================================================================
// Facts that will be randomly chosen to be said by Alexa:
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
// Handlers:
//=========================================================================================================================================

const handlers = {
  'LaunchRequest': function() {
    this.emit('GetNewFactIntent');
  },
  'GetNewFactIntent': function() {
    const factArr = data;
    const factIndex = Math.floor(Math.random() * factArr.length);
    const randomFact = factArr[factIndex];
    const speechOutput =
        SPEECH_TAGS + GET_FACT_MESSAGE + randomFact + END_SPEECH_TAGS;

    this.response.cardRenderer(SKILL_NAME, randomFact);
    this.response.speak(speechOutput);
    this.emit(':responseReady');

    // for lambda redis
    let client = redis.createClient(
        urlHostPort, {'password': authKey.getAuthKey(), 'tls': {}});

    let response;
    let error;
    let tag = 'alexa';
    let value = 'alexaCalledAppInventor';
    let projectName = 'Lambda_CloudDB_Redis_Test';
    // tests setting and PUBLISHING in clouddb (this will be noticed by App
    // Inventor components subscribed to the updates)
    client.eval(
        // Calling convention: tag, value, json encoded list of values, project,
        // ...
        SET_SUB_SCRIPT, 1, tag, value, JSON.stringify([value]), projectName,
        function(e, r) {
          if (e) {
            console.error('Something went wrong with client.eval: ', e);
            error = e;
          } else {
            if (r) {
              response = r;
            }
          }

          // quit redis:
          client.end(function(err) {
            if (err) {
              console.error('Error when quitting redis: ', err);
            }
          });
        });
  },
  'AMAZON.HelpIntent': function() {
    const speechOutput = HELP_MESSAGE;
    const reprompt = HELP_REPROMPT;

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak(STOP_MESSAGE);
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(STOP_MESSAGE);
    this.emit(':responseReady');
  },
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};