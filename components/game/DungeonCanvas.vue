<template>
  <ZoneCanvas
    zone="dungeon"
    :scenes="scenes"
    :room-id="roomId"
    fixed-class="warrior"
    :width="640"
    :height="480"
    background="#0c0a10"
  />
</template>

<script>
import DungeonPreloadScene from '~/game/scenes/DungeonPreloadScene'
import DungeonScene from '~/game/scenes/DungeonScene'
import ZoneCanvas from '~/components/game/ZoneCanvas.vue'

export default {
  name: 'DungeonCanvas',
  components: { ZoneCanvas },
  props: {
    roomId: {
      type: String,
      required: true
    }
  },
  created () {
    this.scenes = [DungeonPreloadScene, DungeonScene]
  }
}
</script>
