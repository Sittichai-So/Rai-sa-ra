<template>
  <ZoneCanvas
    zone="dragon_lair"
    :scenes="scenes"
    :room-id="roomId"
    :class-id="classId"
    :width="640"
    :height="480"
    background="#1a0a08"
  />
</template>

<script>
import DragonLairPreloadScene from '~/game/scenes/DragonLairPreloadScene'
import DragonLairScene from '~/game/scenes/DragonLairScene'
import ZoneCanvas from '~/components/game/ZoneCanvas.vue'

export default {
  name: 'DragonLairCanvas',
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
    this.scenes = [DragonLairPreloadScene, DragonLairScene]
  }
}
</script>
