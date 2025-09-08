export const state = () => {
  return {
    user: null,
    role: null,
    login: {}
  }
}

export const mutations = {
  setLoginData (state, data) {
    state.login = data
  },
  setUserData (state, userData) {
    state.user = userData
  }
}
