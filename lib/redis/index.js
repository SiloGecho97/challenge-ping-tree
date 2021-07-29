const redis = require('../redis')
module.exports = { saveTarget, getTargets, getTargetById, updateTarget }


function saveTarget(id, data, cb) {
  redis.set(`target-${id}`, data, function (err) {
    if (err) return cb(err)
    cb()
    // redis.get('target', function (err, then) {
    //   if (err) return cb(err)
    //   if (data !== then.toString()) return cb(new Error('Redis write failed'))
    //   cb()
    // })
  })
}

function getTargets(cb) {
  redis.keys(`target-*`, function (err, data) {
    if (err) return cb(err, null)
    if (data) {
      redis.mget(data, function (err, data) {
        return cb(null, data)
      })
    }
  })
}

function getTargetById(id, cb) {
  redis.keys(`target-${id}`, function (err, data) {
    if (err) return cb(err, null)
    if (data) {
      redis.get(data, function (err, data) {
        if (err) return cb(err, null)
        return cb(null, data)
      })
    }
  })
}

function updateTarget(index, data, cb) {
  redis.lset('target', index, data, function (err, data) {
    if (err) return cb(err, null)
    if (data) return cb(null, data)
  })
}



function saveTargetOld(data, cb) {
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

function getTargetsOld(cb) {
  redis.lrange('target', 0, -1, function (err, data) {
    if (err) return cb(err, null)
    if (data) return cb(null, data)
  })
}



