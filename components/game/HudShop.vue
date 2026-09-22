<template>
  <transition name="wh-fade">
    <div v-if="ui.panel === 'shop'" class="wh-overlay" @click.self="close">
      <div class="wh-panel wh-shop-box">
        <div class="wh-menu-tabs">
          <button type="button" class="wh-tab" :class="{ active: ui.shopMode === 'buy' }" @click="ui.shopMode = 'buy'">
            <i class="fas fa-coins" /> ซื้อ
          </button>
          <button type="button" class="wh-tab" :class="{ active: ui.shopMode === 'sell' }" @click="ui.shopMode = 'sell'">
            <i class="fas fa-hand-holding-dollar" /> ขาย
          </button>
          <span class="wh-gold"><img :src="coin" class="wh-icon" alt=""> {{ state.gold }}</span>
          <button type="button" class="wh-x" title="ปิด (Esc)" @click="close">
            <i class="fas fa-xmark" />
          </button>
        </div>
        <div class="wh-menu-body">
          <ul v-if="ui.shopMode === 'buy'" class="wh-items">
            <li v-for="item in stock" :key="item.id" class="wh-item">
              <img :src="iconFor(item)" class="wh-icon" alt="">
              <div class="wh-item-main">
                <div class="wh-item-name">
                  {{ item.name }} <small>มีอยู่ {{ count(item.id) }}</small>
                </div>
                <div class="wh-item-desc">
                  {{ item.desc }}
                </div>
              </div>
              <button type="button" class="wh-btn small" :disabled="state.gold < item.price" @click="controller.buy(item.id)">
                {{ item.price }} <img :src="coin" class="wh-icon tiny" alt="">
              </button>
            </li>
          </ul>
          <template v-else>
            <p v-if="!state.inventory.length" class="wh-empty">
              ไม่มีของให้ขาย
            </p>
            <ul class="wh-items">
              <li v-for="item in state.inventory" :key="item.id" class="wh-item">
                <img :src="iconFor(item)" class="wh-icon" alt="">
                <div class="wh-item-main">
                  <div class="wh-item-name">
                    {{ item.name }} <small>x{{ item.qty }}</small>
                  </div>
                  <div class="wh-item-desc">
                    {{ sellDesc(item) }}
                  </div>
                </div>
                <span v-if="isQuestItem(item)" class="wh-quest-tag">ของสำคัญ ขายไม่ได้</span>
                <button v-else type="button" class="wh-btn small" @click="controller.sell(item.id)">
                  ขาย {{ sellPrice(item) }} <img :src="coin" class="wh-icon tiny" alt="">
                </button>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ui, closePanel } from '~/game/systems/ui'
import { state, countItem } from '~/game/systems/gameState'
import { SHOP_STOCK, itemById, describeItem } from '~/game/data/items'
import { itemIcon, COIN_ICON } from '~/components/game/icons'
import { check } from '~/game/systems/conditions'

export default {
  name: 'HudShop',
  props: {
    controller: { type: Object, required: true }
  },
  data () {
    return { ui, state }
  },
  computed: {
    stock () {
      return SHOP_STOCK.map(id => itemById(id)).filter(item => item && check(item.unlockedBy))
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
    close () {
      closePanel()
    },
    count (id) {
      return countItem(id)
    },
    iconFor (item) {
      return itemIcon(item.icon || 'skull')
    },
    baseItem (item) {
      return describeItem(item.id.startsWith('trophy:') ? item.id.slice(7) : item.id)
    },
    sellPrice (item) {
      return this.baseItem(item).sell || 0
    },
    sellDesc (item) {
      return this.baseItem(item).desc
    },
    isQuestItem (item) {
      return !!this.baseItem(item).questItem
    },
    onKey (event) {
      if (event.repeat) { return }
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return }
      if (event.key === 'Escape' && ui.panel === 'shop') { this.close() }
    }
  }
}
</script>
