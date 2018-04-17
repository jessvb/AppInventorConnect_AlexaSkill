'use strict'

module.exports.respond = function(event, callback) {
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
  let client = redis.createClient(
      urlHostPort, {'password': authKey.getAuthKey(), 'tls': {}});

  // tests setting and getting a variable in clouddb (NOT publishing a variable)
  // client.set(
  //     'foo',
  //     'This is a test, if you see this logged to the console, things are
  //     working!');
  // client.get('foo', function(e, r) {
  //   if (e) {
  //     console.error('Something went wrong');
  //   } else {
  //     if (r) {
  //       console.log(r);
  //     }
  //   }
  // });

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

        // callback to index.js
        if (response) {
          callback(null, response);
        } else if (error) {
          callback(error);
        } else {
          callback(null, null);
        }
      });
}