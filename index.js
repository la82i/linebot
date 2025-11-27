import 'dotenv/config'
import linebot from 'linebot'
import commandExhibition from './commands/exhibition.js'
// 【修正 1】 將 default import 修正為具名 import，以取得 getAiResponse 函式
import { getAiResponse } from './commands/openai.js'

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
})

bot.on('message', async (event) => {
  if (event.message.type === 'location') {
    // 處理地理位置訊息，呼叫展覽查詢功能
    commandExhibition(event)
  } else if (event.message.type === 'text') {
    // 【修正點 1】將使用者文字直接定義為 prompt 變數
    const prompt = event.message.text.trim() // 如果是空白訊息，則忽略不處理

    if (prompt.length === 0) {
      return
    }

    try {
      // 呼叫 OpenAI 服務
      const aiResponse = await getAiResponse(prompt) // 使用 Line Bot 回覆訊息

      await event.reply(aiResponse)
    } catch (error) {
      // 如果 getAiResponse 內部的錯誤被 throw 出來，可以在這裡處理
      console.error('AI 回覆失敗:', error) // 使用者友善的錯誤回覆
      await event.reply('很抱歉，AI 服務發生內部錯誤，請稍後再試。')
    }
    // 【修正點 2】結構在這裡結束，不再有多餘的 } 和 else { ... }
  } // 其他訊息類型 (如貼圖、圖片) 這裡沒有處理，會自動忽略
})

bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動')
})
