module.exports = {
    event: async (ctx) => {
        let message = ctx.msg
        let result = {}
        if (message.Event == 'subscribe') {
            result.type = 'text'
            result.text = '欢迎订阅'
        } else if (message.Event == 'unsubscribe') {
            result.type = 'text'
            result.text = '取关'
        } else if (message.Event == 'SCAN') {
            result.type = 'text'
            result.text = '您已经关注啦！'
        } else if (message.Event == 'LOCATION') {
            let m = message
            result.type = 'text'
            result.text = `您当前所处的位置为：精度${m.Longitude}, 纬度${m.Latitude}, 精确度${m.Precision}`
        } else if (message.Event == 'CLICK') {
            let k = message.EventKey
            result.type = 'text'
            result.text = `您点击了${k}`
        } else if (message.Event == 'VIEW') {
            let k = message.EventKey
            result.type = 'text'
            result.text = `即将跳转到网页${k}`
        }
        return result
    },
    text: async (ctx) => {
        let message = ctx.msg
        let result = {}
        if (message.Content == '1') {
            result.type = 'text'
            result.text = '欢迎你'
        } else if (message.Content == '2') {
            result.type = 'text'
            result.text = '我们一起学猫叫，一起喵喵喵喵喵'
        } else if (message.Content == '3') {
            result.type = 'news'
            result.count = 1
            result.items = []
            result.items.push({
                title: '美少女',
                description: '这是篇关于美少女的文章',
                picurl: 'https://b-ssl.duitang.com/uploads/item/201111/13/20111113130152_fVTzA.jpg',
                url: 'https://www.jianshu.com/p/db34642f9d27',
            })
        } else if (message.Content == '4') {
            result.type = 'image'
            try {
                let data = await ctx.wechat.getMediaId('./static/img/1.jpg')
                result.media_id = data    
            } catch(err) {
                console.error(err)
            }
        } else {
            result.type = 'text'
            result.text = '不清楚~'
        }
        return result
    }
}