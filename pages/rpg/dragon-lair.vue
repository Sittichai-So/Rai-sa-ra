<template>
  <div class="rpg-dl-page">
    <div class="rpg-bg" />
    <header class="rpg-top">
      <nuxt-link to="/rpg/map" class="rpg-back">
        <i class="fas fa-door-open" />
      </nuxt-link>
      <h1>ถ้ำมังกร</h1>
    </header>
    <div class="party-row">
      <PartyCodeBar base-path="/rpg/dragon-lair" />
    </div>
    <main class="dl-body">
      <p class="hint">
        ใช้ปุ่มลูกศร หรือ W A S D เพื่อเดิน · E โต้ตอบ · Q ภารกิจ · I ถุงของ · L บันทึก DM — ระวังไอร้อนจากลาวาในถ้ำ
      </p>
      <DragonLairCanvas :key="roomId" :class-id="classId" :room-id="roomId" />
    </main>
  </div>
</template>

<script>
import DragonLairCanvas from '~/components/game/DragonLairCanvas.vue'
import PartyCodeBar from '~/components/game/PartyCodeBar.vue'
import { resolvePartyCode } from '~/utils/rpgParty'
import { rpgClassById } from '~/utils/rpgClasses'

export default {
  name: 'RpgDragonLair',
  components: { DragonLairCanvas, PartyCodeBar },
  middleware: 'middlewareAuth',
  data () {
    let user = null
    try { user = JSON.parse(localStorage.getItem('userData')) } catch (e) {}
    return { user, classId: rpgClassById(this.$route.query.classId) ? this.$route.query.classId : 'warrior' }
  },
  computed: {
    roomId () {
      return 'dragonlair-' + resolvePartyCode(this.$route, this.user)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Kanit:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.rpg-dl-page {
  min-height: 100vh; min-height: 100dvh;
  background: #1a0a08;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  position: relative;
  overflow-x: hidden;
}

.rpg-bg {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle at 30% 20%, rgba(220, 80, 30, 0.12), transparent 45%),
    radial-gradient(circle at 75% 75%, rgba(150, 30, 10, 0.1), transparent 45%);
  pointer-events: none;
  z-index: 0;
}

.rpg-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: calc(16px + env(safe-area-inset-top)) 20px 16px;
  border-bottom: 1px solid rgba(232, 179, 74, 0.15);
  background: rgba(26, 10, 8, 0.7);
}
.rpg-top h1 {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 18px;
  color: #f4e9d0;
}
.rpg-back {
  flex-shrink: 0;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(232, 179, 74, 0.3);
  color: #e8b34a;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
}
.rpg-back:hover { background: rgba(232, 179, 74, 0.1); }

.party-row {
  position: relative;
  z-index: 1;
  padding: 10px 16px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(232, 179, 74, 0.08);
}

.dl-body {
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
