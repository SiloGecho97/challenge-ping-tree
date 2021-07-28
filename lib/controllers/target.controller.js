
module.exports = {
  targetHandler,
  addTarget,
  getOneTarget
}

function targetHandler (req, res, next) {
  console.log(req, 'get')
  if (!req.method) return
  if (req.method === 'GET') {
    getTarget(req, res)
  } else if (req.method === 'POST') {
    addTarget(req, res)
  } else if (req.method === 'PUT') {
    editTarget(req, res)
  }

  // res.writeHead(200)
  // res.end('Welcome')
}

function getTarget (req, res) {
  res.writeHead(200)
  res.end('Get welcome')
}

function addTarget (req, res) {
  console.log('get')
  res.writeHead(200)
  res.end('Welcome')
}

function editTarget (req, res) {
  console.log('get')
  res.writeHead(200)
  res.end('Welcome')
}

function getOneTarget (req, res) {
  console.log('get', req.params.id)
  res.writeHead(200)
  res.end(req.params.id)
}
