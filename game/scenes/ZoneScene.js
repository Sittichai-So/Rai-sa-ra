// eslint-disable-next-line import/default
import Phaser from 'phaser'
import WorldObjects from '../systems/collision'
import InteractionSystem from '../systems/interaction'
import MarkerSet from '../systems/markers'
import DebugOverlay from '../systems/debugOverlay'
import { makeLabel } from '../systems/labels'
import { directionFor } from '../systems/characters'
import { state } from '../systems/gameState'

const MOVE_SEND_INTERVAL_MS = 100
const OTHER_IDLE_DELAY_MS = 250
const DISCOVER_RADIUS = 64
const CLASS_IDS = ['warrior', 'rogue', 'mage', 'cleric']
const DEFAULT_CLASS_ID = 'cleric'

const VERB_BY_TYPE = {
  treasure: 'ตรวจสอบ',
  rest: 'พักผ่อน',
  enemy: 'โจมตี',
  dialogue: 'เข้าไปดู',
  clue: 'ตรวจสอบ',
  trap: 'ตรวจสอบ'
}

export default class ZoneScene extends Phaser.Scene {
  constructor (key, zone) {
    super(key)
    this.zone = zone
    this.speed = 80
    this.viewWidth = 352
    this.zoom = 2
  }

  buildWorld () {
    return { width: 320, height: 240, spawn: { x: 160, y: 120 } }
  }

  markerDefs () {
    return []
  }

  playerKey () {
    const classId = this.registry.get('classId')
    return CLASS_IDS.includes(classId) ? classId : DEFAULT_CLASS_ID
  }

  otherKey (classId) {
    return CLASS_IDS.includes(classId) ? classId : DEFAULT_CLASS_ID
  }

  addPlayerColliders () {
    this.objects.collide(this.player)
  }

  worldReady () {}

  worldUpdate () {}

  get movementLocked () {
    return this.locks.size > 0
  }

  setLock (reason, on) {
    if (on) { this.locks.add(reason) } else { this.locks.delete(reason) }
    if (this.movementLocked) { this.player.setVelocity(0, 0) }
  }

  create () {
    this.zoom = Math.max(2, Math.round(this.scale.width / this.viewWidth))
    this.locks = new Set()
    this.otherPlayers = new Map()
    this.npcs = new Map()
    this.discovered = new Set()
    this._lastSent = null
    this._sendAccum = 0
    this.wasMoving = false
    this.facing = 'down'
    this.waypoint = null
    this.waypointArrow = null

    this.objects = new WorldObjects(this)
    const world = this.buildWorld()
    this.worldSize = { width: world.width, height: world.height }

    this.playerTexture = this.playerKey()
    this.playerShadow = this.add.sprite(world.spawn.x, world.spawn.y + 2, 'marker-shadow')
    this.player = this.physics.add.sprite(world.spawn.x, world.spawn.y, this.playerTexture)
    this.player.setOrigin(0.5, 0.85)
    this.player.body.setSize(12, 10)
    this.player.body.setOffset(2, 6)
    this.player.setCollideWorldBounds(true)
    this.player.play(this.playerTexture + '-idle-down')
    this.addPlayerColliders()

    this.physics.world.setBounds(0, 0, world.width, world.height)
    const padX = Math.max(0, (this.scale.width / this.zoom - world.width) / 2)
    const padY = Math.max(0, (this.scale.height / this.zoom - world.height) / 2)
    this.cameras.main.setBounds(-padX, -padY, world.width + padX * 2, world.height + padY * 2)
    this.cameras.main.setZoom(this.zoom)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys('W,A,S,D')
    this.touchVec = { x: 0, y: 0 }
    const onTouchMove = (vec) => { this.touchVec = vec }
    this.game.events.on('touchMove', onTouchMove)
    this.events.once('shutdown', () => this.game.events.off('touchMove', onTouchMove))

    this.markers = new MarkerSet(this, this.objects)
    this.markerDefList = this.markerDefs()
    this.markers.build(this.markerDefList)

    this.interaction = new InteractionSystem(this)

    this.debug = new DebugOverlay(this)

    this.worldReady()

    this.game.events.emit('sceneReady', this)

    this.network = this.registry.get('network')
    if (this.network) {
      this.network.listen({
        worldCombatEnd: payload => this.onCombatEnd(payload)
      })
      this.network.join(world.spawn, {
        onJoined: this.onWorldJoined.bind(this),
        onPlayerJoined: this.onPlayerJoined.bind(this),
        onPlayerMoved: this.onPlayerMoved.bind(this),
        onPlayerLeft: this.onPlayerLeft.bind(this),
        onEncounter: this.onEncounter.bind(this),
        onEventResolved: this.onEventResolved.bind(this),
        onRested: this.onRested.bind(this),
        onPositionCorrected: this.onPositionCorrected.bind(this),
        onVictory: this.onVictory.bind(this),
        onDefeated: this.onDefeated.bind(this)
      }, { hp: state.hp, level: state.level })
    }
  }

