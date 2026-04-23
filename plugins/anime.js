import Vue from 'vue'

if (process.client) {
  const anime = require('animejs/lib/anime.min.js')
  Vue.prototype.$anime = anime.default || anime
}
