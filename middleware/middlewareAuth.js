import { ensureCleanSession } from '~/utils/auth'

export default function ({ redirect }) {
  if (!process.client) { return }

  const s = ensureCleanSession()
  if (!s.valid) {
    return redirect('/login')
  }
}
