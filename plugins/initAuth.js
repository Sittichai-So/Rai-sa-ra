import axios from 'axios'

export default async ({ store }) => {
  if (process.client) {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('userData')

    if (token && userData) {
      const parsedUser = JSON.parse(userData)

      try {
        const response = await axios.patch(
          `${process.env.API_URL}/user/${parsedUser._id}/status`,
          { status: 'online' },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data?.result) {
          parsedUser.status = response.data.result.status
          parsedUser.lastLogin = response.data.result.lastLogin
          localStorage.setItem('userData', JSON.stringify(parsedUser))
        }

        store.commit('setUserData', parsedUser)
      } catch (err) {
        console.error('Update online status failed:', err)
      }
    }
  }
}
