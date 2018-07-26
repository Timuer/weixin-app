const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const {promisify} = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const rp = require('request-promise')
const {mime} = require('./utils')

class Wechat {
    constructor(config) {
        this.appID = config.appID
        this.appSecret = config.appSecret
        this.token = config.token
        this.access_token_path = config.access_token_path
        this.access_token_url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appID}&secret=${this.appSecret}`
        this.materials = {}
    }

    authenticate(ctx) {
        const req = ctx.request
        const res = ctx.response
        if (!this.isFromWechat(req)) {
            console.log('error:Not from developers')
            res.status = 403
            res.body = 'Not from developers'
            return
        } else {
            res.body = req.query.echostr
        }
    }

    isFromWechat(request) {
        // 获取接入验证信息
        const q = request.query
        const token = this.token
        const nonce = q.nonce
        const timestamp = q.timestamp
        const signature = q.signature
        const echostr = q.echostr
        // 验证微信接入
        if (nonce && timestamp && signature && echostr) {
            const s = sha1([token, nonce, timestamp].sort().join(''))
            // console.log('querystr', ctx.request.querystring)
            // console.log('arguments: ', token, nonce, timestamp, s, signature, echostr)
            if (s == signature) {
                return true
            } else {
                return false
            }    
        }
    }

    async getAccessToken() {
        const data = await readFile(this.access_token_path)
        try {
            const accessToken = JSON.parse(data.toString())
            if (this.isValidAccessToken(accessToken)) {
                console.log('isvalid')
                return accessToken.value
            } else {
                const updated = await this.updatedAccessToken()
                await this.saveAccessToken(updated)
                return updated.access_token
            }
        } catch(e) {
            const updated = await this.updatedAccessToken()
            await this.saveAccessToken(updated)
            return updated.access_token
        }
    }

    isValidAccessToken(accessToken) {
        if (accessToken) {
            const v = accessToken.value
            const t = accessToken.invalid_time
            if (v && t && Date.now() < t) {
                return true
            } else {
                return false
            }
        }
    }

    async updatedAccessToken() {
        console.log('update token')
        const data = await rp(this.access_token_url)
        console.log(data.toString())
        return JSON.parse(data.toString())
    }

    async saveAccessToken(accessToken) {
        const token = accessToken.access_token
        const expires = Date.now() + (token.expires_in - 20) * 1000
        const obj = {
            value: token,
            invalid_time: expires
        }
        const js = JSON.stringify(obj)
        await writeFile(this.access_token_path, js)
    }

    async getMediaId(materialPath) {
        let m = this.materials[materialPath]
        if (m && m.expires - Date.now() > 0) {
            return m.media_id
        } else {
            this.uploadMaterial(materialPath)
        }
    }

    async uploadMaterial(materialPath) {
        let access_token = await this.getAccessToken()
        let name = path.basename(materialPath)
        let ext = path.extname(materialPath).slice(1)
        let type = mime(ext)
        let upload_url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${access_token}&type=${type}`
        let options = {
            method: 'POST',
            uri: upload_url,
            formData: {
                file: {
                    value: fs.createReadStream(materialPath),
                    options: {
                        filename: name,
                        contentType: type,
                    }
                }
            }
        }
        try {
            let data = await rp(options)
            console.log('upload response: ', data)
            let obj = JSON.parse(data)
            this.materials[materialPath] = {
                expires: Date.now() + 3 * 24 * 3600,
                media_id: obj.media_id
            }
        } catch(err) {
            console.error(err)
        }
    }
}

module.exports = Wechat