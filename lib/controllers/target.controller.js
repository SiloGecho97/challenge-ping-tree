const sendJson = require('send-data/json')
var http = require('http')
const redis = require('../redis/index')
const { nanoid } = require('nanoid')

module.exports = {
  targetHandler,
  addTarget,
  oneTargetHandler,
  decideRoute,
  getTargets
}

function targetHandler(req, res, query, err) {
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

function getTarget(req, res, error) {
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

function addTarget(req, res, body, error) {
  const id = nanoid(10)
  body.id = id
  redis.saveTarget(id, JSON.stringify(body), (err) => {
    console.log(err)
    if (err) error('Failed to add', req, res)
    res.statusCode = 200
    sendJson(req, res, {
      message: http.STATUS_CODES[res.statusCode],
      data: body
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

function oneTargetHandler(req, res, query, error) {
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

function getTargetById(req, res, query, error) {
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

function updateTarget(req, res, query, body, error) {
  if (!query.params.id) return error('Failed', req, res)
  redis.getTargetById(query.params.id, (err, data) => {
    if (err) {
      res.statusCode = 500
      return error('Failed', req, res)
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

function decideRoute(req, res, query, error) {
  if (req.method === 'POST') {
    return error("Invalid Method request")
  }
  decideRouteHandler(req, res, query, error).then(data => {
    res.statusCode = 200
    sendJson(req, res,
      data
    )
    res.end()
  }).catch(_err => error('Err failed' + _err, req, res))
}

async function decideRouteHandler(req, res, query, error) {
  const body = await getBody(req)
  if (!body.geoState || !body.timestamp) return error('Validation Error', req, res)
  const targets = await getTargets()
  const search = targets.filter(item => {
    return item.accept.geoState.$in.includes(body.geoState)
  })
  for (const item of search) {
    const accepts = await redis.acceptsPerDaySave(item.id).catch(err => console.log(err))
    console.log(item.maxAcceptsPerDay, accepts)

    if (parseInt(item.maxAcceptsPerDay) > accepts) {
      return item
    }
  }
  return { decision: "reject" }
}

/**
 *  Return body from request
 * @param {*} req
 * @returns Json of body
 */
function getBody(req) {
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

function getTargets() {
  return new Promise((resolve, reject) => {
    redis.getTargets((err, data) => {
      if (err) {
        return reject(new Error('Failed to fetch'))
      }
      if (data) {
        const sendData = data.map(item => {
          return JSON.parse(item)
        })
        resolve(sendData)
      }
      resolve([])
    })
  })
}


