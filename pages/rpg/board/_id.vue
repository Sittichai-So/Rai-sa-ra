<template>
  <div class="rpg-page">
    <div class="rpg-bg" />

    <transition name="fade">
      <div v-if="!joined && !fatalError && !reconnecting" class="rpg-overlay">
        <div class="rpg-overlay-box">
          <i class="fas fa-dice-d20 spin-icon" />
          <p>กำลังเข้าปาร์ตี้...</p>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="reconnecting" class="rpg-overlay">
        <div class="rpg-overlay-box">
          <i class="fas fa-wifi" />
          <p>การเชื่อมต่อหลุด — กำลังเชื่อมต่อใหม่...</p>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="fatalError" class="rpg-overlay">
        <div class="rpg-overlay-box">
          <i class="fas fa-triangle-exclamation" />
          <p>{{ fatalError }}</p>
          <button class="rpg-btn ghost" @click="$router.push('/rpg/board')">
            <i class="fas fa-door-open" /> กลับไปที่ล็อบบี้
          </button>
        </div>
      </div>
    </transition>

    <template v-if="joined && !fatalError">
      <div v-if="inLobby" class="rpg-screen">
        <header class="rpg-top">
          <button class="rpg-back" @click="leaveGame">
            <i class="fas fa-door-open" />
          </button>
          <h1>ห้องรอ — {{ roomId }}</h1>
          <button v-if="thaiVoice" class="rpg-back" :title="voiceEnabled ? 'ปิดเสียงพูด' : 'เปิดเสียงพูด'" @click="toggleVoice">
            <i :class="voiceEnabled ? 'fas fa-comment-dots' : 'fas fa-comment-slash'" />
          </button>
          <button class="rpg-back" :title="soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'" @click="toggleSound">
            <i :class="soundMuted ? 'fas fa-volume-xmark' : 'fas fa-volume-high'" />
          </button>
        </header>

        <div class="lobby-banner">
          <img src="~/assets/images/rpg/village-gate.png" class="lobby-banner-img" alt="">
          <div class="lobby-banner-caption">
            ปาร์ตี้รวมตัวกันที่ประตูหมู่บ้าน ก่อนออกเดินทางเข้าสู่ป่าต้องคำสาป
          </div>
        </div>

        <div class="rpg-lobby-body">
          <div class="class-pick">
            <h2>เลือกคลาสตัวละคร</h2>
            <div class="class-grid">
              <button
                v-for="c in rpgClasses"
                :key="c.id"
                type="button"
                class="class-card"
                :class="{ active: myClassId === c.id }"
                @click="pickClass(c.id)"
              >
                <span class="class-portrait">
                  <img :src="classSpriteFor(c.id)" alt="">
                </span>
                <i :class="'fas ' + c.icon" />
                <span class="class-name">{{ c.name }}</span>
                <span class="class-desc">{{ c.desc }}</span>
              </button>
            </div>
          </div>

          <div class="lobby-roster">
            <h2>ปาร์ตี้ ({{ lobbyPlayers.length }}/6)</h2>
            <div class="roster-list">
              <div v-for="p in lobbyPlayers" :key="p.id" class="roster-row">
                <span class="roster-name">
                  {{ p.username }}
                  <span v-if="String(p.userId) === String(lobbyHostId)" class="roster-host">หัวปาร์ตี้</span>
                </span>
                <span class="roster-class">{{ p.classId ? classNameOf(p.classId) : 'ยังไม่เลือก' }}</span>
                <span class="roster-ready" :class="{ on: p.ready }">
                  <i :class="p.ready ? 'fas fa-check' : 'fas fa-hourglass-half'" />
                  {{ p.ready ? 'พร้อม' : 'รอ...' }}
                </span>
              </div>
            </div>

            <p class="lobby-hint">
              {{ lobbyHintText }}
            </p>
            <p v-if="transientError" class="lobby-error">
              {{ transientError }}
            </p>

            <div class="lobby-actions">
              <button
                type="button"
                class="rpg-btn ready-btn"
                :class="{ on: myLobbyReady }"
                :disabled="!myClassId"
                @click="toggleReady"
              >
                <i :class="myLobbyReady ? 'fas fa-times' : 'fas fa-check'" />
                {{ myLobbyReady ? 'ยกเลิกพร้อม' : 'พร้อมแล้ว' }}
              </button>
              <button
                v-if="isLobbyHost"
                type="button"
                class="rpg-btn start-btn"
                :disabled="!allLobbyReady"
                @click="startGame"
              >
                <i class="fas fa-dice-d20" /> ออกเดินทาง
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="rpg-screen">
        <header class="rpg-top">
          <button class="rpg-back" @click="leaveGame">
            <i class="fas fa-door-open" />
          </button>
          <h1>{{ roomId }}</h1>
          <div class="turn-indicator" :class="{ mine: isMyTurn }">
            <i class="fas fa-dice-d20" />
            {{ isMyTurn ? 'ตาของคุณ!' : ('รอตาของ ' + currentTurnName) }}
          </div>
          <button v-if="thaiVoice" class="rpg-back" :title="voiceEnabled ? 'ปิดเสียงพูด' : 'เปิดเสียงพูด'" @click="toggleVoice">
            <i :class="voiceEnabled ? 'fas fa-comment-dots' : 'fas fa-comment-slash'" />
          </button>
          <button class="rpg-back" :title="soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'" @click="toggleSound">
            <i :class="soundMuted ? 'fas fa-volume-xmark' : 'fas fa-volume-high'" />
          </button>
        </header>

        <div class="quest-tracker">
          <div class="quest-title">
            <i class="fas fa-scroll" /> ภารกิจ: ปราบมังกรเฒ่าไฟกาฬ
          </div>
          <div class="quest-steps">
            <span v-for="(step, i) in questSteps" :key="i" class="quest-step" :class="{ done: step.done }">
              <i :class="step.done ? 'fas fa-circle-check' : 'fas fa-circle'" /> {{ step.label }}
            </span>
          </div>
        </div>

        <transition name="fade">
          <div v-if="zoneBanner" class="zone-banner">
            <span class="zone-banner-name">{{ zoneBanner.name }}</span>
            <span class="zone-banner-desc">{{ zoneBanner.desc }}</span>
          </div>
        </transition>

        <div class="rpg-board-wrap">
          <div class="rpg-board-map">
            <img src="~/assets/images/rpg/board-map.png" class="rpg-board-img" alt="">
            <div
              v-for="tile in board"
              :key="tile.id"
              class="map-marker"
              :style="markerStyle(tile.id)"
            >
              <div class="marker-badge" :class="{ 'has-me': tile.id === myTile }">
                <span class="marker-idx">{{ tile.id }}</span>
                <i :class="'fas ' + tileIcon(tile)" />
              </div>
            </div>
            <div
              v-for="nt in npcTiles"
              :key="'npc-' + nt.id"
              class="monster-figure"
              :class="'tier-' + (nt.monsterTier || 'neutral')"
              :style="markerStyle(nt.id)"
            >
              <span class="monster-ring" />
              <img :src="monsterSpriteFor(nt.monsterTier)" class="monster-sprite" alt="">
              <span class="monster-chip"><i :class="'fas ' + nt.icon" /></span>
            </div>
            <div
              v-for="p in players"
              :key="p.id"
              class="char-figure"
              :class="{ dead: !p.alive, mine: p.id === myId }"
              :style="charMarkerStyle(p)"
              :title="p.username"
            >
              <span v-if="p.id === myId" class="mine-label">คุณ</span>
              <span v-if="p.alive" class="char-hp-bar"><span class="char-hp-fill" :style="{ width: hpPct(p) + '%' }" /></span>
              <span class="char-ring" />
              <img :src="classSpriteFor(p.classId)" class="char-sprite" alt="">
              <span class="char-class-chip"><i :class="'fas ' + classIconOf(p.classId)" /></span>
              <i v-if="!p.alive" class="fas fa-skull char-dead-icon" />
            </div>
          </div>
        </div>

        <div class="rpg-party-panel">
          <div
            v-for="p in players"
            :key="p.id"
            class="party-card"
            :class="{ dead: !p.alive, active: p.id === turn.currentPlayerId, mine: p.id === myId }"
          >
            <span class="party-icon"><i :class="'fas ' + classIconOf(p.classId)" /></span>
            <span class="party-name">{{ p.username }}<span v-if="p.id === myId" class="party-me-tag">คุณ</span></span>
            <div class="party-hp-bar">
              <div class="party-hp-fill" :style="{ width: hpPct(p) + '%' }" />
            </div>
            <span class="party-hp-num">{{ p.hp }}/{{ p.maxHp }}</span>
          </div>
        </div>

        <div v-if="myPlayer" class="my-char-card">
          <div class="mc-portrait" :class="{ dead: !myPlayer.alive }">
            <i :class="'fas ' + classIconOf(myPlayer.classId)" />
          </div>
          <div class="mc-body">
            <div class="mc-name-row">
              <span class="mc-name">{{ myPlayer.username }}</span>
              <span class="mc-class">{{ classNameOf(myPlayer.classId) }}</span>
            </div>
            <div class="mc-hp-row">
              <div class="mc-hp-bar">
                <div class="mc-hp-fill" :style="{ width: hpPct(myPlayer) + '%' }" />
              </div>
              <span class="mc-hp-num">{{ myPlayer.hp }}/{{ myPlayer.maxHp }}</span>
            </div>
            <div class="mc-stats">
              <span title="พลังโจมตี"><i class="fas fa-hand-fist" /> {{ (myPlayer.stats && myPlayer.stats.str) || 0 }}</span>
              <span title="ความว่องไว"><i class="fas fa-feather" /> {{ (myPlayer.stats && myPlayer.stats.agi) || 0 }}</span>
              <span title="สติปัญญา"><i class="fas fa-brain" /> {{ (myPlayer.stats && myPlayer.stats.int) || 0 }}</span>
            </div>
          </div>
          <div class="mc-inventory">
            <span v-if="!myPlayer.inventory || !myPlayer.inventory.length" class="mc-item-empty">ยังไม่มีไอเทม</span>
            <span v-for="(item, i) in myPlayer.inventory" :key="i" class="mc-item" :title="item">
              <i class="fas fa-gem" />
            </span>
          </div>
        </div>

        <div class="rpg-action-bar">
          <div class="dice-3d-scene">
            <div class="dice-3d-cube" :style="diceCubeStyle">
              <div v-for="n in 6" :key="n" class="dice-3d-face" :class="'df-' + n">
                <span v-for="(pos, i) in DICE_PIPS[n]" :key="i" class="pip" :style="{ gridRow: pos[0], gridColumn: pos[1] }" />
              </div>
            </div>
          </div>
          <button class="dice-btn" :disabled="!isMyTurn || !!pendingEvent || !!pendingFork" @click="rollDice">
            <i :class="onBossTile ? 'fas fa-dragon' : 'fas fa-dice-d20'" /> {{ onBossTile ? 'ท้าทายมังกร' : 'ทอยเต๋า' }}
          </button>
          <div v-if="lastRoll" class="last-roll">
            ทอยล่าสุด: {{ lastRoll.roll }}
          </div>
        </div>

        <div class="rpg-log">
          <div v-for="(l, i) in reversedLog" :key="i" class="log-line">
            {{ l }}
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="showPrologue" class="rpg-overlay">
          <div class="rpg-overlay-box prologue-box">
            <div class="go-tag">
              บทนำ
            </div>
            <h2>ตำนานนักผจญภัย</h2>
            <p v-for="(line, i) in prologueLines" :key="i" class="prologue-line">
              {{ line }}
            </p>
            <button class="rpg-btn start-btn prologue-btn" @click="dismissPrologue">
              <i class="fas fa-dice-d20" /> เริ่มการผจญภัย
            </button>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="pendingEvent" class="rpg-overlay">
          <div class="rpg-overlay-box event-box">
            <template v-if="!eventOutcome">
              <div v-if="pendingEvent.npc" class="event-npc">
                <i :class="'fas ' + pendingEvent.npc.icon" />
                <span>{{ pendingEvent.npc.name }}</span>
              </div>
              <div class="event-title">
                {{ pendingEvent.title }}
              </div>
              <p class="event-text">
                {{ pendingEvent.text }}
              </p>
              <div class="event-choices">
                <button
                  v-for="c in pendingEvent.choices"
                  :key="c.id"
                  type="button"
                  class="rpg-btn choice-btn"
                  :disabled="eventBusy"
                  @click="chooseEvent(c.id)"
                >
                  {{ c.label }}
                </button>
              </div>
            </template>
            <template v-else>
              <div class="outcome-tag" :class="eventOutcome.check.roll !== null ? (eventOutcome.check.success ? 'success' : 'fail') : 'neutral'">
                <i :class="eventOutcome.check.roll === null ? 'fas fa-scroll' : (eventOutcome.check.success ? 'fas fa-check-circle' : 'fas fa-times-circle')" />
                {{ eventOutcome.check.roll === null ? 'ผลลัพธ์' : (eventOutcome.check.success ? 'สำเร็จ!' : 'ล้มเหลว') }}
              </div>
              <div v-if="eventOutcome.check.roll !== null" class="outcome-roll">
                ทอย d20 ได้ {{ eventOutcome.check.roll }} + {{ statLabel(eventOutcome.check.stat) }} = {{ eventOutcome.check.total }} (ต้องการ {{ eventOutcome.check.dc }} ขึ้นไป)
              </div>
              <p class="event-text">
                {{ eventOutcome.outcomeText }}
              </p>
              <div v-if="hasOutcomeEffects" class="outcome-effects">
                <span v-if="eventOutcome.effects.hpDelta" :class="eventOutcome.effects.hpDelta > 0 ? 'eff-good' : 'eff-bad'">
                  <i class="fas fa-heart" /> {{ eventOutcome.effects.hpDelta > 0 ? '+' : '' }}{{ eventOutcome.effects.hpDelta }} HP
                </span>
                <span v-if="eventOutcome.effects.moveDelta" class="eff-good">
                  <i class="fas fa-shoe-prints" /> เดินหน้าเพิ่ม {{ eventOutcome.effects.moveDelta }} ช่อง
                </span>
                <span v-if="eventOutcome.effects.itemGained" class="eff-good">
                  <i class="fas fa-gem" /> ได้รับ {{ eventOutcome.effects.itemGained }}
                </span>
                <span v-if="eventOutcome.effects.statBonus" class="eff-good">
                  <i class="fas fa-arrow-up" /> {{ statBonusText(eventOutcome.effects.statBonus) }}
                </span>
              </div>
              <button type="button" class="rpg-btn start-btn" @click="closeOutcome">
                <i class="fas fa-arrow-right" /> ดำเนินเรื่องต่อ
              </button>
            </template>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="pendingFork" class="rpg-overlay">
          <div class="rpg-overlay-box event-box">
            <div class="event-npc">
              <i class="fas fa-route" />
              <span>ทางแยก</span>
            </div>
            <div class="event-title">
              เลือกเส้นทาง
            </div>
            <p class="event-text">
              เส้นทางแยกออกเป็นสองสาย จะไปทางไหนดี?
            </p>
            <div class="event-choices">
              <button
                v-for="opt in pendingFork.options"
                :key="opt.toNodeId"
                type="button"
                class="rpg-btn choice-btn"
                :disabled="forkBusy"
                @click="chooseFork(opt.toNodeId)"
              >
                <i class="fas fa-route" /> {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="gameOver" class="rpg-overlay">
          <div class="rpg-overlay-box gameover-box">
            <div class="go-tag">
              {{ outcome === 'victory' ? 'ชนะภารกิจ!' : 'ปาร์ตี้ล้มทั้งหมด' }}
            </div>
            <h2>{{ outcome === 'victory' ? 'พิชิตถ้ำมังกรสำเร็จ' : 'ผจญภัยจบลง...' }}</h2>
            <div class="summary-list">
              <div v-for="s in summary" :key="s.playerId" class="summary-row">
                <div class="summary-top">
                  <span>{{ s.username }}</span>
                  <span>เดิน {{ s.tilesTraveled }} ช่อง</span>
                  <span>{{ s.eventsResolved }} เหตุการณ์</span>
                </div>
                <div v-if="s.inventory && s.inventory.length" class="summary-items">
                  <i class="fas fa-gem" /> {{ s.inventory.join(', ') }}
                </div>
              </div>
            </div>
            <div class="go-actions">
              <button class="rpg-btn start-btn" @click="restart">
                <i class="fas fa-redo" /> ผจญภัยใหม่
              </button>
              <button class="rpg-btn ghost" @click="leaveGame">
                <i class="fas fa-door-open" /> ออกจากห้อง
              </button>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script>
import { RPG_CLASSES, rpgClassById } from '~/utils/rpgClasses'
import { waypointFor } from '~/utils/rpgBoardMap'
import { zoneInfoFor, ZONE_INFO } from '~/utils/rpgZones'
import heroWarrior from '~/assets/images/rpg/hero-warrior.png'
import heroRogue from '~/assets/images/rpg/hero-rogue.png'
import heroMage from '~/assets/images/rpg/hero-mage.png'
import heroCleric from '~/assets/images/rpg/hero-cleric.png'
import heroMonster from '~/assets/images/rpg/hero-monster.png'
import monsterGoblin from '~/assets/images/rpg/monster-goblin.png'
import monsterOgre from '~/assets/images/rpg/monster-ogre.png'
import monsterSkeleton from '~/assets/images/rpg/monster-skeleton.png'
import monsterBoss from '~/assets/images/rpg/monster-boss.png'
import monsterNeutral from '~/assets/images/rpg/monster-neutral.png'
import diceSfx from '~/assets/sounds/rpg/dice.mp3'
import eventSfx from '~/assets/sounds/rpg/event.mp3'
import clickSfx from '~/assets/sounds/rpg/click.mp3'
import treasureSfx from '~/assets/sounds/rpg/treasure.mp3'
import damageSfx from '~/assets/sounds/rpg/damage.mp3'
import victorySfx from '~/assets/sounds/rpg/victory.mp3'
import defeatSfx from '~/assets/sounds/rpg/defeat.mp3'

const AMBIENT_LINES = [
  'ทางเดินเงียบสงบ ได้ยินแค่เสียงลมพัด',
  'ไม่มีอะไรผิดปกติ เดินหน้าต่อไปอย่างระมัดระวัง',
  'กลิ่นดินชื้นโชยมาตามทาง บรรยากาศเริ่มเย็นลง',
  'ร่องรอยเก่าบนพื้นบอกว่ามีคนเคยผ่านมาทางนี้',
  'เสียงนกร้องแว่วมาจากที่ไกลๆ'
]

const SOUND_FILES = {
  dice: diceSfx,
  event: eventSfx,
  click: clickSfx,
  treasure: treasureSfx,
  damage: damageSfx,
  victory: victorySfx,
  defeat: defeatSfx
}

const CLASS_SPRITES = {
  warrior: heroWarrior,
  rogue: heroRogue,
  mage: heroMage,
  cleric: heroCleric
}

const DICE_PIPS = {
  1: [[2, 2]],
  2: [[1, 3], [3, 1]],
  3: [[1, 3], [2, 2], [3, 1]],
  4: [[1, 1], [1, 3], [3, 1], [3, 3]],
  5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
  6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
}

const DICE_FACE_TARGET = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: 0, y: 180 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 }
}

