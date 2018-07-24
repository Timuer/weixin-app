const config = require('./config')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const sha1 = require('sha1')
const route = require('koa-route')
const serve = require('koa-static')

const Wechat = require('./wechat')
const {parseXML} = require('./utils')


const app = new Koa()



async function main(ctx) {
    const wechat = new Wechat(config.wechat)
    let req = ctx.request
    let res = ctx.response
    if (wechat.isFromWechat(req)) {
        res.status = 403
        res.body = 'Not from developers'
        return
    }
    if (req.method == 'GET') {
        res.body = req.query.echostr
    } else if (req.method == 'POST') {
        let body = ctx.request.body
        await parseXML(body)
    }
    // const accessToken = await wechat.getAccessToken()
    // console.log('accessToken: ', accessToken)
}

app.use(bodyParser({
    onerror: (err, ctx) => {
        ctx.throw('body parse error', 422)
    }
}))
app.use(main)
app.listen(80)

console.log('start server on 80...')
