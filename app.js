const config = require('./config')
const Koa = require('koa')
const getRawBody = require('raw-body')

const Wechat = require('./wechat')
const {parseXML} = require('./utils')


const app = new Koa()

async function parse(ctx, next) {
    ctx.request.rawBody = await getRawBody(ctx.req, {
        length: ctx.req.headers['content-length'],
        limit: '1mb',
        encoding: 'utf-8'
    })
    await next
}

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

app.use(parse)
app.use(main)
app.listen(80)

console.log('start server on 80...')
