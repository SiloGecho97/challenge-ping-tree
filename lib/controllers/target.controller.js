const sendJson = require('send-data/json')
var http = require('http')
const redis = require('../redis/index')
const service = require('../services/target.service')
const { nanoid } = require('nanoid')

module.exports = {
  targetHandler,
  addTarget,
  oneTargetHandler,
  decideRoute
}

function targetHandler (req, res, query, error) {
  if (!req.method) return
  if (req.method === 'GET') {
    getTarget(req, res, error)
  } else if (req.method === 'POST') {
    addTarget(req).then(data => {
      res.statusCode = 200
      sendJson(req, res, {
        message: http.STATUS_CODES[res.statusCode],
        data: JSON.parse(data)
      })
      res.end()
    }).catch(err => {
      res.statusCode = 422
      error('Err : ' + err, req, res)
    })
  } else {
    getTarget(req, res, error)
  }
}
/**
 * Get Targets
 * @param {*} req
 * @param {*} res
 * @param {*} error
 */
function getTarget (req, res, error) {
  redis.getTargets((err, data) => {
    if (err) {
      res.statusCode = 500
      return error('Failed to fetch', req, res)
    }
    let sendData = []
    if (data) {
      sendData = data.map(item => {
        return JSON.parse(item)
      })
    }
    res.statusCode = 200
    sendJson(req, res, {
      error: http.STATUS_CODES[res.statusCode],
      data: sendData
    })
    res.end()
  })
}
// Add Target handler
async function addTarget (req) {
  // Extract body form request
  const body = await getBody(req)
  if (!body) throw new Error('Validation err')
  // create 10 digit alpha number unique id
  const id = nanoid(10)
  body.id = id
  // Save target to redis database
  const saved = await service.saveTarget(id, JSON.stringify(body))
  if (saved) return saved
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
  if (!req.method) return error('Failed', req, res)
  if (req.method === 'GET') {
    getTargetById(req, res, query, error)
  } else if (req.method === 'POST') {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      updateTarget(req, res, query, JSON.parse(data), error)
    })
  } else {
    res.statusCode = 404
    sendJson(req, res, {
      error: http.STATUS_CODES[res.statusCode]
    })
    res.end()
  }
}

/**
 * Get Target by id
 * @param {*} req
 * @param {*} res
 * @param {*} query
 * @param {*} error
 * @returns
 */
function getTargetById (req, res, query, error) {
  if (!query.params.id) return error('Failed', req, res)
  redis.getTargetById(query.params.id, (err, data) => {
    if (err) {
      res.statusCode = 500
      return error('Failed', req, res)
    }
    const sendData = JSON.parse(data)
    res.statusCode = 200
    sendJson(req, res, {
      message: http.STATUS_CODES[res.statusCode],
      data: sendData
    })
    res.end()
  })
}

/**
 * Update Target by id
 * Body should be full object
 * @param {*} req
 * @param {*} res
 * @param {*} query request query
 * @param {*} body request body of target
 * @param {*} error error callback
 * @returns
 */
function updateTarget (req, res, query, body, error) {
  if (!query.params.id || !body) return error('Invalid request', req, res)
  redis.getTargetById(query.params.id, (err, data) => {
    if (err) {
      res.statusCode = 400
      return error('No Target with this id', req, res)
    }
    // const target = JSON.parse(data)
    redis.saveTarget(query.params.id, JSON.stringify(body), (err) => {
      if (err) return error('Failed to update', req, res)
      res.statusCode = 200
      sendJson(req, res, {
        message: http.STATUS_CODES[res.statusCode],
        data: body
      })
      res.end()
    })
  })
}
/**
 * Decide route
 * Accept only POST method
 * @param {*} req
 * @param {*} res
 * @param {*} query
 * @param {*} error
 * @returns
 */
function decideRoute (req, res, query, error) {
  if (req.method !== 'POST') {
    return error('Invalid Method request', req, res)
  }
  decideRouteHandler(req, res, query, error).then(data => {
    res.statusCode = 200
    sendJson(req, res,
      data
    )
    res.end()
  }).catch(_err => error('Err : ' + _err, req, res))
}

/**
 * Decide route handler
 * @param {*} req Request body from http
 * @returns decide target or reject
 */
async function decideRouteHandler (req) {
  const body = await getBody(req)

  if (!body || !body.geoState) throw new Error('Validation Error')
  const targets = await service.getTargets()
  const search = targets.filter(item => {
    // filter only with geostate
    return item.accept?.geoState.$in.includes(body.geoState)
  })
  for (const item of search) {
    const accepts = await redis.acceptsPerDaySave(item.id).catch(err => console.log(err))
    if (parseInt(item.maxAcceptsPerDay) > accepts) {
      return item
    }
  }
  return { decision: 'reject' }
}

/**
 * Return body from request
 * @param {*} req
 * @returns Json of body
 */
function getBody (req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      data ? resolve(JSON.parse(data)) : resolve(null)
    })
  })
}
