'use strict'

// const rt = require('./ritetag') // todo... do we need this??

module.exports.respond = function(event, callback) {
  const redis = require('./redis')()

  const tag = event.hashtag.replace(/^#/, '')
  const key = 'related:' + tag
  let error, response

  redis.on('end', () => {callback(error, response)})

  redis.on('ready', function() {
    redis.get(key, (err, res) => {
      if (err) {
        redis.quit(() => {error = err})
      } else {
        if (res) {
          // Tag is found in Redis, so send results directly.
          redis.quit(() => {response = res})
        } else {
          // todo: what does this do and why / do we need this? -->
          // // Tag is not yet in Redis, so query Ritetag.
          // rt.hashtagDirectory(tag, (err, res) => {
          //   if (err) {
          //     redis.quit(() => {error = err})
          //   } else {
          //     redis.set(key, res, (err) => {
          //       if (err) {
          //         redis.quit(() => {error = err})
          //       } else {
          //         redis.quit(() => {response = res})
          //       }
          //     })
          //   }
          // })
        }
      }
    })
  })
}