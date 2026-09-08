export const state = () => ({
  user: null,
  role: null,
  login: {}
})

export const mutations = {
  setUserData (state, userData) {
    state.user = userData
  },
  setLoginData (state, data) {
    state.login = data
  }
}

export const getters = {
  role (state) {
    return (state.user && state.user.role) || null
  },
  isAdmin (state) {
    return !!state.user && state.user.role === 'admin'
  },
  isStaff (state) {
    return !!state.user && ['admin', 'moderator'].includes(state.user.role)
  }
}
