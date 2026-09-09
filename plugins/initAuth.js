import axios from 'axios'
import { ensureCleanSession } from '~/utils/auth'

export default async ({ store }) => {
  if (!process.client) { return }

  const s = ensureCleanSession()
  if (!s.valid) {
    store.commit('setUserData', null)
    return
  }

  const token = s.token
  const parsedUser = s.user

  store.commit('setUserData', parsedUser)

  try {
    const url = process.env.API_PATCH_USER_STATUS.replace(':id', parsedUser._id)
    const response = await axios.patch(
      url,
      { status: 'online' },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (response.data?.result) {
      parsedUser.status = response.data.result.status || 'online'
      localStorage.setItem('userData', JSON.stringify(parsedUser))
      store.commit('setUserData', parsedUser)
    }
  } catch (err) {
  }
}