export default {
  name: 'RpgRoom',
  middleware: ['middlewareAuth', 'legacyBoard'],
  data () {
    return {
      roomId: this.$route.params.id,
      monsterFigureSrc: heroMonster,
      monsterTierSprites: { small: monsterGoblin, large: monsterOgre, ghost: monsterSkeleton, boss: monsterBoss, neutral: monsterNeutral },
      DICE_PIPS,
      diceRotX: 0,
      diceRotY: 0,
      user: null,
      myId: null,
      joined: false,
      fatalError: '',
      reconnecting: false,

      board: [],
      players: [],
      turn: { order: [], currentIndex: 0, currentPlayerId: null },

      inLobby: false,
      lobbyPlayers: [],
      lobbyHostId: null,
      myClassId: null,

      showPrologue: false,
      zoneBanner: null,
      prologueLines: [
        'เสียงระฆังจากหอคอยกลางเมืองดังกึกก้องไปทั่วราชอาณาจักร มังกรเฒ่าตื่นจากการหลับใหลนับร้อยปี และเริ่มโฉบเฉี่ยวเผาหมู่บ้านรอบเทือกเขา',
        'ผู้เฒ่าประจำหมู่บ้านส่งสาส์นเรียกนักผจญภัยทั่วแคว้นให้มารวมตัวกัน ปาร์ตี้ของคุณคือกลุ่มสุดท้ายที่อาสาเดินทางเข้าไปในป่าต้องคำสาป ผ่านหุบเขาร้าง ข้ามสะพานเก่าแก่ ไปจนถึงถ้ำลึกที่มังกรเฒ่าอาศัยอยู่',
        'ไม่มีใครรู้ว่าจะได้กลับมาหรือไม่ แต่ทุกย่างก้าวจากนี้ ชะตากรรมของอาณาจักรอยู่ในมือของพวกคุณ...'
      ],

      transientError: '',
      lastRoll: null,
      pendingEvent: null,
      eventOutcome: null,
      eventBusy: false,
      pendingFork: null,
      forkBusy: false,
      logEntries: [],

      gameOver: false,
      outcome: null,
      summary: [],

      soundMuted: false,
      voiceEnabled: false,
      thaiVoice: null
    }
  },
  computed: {
    rpgClasses () {
      return RPG_CLASSES
    },
    myPlayer () {
      return this.players.find(p => p.id === this.myId) || null
    },
    myTile () {
      return this.myPlayer ? this.myPlayer.tile : -1
    },
    onBossTile () {
      const p = this.myPlayer
      if (!p) { return false }
      const t = this.board.find(x => x.id === p.tile)
      return !!(t && t.type === 'boss')
    },
    questSteps () {
      const order = ['forest', 'valley', 'dragongate']
      const myTileData = this.myPlayer ? this.board.find(t => t.id === this.myPlayer.tile) : null
      const myIdx = myTileData ? order.indexOf(myTileData.zone) : 0
      const victory = this.gameOver && this.outcome === 'victory'
      return [
        { label: 'ผ่าน' + ZONE_INFO.forest.name, done: victory || myIdx > 0 },
        { label: 'ผ่าน' + ZONE_INFO.valley.name, done: victory || myIdx > 1 },
        { label: 'ปราบมังกรเฒ่าไฟกาฬ', done: victory }
      ]
    },
    isMyTurn () {
      return this.turn.currentPlayerId === this.myId
    },
    currentTurnName () {
      return this.nameFor(this.turn.currentPlayerId)
    },
    myLobbyReady () {
      const me = this.lobbyPlayers.find(p => p.id === this.myId)
      return !!(me && me.ready)
    },
    isLobbyHost () {
      return !!(this.user && this.lobbyHostId && String(this.lobbyHostId) === String(this.user._id))
    },
    allLobbyReady () {
      return this.lobbyPlayers.length > 0 && this.lobbyPlayers.every(p => p.ready)
    },
    lobbyHintText () {
      if (this.isLobbyHost) {
        return this.allLobbyReady ? 'ทุกคนพร้อมแล้ว กดออกเดินทางได้เลย' : 'รอทุกคนเลือกคลาสและกดพร้อม'
      }
      return 'รอหัวปาร์ตี้กดออกเดินทาง'
    },
    reversedLog () {
      return this.logEntries.slice().reverse()
    },
    hasOutcomeEffects () {
      const e = this.eventOutcome && this.eventOutcome.effects
      return !!(e && (e.hpDelta || e.moveDelta || e.itemGained || e.statBonus))
    },
    npcTiles () {
      return this.board.filter(t => t.hasNpc)
    },
    diceCubeStyle () {
      return { transform: 'rotateX(' + this.diceRotX + 'deg) rotateY(' + this.diceRotY + 'deg)' }
    }
  },
  mounted () {
    const stored = localStorage.getItem('userData')
    this.user = stored ? JSON.parse(stored) : { username: 'Guest', fullname: 'Guest' }
    try { this.soundMuted = localStorage.getItem('rpgSoundMuted') === '1' } catch (e) {}
    try { this.voiceEnabled = localStorage.getItem('rpgVoiceEnabled') === '1' } catch (e) {}
    this.loadThaiVoice()
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = this.loadThaiVoice
    }

    this.setupSocketListeners()
    this.joinRoom()
    this._joinRetry = setInterval(() => {
      if (!this.joined) { this.joinRoom() }
    }, 3500)
  },
  beforeDestroy () {
    this.$socket.emit('rpgLeave')
    this._offAll()
    clearInterval(this._joinRetry)
    clearTimeout(this._transientT)
    clearTimeout(this._zoneBannerT)
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  },
  methods: {
    joinRoom () {
      this.$socket.emit('rpgJoin', { roomId: this.roomId, user: this.user })
    },

    playSound (name) {
      if (this.soundMuted) { return }
      const src = SOUND_FILES[name]
      if (!src) { return }
      const audio = new Audio(src)
      audio.volume = 0.5
      audio.play().catch(() => {})
    },

    toggleSound () {
      this.soundMuted = !this.soundMuted
      try { localStorage.setItem('rpgSoundMuted', this.soundMuted ? '1' : '0') } catch (e) {}
    },

    loadThaiVoice () {
      if (!window.speechSynthesis) { return }
      const voices = window.speechSynthesis.getVoices()
      this.thaiVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('th')) || null
    },

    toggleVoice () {
      this.voiceEnabled = !this.voiceEnabled
      try { localStorage.setItem('rpgVoiceEnabled', this.voiceEnabled ? '1' : '0') } catch (e) {}
      if (!this.voiceEnabled && window.speechSynthesis) { window.speechSynthesis.cancel() }
    },

    speak (text) {
      if (!this.voiceEnabled || !this.thaiVoice || !window.speechSynthesis) { return }
      window.speechSynthesis.cancel()
      const clean = text
        .replace(/["“”]/g, '')
        .replace(/\.{2,}/g, ',')
        .replace(/\s+/g, ' ')
        .trim()
      const utter = new SpeechSynthesisUtterance(clean)
      utter.voice = this.thaiVoice
      utter.lang = this.thaiVoice.lang
      utter.rate = 0.88
      window.speechSynthesis.speak(utter)
    },

    dismissPrologue () {
      this.showPrologue = false
      const zone = zoneInfoFor(this.board, this.myTile)
      if (zone) {
        this.zoneBanner = zone
        clearTimeout(this._zoneBannerT)
        this._zoneBannerT = setTimeout(() => { this.zoneBanner = null }, 4000)
      }
    },

    setupSocketListeners () {
      this.$socket.on('connect', this.onSocketReconnect)
      this.$socket.on('disconnect', this.onSocketDrop)

      this.$socket.on('rpgJoined', (data) => {
        this.myId = data.playerId
        this.joined = true
        this.reconnecting = false
        this.fatalError = ''
        clearInterval(this._joinRetry)

        this.board = data.board || []
        this.inLobby = !data.started && !data.gameOver
        if (data.lobby) {
          this.lobbyHostId = data.lobby.hostId
          this.lobbyPlayers = data.lobby.players || []
        }
        if (data.player) {
          this.myClassId = data.player.classId
        }
        if (data.turn) {
          this.turn = data.turn
        }
        if (data.gameOver) {
          this.gameOver = true
        }
      })

      this.$socket.on('rpgLobbyUpdate', ({ hostId, started, players }) => {
        this.lobbyHostId = hostId
        this.lobbyPlayers = players || []
        if (started) { this.inLobby = false }
        const me = this.lobbyPlayers.find(p => p.id === this.myId)
        if (me) { this.myClassId = me.classId }
      })

      this.$socket.on('rpgMatchStarted', ({ turnOrder }) => {
        this.inLobby = false
        this.showPrologue = true
        this.turn.order = turnOrder || []
        this.pushLog('ปาร์ตี้ออกเดินทางแล้ว!')
        this.speak(this.prologueLines.join(' '))
      })

      this.$socket.on('rpgTurnStart', ({ playerId }) => {
        this.turn.currentPlayerId = playerId
        this.pushLog('ตาของ ' + this.nameFor(playerId))
      })

      this.$socket.on('rpgDiceRolled', ({ playerId, roll, fromTile, toTile }) => {
        this.lastRoll = { playerId, roll }
        this.playSound('dice')
        if (roll === 0) {
          this.pushLog(this.nameFor(playerId) + ' เผชิญหน้ามังกรอีกครั้ง!')
          return
        }
        this.spinDiceTo(roll)
        this.pushLog(this.nameFor(playerId) + ' ทอยได้ ' + roll + ' แต้ม เดินไปช่อง ' + toTile)

        const landedTile = this.board.find(t => t.id === toTile)
        if (landedTile && landedTile.type === 'blank') {
          this.pushLog(AMBIENT_LINES[(Math.random() * AMBIENT_LINES.length) | 0])
        }

        const fromZone = zoneInfoFor(this.board, fromTile)
        const toZone = zoneInfoFor(this.board, toTile)
        if (toZone && (!fromZone || fromZone.name !== toZone.name)) {
          this.pushLog('เข้าสู่เขต: ' + toZone.name)
          this.zoneBanner = toZone
          clearTimeout(this._zoneBannerT)
          this._zoneBannerT = setTimeout(() => { this.zoneBanner = null }, 4000)
        }
      })

      this.$socket.on('rpgEventTriggered', ({ playerId, event }) => {
        if (playerId === this.myId) {
          this.pendingEvent = event
          this.eventOutcome = null
          this.eventBusy = false
          this.speak((event.npc ? event.npc.name + ' พูดว่า ' : '') + event.text)
        }
        this.playSound('event')
        this.pushLog(this.nameFor(playerId) + ' เจอเหตุการณ์: ' + event.title)
      })

      this.$socket.on('rpgEventResolved', ({ playerId, outcomeText, effects, check }) => {
        this.eventBusy = false
        if (effects && effects.hpDelta < 0) {
          this.playSound('damage')
        } else if (effects && effects.itemGained) {
          this.playSound('treasure')
        }
        this.pushLog(this.nameFor(playerId) + ': ' + outcomeText)
        if (effects && effects.statBonus) {
          this.pushLog(this.nameFor(playerId) + ' ได้รับพลังเพิ่ม: ' + this.statBonusText(effects.statBonus))
        }
        if (playerId === this.myId && this.pendingEvent) {
          this.eventOutcome = {
            outcomeText,
            effects: effects || {},
            check: check || { success: true, roll: null, dc: null, total: null, stat: null }
          }
          this.speak(outcomeText)
        }
      })

      this.$socket.on('rpgForkTriggered', ({ playerId, options }) => {
        if (playerId === this.myId) {
          this.pendingFork = { options }
          this.forkBusy = false
          this.playSound('event')
          this.speak('เส้นทางแยกออกเป็นสองสาย เลือกทางที่จะไป')
        }
        this.pushLog(this.nameFor(playerId) + ' มาถึงทางแยก')
      })

      this.$socket.on('rpgForkResolved', ({ playerId, label }) => {
        this.pushLog(this.nameFor(playerId) + ' เลือก' + label)
        if (playerId === this.myId) {
          this.pendingFork = null
          this.forkBusy = false
        }
      })

      this.$socket.on('rpgTreasureFound', ({ playerId, text, itemGained, healAmount, statBonus }) => {
        this.playSound('treasure')
        this.pushLog(this.nameFor(playerId) + ' พบสมบัติ: ' + text)
        if (itemGained) {
          this.pushLog('ได้รับไอเทม: ' + itemGained)
        }
        if (healAmount) {
          this.pushLog('ฟื้นพลังชีวิต +' + healAmount)
        }
        if (statBonus) {
          this.pushLog(this.nameFor(playerId) + ' ได้รับพลังเพิ่ม: ' + this.statBonusText(statBonus))
        }
      })

      this.$socket.on('rpgTrapTriggered', ({ playerId, text, damage }) => {
        this.playSound('damage')
        this.pushLog(this.nameFor(playerId) + ' เจอกับดัก: ' + text + ' (-' + damage + ' HP)')
      })

      this.$socket.on('rpgTurnEnded', () => {})

      this.$socket.on('rpgState', ({ players, turn }) => {
        this.players = players || []
        if (turn) { this.turn = turn }
      })

      this.$socket.on('rpgGameOver', ({ outcome, summary }) => {
        this.gameOver = true
        this.outcome = outcome
        this.summary = summary || []
        this.playSound(outcome === 'victory' ? 'victory' : 'defeat')
      })

      this.$socket.on('rpgRestarted', ({ board } = {}) => {
        this.gameOver = false
        this.outcome = null
        this.summary = []
        this.inLobby = true
        this.pendingEvent = null
        this.eventOutcome = null
        this.logEntries = []
        this.myClassId = null
        this.lastRoll = null
        if (board) { this.board = board }
      })

      this.$socket.on('rpgPlayerJoined', () => {})
      this.$socket.on('rpgPlayerLeft', () => {})

      this.$socket.on('rpgError', ({ error }) => {
        this.handleError(error)
      })
    },

    onSocketReconnect () {
      if (this.joined) {
        this.reconnecting = false
        this.joinRoom()
      }
    },

    onSocketDrop () {
      if (this.joined && !this.gameOver) {
        this.reconnecting = true
      }
    },

    handleError (error) {
      const fatalSet = ['unauthorized', 'room_full', 'game_already_started']
      if (fatalSet.includes(error)) {
        clearInterval(this._joinRetry)
        if (error === 'unauthorized') {
          this.fatalError = 'เซสชันหมดอายุ — กรุณาเข้าสู่ระบบใหม่'
        } else if (error === 'room_full') {
          this.fatalError = 'ปาร์ตี้นี้เต็มแล้ว (สูงสุด 6 คน) — ลองห้องอื่นหรือเปิดใหม่'
        } else {
          this.fatalError = 'ปาร์ตี้นี้ออกเดินทางไปแล้ว เข้าร่วมเพิ่มไม่ได้ — ลองห้องอื่นหรือเปิดใหม่'
        }
        return
      }
      const messages = {
        not_host: 'มีแค่หัวปาร์ตี้เท่านั้นที่เริ่มได้',
        not_all_ready: 'ยังมีคนไม่พร้อมครบทุกคน',
        not_all_classes_picked: 'ยังมีคนไม่ได้เลือกคลาส',
        empty_room: 'ปาร์ตี้ว่างไป เริ่มไม่ได้',
        already_started: 'ออกเดินทางไปแล้ว',
        no_class: 'เลือกคลาสก่อนกดพร้อม',
        not_your_turn: 'ยังไม่ถึงตาคุณ',
        event_pending: 'มีเหตุการณ์ค้างอยู่',
        fork_pending: 'ต้องเลือกเส้นทางก่อน',
        not_playing: 'ยังเล่นไม่ได้ตอนนี้',
        no_pending_event: 'ไม่มีเหตุการณ์ค้างให้เลือก',
        no_pending_fork: 'ไม่มีทางแยกค้างให้เลือก',
        invalid_choice: 'ตัวเลือกไม่ถูกต้อง'
      }
      this.transientError = messages[error] || 'เกิดข้อผิดพลาด'
      clearTimeout(this._transientT)
      this._transientT = setTimeout(() => { this.transientError = '' }, 3000)
    },

    pickClass (classId) {
      this.playSound('click')
      this.myClassId = classId
      this.$socket.emit('rpgClassPick', { classId })
    },

    toggleReady () {
      this.playSound('click')
      this.$socket.emit('rpgReady', { ready: !this.myLobbyReady })
    },

    startGame () {
      this.playSound('click')
      this.$socket.emit('rpgStart')
    },

    rollDice () {
      if (!this.isMyTurn || this.pendingEvent || this.pendingFork) { return }
      this.playSound('click')
      this.$socket.emit('rpgRollDice')
    },

    spinDiceTo (n) {
      const target = DICE_FACE_TARGET[n]
      const extraSpins = 2 + Math.floor(Math.random() * 2)
      const advance = (current, targetDeg) => {
        const currentMod = ((current % 360) + 360) % 360
        const targetMod = ((targetDeg % 360) + 360) % 360
        let delta = targetMod - currentMod
        if (delta <= 0) { delta += 360 }
        return current + delta + extraSpins * 360
      }
      this.diceRotX = advance(this.diceRotX, target.x)
      this.diceRotY = advance(this.diceRotY, target.y)
    },

    chooseEvent (choiceId) {
      if (this.eventBusy) { return }
      this.eventBusy = true
      this.playSound('click')
      this.$socket.emit('rpgEventChoice', { choiceId })
    },

    chooseFork (toNodeId) {
      if (this.forkBusy) { return }
      this.forkBusy = true
      this.playSound('click')
      this.$socket.emit('rpgForkChoice', { toNodeId })
    },

    closeOutcome () {
      this.playSound('click')
      this.pendingEvent = null
      this.eventOutcome = null
    },

    restart () {
      this.$socket.emit('rpgRestart', { roomId: this.roomId })
    },

    leaveGame () {
      this.$socket.emit('rpgLeave')
      this.$router.push('/rpg/board')
    },

    pushLog (text) {
      this.logEntries.push(text)
      if (this.logEntries.length > 30) { this.logEntries.shift() }
    },

    nameFor (id) {
      const p = this.players.find(x => x.id === id) || this.lobbyPlayers.find(x => x.id === id)
      return p ? p.username : 'ผู้เล่น'
    },

    classNameOf (classId) {
      const c = rpgClassById(classId)
      return c ? c.name : classId
    },

    classIconOf (classId) {
      const c = rpgClassById(classId)
      return c ? c.icon : 'fa-user'
    },

    classSpriteFor (classId) {
      return CLASS_SPRITES[classId] || heroWarrior
    },

    monsterSpriteFor (tier) {
      return this.monsterTierSprites[tier] || this.monsterFigureSrc
    },

    tileIcon (tile) {
      if ((tile.type === 'event' || tile.type === 'boss') && tile.icon) { return tile.icon }
      if (tile.type === 'start') { return 'fa-door-open' }
      if (tile.type === 'event') { return 'fa-question' }
      if (tile.type === 'rest') { return 'fa-campground' }
      if (tile.type === 'treasure') { return 'fa-gem' }
      if (tile.type === 'trap') { return 'fa-triangle-exclamation' }
      if (tile.type === 'boss') { return 'fa-dragon' }
      if (tile.type === 'finish') { return 'fa-trophy' }
      if (tile.type === 'fork') { return 'fa-route' }
      return 'fa-circle'
    },

    markerStyle (tileId) {
      const w = waypointFor(tileId)
      return { left: w.xPct + '%', top: w.yPct + '%' }
    },

    charMarkerStyle (p) {
      const w = waypointFor(p.tile)
      const group = this.players.filter(x => x.tile === p.tile)
      const idx = group.findIndex(x => x.id === p.id)
      const offset = (idx - (group.length - 1) / 2) * 3.2
      return { left: (w.xPct + offset) + '%', top: w.yPct + '%' }
    },

    statBonusText (statBonus) {
      const labels = { str: 'พลังโจมตี', agi: 'ความว่องไว', int: 'สติปัญญา' }
      return Object.entries(statBonus).map(([k, v]) => (labels[k] || k) + ' +' + v).join(', ')
    },

    statLabel (stat) {
      const labels = { str: 'พลังโจมตี', agi: 'ความว่องไว', int: 'สติปัญญา' }
      return labels[stat] || stat
    },

    initialsOf (name) {
      return (name || '?').substring(0, 2).toUpperCase()
    },

    hpPct (p) {
      if (!p.maxHp) { return 0 }
      return Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100))
    },

    _offAll () {
      const events = [
        'rpgJoined', 'rpgLobbyUpdate', 'rpgPlayerJoined', 'rpgPlayerLeft', 'rpgMatchStarted',
        'rpgTurnStart', 'rpgDiceRolled', 'rpgEventTriggered', 'rpgEventResolved', 'rpgTurnEnded',
        'rpgForkTriggered', 'rpgForkResolved',
        'rpgTreasureFound', 'rpgTrapTriggered',
        'rpgState', 'rpgGameOver', 'rpgRestarted', 'rpgError'
      ]
      events.forEach(ev => this.$socket.off(ev))
      this.$socket.off('connect', this.onSocketReconnect)
      this.$socket.off('disconnect', this.onSocketDrop)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Kanit:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.rpg-page {
  min-height: 100vh; min-height: 100dvh;
  background: #140f1e;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  position: relative;
  overflow-x: hidden;
}

.rpg-bg {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(232, 179, 74, 0.06), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(124, 60, 168, 0.12), transparent 45%);
  pointer-events: none;
  z-index: 0;
}

