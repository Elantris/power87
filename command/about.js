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
        name: ':bookmark_tabs: Dev Note',
        value: 'https://hackmd.io/s/VkLSj2pOJW\nAnnouncement, updates, development notes. This project is still in development.'
      }, {
        name: ':loudspeaker: Report and Feedback',
        value: 'https://forms.gle/9iYELzNoQ2JRDKeR7\nSay hi to developer of power87!'
      }, {
        name: ':credit_card: Donation Links',
        value: '(NTD) Opay Donation\n<申請沒過QQ>\n\n(ETH) 0x Donate\nhttps://0xdonate.io/#/donate?addr=0x175021BACC450F44b895e2Cdcf384810351A4ECE'
      }]
    }
  })
}
