<template>
  <ZoneCanvas
    zone="cave"
    :scenes="scenes"
    :room-id="roomId"
    :class-id="classId"
    :width="640"
    :height="480"
    background="#0c0a10"
  />
</template>

<script>
import CavePreloadScene from '~/game/scenes/CavePreloadScene'
import CaveScene from '~/game/scenes/CaveScene'
import ZoneCanvas from '~/components/game/ZoneCanvas.vue'

export default {
  name: 'CaveCanvas',
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
    this.scenes = [CavePreloadScene, CaveScene]
  }
}
</script>
