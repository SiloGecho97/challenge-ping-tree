
const redis = require('../redis/index')

module.exports = class Targets {
    constructor() {
    }
    /**
     *  Return body from request
     * @param {*} req
     * @returns Json of body
     */
    getBody(req) {
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

    getTargets() {
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

    getTargetById(id) {
        return new Promise((resolve, reject) => {
            redis.getTargetById(id, (err, data) => {
                if (err) return reject(new Error("faile to get"))
                if (data) {
                    const sendData = data.map(item => {
                        return JSON.parse(item)
                    })
                    resolve(sendData)
                }
                resolve(null)

            })
        })
    }
    getTargetCallback(id, cb) {
        redis.getTargetById(id, (err, data) => {
            if (data) cb(JSON.parse(data))
            cb(null)
        })
    }
}
