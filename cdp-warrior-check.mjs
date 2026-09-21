const CDP_PORT = process.env.CDP_PORT
async function main () {
  const listRes = await fetch(`http://localhost:${CDP_PORT}/json/list`)
  const tabs = await listRes.json()
  const tab = tabs.find(t => t.url.includes('/rpg/world'))
  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  let msgId = 1
  const pending = new Map()
  function send (method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++
      pending.set(id, resolve)
      ws.send(JSON.stringify({ id, method, params }))
    })
  }
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject) })
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id) }
  })
  await send('Runtime.enable')
  await send('Input.enable')

  await send('Runtime.evaluate', { expression: `window.__rpgGame ? 'has-hook' : (window.__rpgGame = null)` })

  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 38, code: 'ArrowUp', key: 'ArrowUp' })
  await new Promise(r => setTimeout(r, 3400))
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 38, code: 'ArrowUp', key: 'ArrowUp' })
  await new Promise(r => setTimeout(r, 600))

  async function evalExpr (expr) {
    const r = await send('Runtime.evaluate', { expression: expr })
    return r.result.value
  }
  console.log('ENCOUNTER_TEXT:', await evalExpr(`(document.querySelector('.event-box')||{}).innerText || 'NONE'`))
  console.log('FIGHT_CLICK:', await evalExpr(`(() => { const b = document.querySelector('.choice-btn'); if(!b) return 'NOT_FOUND'; b.click(); return 'clicked:'+b.innerText })()`))
  await new Promise(r => setTimeout(r, 700))
  console.log('OUTCOME:', await evalExpr(`(document.querySelector('.event-box')||{}).innerText || 'NONE'`))
  ws.close()
  process.exit(0)
}
main().catch(e => { console.error(e.message); process.exit(1) })
