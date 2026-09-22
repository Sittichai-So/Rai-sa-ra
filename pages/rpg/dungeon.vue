<template>
  <div class="dungeon-page">
    <div class="dungeon-bg" />
    <header class="dungeon-top">
      <nuxt-link to="/rpg/map" class="dungeon-back">
        <i class="fas fa-door-open" />
      </nuxt-link>
      <h1>ประตูสู่รังมังกร</h1>
    </header>
    <div class="party-row">
      <PartyCodeBar base-path="/rpg/dungeon" />
    </div>
    <main class="dungeon-body">
      <p class="hint">
        ใช้ปุ่มลูกศร หรือ W A S D เพื่อเดิน · E โต้ตอบ · Q ภารกิจ · I ถุงของ · L บันทึก DM
      </p>
      <DungeonCanvas :key="roomId" :room-id="roomId" :class-id="classId" />
    </main>
  </div>
</template>

<script>
import DungeonCanvas from '~/components/game/DungeonCanvas.vue'
import PartyCodeBar from '~/components/game/PartyCodeBar.vue'
import { resolvePartyCode } from '~/utils/rpgParty'
import { rpgClassById } from '~/utils/rpgClasses'

export default {
  name: 'RpgDungeon',
  components: { DungeonCanvas, PartyCodeBar },
  middleware: 'middlewareAuth',
  data () {
    let user = null
    try { user = JSON.parse(localStorage.getItem('userData')) } catch (e) {}
    return { user, classId: rpgClassById(this.$route.query.classId) ? this.$route.query.classId : 'warrior' }
  },
  computed: {
    roomId () {
      return 'dungeon-' + resolvePartyCode(this.$route, this.user)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Kanit:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.dungeon-page {
  min-height: 100vh; min-height: 100dvh;
  background: #0c0a10;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  position: relative;
  overflow-x: hidden;
}

.dungeon-bg {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle at 30% 20%, rgba(200, 90, 40, 0.08), transparent 45%),
    radial-gradient(circle at 75% 75%, rgba(60, 40, 100, 0.1), transparent 45%);
  pointer-events: none;
  z-index: 0;
}

.dungeon-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: calc(16px + env(safe-area-inset-top)) 20px 16px;
  border-bottom: 1px solid rgba(232, 179, 74, 0.15);
  background: rgba(12, 10, 16, 0.7);
}
.dungeon-top h1 {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 18px;
  color: #f4e9d0;
}
.dungeon-back {
  flex-shrink: 0;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(232, 179, 74, 0.3);
  color: #e8b34a;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
}
.dungeon-back:hover { background: rgba(232, 179, 74, 0.1); }

.party-row {
  position: relative;
  z-index: 1;
  padding: 10px 16px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(232, 179, 74, 0.08);
}

.dungeon-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 24px 16px calc(24px + env(safe-area-inset-bottom));
}
.hint {
  font-size: 12.5px;
  color: rgba(237, 230, 214, 0.6);
  text-align: center;
  max-width: 640px;
  margin: 0;
}
</style>
