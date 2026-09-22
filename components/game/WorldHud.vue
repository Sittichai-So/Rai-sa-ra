<template>
  <div class="wh-root" :class="{ 'wh-compact': compact }">
    <HudStatus :class-id="classId" @shake="$emit('shake')" @open="openMenu" />

    <div class="wh-toolbar">
      <button type="button" class="wh-icon-btn wh-icon-exit" title="ออกจากเกม" @click="confirmExit">
        <i class="fas fa-door-open" />
      </button>
      <button type="button" class="wh-icon-btn" title="ภารกิจ (Q)" @click="openMenu('quests')">
        <i class="fas fa-scroll" />
      </button>
      <button type="button" class="wh-icon-btn" title="ตัวละครและถุงของ (I)" @click="openMenu('bag')">
        <i class="fas fa-bag-shopping" />
      </button>
      <button type="button" class="wh-icon-btn" title="บันทึกของ DM (L)" @click="openMenu('log')">
        <i class="fas fa-book-open" />
      </button>
      <input
        v-if="!sound.muted"
        type="range"
        min="0"
        max="100"
        class="wh-volume"
        :value="sound.volume"
        @input="setVolume($event.target.value)"
      >
      <button type="button" class="wh-icon-btn" title="เต็มจอ" @click="$emit('fullscreen')">
        <i class="fas fa-expand" />
      </button>
      <button type="button" class="wh-icon-btn" :title="sound.muted ? 'เปิดเสียง' : 'ปิดเสียง'" @click="toggleSound">
        <i :class="sound.muted ? 'fas fa-volume-xmark' : 'fas fa-volume-high'" />
      </button>
    </div>

    <TouchControls v-if="touchEnabled" :game="game" :blocked="blocked" />

    <HudDebug :game="game" />

    <transition name="wh-fade">
      <div v-if="ui.banner && !blocked" :key="ui.banner.id" class="wh-banner">
        <span class="wh-tag dm">DM</span>
        <span class="wh-banner-text">{{ ui.banner.text }}</span>
      </div>
    </transition>

    <transition-group name="wh-toast" tag="div" class="wh-toasts">
      <div v-for="t in ui.toasts" :key="t.id" class="wh-toast" :class="'tone-' + t.tone">
        {{ t.text }}
      </div>
    </transition-group>

    <transition name="wh-fade">
      <button v-if="ui.prompt && !blocked" :key="ui.prompt.id" type="button" class="wh-prompt" @click="pressInteract">
        <span class="wh-key">{{ ui.prompt.key }}</span>
        <span class="wh-prompt-verb">{{ ui.prompt.verb }}</span>
        <span v-if="ui.prompt.label" class="wh-prompt-label">{{ ui.prompt.label }}</span>
      </button>
    </transition>

    <HudDialogue />
    <HudDice :controller="controller" />
    <HudCombat :controller="controller" />
    <HudLoot :controller="controller" />
    <HudMenu :controller="controller" />
    <HudShop :controller="controller" />
    <HudBoard />

    <transition name="wh-fade">
      <div v-if="ui.victory && !ui.dialogue && !ui.dice && !ui.loot" class="wh-overlay">
        <div class="wh-panel wh-loot-box">
          <div class="wh-loot-title">
            <i class="fas fa-trophy" /> ภารกิจสำเร็จ!
          </div>
          <p class="wh-loot-text">
            {{ ui.victory.text }}
          </p>
          <ul class="wh-loot-list">
            <li class="wh-loot-row">
              <i class="fas fa-shield-halved wh-icon-fa" /> <span>เหตุการณ์ที่ผ่าน</span><b>{{ ui.victory.eventsResolved }} จุด</b>
            </li>
            <li class="wh-loot-row">
              <i class="fas fa-heart wh-icon-fa" /> <span>เหลือ HP</span><b>{{ ui.victory.hp }}/{{ ui.victory.maxHp }}</b>
            </li>
          </ul>
          <button type="button" class="wh-btn primary" @click="controller.travel('map')">
            <i class="fas fa-map" /> กลับแผนที่โลก
          </button>
          <button type="button" class="wh-btn" @click="ui.victory = null">
            อยู่สำรวจต่อ
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import HudStatus from '~/components/game/HudStatus.vue'
import HudDialogue from '~/components/game/HudDialogue.vue'
import HudDice from '~/components/game/HudDice.vue'
import HudCombat from '~/components/game/HudCombat.vue'
import HudLoot from '~/components/game/HudLoot.vue'
import HudMenu from '~/components/game/HudMenu.vue'
import HudShop from '~/components/game/HudShop.vue'
import HudBoard from '~/components/game/HudBoard.vue'
import HudDebug from '~/components/game/HudDebug.vue'
import TouchControls from '~/components/game/TouchControls.vue'
import { detectTouch } from '~/components/game/touch'
import { ui, isBlocking, openPanel, closePanel } from '~/game/systems/ui'
import { loadSoundSettings, saveSoundSettings, playSound, playMusic, syncMusic, stopMusic } from '~/components/game/sound'

