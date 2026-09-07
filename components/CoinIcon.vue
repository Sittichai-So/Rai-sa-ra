<template>
  <img
    :src="large ? big : small"
    alt="เหรียญ"
    class="coin-icon"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
</template>

<script>
import small from '~/assets/images/coin-64.png'
import big from '~/assets/images/coin-128.png'

export default {
  name: 'CoinIcon',
  props: {
    size: { type: [Number, String], default: 18 },
    large: { type: Boolean, default: false }
  },
  data () {
    return { small, big }
  }
}
</script>

<style scoped>
.coin-icon {
  display: inline-block;
  object-fit: contain;
  vertical-align: -0.15em;
  flex-shrink: 0;
}
</style>
