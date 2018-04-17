'use strict'

// todo del:
// // const port = 6379;           // todo put in env vars
// // const host = '128.30.9.34';  // todo put in env vars
// const port = 6381;                           // clouddb default port
// const host = 'clouddb.appinventor.mit.edu';  // clouddb host

module.exports.respond = function(event, callback) {
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
      'rediss://clouddb.appinventor.mit.edu:6381',
      {'password': authKey.getAuthKey(), 'tls': {}});

  client.set(
      'foo',
      'This is a test, if you see this logged to the console, things are working!');
  client.get('foo', function(e, r) {
    if (e) {
      console.log('Something went wrong');
    } else {
      if (r) {
        console.log(r);
      }
    }
  });

  client.eval(
      // Calling convention: tag, value, json encoded list of values, project,
      // ...
      SET_SUB_SCRIPT, 1, 'tag1', 'val1', JSON.stringify(['val1']),
      'Lambda_CloudDB_Redis_Test', function(e, r) {
        if (e) {
          console.log('Something went wrong: ', e);
        } else {
          if (r) {
            console.log('reply:', r);
          }
        }
      });

  // const redis = require('redis');
  // let error, response;

  // // testing redis:
  // console.log('creating client...');
  // let client = redis.createClient(port, host);
  // client.auth(authToken, function(err, reply) {
  //   if (err) {
  //     console.log('error in auth -- quitting');
  //     client.quit();
  //   } else {
  //     console.log('sent authtoken!');
  //     client.get('key1', function(err, reply) {
  //       console.log('reply from key1:', reply);
  //     });
  //     client.quit();
  //   }
  // });
  // client.on('connect', function() {
  //   console.log('connected');
  //   client.get('hello', function(err, reply) {
  //     console.log('reply from hello:', reply);
  //   });
  //   client.set('key1', 'val1');
  //   client.get('key1', function(err, reply) {
  //     if (err) {
  //       client.quit(() => {error = err});
  //     } else {
  //       client.quit(() => {response = reply});
  //       console.log('key1 reply:', reply);
  //       console.log('key1 response ;P :', response);
  //     }
  //   });
  // });
}