.rpg-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(10, 7, 15, 0.82);
}

.rpg-overlay-box {
  background: rgba(20, 15, 30, 0.98);
  border: 1px solid rgba(232, 179, 74, 0.25);
  border-radius: 14px;
  padding: 32px;
  width: min(420px, 100%);
  text-align: center;
}

.rpg-overlay-box i:not(.event-choices i):not(.event-npc i):not(.prologue-btn i) {
  font-size: 34px;
  color: #e8b34a;
  margin-bottom: 12px;
  display: block;
}
.spin-icon { animation: rpg-spin 0.8s linear infinite; }
@keyframes rpg-spin { to { transform: rotate(360deg); } }

.rpg-btn {
  font-family: 'Kanit', sans-serif;
  font-weight: 700;
  font-size: 13px;
  border-radius: 999px;
  padding: 11px 22px;
  border: 1px solid rgba(232, 179, 74, 0.3);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: #e8b34a;
  transition: all 0.15s ease;
}
.rpg-btn.ghost { background: transparent; }
.rpg-btn.ghost:hover { background: rgba(232, 179, 74, 0.08); }
.rpg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.rpg-btn.start-btn { background: #e8b34a; color: #140f1e; border-color: #e8b34a; }
.rpg-btn.start-btn:hover:not(:disabled) { background: #f4cb72; }

.rpg-btn.ready-btn { background: rgba(232, 179, 74, 0.15); color: #e8b34a; }
.rpg-btn.ready-btn.on { background: transparent; color: rgba(237, 230, 214, 0.6); }

.rpg-screen {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.rpg-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: calc(16px + env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) 16px max(20px, env(safe-area-inset-left));
  border-bottom: 1px solid rgba(232, 179, 74, 0.15);
  background: rgba(20, 15, 30, 0.6);
}
.rpg-top h1 {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 17px;
  color: #f4e9d0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rpg-back {
  flex-shrink: 0;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(232, 179, 74, 0.3);
  background: transparent;
  color: #e8b34a;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.rpg-back:hover { background: rgba(232, 179, 74, 0.1); }

.turn-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(232, 179, 74, 0.08);
  color: rgba(237, 230, 214, 0.6);
  border: 1px solid rgba(232, 179, 74, 0.15);
}
.turn-indicator.mine { background: rgba(232, 179, 74, 0.2); color: #f4e9d0; border-color: #e8b34a; }

.lobby-banner {
  position: relative;
  max-width: 900px;
  width: 100%;
  margin: 16px auto 0;
  padding: 0 20px;
}
.lobby-banner-img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 180px;
  object-fit: cover;
  object-position: center 30%;
  border-radius: 12px;
  filter: brightness(0.75) saturate(0.9);
}
.lobby-banner-caption {
  position: absolute;
  left: 36px;
  right: 36px;
  bottom: 10px;
  font-size: 12px;
  color: #f4e9d0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
  font-family: 'Cinzel', serif;
}

.rpg-lobby-body {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
}

.class-pick h2, .lobby-roster h2 {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  color: #e8b34a;
  margin: 0 0 14px;
}

.class-grid { display: flex; flex-direction: column; gap: 10px; }
.class-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 52px 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(232, 179, 74, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: #ede6d6;
  cursor: pointer;
  text-align: left;
  font-family: 'Kanit', sans-serif;
  overflow: hidden;
}
.class-card i { font-size: 20px; color: #e8b34a; margin-bottom: 4px; }
.class-card.active { border-color: #e8b34a; background: rgba(232, 179, 74, 0.1); }
.class-portrait {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 34px;
  height: 52px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: 0.85;
}
.class-portrait img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.7));
}
.class-name { font-weight: 700; font-size: 14px; }
.class-desc { font-size: 12px; color: rgba(237, 230, 214, 0.5); }

.roster-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.roster-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(232, 179, 74, 0.1);
  font-size: 12.5px;
}
.roster-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.roster-host { flex-shrink: 0; font-size: 9px; font-family: 'Cinzel', serif; color: #140f1e; background: #e8b34a; padding: 2px 6px; border-radius: 999px; }
.roster-class { flex-shrink: 0; color: rgba(237, 230, 214, 0.5); }
.roster-ready { flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; color: rgba(237, 230, 214, 0.4); }
.roster-ready.on { color: #6fdba0; }

.lobby-hint { font-size: 12.5px; color: rgba(237, 230, 214, 0.5); margin: 0 0 8px; }
.lobby-error { font-size: 12px; color: #ff8f8f; margin: 0 0 8px; }
.lobby-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.quest-tracker {
  margin: 12px max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
  max-width: 900px;
  width: calc(100% - 32px);
  margin-left: auto;
  margin-right: auto;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(232, 179, 74, 0.2);
}
.quest-title {
  font-family: 'Cinzel', serif;
  font-size: 12.5px;
  color: #e8b34a;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.quest-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.quest-step {
  font-size: 11px;
  color: rgba(237, 230, 214, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.quest-step i { font-size: 10px; }
.quest-step.done {
  color: #8ff0bd;
  text-decoration: line-through;
  text-decoration-color: rgba(143, 240, 189, 0.5);
}

.zone-banner {
  margin: 12px max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
  padding: 10px 18px;
  border-radius: 10px;
  background: rgba(232, 179, 74, 0.1);
  border: 1px solid rgba(232, 179, 74, 0.3);
  text-align: center;
}
.zone-banner-name {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 14px;
  color: #e8b34a;
  margin-bottom: 2px;
}
.zone-banner-desc {
  display: block;
  font-size: 11.5px;
  color: rgba(237, 230, 214, 0.6);
}

.rpg-board-wrap {
  padding: 16px max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
}
.rpg-board-map {
  position: relative;
  max-width: 1080px;
  margin: 0 auto;
}
.rpg-board-map::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(10, 8, 16, 0.55) 100%);
}
.rpg-board-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%) translateY(-52px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}

.marker-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(20, 15, 30, 0.7);
  border: 1px solid rgba(232, 179, 74, 0.35);
  border-radius: 999px;
  padding: 1px 6px;
  font-size: 9px;
  color: rgba(237, 230, 214, 0.8);
  white-space: nowrap;
}
.marker-idx { opacity: 0.7; }
.marker-badge i { font-size: 9px; }

.marker-badge.has-me {
  border-color: #6fdba0;
  color: #d9f5e6;
  animation: rpg-marker-pulse 1.6s ease-in-out infinite;
}
@keyframes rpg-marker-pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(111, 219, 160, 0.6); }
  50% { box-shadow: 0 0 14px rgba(111, 219, 160, 0.95); }
}

