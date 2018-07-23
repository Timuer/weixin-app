const config = require('./config')
const Koa = require('koa')

const sha1 = require('sha1')
const route = require('koa-route')
const serve = require('koa-static')

const Wechat = require('./wechat')

const app = new Koa()

async function auth(ctx, next) {
    const wechat = new Wechat(config.wechat)
    const q = ctx.request.query
    const token = wechat.token
    const nonce = q.nonce
    const timestamp = q.timestamp
    const signature = q.signature
    const echostr = q.echostr
    if (nonce && timestamp && signature && echostr) {
        const s = sha1([token, nonce, timestamp].sort().join(''))
        // console.log('querystr', ctx.request.querystring)
        // console.log('arguments: ', token, nonce, timestamp, s, signature, echostr)
        if (s == signature) {
            ctx.response.body = echostr
        } else {
            ctx.response.body = 'Wrong'
        }    
    }
    await next() 
}

async function sendMessage(ctx) {
    console.log('send message')
    const wechat = new Wechat(config.wechat)
    const accessToken = await wechat.getAccessToken()
    console.log('accessToken: ', accessToken)
}

app.use(auth)
app.use(sendMessage)
app.listen(80)

console.log('start server on 8000...')
