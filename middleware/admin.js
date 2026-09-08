export default function ({ redirect }) {
  if (!process.client) { return }

  let role = null
  try {
    const raw = localStorage.getItem('userData')
    if (raw) { role = JSON.parse(raw).role || null }
  } catch (e) {}

  if (role !== 'admin') {
    return redirect('/chat/chat')
  }
}
