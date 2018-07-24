const {promisify} = require('util')
const parseString = promisify(require('xml2js').parseString)
const xml2js = require('xml2js')

module.exports.parseXML = async function(xmlStr) {
    const xmlObj = await parseString(xmlStr)
    const formated = await formatXMLObj(xmlObj)
    return formated
}

module.exports.buildXML = async function(obj) {
    let builder = new xml2js.Builder()
    return await builder.buildObject(obj)
}

function formatXMLObj(xmlObj) {
    let result = {}
    if (typeof xmlObj == 'object') {
        let keys = Object.keys(xmlObj)
        for (let key of keys) {
            let item = xmlObj[key]
            if (!Array.isArray(item) || item.length == 0) {
                // 微信返回的xml除了根元素xml，其他的元素值都为数组
                continue
            }
            if (item.length == 1) {
                let val = item[0]
                if (typeof val == 'object') {
                    result[key] = formatXMLObj(val)
                } else {
                    val = (val || '').trim()
                    result[key] = val
                }
            } else {
                let arr = []
                for (let i = 0; i < item.length; i++) {
                    let val = item[i]
                    if (typeof val == 'object') {
                        arr.push(formatXMLObj(val))
                    } else {
                        val = (val || '').trim()
                        arr.push(val)
                    }
                }
                result[key] = arr
            }
        }
    
    }
    return result
}