// eslint-disable-next-line import/default
import Phaser from 'phaser'

export default class DebugOverlay {
  constructor (scene) {
    this.scene = scene
    this.enabled = false
    this.gfx = scene.add.graphics().setDepth(100000).setVisible(false)
    this.key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F3, false)
    this.onKey = () => this.toggle()
    this.key.on('down', this.onKey)
    this.onExternal = on => this.set(on)
    scene.game.events.on('debugSet', this.onExternal)
  }

  toggle () {
    this.set(!this.enabled)
  }

  set (on) {
    this.enabled = !!on
    this.gfx.setVisible(this.enabled)
    if (!this.enabled) { this.gfx.clear() }
    this.scene.game.events.emit('debugState', this.enabled)
  }

  update () {
    if (!this.enabled) { return }
    const { scene, gfx } = this
    gfx.clear()

    scene.objects.debugBoxes().forEach((box) => {
      gfx.lineStyle(1, box.color, 0.95)
      gfx.fillStyle(box.color, 0.18)
      gfx.fillRect(box.x, box.y, box.w, box.h)
      gfx.strokeRect(box.x, box.y, box.w, box.h)
    })

    if (scene.debugTiles) {
      gfx.lineStyle(1, 0xFF5A5A, 0.9)
      gfx.fillStyle(0xFF5A5A, 0.16)
      scene.debugTiles().forEach((tile) => {
        gfx.fillRect(tile.x, tile.y, tile.w, tile.h)
        gfx.strokeRect(tile.x, tile.y, tile.w, tile.h)
      })
    }

    scene.interaction.debugItems().forEach((item) => {
      gfx.lineStyle(1, item.active ? 0xFFF07A : 0x62E0A0, 0.9)
      gfx.strokeCircle(item.x, item.y, item.r)
    })

    scene.markerDefList.forEach((def) => {
      gfx.lineStyle(1, 0x62A8FF, 0.8)
      gfx.strokeCircle(def.x, def.y, 3)
    })

    const body = scene.player.body
    gfx.lineStyle(1, 0xFFFFFF, 0.95)
    gfx.strokeRect(body.x, body.y, body.width, body.height)
  }
}
