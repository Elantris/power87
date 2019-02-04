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
        url: 'https://elantris.github.io',
        icon_url: 'https://elantris.github.io/profile.jpg'
      },
      fields: [{
        name: ':credit_card: Donation',
        value: 'Opay:'
      }]
    }
  })
}
