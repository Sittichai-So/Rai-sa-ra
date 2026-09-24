<template>
  <ZoneCanvas
    zone="tower"
    :scenes="scenes"
    :room-id="roomId"
    :class-id="classId"
    :width="640"
    :height="480"
    background="#120a1a"
  />
</template>

<script>
import TowerPreloadScene from '~/game/scenes/TowerPreloadScene'
import TowerScene from '~/game/scenes/TowerScene'
import ZoneCanvas from '~/components/game/ZoneCanvas.vue'

export default {
  name: 'TowerCanvas',
  components: { ZoneCanvas },
  props: {
    roomId: {
      type: String,
      required: true
    },
    classId: {
      type: String,
      default: null
    }
  },
  created () {
    this.scenes = [TowerPreloadScene, TowerScene]
  }
}
</script>
