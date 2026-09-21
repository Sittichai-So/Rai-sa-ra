// eslint-disable-next-line import/default
import Phaser from 'phaser'

const PRIORITY_WEIGHT = 6

export default class InteractionSystem {
  constructor (scene) {
    this.scene = scene
    this.items = new Map()
    this.current = null
    this.enabled = true
    this.key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E, false)
    this.onPress = () => this.interact()
    this.key.on('down', this.onPress)
    this.onExternalPress = () => this.interact()
    scene.game.events.on('interactPress', this.onExternalPress)
    scene.events.once('shutdown', () => this.destroy())
  }

  register (def) {
    this.items.set(def.id, {
      radius: 26,
      priority: 0,
      verb: 'พูดคุย',
      enabled: () => true,
      ...def
    })
  }

  unregister (id) {
    this.items.delete(id)
    if (this.current && this.current.id === id) { this.setCurrent(null) }
  }

  setEnabled (on) {
    this.enabled = on
    if (!on) { this.setCurrent(null) }
  }

  pick (px, py) {
    let best = null
    let bestScore = Infinity
    this.items.forEach((item) => {
      if (!item.enabled()) { return }
      const dist = Math.hypot(px - item.x, py - item.y)
      if (dist > item.radius) { return }
      const score = dist - item.priority * PRIORITY_WEIGHT
      if (score < bestScore) {
        best = item
        bestScore = score
      }
    })
    return best
  }

  update (px, py) {
    if (!this.enabled) { return }
    this.setCurrent(this.pick(px, py))
  }

  setCurrent (item) {
    const prev = this.current ? this.current.id : null
    const next = item ? item.id : null
    if (prev === next) { return }
    this.current = item
    this.scene.game.events.emit('interactPrompt', item ? { id: item.id, key: 'E', verb: item.verb, label: item.label || '' } : null)
  }

  interact () {
    if (!this.enabled || !this.current) { return false }
    const item = this.current
    this.scene.game.events.emit('interact', { id: item.id, meta: item.meta || null })
    if (item.onInteract) { item.onInteract(item) }
    return true
  }

  debugItems () {
    return [...this.items.values()].map(i => ({ x: i.x, y: i.y, r: i.radius, active: !!this.current && this.current.id === i.id }))
  }

  destroy () {
    this.key.off('down', this.onPress)
    this.scene.game.events.off('interactPress', this.onExternalPress)
    this.items.clear()
    this.current = null
  }
}
