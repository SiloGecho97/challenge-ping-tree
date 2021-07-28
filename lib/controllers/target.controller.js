const sendJson = require('send-data/json')
var http = require('http')
const redis = require('../redis/index')

module.exports = {
  targetHandler,
  addTarget,
  oneTargetHandler
}

function targetHandler (req, res, query, err) {
  if (!req.method) return
  if (req.method === 'GET') {
    getTarget(req, res, err)
  } else if (req.method === 'POST') {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      addTarget(req, res, JSON.parse(data), err)
    })
  } else {
    getTarget(req, res, err)
  }
}

function getTarget (req, res, error) {
  redis.getTargets((err, data) => {
    if (err) {
      res.statusCode = 500
      return error()
    }
    const sendData = data.map(item => {
      return JSON.parse(item)
    })
    res.statusCode = 200
    sendJson(req, res, {
      error: http.STATUS_CODES[res.statusCode],
      data: sendData
    })
    res.end()
  })
}

function addTarget (req, res, body, err) {
  console.log('Body', body)
  // res.writeHead(200)

  redis.saveTarget(JSON.stringify(body), (err) => {
    console.log(err)
    res.statusCode = 200

    sendJson(req, res, {
      error: http.STATUS_CODES[res.statusCode],
      message: 'success'
    })
    res.end()
  })
}

/**
 * Specific target handler
 * @param {*} req
 * @param {*} res
 * @param {*} query
 * @param {*} error
 * @returns
 */

function oneTargetHandler (req, res, query, error) {
  if (!req.method) return
  if (req.method === 'GET') {
    getTargetById(req, res, query, error)
  } else if (req.method === 'POST') {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      updateTarget(req, res, JSON.parse(data), error)
    })
  } else {
    getTarget(req, res, error)
  }
}

function getTargetById (req, res, query, error) {
  redis.getTargets((err, data) => {
    if (err) {
      res.statusCode = 500
      return error()
    }
    const sendData = data.map(item => {
      return JSON.parse(item)
    })
    res.statusCode = 200
    sendJson(req, res, {
      error: http.STATUS_CODES[res.statusCode],
      data: sendData
    })
    res.end()
  })
}

function updateTarget (req, res, query, error) {
  redis.getTargets((err, data) => {
    if (err) {
      res.statusCode = 500
      return error()
    }
    const sendData = data.map(item => {
      return JSON.parse(item)
    })
    res.statusCode = 200
    sendJson(req, res, {
      error: http.STATUS_CODES[res.statusCode],
      data: sendData
    })
    res.end()
  })
}