export default {
  name: 'WorldHud',
  components: { HudStatus, HudDialogue, HudDice, HudCombat, HudLoot, HudMenu, HudShop, HudBoard, HudDebug, TouchControls },
  props: {
    controller: { type: Object, required: true },
    game: { type: Object, default: null },
    classId: { type: String, default: null },
    compact: { type: Boolean, default: false }
  },
  data () {
    return { ui, sound: loadSoundSettings(), touchEnabled: detectTouch() }
  },
  computed: {
    blocked () {
      return isBlocking()
    },
    musicTrack () {
      return ui.combat ? 'fight' : ui.zone
    }
  },
  watch: {
    musicTrack (name) {
      playMusic(name, this.sound)
    }
  },
  mounted () {
    this.onSfx = name => playSound(name, this.sound)
    this.game.events.on('sfx', this.onSfx)
    window.addEventListener('keydown', this.onKey)
    playMusic(this.musicTrack, this.sound)
  },
  beforeDestroy () {
    if (this.game && this.game.events) { this.game.events.off('sfx', this.onSfx) }
    window.removeEventListener('keydown', this.onKey)
    stopMusic()
  },
  methods: {
    async confirmExit () {
      const result = await this.$swal({
        title: 'ออกจากเกม?',
        text: 'ระบบบันทึกความคืบหน้าของคุณไว้ให้แล้ว',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ออกจากเกม',
        cancelButtonText: 'เล่นต่อ',
        confirmButtonColor: '#e8b34a',
        cancelButtonColor: '#3b2d4b'
      })
      if (result.isConfirmed) { this.controller.exitToHub() }
    },
    openMenu (tab) {
      if (ui.dialogue || ui.dice || ui.combat || ui.loot) { return }
      if (ui.panel === 'menu' && ui.panelTab === tab) {
        closePanel()
        return
      }
      openPanel('menu', tab)
    },
    pressInteract () {
      this.game.events.emit('interactPress')
    },
    toggleSound () {
      this.sound.muted = !this.sound.muted
      saveSoundSettings(this.sound)
      syncMusic(this.sound)
    },
    setVolume (value) {
      this.sound.volume = Math.max(0, Math.min(100, Number(value)))
      saveSoundSettings(this.sound)
      syncMusic(this.sound)
    },
    onKey (event) {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) { return }
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return }
      const key = event.key.toLowerCase()
      if (key === 'q') { this.openMenu('quests') } else if (key === 'i') { this.openMenu('bag') } else if (key === 'l') { this.openMenu('log') }
    }
  }
}
</script>

<style>
.wh-root {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  font-family: 'Kanit', sans-serif;
  color: #efe6d2;
  overflow: hidden;
  border-radius: 12px;
}
.wh-root button, .wh-root input, .wh-root .wh-panel, .wh-root .wh-tracker, .wh-root .wh-overlay, .wh-root .wh-dialogue { pointer-events: auto; }
.wh-root * { box-sizing: border-box; }

.wh-panel {
  position: relative;
  background: #1b1425;
  color: #efe6d2;
  box-shadow: 0 0 0 2px #0a0710, inset 0 0 0 2px #7a5a26, inset 0 0 0 4px #1b1425, 5px 5px 0 2px rgba(0, 0, 0, 0.5);
}
.wh-panel::before, .wh-panel::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #e8b34a;
  box-shadow: 0 0 0 1px #0a0710;
}
.wh-panel::before { left: -3px; top: -3px; }
.wh-panel::after { right: -3px; bottom: -3px; }

