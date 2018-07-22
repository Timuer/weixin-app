const config = require('./config')
const Koa = require('koa')
const sha1 = require('sha1')
const route = require('koa-route')
const serve = require('koa-static')

const app = new Koa()

const auth = ctx => {
    const q = ctx.request.query
    const token = config.wechat.token
    // console.log(token)
    const nonce = q.nonce
    // console.log(nonce)
    const timestamp = q.timestamp
    // console.log(timestamp)
    const s = sha1([token, nonce, timestamp].sort().join(''))
    const signature = q.signature
    // console.log(s)
    // console.log(signature)
    const echostr = q.echostr
    // console.log(ecostr)
    if (s == signature) {
        ctx.response.body = ecostr
    } else {
        ctx.response.body = 'Wrong'
    }
}

app.use(auth)

app.listen(80)