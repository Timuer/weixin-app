const Koa = require('koa')
const route = require('koa-route')
const serve = require('koa-static')

const app = new Koa()

const main = ctx => {
    ctx.response.body = "Hello You"
}

app.use(main)

app.listen(3000)