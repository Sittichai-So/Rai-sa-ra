<template>
  <ZoneCanvas
    zone="village"
    :scenes="scenes"
    :room-id="roomId"
    :class-id="classId"
    :width="1056"
    :height="594"
    background="#140f1e"
  />
</template>

<script>
import BootScene from '~/game/scenes/BootScene'
import PreloadScene from '~/game/scenes/PreloadScene'
import WorldScene from '~/game/scenes/WorldScene'
import ZoneCanvas from '~/components/game/ZoneCanvas.vue'

export default {
  name: 'GameCanvas',
  components: { ZoneCanvas },
  props: {
    classId: {
      type: String,
      default: null
    },
    roomId: {
      type: String,
      required: true
    }
  },
  created () {
    this.scenes = [BootScene, PreloadScene, WorldScene]
  }
}
</script>
