<template>
  <div class="rpg-valley-page">
    <div class="rpg-bg" />
    <header class="rpg-top">
      <nuxt-link to="/rpg/map" class="rpg-back">
        <i class="fas fa-door-open" />
      </nuxt-link>
      <h1>หุบเขาร้าง</h1>
    </header>
    <div class="party-row">
      <PartyCodeBar base-path="/rpg/valley" />
    </div>
    <main class="valley-body">
      <template v-if="!classId">
        <h2 class="pick-title">เลือกคลาสตัวละครก่อนออกสำรวจ</h2>
        <div class="class-grid">
          <button
            v-for="c in rpgClasses"
            :key="c.id"
            type="button"
            class="class-card"
            @click="classId = c.id"
          >
            <i :class="'fas ' + c.icon" />
            <span class="class-name">{{ c.name }}</span>
            <span class="class-desc">{{ c.desc }}</span>
          </button>
        </div>
      </template>

      <template v-else>
        <p class="hint">
          ใช้ปุ่มลูกศร หรือ W A S D เพื่อเดิน · E โต้ตอบ · Q ภารกิจ · I ถุงของ · L บันทึก DM — หินอาจถล่มลงมาได้ทุกเมื่อ
        </p>
        <ValleyCanvas :key="roomId" :class-id="classId" :room-id="roomId" />
      </template>
    </main>
  </div>
</template>

<script>
import ValleyCanvas from '~/components/game/ValleyCanvas.vue'
import PartyCodeBar from '~/components/game/PartyCodeBar.vue'
import { RPG_CLASSES, rpgClassById } from '~/utils/rpgClasses'
import { resolvePartyCode } from '~/utils/rpgParty'

export default {
  name: 'RpgValley',
  components: { ValleyCanvas, PartyCodeBar },
  middleware: 'middlewareAuth',
  data () {
    let user = null
    try { user = JSON.parse(localStorage.getItem('userData')) } catch (e) {}
    return {
      classId: rpgClassById(this.$route.query.classId) ? this.$route.query.classId : null,
      user
    }
  },
  computed: {
    rpgClasses () {
      return RPG_CLASSES
    },
    roomId () {
      return 'valley-' + resolvePartyCode(this.$route, this.user)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Kanit:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.rpg-valley-page {
  min-height: 100vh; min-height: 100dvh;
  background: #171310;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  position: relative;
  overflow-x: hidden;
}

.rpg-bg {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(140, 110, 70, 0.08), transparent 45%),
    radial-gradient(circle at 80% 70%, rgba(90, 70, 40, 0.15), transparent 45%);
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
  background: rgba(23, 19, 16, 0.7);
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

.valley-body {
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

.pick-title {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  color: #f4e9d0;
  margin: 8px 0 4px;
}
.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 640px;
}
.class-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 14px;
  border-radius: 12px;
  border: 1px solid rgba(232, 179, 74, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: #ede6d6;
  cursor: pointer;
  text-align: center;
  font-family: 'Kanit', sans-serif;
  transition: all 0.15s ease;
}
.class-card:hover { border-color: #e8b34a; background: rgba(232, 179, 74, 0.1); }
.class-card i { font-size: 22px; color: #e8b34a; }
.class-name { font-weight: 700; font-size: 14px; }
.class-desc { font-size: 11.5px; color: rgba(237, 230, 214, 0.5); }
</style>
