import io from 'socket.io-client'

export default (ctx, inject) => {
  const socket = io('http://localhost:8012', {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })

  inject('socket', socket)
}