  addNpc ({ id, npcId, x, y, texture, facing = 'down', label, verb = 'พูดคุย', radius = 26, name }) {
    this.add.sprite(x, y + 6, 'marker-shadow').setDepth(y - 1)
    const sprite = this.add.sprite(x, y, texture).setOrigin(0.5, 0.85)
    sprite.setDepth(y)
    sprite.play(texture + '-idle-' + facing)
    this.tweens.add({ targets: sprite, y: y - 1, duration: 1100 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    const text = makeLabel(this, x, y - 17, name || label).setDepth(y + 1)
    this.objects.addNpcBlocker(x, y + 4)
    this.interaction.register({
      id,
      x,
      y: y + 2,
      radius,
      priority: 2,
      verb,
      label: label || name,
      meta: { kind: 'npc', npcId },
      onInteract: () => this.game.events.emit('localInteract', { kind: 'npc', npcId })
    })
    this.npcs.set(id, { sprite, text })
    return sprite
  }

  addLocalInteractable ({ id, x, y, radius = 26, verb, label, priority = 1, kind, data = {} }) {
    this.interaction.register({
      id,
      x,
      y,
      radius,
      priority,
      verb,
      label,
      meta: { kind },
      onInteract: () => this.game.events.emit('localInteract', { kind, ...data })
    })
  }

  registerServerInteractables (encounters) {
    const defs = new Map(this.markerDefList.map(d => [d.id, d]))
    encounters.forEach((enc) => {
      if (enc.trigger !== 'interact') { return }
      const def = defs.get(enc.id) || {}
      this.interaction.register({
        id: 'enc:' + enc.id,
        x: enc.x,
        y: enc.y,
        radius: enc.radius,
        priority: 1,
        verb: def.verb || VERB_BY_TYPE[enc.type] || 'โต้ตอบ',
        label: def.label || '',
        meta: { kind: 'encounter', encounterId: enc.id, type: enc.type },
        enabled: () => !this.markers.isDone(enc.id),
        onInteract: () => this.game.events.emit('encounterInteract', { id: enc.id, type: enc.type })
      })
    })
  }

  onWorldJoined ({ players, self, encounters, random, cleared, zoneVariant }) {
    (players || []).forEach(p => this.createOtherSprite(p))
    ;(cleared || []).forEach(id => this.markers.complete(id))
    this.zoneVariant = zoneVariant || 'normal'
    this.applyZoneVariant(this.zoneVariant)
    this.registerServerInteractables(encounters || [])
    this.game.events.emit('joined', { self, encounters, random, zone: this.zone, zoneVariant: this.zoneVariant })
    if (self) { this.game.events.emit('hpUpdate', { hp: self.hp, maxHp: self.maxHp }) }
  }

  applyZoneVariant (variant) {}

  onEncounter ({ event }) {
    this.player.setVelocity(0, 0)
    this.game.events.emit('encounter', event)
  }

  onEventResolved (payload) {
    if (payload.encounterId && !payload.keepAvailable) { this.markers.complete(payload.encounterId) }
    this.game.events.emit('encounterResolved', payload)
    this.game.events.emit('hpUpdate', { hp: payload.hp, maxHp: payload.maxHp })
  }

  onRested (payload) {
    this.markers.complete(payload.encounterId)
    this.game.events.emit('rested', payload)
    this.game.events.emit('hpUpdate', { hp: payload.hp, maxHp: payload.maxHp })
  }

  onCombatEnd (payload) {
    if (payload.result === 'victory' && payload.encounterId) { this.markers.complete(payload.encounterId) }
  }

  onVictory (payload) {
    this.player.setVelocity(0, 0)
    this.game.events.emit('victory', payload)
  }

  onPositionCorrected ({ x, y }) {
    this.player.setPosition(x, y)
    this._lastSent = null
  }

  onDefeated ({ hp, maxHp, x, y }) {
    this.player.setPosition(x, y)
    this.playerShadow.setPosition(x, y + 2)
    this._lastSent = null
    this.game.events.emit('defeated', { hp, maxHp })
    this.game.events.emit('hpUpdate', { hp, maxHp })
  }

  createOtherSprite (player) {
    const key = this.otherKey(player.classId)
    const shadow = this.add.sprite(player.x, player.y + 2, 'marker-shadow')
    const sprite = this.add.sprite(player.x, player.y, key).setOrigin(0.5, 0.85)
    sprite.play(key + '-idle-down')
    const label = makeLabel(this, player.x, player.y - 17, player.username || 'Player')
    this.otherPlayers.set(player.id, { sprite, shadow, label, key, facing: 'down', idleTimer: null })
  }

  onPlayerJoined ({ player }) {
    if (!this.otherPlayers.has(player.id)) {
      this.createOtherSprite(player)
    }
  }

  onPlayerMoved ({ playerId, x, y }) {
    const entry = this.otherPlayers.get(playerId)
    if (!entry) { return }
    entry.facing = directionFor(x - entry.sprite.x, y - entry.sprite.y, entry.facing)
    entry.sprite.setPosition(x, y)
    entry.sprite.setDepth(y)
    entry.shadow.setPosition(x, y + 2)
    entry.label.setPosition(x, y - 17)
    entry.label.setDepth(y + 1)
    entry.sprite.play(entry.key + '-run-' + entry.facing, true)
    clearTimeout(entry.idleTimer)
    entry.idleTimer = setTimeout(() => { entry.sprite.play(entry.key + '-idle-' + entry.facing) }, OTHER_IDLE_DELAY_MS)
  }

  onPlayerLeft ({ playerId }) {
    const entry = this.otherPlayers.get(playerId)
    if (!entry) { return }
    clearTimeout(entry.idleTimer)
    entry.shadow.destroy()
    entry.sprite.destroy()
    entry.label.destroy()
    this.otherPlayers.delete(playerId)
  }

  checkDiscoveries () {
    this.markerDefList.forEach((def) => {
      if (!def.discover || this.discovered.has(def.id) || this.markers.isDone(def.id)) { return }
      if (Math.hypot(this.player.x - def.x, this.player.y - def.y) > DISCOVER_RADIUS) { return }
      this.discovered.add(def.id)
      this.game.events.emit('discover', { id: def.id, text: def.discover })
      if (this.waypoint && this.waypoint.id === def.id) { this.clearWaypoint() }
    })
  }

  setWaypoint (id) {
    const entry = this.markers.entries.get(id)
    if (!entry || entry.done) { return }
    this.waypoint = { id, x: entry.def.x, y: entry.def.y }
    if (!this.waypointArrow) {
      this.waypointArrow = this.add.graphics().setDepth(999999)
      this.waypointArrow.fillStyle(0xE8B34A, 1)
      this.waypointArrow.lineStyle(1, 0x1B1425, 1)
      this.waypointArrow.beginPath()
      this.waypointArrow.moveTo(0, -8)
      this.waypointArrow.lineTo(6, 4)
      this.waypointArrow.lineTo(-6, 4)
      this.waypointArrow.closePath()
      this.waypointArrow.fillPath()
      this.waypointArrow.strokePath()
      this.waypointTween = this.tweens.add({ targets: this.waypointArrow, scale: 1.25, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
    this.waypointArrow.setVisible(true)
    this.markers.pulseAttention(id)
  }

  clearWaypoint () {
    this.waypoint = null
    if (this.waypointArrow) { this.waypointArrow.setVisible(false) }
  }

  updateWaypoint () {
    if (!this.waypoint || !this.waypointArrow) { return }
    if (Math.hypot(this.player.x - this.waypoint.x, this.player.y - this.waypoint.y) < 40) {
      this.clearWaypoint()
      return
    }
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.waypoint.x, this.waypoint.y)
    this.waypointArrow.setPosition(this.player.x, this.player.y - 28)
    this.waypointArrow.setRotation(angle + Math.PI / 2)
  }

  update (time, delta) {
    this.debug.update()
    this.worldUpdate(time, delta)

    if (this.movementLocked) {
      this.player.setVelocity(0, 0)
      if (this.wasMoving) {
        this.player.play(this.playerTexture + '-idle-' + this.facing)
        this.wasMoving = false
      }
      this.interaction.setEnabled(false)
      return
    }
    this.interaction.setEnabled(true)

    const left = this.cursors.left.isDown || this.wasd.A.isDown
    const right = this.cursors.right.isDown || this.wasd.D.isDown
    const up = this.cursors.up.isDown || this.wasd.W.isDown
    const down = this.cursors.down.isDown || this.wasd.S.isDown

    let vx = (right ? 1 : 0) - (left ? 1 : 0)
    let vy = (down ? 1 : 0) - (up ? 1 : 0)
    if (Math.abs(this.touchVec.x) > 0.25 || Math.abs(this.touchVec.y) > 0.25) {
      vx = this.touchVec.x
      vy = this.touchVec.y
    }
    const velocity = new Phaser.Math.Vector2(vx, vy)
    const moving = velocity.length() > 0
    if (moving) {
      velocity.normalize().scale(this.speed)
    }
    const facing = moving ? directionFor(vx, vy, this.facing) : this.facing
    this.player.setVelocity(velocity.x, velocity.y)
    this.playerShadow.setPosition(this.player.x, this.player.y + 2)
    this.player.setDepth(this.player.y)

    if (moving !== this.wasMoving || facing !== this.facing) {
      this.facing = facing
      this.player.play(this.playerTexture + (moving ? '-run-' : '-idle-') + facing, true)
      this.wasMoving = moving
    }

    this.interaction.update(this.player.x, this.player.y)
    this.checkDiscoveries()
    this.updateWaypoint()

    this._sendAccum += delta
    if (this.network && this._sendAccum >= MOVE_SEND_INTERVAL_MS) {
      this._sendAccum = 0
      const snapshot = { x: Math.round(this.player.x), y: Math.round(this.player.y), flipX: this.facing === 'left' }
      const last = this._lastSent
      if (!last || last.x !== snapshot.x || last.y !== snapshot.y || last.flipX !== snapshot.flipX) {
        this.network.move(snapshot.x, snapshot.y, snapshot.flipX)
        this._lastSent = snapshot
      }
    }
  }
}
