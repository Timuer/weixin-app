const config = require('./config')
const Koa = require('koa')
const sha1 = require('sha1')
const route = require('koa-route')
const serve = require('koa-static')

const app = new Koa()

const auth = ctx => {
    const q = ctx.request.query
    const token = config.wechat.token
    const nonce = q.nonce
    const timestamp = q.timestamp
    const s = sha1([token, nonce, timestamp].sort().join(''))
    const signature = q.signature
    const echostr = q.echostr
    console.log('querystr', ctx.request.querystring)
    console.log('arguments: ', token, nonce, timestamp, s, signature, echostr)
    if (s == signature) {
        ctx.response.body = echostr
    } else {
        ctx.response.body = 'Wrong'
    }
}

app.use(auth)

app.listen(80)