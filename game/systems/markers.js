const CREATURE_SCALE = 1.15

export default class MarkerSet {
  constructor (scene, objects) {
    this.scene = scene
    this.objects = objects
    this.entries = new Map()
  }

  build (defs) {
    defs.forEach(def => this.entries.set(def.id, this.create(def)))
  }

  create (def) {
    const entry = { def, sprites: [], done: false, stopTween: null }
    const shadow = def.shadow === false ? null : this.scene.add.sprite(def.x, def.y + 7, 'marker-shadow').setDepth(def.y - 1)
    if (shadow) { entry.sprites.push(shadow) }
    if (def.kind === 'chest') { this.buildChest(entry) } else if (def.kind === 'trap') { this.buildTrap(entry) } else if (def.kind === 'campfire') { this.buildCampfire(entry) } else if (def.kind === 'creature') { this.buildCreature(entry) } else { this.buildClue(entry) }
    return entry
  }

  buildChest (entry) {
    const { def } = entry
    entry.main = this.scene.add.image(def.x, def.y + 8, 'chest_closed').setOrigin(0.5, 1).setDepth(def.y)
    entry.sprites.push(entry.main)
    this.objects.addBlocker(def.x, def.y + 3, 12, 8, 'chest')
  }

  buildTrap (entry) {
    const { def } = entry
    entry.main = this.scene.add.sprite(def.x, def.y, 'spikes', 0).setDepth(def.y - 6)
    entry.sprites.push(entry.main)
  }

  buildCampfire (entry) {
    const { def } = entry
    entry.main = this.scene.add.image(def.x, def.y + 8, 'campfire').setOrigin(0.5, 1).setDepth(def.y)
    entry.sprites.push(entry.main)
    const tween = this.scene.tweens.add({ targets: entry.main, scaleY: 1.07, scaleX: 0.96, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    entry.stopTween = () => tween.stop()
    this.objects.addBlocker(def.x, def.y + 4, 10, 8, 'campfire')
  }

  buildCreature (entry) {
    const { def } = entry
    const origin = def.origin || [0.5, 0.5]
    entry.main = this.scene.add.sprite(def.x, def.y, def.sprite).setOrigin(origin[0], origin[1]).setDepth(def.y).setScale(def.scale || CREATURE_SCALE)
    if (def.anim) { entry.main.play(def.anim) }
    if (def.tint) { entry.main.setTint(def.tint) }
    entry.sprites.push(entry.main)
    const tween = this.scene.tweens.add({ targets: entry.main, y: def.y - 2, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    entry.stopTween = () => tween.stop()
  }

  buildClue (entry) {
    const { def } = entry
    entry.main = this.scene.add.image(def.x, def.y + 8, def.sprite).setOrigin(0.5, 1).setDepth(def.y)
    entry.sprites.push(entry.main)
    if (def.solid) { this.objects.addBlocker(def.x, def.y + 4, def.solid[0], def.solid[1], 'clue') }
    if (def.pulse !== false) {
      const tween = this.scene.tweens.add({ targets: entry.main, alpha: 0.72, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      entry.stopTween = () => { tween.stop(); entry.main.setAlpha(1) }
    }
  }

  complete (id) {
    const entry = this.entries.get(id)
    if (!entry || entry.done) { return }
    entry.done = true
    const { def, main } = entry
    if (entry.stopTween) { entry.stopTween() }
    if (def.kind === 'chest') {
      main.setTexture('chest_open')
    } else if (def.kind === 'trap') {
      main.play('spikes-fire')
      main.once('animationcomplete', () => main.setAlpha(0.55))
    } else if (def.kind === 'campfire') {
      main.setTint(0x777777)
      main.setScale(1, 0.85)
    } else if (def.kind === 'creature') {
      this.scene.tweens.add({ targets: entry.sprites, alpha: 0, duration: 500, onComplete: () => entry.sprites.forEach(s => s.destroy()) })
    } else {
      main.setTint(0xBBBBBB)
    }
  }

  isDone (id) {
    const entry = this.entries.get(id)
    return !!entry && entry.done
  }
}
