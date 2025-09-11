import { io } from 'socket.io-client'

export default function ({ $config, store, $auth }, inject) {
  let socket = null

  const connect = () => {
    if (socket?.connected) { return socket }

    const token = $auth.strategy.token.get()
    if (!token) { return null }

    socket = io($config.socketURL, {
      auth: {
        token: token.replace('Bearer ', '')
      },
      transports: ['websocket', 'polling'],
      forceNew: true
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      store.dispatch('chat/setConnectionStatus', true)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      store.dispatch('chat/setConnectionStatus', false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      store.dispatch('chat/setConnectionStatus', false)
    })

    return socket
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      store.dispatch('chat/setConnectionStatus', false)
    }
  }

  const getSocket = () => socket

  inject('socket', {
    connect,
    disconnect,
    getSocket,
    get connected () {
      return socket?.connected || false
    }
  })
}
