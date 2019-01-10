const manualText = `**Power87** 八七提醒機器人

\`87!add\` __term__ __response__：新增回應
\`87!del\` __term__ __position__：刪除特定回應
\`87!list\` [term]：列出伺服器所有關鍵字、列出單一關鍵字的所有回應
\`87!clean\` [amount]：清除指令訊息、預設 20 則`

module.exports = ({ message, args }) => {
  message.channel.send(manualText)
}
