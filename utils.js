const {promisify} = require('util')
const parseString = promisify(require('xml2js').parseString)

module.exports.parseXML = async function(xmlStr) {
    const xmlObj = await parseString(xmlStr)
    console.log(xmlObj)
}