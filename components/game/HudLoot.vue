<template>
  <transition name="wh-fade">
    <div v-if="l" class="wh-overlay">
      <div class="wh-panel wh-loot-box">
        <div class="wh-loot-head">
          <img :src="chest" class="wh-loot-img" alt="">
          <div>
            <div class="wh-loot-title">
              {{ l.title }}
            </div>
            <p class="wh-loot-text">
              {{ l.text }}
            </p>
          </div>
        </div>
        <ul class="wh-loot-list">
          <li v-if="l.gold" class="wh-loot-row">
            <img :src="coin" class="wh-icon" alt=""> <span>เหรียญทอง</span><b>+{{ l.gold }}</b>
          </li>
          <li v-if="l.exp" class="wh-loot-row">
            <i class="fas fa-star wh-icon-fa" /> <span>ค่าประสบการณ์</span><b>+{{ l.exp }}</b>
          </li>
          <li v-for="(item, i) in l.items" :key="i" class="wh-loot-row">
            <img :src="iconFor(item)" class="wh-icon" alt=""> <span>{{ item.name }}</span><b>x{{ item.qty }}</b>
          </li>
          <li v-if="!l.gold && !l.exp && !l.items.length" class="wh-loot-row empty">
            ไม่มีอะไรเหลืออยู่เลย
          </li>
        </ul>
        <button type="button" class="wh-btn primary" @click="controller.collectLoot()">
          <span class="wh-key">E</span> {{ l.applied ? 'ตกลง' : 'เก็บทั้งหมด' }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { ui } from '~/game/systems/ui'
import { itemById } from '~/game/data/items'
import { itemIcon, COIN_ICON } from '~/components/game/icons'
import chestImg from '~/assets/images/rpg-world/props/chest_open.png'

export default {
  name: 'HudLoot',
  props: {
    controller: { type: Object, required: true }
  },
  computed: {
    l () {
      return ui.loot
    },
    chest () {
      return chestImg
    },
    coin () {
      return COIN_ICON
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKey)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    iconFor (item) {
      const known = itemById(item.id)
      return itemIcon(known ? known.icon : 'skull')
    },
    onKey (event) {
      if (!this.l || event.repeat || Date.now() - this.l.createdAt < 250) { return }
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return }
      if (event.key === 'e' || event.key === 'E' || event.key === 'Enter') {
        event.preventDefault()
        this.controller.collectLoot()
      }
    }
  }
}
</script>
