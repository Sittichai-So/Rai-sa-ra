const API = process.env.API_RPG_SAVE
const FETCH_TIMEOUT_MS = 2500

function headers () {
  let token = ''
  try { token = localStorage.getItem('token') || '' } catch (e) {}
  return { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }
}

async function request (method, body, { keepalive = false, timeoutMs = FETCH_TIMEOUT_MS } = {}) {
  if (!API || typeof fetch === 'undefined') { return null }
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null
  try {
    const response = await fetch(API, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
      keepalive,
      signal: controller ? controller.signal : undefined
    })
    if (!response.ok) { return null }
    const json = await response.json()
    return json && json.result ? json.result : null
  } catch (e) {
    return null
  } finally {
    if (timer) { clearTimeout(timer) }
  }
}

export function fetchRemote () {
  return request('GET')
}

export function pushRemote (payload, options) {
  return request('PUT', payload, options)
}

export function deleteRemote () {
  return request('DELETE')
}
