module.exports = ({ message }) => {
  message.channel.send({
    embed: {
      title: 'Elantris/power87',
      description: 'A discord bot filled with 87 power.',
      url: 'https://github.com/Elantris/power87',
      color: 0xffe066,
      thumbnail: {
        url: 'https://i.imgur.com/KxZpCxD.png'
      },
      author: {
        name: 'Elantris',
        url: 'https://github.com/Elantris',
        icon_url: 'https://elantris.github.io/profile.jpg'
      },
      fields: [{
        name: ':orange_book: Dev Note',
        value: 'This project is still in development.\nhttps://hackmd.io/s/VkLSj2pOJW'
      }, {
        name: ':credit_card: Donation Links',
        value: '(NTD) Opay Donation\n<>\n(ETH) 0x Donate\nhttps://0xdonate.io/#/donate?addr=0x175021BACC450F44b895e2Cdcf384810351A4ECE'
      }]
    }
  })
}
