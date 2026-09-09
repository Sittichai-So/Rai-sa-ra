const AUTH_KEYS = ['token', 'userData', 'userStatus', 'authPayrollToken']

export function clearAuth () {
  AUTH_KEYS.forEach((k) => {
    try { localStorage.removeItem(k) } catch (e) {}
    try { sessionStorage.removeItem(k) } catch (e) {}
  })
}

export function decodeJwt (token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

// อ่าน + ตรวจ session ฝั่ง client (backend ยังตรวจ signature จริงอีกชั้น)
// reason: 'missing' | 'malformed' | 'expired' — ทุกกรณีที่ไม่ใช่ 'missing' ควรล้าง localStorage
export function readSession () {
  let token, rawUser
  try {
    token = localStorage.getItem('token')
    rawUser = localStorage.getItem('userData')
  } catch (e) {
    return { valid: false, reason: 'missing' }
  }
  if (!token || !rawUser) { return { valid: false, reason: 'missing' } }

  const payload = decodeJwt(token)
  if (!payload || typeof payload.exp !== 'number') {
    return { valid: false, reason: 'malformed' }
  }
  if (payload.exp * 1000 <= Date.now()) {
    return { valid: false, reason: 'expired' }
  }

  let user
  try { user = JSON.parse(rawUser) } catch (e) {
    return { valid: false, reason: 'malformed' }
  }

  return { valid: true, token, payload, user }
}

// ล้าง session ถ้าเสีย/หมดอายุ — คืน true ถ้ายัง valid
export function ensureCleanSession () {
  const s = readSession()
  if (!s.valid && s.reason !== 'missing') { clearAuth() }
  return s
}
