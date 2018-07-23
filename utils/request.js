const http = require('http')
const https = require('https')
const URL = require('url')
const {promisify} = require('util')

class Request {
    constructor(url) {
        this.url = url
        this.init()
    }

    init() {
        this.parseURL()
        this.setupOptions()
    }

    parseURL() {
        const u = URL.parse(this.url)
        this.hostname = u.hostname
        this.port = u.port
        this.path = u.path
        this.protocal = u.protocol
    }

    setupOptions() {
        this.options = {
            hostname: this.hostname,
            port: this.port,
            path: this.path,
            method: 'GET',
            headers: {}
        }
    }

    async get() {
        const protocal = this.protocal == 'http' ? http : https
        const request = promisify(protocal.request)
        try {
            console.log('begin request')
            const data = await request(this.options)
            console.log('data returned: ', data)
            return data
        } catch(e) {
            console.error(e)
        }
    }
}

module.exports = Request