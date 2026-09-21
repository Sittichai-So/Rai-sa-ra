<template>
  <ZoneCanvas
    zone="forest"
    :scenes="scenes"
    :room-id="roomId"
    :class-id="classId"
    :width="1056"
    :height="594"
    background="#141f14"
  />
</template>

<script>
import ForestPreloadScene from '~/game/scenes/ForestPreloadScene'
import ForestScene from '~/game/scenes/ForestScene'
import ZoneCanvas from '~/components/game/ZoneCanvas.vue'

export default {
  name: 'ForestCanvas',
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
    this.scenes = [ForestPreloadScene, ForestScene]
  }
}
</script>