.char-figure {
  position: absolute;
  transform: translate(-50%, -100%);
  transition: left 0.6s ease, top 0.6s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 26px;
  pointer-events: none;
  z-index: 3;
}
.char-hp-bar {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 4;
}
.char-figure.mine .char-hp-bar { width: 30px; top: -9px; }
.char-hp-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ff8f8f, #6fdba0);
  transition: width 0.4s ease;
}
.monster-figure {
  position: absolute;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  pointer-events: none;
  z-index: 2;
  opacity: 0.9;
}
.monster-sprite {
  display: block;
  width: 19px;
  height: auto;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.8));
  animation: rpg-monster-breathe 2.2s ease-in-out infinite;
}
@keyframes rpg-monster-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
.monster-ring {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(178, 34, 34, 0.6) 0%, rgba(178, 34, 34, 0) 72%);
  z-index: 0;
}
.monster-chip {
  position: absolute;
  bottom: 1px;
  right: -3px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #140f1e;
  border: 1px solid rgba(178, 34, 34, 0.8);
  color: #ff8f8f;
  font-size: 6.5px;
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
}

.monster-figure.tier-neutral .monster-sprite {
  width: 21px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.8));
}
.monster-figure.tier-neutral .monster-ring {
  background: radial-gradient(ellipse at center, rgba(120, 150, 200, 0.5) 0%, rgba(120, 150, 200, 0) 72%);
}
.monster-figure.tier-neutral .monster-chip {
  border-color: rgba(120, 150, 200, 0.8);
  color: #cfe0ff;
}