.wh-tag {
  display: inline-block;
  padding: 1px 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #241a0d;
  background: #e8b34a;
  box-shadow: 0 0 0 1px #0a0710;
}
.wh-tag.npc { background: #c98a52; }
.wh-tag.dm { background: #e8b34a; }

.wh-key {
  display: inline-block;
  min-width: 20px;
  padding: 0 5px;
  margin-right: 6px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #1b1425;
  background: #efe6d2;
  box-shadow: 0 0 0 1px #0a0710, 0 2px 0 1px #6f6450;
}

.wh-btn {
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #efe6d2;
  background: #2a2036;
  border: 0;
  padding: 8px 14px;
  cursor: pointer;
  box-shadow: 0 0 0 2px #0a0710, inset 0 0 0 2px #6d5324;
  transition: background 0.1s;
}
.wh-btn:hover:not(:disabled) { background: #3b2d4b; }
.wh-btn:active:not(:disabled) { transform: translateY(1px); }
.wh-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.wh-btn.primary { background: #e8b34a; color: #241a0d; box-shadow: 0 0 0 2px #0a0710, inset 0 0 0 2px #fbe0a0; font-weight: 600; }
.wh-btn.primary:hover:not(:disabled) { background: #f4c862; }
.wh-btn.primary .wh-key { background: #241a0d; color: #f4e2b0; }
.wh-btn.big { padding: 10px 26px; font-size: 16px; }
.wh-btn.small { padding: 4px 10px; font-size: 13px; }
.wh-btn.act { flex: 1; min-width: 0; padding: 8px 6px; }
.wh-btn small { opacity: 0.7; }

.wh-fade-enter-active, .wh-fade-leave-active { transition: opacity 0.18s; }
.wh-fade-enter, .wh-fade-leave-to { opacity: 0; }
.wh-rise-enter-active, .wh-rise-leave-active { transition: opacity 0.16s, transform 0.16s; }
.wh-rise-enter, .wh-rise-leave-to { opacity: 0; transform: translateY(10px); }

.wh-overlay {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  overflow-y: auto;
  padding: 12px;
  background: rgba(8, 5, 12, 0.72);
}
.wh-overlay > .wh-panel { margin: auto; max-height: 100%; overflow-y: auto; }

.wh-status-wrap { position: absolute; left: 10px; top: 10px; z-index: 12; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; pointer-events: none; }
.wh-status { display: flex; gap: 8px; align-items: center; padding: 8px 12px 8px 10px; min-width: 176px; }
.wh-status-icon { flex: 0 0 auto; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #e8b34a; background: #0f0a16; box-shadow: 0 0 0 1px #6d5324; }
.wh-status-face { width: 38px; height: 38px; image-rendering: pixelated; }
.wh-status-body { flex: 1; min-width: 118px; }
.wh-status-name { font-size: 13px; font-weight: 600; line-height: 1.2; }
.wh-status-name small { font-weight: 400; color: #a89b86; margin-left: 4px; }
.wh-status-line { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #a89b86; margin: 2px 0 3px; }
.wh-gold { display: inline-flex; align-items: center; gap: 4px; color: #f4d27a; font-size: 12px; font-weight: 600; }
.wh-bar { position: relative; height: 8px; background: #0f0a16; box-shadow: 0 0 0 1px #0a0710; overflow: hidden; }
.wh-bar.thin { height: 4px; }
.wh-bar-ghost { position: absolute; inset: 0; background: #ff8f8f; transition: width 0.5s ease-out; }
.wh-bar-fill { position: relative; height: 100%; background: #62c58a; transition: width 0.3s; }
.wh-bar-fill.low { background: #e0664f; }
.wh-bar-fill.exp { background: #6aa8ff; }
.wh-bar-fill.enemy { background: #d1533f; }
.wh-float-layer { position: absolute; inset: 0; pointer-events: none; }
.wh-float { position: absolute; left: 50%; top: 0; font-weight: 700; font-size: 16px; white-space: nowrap; text-shadow: 1px 1px 0 #000; }
.wh-float.good { color: #6fdba0; }
.wh-float.bad { color: #ff8f8f; }
.wh-float-enter-active { transition: all 1s ease-out; }
.wh-float-enter { opacity: 0; transform: translate(-50%, 0); }
.wh-float-enter-to { opacity: 1; }
.wh-float-leave-active { transition: all 0.3s; }
.wh-float-leave-to { opacity: 0; transform: translate(-50%, -34px); }

.wh-tracker { max-width: 220px; padding: 6px 10px; cursor: pointer; background: rgba(27, 20, 37, 0.92); box-shadow: 0 0 0 2px #0a0710, inset 0 0 0 1px #7a5a26; }
.wh-tracker-title { font-size: 12px; font-weight: 600; color: #e8b34a; }
.wh-tracker-obj { font-size: 12px; line-height: 1.4; color: #efe6d2; margin-top: 2px; }

.wh-toolbar { position: absolute; right: 10px; top: 10px; z-index: 12; display: flex; gap: 6px; align-items: center; }
.wh-icon-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #e8b34a; background: #1b1425; border: 0; cursor: pointer; box-shadow: 0 0 0 2px #0a0710, inset 0 0 0 1px #7a5a26; }
.wh-icon-btn:hover { background: #33264a; }
.wh-icon-exit { color: #ff8f8f; }
.wh-volume { width: 54px; height: 4px; accent-color: #e8b34a; cursor: pointer; }

.wh-banner { position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); z-index: 20; width: calc(100% - 24px); max-width: 560px; display: flex; gap: 10px; align-items: flex-start; padding: 8px 12px; background: rgba(27, 20, 37, 0.95); box-shadow: 0 0 0 2px #0a0710, inset 0 0 0 1px #7a5a26; pointer-events: none; }
.wh-banner-text { font-size: 13.5px; line-height: 1.55; color: #efe6d2; }

.wh-toasts { position: absolute; left: 50%; top: 52px; transform: translateX(-50%); z-index: 45; display: flex; flex-direction: column; gap: 6px; align-items: center; pointer-events: none; }
.wh-toast { padding: 5px 14px; font-size: 13px; background: #1b1425; color: #efe6d2; box-shadow: 0 0 0 2px #0a0710, inset 0 0 0 1px #7a5a26; white-space: nowrap; }
.wh-toast.tone-quest { color: #f4d27a; }
.wh-toast.tone-good { color: #6fdba0; }
.wh-toast.tone-bad { color: #ff8f8f; }
.wh-toast.tone-level { color: #9cc8ff; }
.wh-toast-enter-active, .wh-toast-leave-active { transition: all 0.25s; }
.wh-toast-enter, .wh-toast-leave-to { opacity: 0; transform: translateY(-8px); }

.wh-prompt { position: absolute; left: 50%; bottom: 84px; transform: translateX(-50%); z-index: 15; display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-family: inherit; font-size: 13px; color: #efe6d2; background: rgba(27, 20, 37, 0.95); border: 0; cursor: pointer; box-shadow: 0 0 0 2px #0a0710, inset 0 0 0 1px #e8b34a; }
.wh-prompt-verb { font-weight: 600; }
.wh-prompt-label { color: #f4d27a; }

.wh-dialogue { position: absolute; left: 10px; right: 10px; bottom: 10px; max-width: 880px; margin: 0 auto; z-index: 30; cursor: pointer; }
.wh-dialogue-box { display: flex; gap: 12px; padding: 14px 16px; min-height: 118px; }
.wh-dialogue-box.dm { background: #21182f; }
.wh-dialogue-box.npc { background: #2a1d14; }
.wh-dlg-side { flex: 0 0 auto; display: flex; align-items: flex-start; }
.wh-portrait { width: 76px; height: 76px; image-rendering: pixelated; background: #0f0a16; box-shadow: 0 0 0 1px #6d5324; }
.wh-dm-seal { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; background: #0f0a16; box-shadow: 0 0 0 1px #6d5324; }
.wh-dm-die { width: 32px; height: 32px; image-rendering: pixelated; }
.wh-dlg-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.wh-dlg-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.wh-dlg-title { font-size: 13px; font-weight: 600; color: #f4d27a; }
.wh-dlg-count { margin-left: auto; font-size: 11px; color: #8d8170; }
.wh-dlg-text { margin: 0; font-size: 14px; line-height: 1.75; min-height: 48px; white-space: pre-line; }
.wh-dialogue-box.dm .wh-dlg-text { color: #e7dcf5; }
.wh-caret { display: inline-block; width: 7px; height: 14px; margin-left: 2px; vertical-align: -2px; background: #e8b34a; animation: wh-blink 0.7s steps(2) infinite; }
@keyframes wh-blink { 50% { opacity: 0; } }
.wh-effects { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.wh-fx { padding: 1px 8px; font-size: 12.5px; font-weight: 600; background: #0f0a16; box-shadow: 0 0 0 1px #3a2f4b; }
.wh-fx.tone-good { color: #6fdba0; }
.wh-fx.tone-bad { color: #ff8f8f; }
.wh-fx.tone-gold { color: #f4d27a; }
.wh-choices { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.wh-choice { text-align: left; }
.wh-choice-key { display: inline-block; width: 18px; margin-right: 8px; color: #e8b34a; font-weight: 700; }
.wh-dlg-hint { margin-top: 8px; text-align: right; font-size: 12px; color: #8d8170; }

.wh-dice-overlay { z-index: 44; flex-direction: column; }
.wh-dice-box { width: min(380px, 100%); padding: 12px 16px; text-align: center; display: flex; flex-direction: column; gap: 6px; align-items: center; }
.wh-dice-head { display: flex; align-items: center; gap: 8px; }
.wh-dice-narration { margin: 0; font-size: 13.5px; line-height: 1.65; color: #e7dcf5; }
.wh-dice-narration.dim { color: #a89b86; font-size: 12.5px; }
.wh-check-strip { display: flex; gap: 10px; align-items: center; justify-content: center; padding: 4px 10px; background: #0f0a16; box-shadow: 0 0 0 1px #3a2f4b; font-size: 13px; }
.wh-check-name { color: #f4d27a; font-weight: 600; }
.wh-check-mod { color: #9cc8ff; }
.wh-check-dc { color: #ff9f8f; font-weight: 600; }
.wh-roll-chips { display: flex; gap: 6px; justify-content: center; }
.wh-chip { min-width: 58px; padding: 3px 8px; display: flex; flex-direction: column; align-items: center; background: #0f0a16; box-shadow: 0 0 0 1px #3a2f4b; }
.wh-chip small { font-size: 11px; color: #a89b86; line-height: 1.2; }
.wh-chip b { font-size: 16px; color: #efe6d2; line-height: 1.3; }
.wh-chip.total b { color: #f4d27a; }
.wh-result-row { display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; }
.wh-result { padding: 3px 16px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; background: #0f0a16; }
.wh-result.tier-success { color: #6fdba0; box-shadow: 0 0 0 2px #2f7a55; }
.wh-result.tier-critical_success { color: #ffe08a; box-shadow: 0 0 0 2px #b8881f; }
.wh-result.tier-failure { color: #ff8f8f; box-shadow: 0 0 0 2px #8a3a3a; }
.wh-result.tier-critical_failure { color: #ffb3b3; box-shadow: 0 0 0 2px #b03030; }
.wh-result.tier-neutral { color: #e8b34a; box-shadow: 0 0 0 2px #7a5a26; }

.wh-combat-overlay { align-items: stretch; }
.wh-combat-box { width: min(520px, 100%); margin: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
.wh-combat-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.wh-enemy { display: flex; gap: 10px; align-items: center; flex: 1; min-width: 0; }
.wh-enemy-img { width: 76px; height: 76px; object-fit: contain; image-rendering: pixelated; background: #0f0a16; box-shadow: 0 0 0 1px #6d5324; }
.wh-enemy-img.is-dead { filter: grayscale(1) brightness(0.5); }
.wh-enemy-info { flex: 1; min-width: 0; }
.wh-enemy-name { font-size: 14px; font-weight: 600; color: #f4d27a; }
.wh-enemy-stats { font-size: 11.5px; color: #a89b86; margin-top: 2px; }
.wh-round { font-size: 12px; color: #8d8170; white-space: nowrap; }
.wh-combat-intro { margin: 0; font-size: 13px; line-height: 1.6; color: #e7dcf5; }
.wh-combat-intro.dim { color: #a89b86; }
.wh-combat-log { min-height: 92px; max-height: 128px; overflow-y: auto; padding: 6px 8px; background: #0f0a16; box-shadow: 0 0 0 1px #3a2f4b; font-size: 12.5px; line-height: 1.55; }
.wh-log-line { padding: 2px 0; display: flex; flex-wrap: wrap; gap: 6px; align-items: baseline; }
.wh-log-line .who { font-weight: 700; color: #e8b34a; }
.wh-log-line.enemy .who { color: #ff9f8f; }
.wh-log-line .rollinfo { color: #7f95b8; font-size: 11.5px; }
.wh-log-line .dmg { color: #ff8f8f; font-weight: 700; }
.wh-log-line .heal { color: #6fdba0; font-weight: 700; }
.wh-combat-player { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; font-size: 12px; color: #b9ad98; }
.wh-actions { display: flex; gap: 6px; }

.wh-loot-box { width: min(360px, 100%); padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.wh-loot-head { display: flex; gap: 12px; align-items: center; }
.wh-loot-img { width: 48px; height: 48px; image-rendering: pixelated; object-fit: contain; }
.wh-loot-title { font-size: 16px; font-weight: 700; color: #f4d27a; }
.wh-loot-text { margin: 2px 0 0; font-size: 13px; line-height: 1.5; color: #d6cbb6; }
.wh-loot-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.wh-loot-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; font-size: 13.5px; background: #0f0a16; box-shadow: 0 0 0 1px #3a2f4b; }
.wh-loot-row span { flex: 1; }
.wh-loot-row b { color: #f4d27a; }
.wh-loot-row.empty { color: #8d8170; justify-content: center; }
.wh-icon { width: 20px; height: 20px; object-fit: contain; image-rendering: pixelated; }
.wh-icon.tiny { width: 14px; height: 14px; }
.wh-icon-fa { width: 20px; text-align: center; color: #e8b34a; }

.wh-menu-box, .wh-shop-box { width: min(500px, 100%); max-height: 100%; display: flex; flex-direction: column; padding: 0; }
.wh-menu-tabs { display: flex; align-items: center; gap: 4px; padding: 10px 12px 0; border-bottom: 2px solid #33284a; }
.wh-tab { font-family: inherit; font-size: 13.5px; padding: 6px 12px; color: #a89b86; background: transparent; border: 0; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; }
.wh-tab.active { color: #f4d27a; border-bottom-color: #e8b34a; }
.wh-tab:hover { color: #efe6d2; }
.wh-menu-tabs .wh-gold { margin-left: auto; margin-right: 6px; }
.wh-menu-tabs .wh-x { margin-left: auto; }
.wh-menu-tabs .wh-gold + .wh-x { margin-left: 0; }
.wh-x { width: 26px; height: 26px; font-size: 13px; color: #a89b86; background: transparent; border: 0; cursor: pointer; }
.wh-x:hover { color: #ff8f8f; }
.wh-menu-body { padding: 12px 16px 16px; overflow-y: auto; min-height: 120px; }
.wh-h { margin: 4px 0 8px; font-size: 14px; color: #e8b34a; font-weight: 600; }
.wh-empty { margin: 8px 0; font-size: 13px; color: #8d8170; text-align: center; line-height: 1.6; }
.wh-empty.left { text-align: left; }
.wh-quest { padding: 10px 12px; margin-bottom: 10px; background: #0f0a16; box-shadow: 0 0 0 1px #3a2f4b; }
.wh-quest.done { opacity: 0.7; padding: 6px 12px; }
.wh-quest-title { font-size: 14px; font-weight: 600; color: #f4d27a; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.wh-quest-status { font-size: 11px; font-weight: 500; padding: 0 6px; color: #efe6d2; background: #33284a; }
.wh-quest-status.good { color: #6fdba0; }
.wh-quest-status.bad { color: #ff8f8f; }
.wh-quest-desc { margin: 4px 0 6px; font-size: 12.5px; line-height: 1.55; color: #c9bea9; }
.wh-objectives { list-style: none; margin: 0 0 6px; padding: 0; font-size: 13px; line-height: 1.7; }
.wh-objectives li.done { color: #6fdba0; text-decoration: line-through; text-decoration-color: rgba(111, 219, 160, 0.4); }
.wh-objectives i { width: 16px; }
.wh-hint { font-size: 12.5px; color: #9cc8ff; line-height: 1.5; margin-bottom: 4px; }
.wh-quest-reward { font-size: 12px; color: #a89b86; margin-bottom: 4px; }
.wh-sheet { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px; }
.wh-sheet-row { display: flex; justify-content: space-between; gap: 6px; padding: 4px 8px; font-size: 12.5px; background: #0f0a16; box-shadow: 0 0 0 1px #3a2f4b; color: #a89b86; }
.wh-sheet-row b { color: #efe6d2; }
.wh-items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.wh-item { display: flex; align-items: center; gap: 10px; padding: 6px 10px; background: #0f0a16; box-shadow: 0 0 0 1px #3a2f4b; }
.wh-item .wh-icon { width: 26px; height: 26px; flex: 0 0 auto; }
.wh-item-main { flex: 1; min-width: 0; }
.wh-item-name { font-size: 13.5px; font-weight: 500; }
.wh-item-name small { color: #a89b86; margin-left: 4px; }
.wh-item-desc { font-size: 12px; color: #a89b86; line-height: 1.4; }
.wh-equipped { margin-left: 8px; padding: 0 6px; font-size: 11px; color: #6fdba0; background: #14261e; }
.wh-check { display: block; margin-bottom: 8px; font-size: 12.5px; color: #a89b86; cursor: pointer; }
.wh-log-list { display: flex; flex-direction: column; gap: 6px; max-height: 320px; overflow-y: auto; }
.wh-log-entry { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; line-height: 1.6; }
.wh-log-entry .wh-tag { flex: 0 0 auto; margin-top: 3px; }
.wh-log-entry.dm .wh-log-text { color: #e7dcf5; }
.wh-log-text { flex: 1; }

.wh-debug { position: absolute; left: 10px; top: 84px; z-index: 50; width: 250px; max-height: calc(100% - 100px); overflow-y: auto; overflow-x: hidden; padding: 8px 10px; font-family: monospace; font-size: 11px; background: rgba(12, 8, 18, 0.92); }
.wh-menu-body, .wh-log-list, .wh-combat-log, .wh-debug { scrollbar-width: thin; scrollbar-color: #7a5a26 #0f0a16; }
.wh-menu-body::-webkit-scrollbar, .wh-log-list::-webkit-scrollbar, .wh-combat-log::-webkit-scrollbar, .wh-debug::-webkit-scrollbar { width: 8px; height: 8px; }
.wh-menu-body::-webkit-scrollbar-track, .wh-log-list::-webkit-scrollbar-track, .wh-combat-log::-webkit-scrollbar-track, .wh-debug::-webkit-scrollbar-track { background: #0f0a16; }
.wh-menu-body::-webkit-scrollbar-thumb, .wh-log-list::-webkit-scrollbar-thumb, .wh-combat-log::-webkit-scrollbar-thumb, .wh-debug::-webkit-scrollbar-thumb { background: #7a5a26; border: 1px solid #0f0a16; }
.wh-debug-head { display: flex; justify-content: space-between; color: #e8b34a; margin-bottom: 4px; }
.wh-debug-row { display: flex; justify-content: space-between; gap: 6px; color: #a89b86; }
.wh-debug-row b { color: #efe6d2; font-weight: 400; text-align: right; word-break: break-all; }
.wh-debug-title { margin-top: 6px; color: #e8b34a; }
.wh-debug-flags { color: #efe6d2; word-break: break-all; }
.wh-debug-actions { display: flex; gap: 6px; margin-top: 8px; }

.wh-compact .wh-dialogue-box { min-height: 84px; padding: 9px 12px; gap: 9px; }
.wh-compact .wh-dlg-text { font-size: 13px; line-height: 1.55; min-height: 36px; }
.wh-compact .wh-portrait { width: 57px; height: 57px; }
.wh-compact .wh-dm-seal { width: 36px; height: 36px; }
.wh-compact .wh-dlg-head { margin-bottom: 3px; }
.wh-compact .wh-choices { margin-top: 6px; gap: 4px; }
.wh-compact .wh-btn { padding: 6px 10px; font-size: 13px; }
.wh-compact .wh-dice-box { padding: 8px 12px; gap: 3px; }
.wh-compact .wh-dice-narration { font-size: 12.5px; line-height: 1.5; }
.wh-compact .wh-dice-narration.dim { display: none; }
.wh-compact .dice-stage { transform: scale(0.72); margin: -20px auto; }
.wh-compact .wh-combat-box { padding: 8px 12px; gap: 4px; }
.wh-compact .wh-combat-log { min-height: 54px; max-height: 72px; }
.wh-compact .wh-combat-intro.dim { display: none; }
.wh-compact .wh-enemy-img { width: 57px; height: 57px; }
.wh-compact .wh-menu-body { padding: 8px 12px 12px; }
.wh-compact .wh-status { padding: 5px 9px; }
.wh-compact .wh-tracker { display: none; }

@media (max-width: 560px) {
  .wh-dlg-text { font-size: 13.5px; }
  .wh-portrait { width: 57px; height: 57px; }
  .wh-sheet { grid-template-columns: repeat(2, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  .wh-caret { animation: none; }
  .wh-float-enter-active, .wh-float-leave-active { transition: opacity 0.2s; }
  .wh-float-enter, .wh-float-leave-to { transform: none; }
}
</style>
