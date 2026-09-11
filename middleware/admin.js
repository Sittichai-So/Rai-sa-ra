import { ensureCleanSession } from '~/utils/auth'

export default function ({ redirect }) {
  if (!process.client) { return }

  const s = ensureCleanSession()
  if (!s.valid) {
    return redirect('/login')
  }

  const role = s.payload.role || (s.user && s.user.role) || null
  if (role !== 'admin') {
    return redirect('/chat/chat')
  }
}
