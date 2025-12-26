import axios from 'axios'
import { distance } from '../utils/distance.js'
import template from '../templates/exhibition.json' with { type: 'json' }

export default async (event) => {
  try {
    // 如果是位置訊息，使用使用者的座標；如果是文字訊息，使用預設座標 (例如台北市政府)
    const lat = event.message.type === 'location' ? event.message.latitude : 25.03746
    const lon = event.message.type === 'location' ? event.message.longitude : 121.564558

    const { data } = await axios.get('https://cultureexpress.taipei/OpenData/Event/C000003')
    const bubbles = data
      .map((value) => {
        value.distance = distance(
          value.Latitude,
          value.Longitude,
          event.message.latitude,
          event.message.longitude,
          lat,
          lon,
          'K',
        )
        return value
      })
      .sort((a, b) => {
        return a.distance - b.distance
      })
      
      .slice(0, 3)
      
      .map((value) => {
        const type = `${value.Category}`
        const title = `${value.Caption}`
        const startDate = `開始${value.StartDate}`
        const endDate = `結束${value.EndDate}`
        const address = value.City + value.Area
        const googleMapUrl = `https://www.google.com/maps/@${value.Latitude},${value.Longitude},18.5z`
        const url = value.RelatedLink || googleMapUrl
        const picUrl = value.ImageFile || 'https://placehold.co/600x400?text=No+Image'        //免費、售票
        const charge = value.TicketType
        const bubble = JSON.parse(JSON.stringify(template))

        bubble.hero.url = picUrl
        bubble.body.contents[0].text = type
        bubble.body.contents[1].text = title
        bubble.body.contents[2].contents[1].text = charge
        bubble.body.contents[3].contents[0].contents[1].text = startDate
        bubble.body.contents[3].contents[1].contents[1].text = endDate
        bubble.body.contents[3].contents[2].contents[1].text = address
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
    }
  } catch (error) {
    console.log(error)
  }
}
