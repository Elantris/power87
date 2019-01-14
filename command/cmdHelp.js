const manualText = `**Power87** 八七提醒機器人

\`87\` __term__：從特定關鍵字裡隨機挑選一個回應
\`87\` __term__ __number__：從特定關鍵字裡挑出第 number 個回應

管理指令：
\`87!add\` __term__ __response__：新增回應
\`87!del\` __term__ __position__：刪除特定回應
\`87!list\` [term]：列出伺服器所有關鍵字或列出單一關鍵字的所有回應
\`87!vote\` __subject__ [duration]：發起公投
\`87!clean\` [amount]：清除機器人訊息、預設 20 則`

module.exports = ({ message, args }) => {
  message.channel.send(manualText)
}
