import { ensureCleanSession } from '~/utils/auth'

export default function ({ redirect }) {
  if (!process.client) { return }

  const s = ensureCleanSession()
  if (!s.valid) {
    return redirect('/login')
  }

  // role จาก JWT payload ที่ backend เซ็น — เชื่อถือได้กว่า userData ใน localStorage ที่แก้เองได้
  const role = s.payload.role || (s.user && s.user.role) || null
  if (role !== 'admin') {
    return redirect('/chat/chat')
  }
}
