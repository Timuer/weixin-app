const {promisify} = require('util')
const parseString = promisify(require('xml2js').parseString)
const ejs = require('ejs')
const heredoc = require('heredoc')

module.exports.parseXML = async function(xmlStr) {
    const xmlObj = await parseString(xmlStr)
    const formated = await formatXMLObj(xmlObj)
    return formated
}

class XMLMessageBuilder {
    constructor() {
        this.str = heredoc(function() {/*
            <xml>
                <ToUserName>
                    < ![CDATA[<%= obj.toUser %>]]>
                </ToUserName>
                <FromUserName>
                    < ![CDATA[<%= obj.fromUser %>]]>
                </FromUserName>
                <CreateTime>
                    <%= obj.now %>
                </CreateTime>
                <MsgType>
                    < ![CDATA[<%= obj.content.type %>]]>
                </MsgType>
                <% if (obj.content.type == 'text') { %>
                    <Content>
                        < ![CDATA[<%= obj.content.text %>]]>
                    </Content>
                <% } else if (obj.content.type == 'image') { %>
                    <Image>
                        <MediaId>
                            < ![CDATA[<%= obj.content.media_id %>]]>
                        </MediaId>
                    </Image>
                <% } else if (obj.content.type == 'voice') { %>
                    <Voice>
                        <MediaId>
                            < ![CDATA[<%= obj.content.media_id %>]]>
                        </MediaId>
                    </Voice>
                <% } else if (obj.content.type == 'video') { %>
                    <Video>
                        <MediaId>
                            < ![CDATA[<%= obj.content.media_id %>]]>
                        </MediaId>
                        <Title>
                            < ![CDATA[<%= obj.content.title %>]]>
                        </Title>
                        <Description>
                            < ![CDATA[<%= obj.content.description %>]]>
                        </Description>
                    </Video>
                <% } else if (obj.content.type == 'music') { %>
                    <Music>
                        <Title>
                            < ![CDATA[<%= obj.content.title %>]]>
                        </Title>
                        <Description>
                            < ![CDATA[<%= obj.content.description %>]]>
                        </Description>
                        <MusicUrl>
                            < ![CDATA[<%= obj.content.music_url %>]]>
                        </MusicUrl>
                        <HQMusicUrl>
                            < ![CDATA[<%= obj.content.hq_music_url %>]]>
                        </HQMusicUrl>
                        <ThumbMediaId>
                            < ![CDATA[<%= obj.content.media_id %>]]>
                        </ThumbMediaId>
                    </Music>
                <% } else if (obj.content.type == 'news') { %>
                    <ArticleCount><%= obj.content.count %></ArticleCount>
                    <Articles>
                        <% for (let i = 0; i < obj.content.count; i++) { %>
                            <item>
                                <Title>
                                    < ![CDATA[<%= obj.content.items[i].title %>]]>
                                </Title>
                                <Description>
                                    < ![CDATA[<%= obj.content.items[i].description %>]]>
                                </Description>
                                <PicUrl>
                                    < ![CDATA[<%= obj.content.items[i].picurl %>]]>
                                </PicUrl>
                                <Url>
                                    < ![CDATA[<%= obj.content.items[i].url %>]]>
                                </Url>
                            </item>
                        <% } %>
                    </Articles>
                <% } %>
            </xml>
        */})
        this.template = ejs.compile(this.str)
    }

    build(obj) {
        return this.template({obj: obj}).replace(/\s+/g, '')
    }
}

module.exports.XMLMessageBuilder = XMLMessageBuilder

function formatXMLObj(xmlObj) {
    let result = {}
    if (typeof xmlObj == 'object') {
        let keys = Object.keys(xmlObj)
        for (let key of keys) {
            let item = xmlObj[key]
            if (!Array.isArray(item) || item.length == 0) {
                // 微信返回的xml除了根元素xml，其他的元素值都为数组
                result = formatXMLObj(item)
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

module.exports.mime = (ext) => {
    return {
        txt: 'text/plain',
        json: 'application/json',
        html: 'text/html',
        xml: 'application/xml',
        jpg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
    }[ext]
}