---
name: project-snake-cyber-venom
description: 貪食蛇遊戲改版案 — 從粉嫩可愛風改為「CYBER VENOM 賽博毒蛇」霓虹故障風，2026-06-11 提出設計方案
metadata:
  type: project
---

貪食蛇專案（純 HTML/CSS/JS，Canvas 400x400，無框架）正從粉嫩可愛風（粉紅、圓角、Baloo 2 字體）改版為「絢麗刺激」風格。

2026-06-11 已提出完整設計方案，主題定為「CYBER VENOM 賽博毒蛇」：
- 配色：深淵黑底 `#0a0a12` + 毒液綠 `#39ff14`（蛇/主色）+ 電子品紅 `#ff2079`（食物/危險）+ 賽博青 `#00f0ff`（UI 邊框）
- 字體：Press Start 2P（標題/分數）+ Share Tech Mono（按鈕/排行榜）
- 關鍵架構決策：現有 script.js 把 draw() 綁在 setInterval 邏輯 tick 上，必須拆成「setInterval 跑邏輯 + requestAnimationFrame 跑渲染」才能做粒子/glow/glitch
- 核心效果：半透明黑覆蓋殘影拖尾、shadowBlur 霓虹 glow、橫帶 drawImage 撕裂 glitch、死亡三幕劇（爆裂粒子→訊號劣化→SYSTEM FAILURE 終端畫面）、吃食物粒子迸發+衝擊環+微震
- 提供三檔強度：微叛逆 / 標準龐克 / 全面暴走（含 Web Audio 8-bit 音效）
- 可用性底線：閃爍 < 3Hz、尊重 prefers-reduced-motion

**Why:** 使用者明確要求拋棄粉嫩、追求視覺衝擊；方案已交付但尚未實作。
**How to apply:** 後續若被要求實作，直接依此方案動工，優先序：拆 render 迴圈 → CSS 換皮 → glow/拖尾 → 粒子系統 → 死亡動畫。
