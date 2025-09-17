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
