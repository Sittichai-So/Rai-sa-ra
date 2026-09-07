import axios from 'axios'

export default async ({ store }) => {
  if (!process.client) { return }

  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('userData')
  if (!token || !userData) { return }

  let parsedUser
  try {
    parsedUser = JSON.parse(userData)
  } catch (e) {
    localStorage.removeItem('userData')
    return
  }

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
