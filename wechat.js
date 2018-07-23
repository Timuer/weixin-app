const fs = require('fs')
const {promisify} = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const rp = require('request-promise')

class Wechat {
    constructor(config) {
        this.appID = config.appID
        this.appSecret = config.appSecret
        this.token = config.token
        this.access_token_path = config.access_token_path
        this.access_token_url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appID}&secret=${this.appSecret}`
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
}

module.exports = Wechat