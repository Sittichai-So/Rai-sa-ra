import io from 'socket.io-client'

export default (ctx, inject) => {
  const url = process.env.SOCKET_URL || 'http://localhost:8012'

  const socket = io(url, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: (setAuth) => {
      let token = null
      try {
        token = localStorage.getItem('token')
      } catch (e) {}
      setAuth({ token })
    }
  })

  const identify = () => {
    socket.emit('identify')
  }
  socket.on('connect', identify)

  inject('socket', socket)
}
