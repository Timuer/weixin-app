const config = require('./config')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')


const route = require('koa-route')
const serve = require('koa-static')

const Wechat = require('./wechat')
const {parseXML} = require('./utils')


const app = new Koa()

async function main(ctx) {
    console.log(`received request url http://www.timuer.top${ctx.request.path}`)
    const wechat = new Wechat(config.wechat)
    let req = ctx.request
    let res = ctx.response
    if (req.method == 'GET') {
        wechat.authenticate(ctx)
    } else if (req.method == 'POST') {
        console.log('receive message from weixin...')
        let body = req.rawBody
        console.log('body: ', body)
        await parseXML(body)
        res.body = 'ok'
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
