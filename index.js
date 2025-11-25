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
    const userText = event.message.text.trim()

    // 【修正 3/優化】 設置條件觸發 AI 服務，例如：輸入的文字以 'AI:' 開頭
    if (userText.startsWith('AI:')) {
      // 【修正 2】 提取 prompt 變數：將前綴 'AI:' 移除後，剩下的文字就是 prompt
      const prompt = userText.substring(3).trim()

      // 如果移除前綴後，內容是空的，則提醒使用者
      if (prompt.length === 0) {
        return event.reply('請在 AI: 後面輸入您想詢問的內容。')
      }

      try {
        // 呼叫 OpenAI 服務
        const aiResponse = await getAiResponse(prompt)

        // 使用 Line Bot 回覆訊息
        await event.reply(aiResponse)
      } catch (error) {
        // 如果 getAiResponse 內部的錯誤被 throw 出來，可以在這裡處理
        console.error('AI 回覆失敗:', error)
        // 使用者友善的錯誤回覆
        await event.reply('很抱歉，AI 服務發生內部錯誤，請稍後再試。')
      }
    } else {
      // (可選) 在這裡處理其他非 AI 指令的一般文字訊息，例如：回覆說明、關鍵字查詢等
      // await event.reply('我不懂您的意思，請問您是想查詢展覽還是使用 AI 服務？')
    }
  }
  // 其他訊息類型 (如貼圖、圖片) 這裡沒有處理，會自動忽略
})

bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動')
})
