const {promisify} = require('util')
const parseString = promisify(require('xml2js').parseString)

module.exports.getPostData = async function(ctx, next) {
    ctx.req.rawBody = ''
    ctx.req.on('data', (chunk) => {
        ctx.req.rawBody += chunk
    })
    req.on('end', () => {
        await next()
    })
}

module.exports.parseXML = async function(xmlStr) {
    const xmlObj = await parseString(xmlStr)
    console.log(xmlObj)
}