import { ensureCleanSession } from '~/utils/auth'

export default function () {
  if (!process.client) { return }
  ensureCleanSession()
}