.monster-figure.tier-small {
  width: 24px;
  opacity: 0.95;
}
.monster-figure.tier-small .monster-sprite {
  width: 20px;
  filter: saturate(1.15) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.8));
}
.monster-figure.tier-small .monster-ring {
  background: radial-gradient(ellipse at center, rgba(150, 200, 60, 0.55) 0%, rgba(150, 200, 60, 0) 72%);
}
.monster-figure.tier-small .monster-chip {
  border-color: rgba(150, 200, 60, 0.8);
  color: #d4f5a0;
}

.monster-figure.tier-large {
  width: 36px;
}
.monster-figure.tier-large .monster-sprite {
  width: 32px;
  filter: saturate(1.05) drop-shadow(0 3px 4px rgba(0, 0, 0, 0.85));
}
.monster-figure.tier-large .monster-ring {
  width: 26px; height: 11px;
  background: radial-gradient(ellipse at center, rgba(70, 110, 40, 0.65) 0%, rgba(70, 110, 40, 0) 72%);
}
.monster-figure.tier-large .monster-chip {
  width: 14px; height: 14px;
  border-color: rgba(70, 110, 40, 0.85);
  color: #c3e6a8;
}

.monster-figure.tier-ghost {
  opacity: 0.8;
  animation: rpg-ghost-float 3s ease-in-out infinite;
}
.monster-figure.tier-ghost .monster-sprite {
  width: 21px;
  filter: hue-rotate(160deg) saturate(0.25) brightness(1.35) drop-shadow(0 0 8px rgba(180, 220, 255, 0.6));
  animation: none;
}
.monster-figure.tier-ghost .monster-ring {
  background: radial-gradient(ellipse at center, rgba(180, 220, 255, 0.45) 0%, rgba(180, 220, 255, 0) 72%);
}
.monster-figure.tier-ghost .monster-chip {
  border-color: rgba(180, 220, 255, 0.85);
  color: #dff0ff;
}
@keyframes rpg-ghost-float {
  0%, 100% { transform: translate(-50%, -100%) translateY(0); }
  50% { transform: translate(-50%, -100%) translateY(-6px); }
}

