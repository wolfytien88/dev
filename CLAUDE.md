# CLAUDE.md

此檔案為 Claude Code（claude.ai/code）在此專案中運作時提供指引。

## 執行遊戲

直接用瀏覽器開啟 `index.html` 即可，無需建置步驟或伺服器。所有資源皆為純 HTML/CSS/JS。

## 架構

單頁貪食蛇遊戲，共三個檔案，除 Google Fonts 字型外無任何外部相依：

- `index.html` — 版面配置：畫布、分數顯示、暫停／速度／重新開始控制項、排行榜側欄
- `script.js` — 所有遊戲邏輯集中於一個平坦腳本（無模組、無類別）
- `style.css` — 粉紅主題樣式，響應式斷點設於 700 px

### `script.js` 中的關鍵狀態

| 變數 | 用途 |
|---|---|
| `snake` | `{x, y}` 格子陣列，頭部在最前 |
| `dir` | 當前方向向量 |
| `food` | 當前食物位置 `{x, y}` |
| `running` / `paused` | 遊戲狀態旗標 |
| `timer` | 遊戲迴圈的 `setInterval` 控制代碼 |

遊戲透過 `setInterval(gameLoop, speed)` 推進。速度變更時會清除並重新建立計時器。網格為 400×400 畫布上的 20×20 格。

排行榜將前 5 名分數以 `snake_leaderboard` 為鍵儲存於 `localStorage`。

### 操作方式

鍵盤：方向鍵或 WASD 控制方向；遊戲結束後按空白鍵重新開始；P 鍵暫停。
滑鼠：點擊畫布開始遊戲；可使用暫停／重新開始／速度按鈕。

### `roundRect` Polyfill

`script.js` 會為不支援原生 API 的瀏覽器補丁 `CanvasRenderingContext2D.prototype.roundRect`。
