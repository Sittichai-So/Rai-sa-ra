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
    // ส่ง JWT ไปด้วยทุกครั้งที่ (re)connect — server verify ที่ io.use()
    auth: (setAuth) => {
      let token = null
      try {
        token = localStorage.getItem('token')
      } catch (e) {}
      setAuth({ token })
    }
  })

  // ประกาศตัวตนใหม่ทุกครั้งที่ (re)connect
  const identify = () => {
    socket.emit('identify')
  }
  socket.on('connect', identify)

  inject('socket', socket)
}
