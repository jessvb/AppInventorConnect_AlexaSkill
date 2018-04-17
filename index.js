/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 *
 * This skill can connect with App Inventor.
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

// for speech and alexa app:
const SKILL_NAME = 'App Inventor';
const CONNECTING_MESSAGE = 'Connecting.';
const HELP_MESSAGE =
    'If you want to connect with App Inventor, you can say, "Ask App Inventor to connect"';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

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
// Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
  'LaunchRequest': function() {
    this.emit('ConnectToAppInventor');
  },
  'ConnectToAppInventor': function() {
    const speechOutput = CONNECTING_MESSAGE;

    // render a card in the alexa app:
    this.response.cardRenderer(SKILL_NAME, CONNECTING_MESSAGE);
    // voice output from alexa:
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
