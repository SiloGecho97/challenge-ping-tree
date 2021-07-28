const redis = require('../redis')

module.exports = { saveTarget, getTargets }

function saveTarget (data, cb) {
  redis.lpush('target', data, function (err) {
    if (err) return cb(err)
    cb()
    // redis.get('target', function (err, then) {
    //   if (err) return cb(err)
    //   if (data !== then.toString()) return cb(new Error('Redis write failed'))
    //   cb()
    // })
  })
}

function getTargets (cb) {
  redis.lrange('target', 0, -1, function (err, data) {
    if (err) return cb(err, null)
    if (data) return cb(null, data)
  })
}
