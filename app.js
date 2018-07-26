const config = require('./config')
const Koa = require('koa')
const getRawBody = require('raw-body')

const Wechat = require('./wechat')
const {parseXML, XMLMessageBuilder} = require('./utils')
const rules = require('./message_rules')

const app = new Koa()
initApp(app)

async function initApp(app) {
    // 将builder与wechat对象作为ctx原型的属性，从而可全局引用
    app.context.builder = new XMLMessageBuilder()
    let w = new Wechat(config.wechat)
    await w.uploadMaterial('./static/img/1.jpg')
    app.context.wechat = w
    app.use(parseBody())
    app.use(main())
    app.listen(80)
    console.log('start server on 80...')
}

function parseBody(options) {
    const opts = options || {}
    return async function(ctx, next) {
        ctx.request.rawBody = await getRawBody(ctx.req, {
            length: ctx.req.headers['content-length'],
            limit: opts.limit || '1mb',
            encoding: opts.encoding || 'utf-8'
        })
        await next()
    }
}

function main() {
    return async function(ctx) {
        console.log(`received request url http://www.timuer.top${ctx.request.path}`)
        let req = ctx.request
        let res = ctx.response
        if (req.method == 'GET') {
            wechat.authenticate(ctx)
        } else if (req.method == 'POST') {
            let body = req.rawBody
            // console.log('request body: ', body)
            ctx.msg = await parseXML(body)
            // console.log('parsed info: ', parsedMessage)
            res.status = 200
            res.type = 'application/xml'
            res.body = await buildRetBody(ctx)
        }    
    }
}

async function buildRetBody(ctx) {
    let message = ctx.msg
    let toUser = message.FromUserName
    let fromUser = message.ToUserName
    let now = Date.now()
    let type = message.MsgType
    let retObj = {
        toUser,
        fromUser,
        now,
    }
    retObj.content = await rules[type](ctx)
    let xml = ctx.builder.build(retObj)
    console.log('ret body: ', xml)
    return xml
}