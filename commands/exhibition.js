import axios from 'axios'
import { distance } from '../utils/distance.js'
import template from '../templates/exhibition.json' with { type: 'json' }

export default async (event) => {
  try {
    const { data } = await axios.get('https://cultureexpress.taipei/OpenData/Event/C000003')
    const bubbles = data
      .map((value) => {
        value.distance = distance(
          value.Latitude,
          value.Longitude,
          event.message.latitude,
          event.message.longitude,
          'K',
        )
        return value
      })
      .sort((a, b) => {
        return a.distance - b.distance
      })
      // 取出前 3 筆
      .slice(0, 3)
      // 組成卡片
      .map((value) => {
        // 類型、名稱
        const type = `${value.Category}`
        const title = `${value.Caption}`
        // 時間
        const startDate = `開始${value.StartDate}`
        const endDate = `結束${value.EndDate}`
        // 把縣市、鄉鎮、地址組合起來
        const address = value.City + value.Area
        // 用經緯度產生 Google Map 連結
        const googleMapUrl = `https://www.google.com/maps/@${value.Latitude},${value.Longitude},18.5z`
        // 有些資料沒有網址，需要用 Google Map 連結替代
        const url = value.RelatedLink || googleMapUrl
        // 有些資料沒有圖片，需要用其他圖片替代
        const picUrl = value.ImageFile || 'https://placehold.co/600x400?text=No+Image'
        //免費、售票
        const charge = value.TicketType

        // 將資料帶入 Flex 卡片模板
        const bubble = JSON.parse(JSON.stringify(template))
        bubble.hero.url = picUrl
        bubble.body.contents[0].text = type
        bubble.body.contents[1].text = title
        bubble.body.contents[1].contents[1].text = charge
        bubble.body.contents[2].contents[0].contents[1].text = startDate
        bubble.body.contents[2].contents[1].contents[1].text = endDate
        bubble.body.contents[2].contents[2].contents[1].text = address

        bubble.footer.contents[0].action.uri = url
        bubble.footer.contents[1].action.uri = googleMapUrl

        return bubble
      })

    const result = await event.reply({
      type: 'flex',
      altText: '展覽',
      contents: {
        type: 'carousel',
        contents: bubbles,
      },
    })
    if (result.message) {
      await event.reply('發生錯誤')
      console.log(result)
      // if (!fs.existSync('/*dump')) {
      //   fs.mkdirSync('/*dump')
      // }
    }
  } catch (error) {
    console.log(error)
  }
}
