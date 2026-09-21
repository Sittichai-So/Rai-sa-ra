const EVENT_MAP = {
  worldJoined: 'onJoined',
  worldPlayerJoined: 'onPlayerJoined',
  worldPlayerMoved: 'onPlayerMoved',
  worldPlayerLeft: 'onPlayerLeft',
  worldEncounter: 'onEncounter',
  worldEventResolved: 'onEventResolved',
  worldRested: 'onRested',
  worldPositionCorrected: 'onPositionCorrected',
  worldVictory: 'onVictory',
  worldDefeated: 'onDefeated'
}

export default class WorldNetwork {
  constructor (socket, roomId, zone, user, classId) {
    this.socket = socket
    this.roomId = roomId
    this.zone = zone
    this.user = user
    this.classId = classId
    this.joined = false
    this.listeners = []
  }

  listen (map) {
    Object.entries(map).forEach(([event, fn]) => {
      if (!fn) { return }
      this.socket.on(event, fn)
      this.listeners.push([event, fn])
    })
  }

  join (spawn, handlers, profile = {}) {
    const mapped = {}
    Object.entries(EVENT_MAP).forEach(([event, key]) => { mapped[event] = handlers[key] })
    this.listen(mapped)
    this.socket.emit('worldJoin', {
      roomId: this.roomId,
      zone: this.zone,
      user: this.user,
      classId: this.classId,
      x: spawn.x,
      y: spawn.y,
      hp: profile.hp,
      level: profile.level
    })
    this.joined = true
  }

  move (x, y, flipX) {
    if (!this.joined) { return }
    this.socket.emit('worldMove', { x, y, flipX })
  }

  chooseEvent (choiceId) {
    if (!this.joined) { return }
    this.socket.emit('worldEventChoice', { choiceId })
  }

  interact (id) {
    if (!this.joined) { return }
    this.socket.emit('worldInteract', { id })
  }

  roll () {
    if (!this.joined) { return }
    this.socket.emit('worldRoll')
  }

  combatAction (action, itemId) {
    if (!this.joined) { return }
    this.socket.emit('worldCombatAction', { action, itemId })
  }

  useItem (itemId) {
    if (!this.joined) { return }
    this.socket.emit('worldUseItem', { itemId })
  }

  setGear (gear) {
    if (!this.joined) { return }
    this.socket.emit('worldSetGear', gear)
  }

  service (id) {
    if (!this.joined) { return }
    this.socket.emit('worldService', { id })
  }

  destroy () {
    this.listeners.forEach(([event, fn]) => this.socket.off(event, fn))
    this.listeners = []
    if (this.joined) { this.socket.emit('worldLeave') }
    this.joined = false
  }
}
