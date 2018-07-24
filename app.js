const config = require('./config')
const Koa = require('koa')
const getRawBody = require('raw-body')

const Wechat = require('./wechat')
const {parseXML, buildXML} = require('./utils')


const app = new Koa()

async function parse(ctx, next) {
    ctx.request.rawBody = await getRawBody(ctx.req, {
        length: ctx.req.headers['content-length'],
        limit: '1mb',
        encoding: 'utf-8'
    })
    await next()
}

async function main(ctx) {
    console.log(`received request url http://www.timuer.top${ctx.request.path}`)
    const wechat = new Wechat(config.wechat)
    let req = ctx.request
    let res = ctx.response
    if (req.method == 'GET') {
        wechat.authenticate(ctx)
        const accessToken = await wechat.getAccessToken()
        console.log('accessToken: ', accessToken)
    } else if (req.method == 'POST') {
        console.log('receive message from weixin...')
        let body = req.rawBody
        console.log('request body: ', body)
        let parsedMessage = await parseXML(body)
        console.log('parsed info: ', parsedMessage)
        res.body = await buildRetBody(parsedMessage)
    }
}

async function buildRetBody(message) {
    let toUser = message.FromUserName
    let fromUser = message.ToUserName
    let now = Date.now()
    let type = message.MsgType
    let obj
    if (type == 'text') {
        let content = "Hi Baby"
        obj = {
            xml: {
                ToUserName: `&lt;![CDATA[${toUser}]]&gt;`,
                FromUserName: `&lt;![CDATA[${fromUser}]&gt;`,
                CreateTime: `&lt;![CDATA[${now}]&gt;`,
                MsgType: `&lt;![CDATA[${type}]&gt;`,
                Content: `&lt;![CDATA[${content}]&gt;`,
            }
        }
    }
    let xml = await buildXML(obj)
    console.log('ret body: ', xml)
    return xml
}

app.use(parse)
app.use(main)
app.listen(80)

console.log('start server on 80...')
