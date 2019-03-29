module.exports = ({ message }) => {
  message.channel.send({
    embed: {
      title: 'Power87',
      description: 'A discord bot filled with 87 power.',
      color: 0xffe066,
      thumbnail: {
        url: 'https://i.imgur.com/KxZpCxD.png'
      },
      author: {
        name: 'Elantris',
        icon_url: 'https://elantris.github.io/profile.jpg'
      },
      fields: [{
        name: ':loudspeaker: 公告頁面',
        value: 'https://hackmd.io/s/VkLSj2pOJW\n功能介紹與更新紀錄'
      }, {
        name: ':envelope: 意見調查',
        value: 'https://forms.gle/9iYELzNoQ2JRDKeR7\n你們的聲音開發者都聽到了！'
      }, {
        name: ':credit_card: 捐款贊助',
        value: '申請沒過啦Ｘ！'
      }]
    }
  })
}
