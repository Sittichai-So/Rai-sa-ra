export const state = () => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  typingUsers: [],
  onlineUsers: [],
  isConnected: false,
  memberList: []
})

export const mutations = {
  SET_CURRENT_ROOM (state, room) {
    state.currentRoom = room
  },
  SET_ROOMS (state, rooms) {
    state.rooms = rooms
  },
  SET_MESSAGES (state, messages) {
    state.messages = messages
  },
  ADD_MESSAGE (state, message) {
    state.messages.push(message)
  },
  UPDATE_MESSAGE (state, message) {
    const index = state.messages.findIndex(m => m._id === message._id)
    if (index !== -1) { state.messages.splice(index, 1, message) }
  },
  REMOVE_MESSAGE (state, messageId) {
    state.messages = state.messages.filter(m => m._id !== messageId)
  },
  SET_MEMBER_LIST (state, members) {
    state.memberList = members
  },
  ADD_TYPING_USER (state, user) {
    if (!state.typingUsers.find(u => u.userId === user.userId)) {
      state.typingUsers.push(user)
    }
  },
  REMOVE_TYPING_USER (state, userId) {
    state.typingUsers = state.typingUsers.filter(u => u.userId !== userId)
  }
}

export const actions = {
  setCurrentRoom ({ commit }, room) {
    commit('SET_CURRENT_ROOM', room)
  },
  setMessages ({ commit }, messages) {
    commit('SET_MESSAGES', messages)
  },
  addMessage ({ commit }, message) {
    commit('ADD_MESSAGE', message)
  },
  updateMessage ({ commit }, message) {
    commit('UPDATE_MESSAGE', message)
  },
  removeMessage ({ commit }, messageId) {
    commit('REMOVE_MESSAGE', messageId)
  },
  setMemberList ({ commit }, members) {
    commit('SET_MEMBER_LIST', members)
  },
  addTypingUser ({ commit }, user) {
    commit('ADD_TYPING_USER', user)
  },
  removeTypingUser ({ commit }, userId) {
    commit('REMOVE_TYPING_USER', userId)
  },

  async fetchRooms ({ commit }) {
    try {
      const rooms = await this.$axios.$get(`${process.env.API_BASE}/room/getRoom`)
      commit('SET_ROOMS', rooms.result || [])
    } catch (err) {
      console.error('fetchRooms error:', err)
    }
  },

  async joinRoom ({ commit }, { roomId, user }) {
    try {
      const { data } = await this.$axios.post('/room/joinRoom', {
        roomId,
        userId: user._id,
        fullname: user.fullname,
        avatar: user.avatar || ''
      })

      if (data.status === 'success') {
        commit('SET_CURRENT_ROOM', data.result)
        return data.result
      }
    } catch (error) {
      console.error('joinRoom error:', error)
      throw error
    }
  }
}

export const getters = {
  currentRoom: state => state.currentRoom,
  messages: state => state.messages,
  typingUsers: state => state.typingUsers,
  onlineUsers: state => state.onlineUsers,
  memberList: state => state.memberList,
  messagesByDate: (state) => {
    const grouped = {}
    state.messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString()
      if (!grouped[date]) { grouped[date] = [] }
      grouped[date].push(msg)
    })
    return grouped
  }
}
