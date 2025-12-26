import 'dotenv/config'
import linebot from 'linebot'
import commandExhibition from './commands/exhibition.js'


const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
})
bot.on('message', async (event) => {
  if (event.message.type === 'location') {
    commandExhibition(event)
  } else if (event.message.type === 'text') {
    const prompt = event.message.text.trim()
    
    if (prompt === '查詢展覽') {
      commandExhibition(event)
      return
    }

    if (prompt.length === 0) {
      return
    }

    console.log(`收到文字訊息: ${prompt}`)
  } 
}) 
    
bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動')
})
