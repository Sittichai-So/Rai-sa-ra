<template>
  <ZoneCanvas
    zone="valley"
    :scenes="scenes"
    :room-id="roomId"
    :class-id="classId"
    :width="1056"
    :height="594"
    background="#1c1710"
    filter="saturate(0.45) sepia(0.2) brightness(0.92)"
  />
</template>

<script>
import ValleyPreloadScene from '~/game/scenes/ValleyPreloadScene'
import ValleyScene from '~/game/scenes/ValleyScene'
import ZoneCanvas from '~/components/game/ZoneCanvas.vue'

export default {
  name: 'ValleyCanvas',
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
    this.scenes = [ValleyPreloadScene, ValleyScene]
  }
}
</script>
