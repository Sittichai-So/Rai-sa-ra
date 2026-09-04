import io from 'socket.io-client'

export default (ctx, inject) => {
  const url = process.env.SOCKET_URL || 'http://localhost:8012'

  const socket = io(url, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  })

  // ประกาศตัวตนใหม่ทุกครั้งที่ (re)connect เพื่อให้ server ผูก socket กับ userId
  const identify = () => {
    try {
      const raw = localStorage.getItem('userData')
      if (!raw) { return }
      const user = JSON.parse(raw)
      if (user && user._id) {
        socket.emit('identify', { userId: user._id })
      }
    } catch (e) {}
  }
  socket.on('connect', identify)

  inject('socket', socket)
}
