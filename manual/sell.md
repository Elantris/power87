販賣物品
可用指令：sell

語法：
```
87!sell [target] [amount]
```
`target` 不含空格的字串或是 all
`amount` 大於 0 的整數數字

範例：
```
87!sell shrimp
87!sell fishing
87!sell all
```
說明：
這間道具販賣屋的店主很八七，收購都用最低價。釣魚中無法使用 sell 指令。無參數時列出背包內可以販賣的物品，沒有 amount 參數時販賣最大數量。指定販賣目標時可以使用物品的種類、名稱、圖示、顯示名稱選擇物品，例如 `87!sell fishing` 會只賣出背包內所有的漁獲。
