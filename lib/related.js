'use strict'

module.exports.respond = function (event, callback) {
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
    'rediss://clouddb.appinventor.mit.edu:6381', {
      'password': authKey.getAuthKey(),
      'tls': {}
    });

  // tests setting and getting a variable in clouddb
  client.set(
    'foo',
    'This is a test, if you see this logged to the console, things are working!');
  client.get('foo', function (e, r) {
    if (e) {
      console.log('Something went wrong');
    } else {
      if (r) {
        console.log(r);
      }
    }
  });

  // tests setting and PUBLISHING in clouddb (this will be noticed by App Inventor 
  // components subscribed to the updates)
  client.eval(
    // Calling convention: tag, value, json encoded list of values, project,
    // ...
    SET_SUB_SCRIPT, 1, 'tag1', 'val1', JSON.stringify(['val1']),
    'Lambda_CloudDB_Redis_Test',
    function (e, r) {
      if (e) {
        console.log('Something went wrong: ', e);
      } else {
        if (r) {
          console.log('reply:', r);
        }
      }
    });
}