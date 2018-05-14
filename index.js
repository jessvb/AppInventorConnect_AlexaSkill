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
const SKILL_NAME = 'App Inventor Connect - Possibilities';
const LAUNCH_MESSAGE =
    'Hello! My name is Codi, and I am here to help you connect to App Inventor! ' +
    'If you would like to connect, you can say, "Alexa, ask Inventor Codi to connect."';
const CONNECTING_MESSAGE = 'Connecting.';
const HELP_MESSAGE =
    'If you want to connect with App Inventor, you can say, "Ask Inventor Codi to connect".' +
    'If the connection did not work correctly, try checking your code in App Inventor, ' +
    ' or getting help from the online tutorials you can find at ' +
    'App Inventor dot MIT dot EDU slash explore slash AI2 slash tutorials dot html. ' +
    'If you are still having trouble, feel free to post on the App Inventor forums. ' +
    'You can find the forums in the Resources menu on the App Inventor website.';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Closing App Inventor Connect. Goodbye!';
const FALLBACK_MESSAGE = 'I\'m not sure what you mean. ' +
    'I can send a signal to App Inventor if you say,' +
    ' \'Alexa, ask Inventor Codi to send signal three.\'';

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
const ALEXA_TAG = '_ALEXA_SIGNAL_';
const PROJECT_NAME = 'TestAlexaPID';  // todo: make this modify-able by the user


//=========================================================================================================================================
// Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
  'LaunchRequest': function() {
    this.response.speak(LAUNCH_MESSAGE);
    this.emit(':responseReady');
  },
  'SignalIntent': function() {
    let signalNum = this.event.request.intent.slots.signalNum.value;
    // If we've been given a signal number, try to signal App Inventor and then
    // give feedback to the user
    if (signalNum != null) {
      console.log('signalling app inventor with number: ' + signalNum);
      // for lambda redis
      let client = redis.createClient(
          urlHostPort, {'password': authKey.getAuthKey(), 'tls': {}});

      let response;
      let error;
      let tag = ALEXA_TAG;
      let value = signalNum;
      let projectName = PROJECT_NAME;
      // tests setting and PUBLISHING in clouddb (this will be noticed by App
      // Inventor components subscribed to the updates)
      client.eval(
          // Calling convention: tag, value, json encoded list of values,
          // project,
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


      // Feedback for the user:
      let voiceOutput = '';
      let cardOutput = '';
      if (error) {
        voiceOutput =
            'There was an error connecting. Please try again later. ' +
            'If this problem persists, please post on the App Inventor forums, ' +
            'which can be found in the Resources menu on the App Inventor website, ' +
            '"App Inventor dot MIT dot EDU". ';
        cardOutput = voiceOutput + '(appinventor.mit.edu) ' +
            ' You may include the following error code with your post on the forums: ' +
            error;
      } else {
        voiceOutput = 'Successfully connected to App Inventor! Sent signal ' +
            signalNum + '.';
        cardOutput = voiceOutput +
            'If the "when Alexa.sendsSignal" block was not ' +
            'triggered in App Inventor, check the tutorials section ' +
            '(http://appinventor.mit.edu/explore/ai2/tutorials.html) or the forums ' +
            '(https://groups.google.com/forum/#!forum/mitappinventortest) ' +
            'on the App Inventor website.';
      }
      // render a card in the alexa app:
      this.response.cardRenderer(SKILL_NAME, cardOutput);
      // voice output from alexa:
      this.response.speak(voiceOutput);
      this.emit(':responseReady');
    } else if (this.event.request.dialogState == 'COMPLETED') {
      console.error(
          'The dialogState is completed, but there is no signal value. Signal value: ' +
          signalNum + '. This should never occur.');
    } else {
      // There was no signal number, so get Alexa to ask the user for a number
      // by returning a Dialog.Delegate directive.
      this.emit(':delegate');
    }
  },
  'AMAZON.FallbackIntent': function() {
    const speechOutput = FALLBACK_MESSAGE;

    this.response.speak(speechOutput);
    this.emit(':responseReady');
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