.monster-figure.tier-boss {
  width: 34px;
  opacity: 1;
  z-index: 4;
}
.monster-figure.tier-boss .monster-sprite {
  width: 29px;
  filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 90, 60, 0.85)) drop-shadow(0 3px 4px rgba(0, 0, 0, 0.85));
  animation: rpg-boss-breathe 1.8s ease-in-out infinite;
}
@keyframes rpg-boss-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.monster-figure.tier-boss .monster-ring {
  width: 30px; height: 13px;
  background: radial-gradient(ellipse at center, rgba(255, 90, 60, 0.75) 0%, rgba(255, 90, 60, 0) 72%);
  animation: rpg-ring-pulse 1.4s ease-in-out infinite;
}
.monster-figure.tier-boss .monster-chip {
  width: 15px; height: 15px;
  border-color: rgba(255, 90, 60, 0.9);
  color: #ffcf9f;
}
.char-sprite {
  display: block;
  width: 20px;
  height: auto;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.7));
}
.char-figure.dead .char-sprite { filter: grayscale(1) brightness(0.6) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.7)); }
.char-class-chip {
  position: absolute;
  bottom: 2px;
  right: -2px;
  width: 13px; height: 13px;
  border-radius: 50%;
  background: #140f1e;
  border: 1px solid rgba(232, 179, 74, 0.6);
  color: #e8b34a;
  font-size: 7px;
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
}
.char-dead-icon {
  position: absolute;
  top: -4px;
  right: -2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  z-index: 3;
}
.char-ring {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 9px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(232, 179, 74, 0.55) 0%, rgba(232, 179, 74, 0) 72%);
  z-index: 0;
}
.char-figure.mine {
  width: 34px;
}
.char-figure.mine .char-sprite {
  width: 28px;
}
.char-figure.mine .char-ring {
  width: 26px;
  height: 11px;
  background: radial-gradient(ellipse at center, rgba(111, 219, 160, 0.85) 0%, rgba(111, 219, 160, 0) 72%);
  animation: rpg-ring-pulse 1.6s ease-in-out infinite;
}
@keyframes rpg-ring-pulse {
  0%, 100% { opacity: 0.75; }
  50% { opacity: 1; }
}
.mine-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: #6fdba0;
  color: #0c1712;
  font-weight: 700;
  font-size: 10.5px;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  animation: rpg-mine-bounce 1s ease-in-out infinite;
  z-index: 4;
}
.mine-label::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px 4px 0;
  border-style: solid;
  border-color: #6fdba0 transparent transparent;
}
@keyframes rpg-mine-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-3px); }
}

