import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
})

/**
 * 呼叫 OpenAI API 產生內容
 * @param {string} prompt 使用者輸入的提示
 * @returns {Promise<string>} 回傳 AI 生成的文字
 */
export async function getAiResponse(prompt) {
  try {
    const completion = await openai.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '你是一個樂於助人的 Line 機器人助理。' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
    })

    return completion.choices[0].message.content.trim()
  } catch (error) {
    console.error('OpenAI API 錯誤:', error)
    return '很抱歉，AI 服務目前無法回應。'
  }
}