.rpg-party-panel {
  padding: 22px max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.party-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(232, 179, 74, 0.12);
  background: rgba(0, 0, 0, 0.2);
  font-size: 12.5px;
}
.party-card.active { border-color: #e8b34a; }
.party-card.dead { opacity: 0.4; }
.party-card.mine { border-color: rgba(111, 219, 160, 0.5); background: rgba(111, 219, 160, 0.06); }
.party-icon {
  flex-shrink: 0;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(232, 179, 74, 0.15);
  color: #e8b34a;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
}
.party-card.mine .party-icon { background: rgba(111, 219, 160, 0.18); color: #6fdba0; }
.party-name { flex-shrink: 0; width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.party-me-tag {
  margin-left: 6px;
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(111, 219, 160, 0.18);
  color: #6fdba0;
  vertical-align: middle;
}
.party-hp-bar { flex: 1; min-width: 0; height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.party-hp-fill { height: 100%; background: linear-gradient(90deg, #ff8f8f, #6fdba0); }
.party-hp-num { flex-shrink: 0; font-size: 11px; color: rgba(237, 230, 214, 0.5); width: 52px; text-align: right; }

.my-char-card {
  margin: 14px max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
  max-width: 900px;
  width: calc(100% - 32px);
  margin-left: auto;
  margin-right: auto;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(111, 219, 160, 0.06);
  border: 1px solid rgba(111, 219, 160, 0.3);
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.mc-portrait {
  flex-shrink: 0;
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(111, 219, 160, 0.18);
  color: #6fdba0;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  border: 2px solid rgba(111, 219, 160, 0.5);
}
.mc-portrait.dead { background: rgba(120, 120, 130, 0.18); color: #9a9aa4; border-color: rgba(120, 120, 130, 0.5); }
.mc-body { flex: 1; min-width: 160px; }
.mc-name-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.mc-name { font-weight: 700; font-size: 13px; }
.mc-class { font-size: 11px; color: rgba(237, 230, 214, 0.5); }
.mc-hp-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.mc-hp-bar { flex: 1; height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.mc-hp-fill { height: 100%; background: linear-gradient(90deg, #ff8f8f, #6fdba0); }
.mc-hp-num { flex-shrink: 0; font-size: 11px; color: rgba(237, 230, 214, 0.6); }
.mc-stats { display: flex; gap: 14px; font-size: 11.5px; color: rgba(237, 230, 214, 0.75); }
.mc-stats i { color: #e8b34a; margin-right: 4px; }
.mc-inventory {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 140px;
}
.mc-item-empty { font-size: 10.5px; color: rgba(237, 230, 214, 0.35); }
.mc-item {
  width: 24px; height: 24px;
  border-radius: 6px;
  background: rgba(232, 179, 74, 0.12);
  border: 1px solid rgba(232, 179, 74, 0.3);
  color: #e8b34a;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
}

.rpg-action-bar {
  padding: 18px max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
}
.dice-3d-scene {
  width: 46px;
  height: 46px;
  perspective: 300px;
  flex-shrink: 0;
}
.dice-3d-cube {
  position: relative;
  width: 46px;
  height: 46px;
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.22, 0.98, 0.35, 1);
}
.dice-3d-face {
  position: absolute;
  width: 46px;
  height: 46px;
  backface-visibility: hidden;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  padding: 7px;
  box-sizing: border-box;
  background: linear-gradient(160deg, #fdf6e3, #ede0c0);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.15);
}
.dice-3d-face .pip {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2a2118;
  justify-self: center;
  align-self: center;
}
.df-1 { transform: rotateY(0deg) translateZ(23px); }
.df-2 { transform: rotateY(90deg) translateZ(23px); }
.df-3 { transform: rotateY(180deg) translateZ(23px); }
.df-4 { transform: rotateY(-90deg) translateZ(23px); }
.df-5 { transform: rotateX(90deg) translateZ(23px); }
.df-6 { transform: rotateX(-90deg) translateZ(23px); }

.dice-btn {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 14px;
  border-radius: 999px;
  border: none;
  padding: 14px 28px;
  background: #e8b34a;
  color: #140f1e;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.dice-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.last-roll { font-size: 12.5px; color: rgba(237, 230, 214, 0.5); }

.rpg-log {
  flex: 1;
  min-height: 0;
  margin: 18px max(16px, env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  max-width: 900px;
  width: calc(100% - 32px);
  margin-left: auto;
  margin-right: auto;
  overflow-y: auto;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(232, 179, 74, 0.1);
  font-size: 12px;
  color: rgba(237, 230, 214, 0.55);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-box { text-align: left; }
.event-npc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(232, 179, 74, 0.9);
}
.event-npc i { font-size: 13px; }
.event-title { font-family: 'Cinzel', serif; font-size: 16px; color: #e8b34a; margin-bottom: 10px; text-align: center; }
.event-text { font-size: 13.5px; color: rgba(237, 230, 214, 0.75); line-height: 1.6; margin: 0 0 18px; text-align: center; }
.event-choices { display: flex; flex-direction: column; gap: 10px; }

.outcome-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto 10px;
  width: fit-content;
  padding: 4px 14px;
  border-radius: 999px;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
}
.outcome-tag.success { background: rgba(111, 219, 160, 0.15); color: #8ff0bd; border: 1px solid rgba(111, 219, 160, 0.4); }
.outcome-tag.fail { background: rgba(255, 143, 143, 0.15); color: #ff8f8f; border: 1px solid rgba(255, 143, 143, 0.4); }
.outcome-tag.neutral { background: rgba(232, 179, 74, 0.12); color: #e8b34a; border: 1px solid rgba(232, 179, 74, 0.35); }
.outcome-roll {
  text-align: center;
  font-size: 12px;
  color: rgba(237, 230, 214, 0.5);
  margin-bottom: 12px;
}
.outcome-effects {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
}
.outcome-effects span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  background: rgba(255, 255, 255, 0.05);
}
.outcome-effects .eff-good { color: #8ff0bd; }
.outcome-effects .eff-bad { color: #ff8f8f; }

.prologue-box { text-align: center; width: min(480px, 100%); max-height: 85vh; overflow-y: auto; }
.prologue-line { font-size: 13px; color: rgba(237, 230, 214, 0.75); line-height: 1.7; text-align: left; margin: 0 0 12px; }
.prologue-btn { width: 100%; margin-top: 8px; }
.choice-btn { width: 100%; background: rgba(232, 179, 74, 0.1); }
.choice-btn:hover:not(:disabled) { background: rgba(232, 179, 74, 0.2); }

.gameover-box { text-align: center; }
.go-tag { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 2px; color: #e8b34a; margin-bottom: 8px; }
.gameover-box h2 { font-family: 'Cinzel', serif; font-size: 19px; color: #f4e9d0; margin: 0 0 20px; }
.summary-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 22px; }
.summary-row {
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  font-size: 12px;
  color: rgba(237, 230, 214, 0.65);
}
.summary-top { display: flex; justify-content: space-between; gap: 8px; }
.summary-items { margin-top: 4px; font-size: 11px; color: rgba(232, 179, 74, 0.7); }
.go-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter, .fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .rpg-lobby-body { grid-template-columns: 1fr; }
  .marker-badge { font-size: 7px; padding: 1px 4px; }
  .char-figure { width: 20px; }
  .char-figure .char-sprite { width: 15px; }
  .char-figure.mine { width: 26px; }
  .char-figure.mine .char-sprite { width: 21px; }
  .monster-figure { width: 18px; }
  .monster-sprite { width: 14px; }
}

@media (max-width: 420px) {
  .rpg-top h1 { font-size: 14px; }
  .turn-indicator { font-size: 11px; padding: 6px 10px; }
  .party-name { width: 80px; }
}
</style>
