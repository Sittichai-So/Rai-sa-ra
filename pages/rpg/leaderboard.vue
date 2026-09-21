<template>
  <div class="rpg-lb-page">
    <div class="rpg-bg" />
    <header class="rpg-top">
      <nuxt-link to="/rpg" class="rpg-back">
        <i class="fas fa-arrow-left" />
      </nuxt-link>
      <h1>กระดานผู้นำ</h1>
    </header>

    <main class="lb-body">
      <section v-if="myStats" class="lb-card">
        <h2>สถิติของฉัน</h2>
        <div class="my-stats">
          <div class="ms-item">
            <span class="ms-val">{{ myStats.victories || 0 }}</span>
            <span class="ms-label">ชนะบอส</span>
          </div>
          <div class="ms-item">
            <span class="ms-val">{{ myStats.bestScore || 0 }}</span>
            <span class="ms-label">คะแนนสูงสุด</span>
          </div>
          <div class="ms-item">
            <span class="ms-val">{{ myStats.runs || 0 }}</span>
            <span class="ms-label">เล่นจบแล้ว</span>
          </div>
        </div>
      </section>

      <section class="lb-card">
        <h2>10 อันดับแรก</h2>
        <p v-if="loading" class="lb-empty">
          กำลังโหลด...
        </p>
        <p v-else-if="failed" class="lb-empty">
          โหลดกระดานผู้นำไม่สำเร็จ ลองใหม่อีกครั้งภายหลัง
        </p>
        <p v-else-if="leaderboard.length === 0" class="lb-empty">
          ยังไม่มีใครพิชิตดันเจี้ยน — เป็นคนแรกเลยสิ!
        </p>
        <ol v-else class="lb-list">
          <li
            v-for="row in leaderboard"
            :key="row.userId"
            class="lb-item"
            :class="{ 'lb-me': user && String(row.userId) === String(user._id) }"
          >
            <span class="lb-rank">#{{ row.rank }}</span>
            <span class="lb-name">{{ row.username }}</span>
            <span class="lb-best">{{ row.bestScore }}</span>
            <span class="lb-wins">ชนะ {{ row.victories }}</span>
          </li>
        </ol>
        <p class="lb-note">
          คะแนนมาจากจำนวนเหตุการณ์ที่ผ่านในดันเจี้ยน บวกโบนัสเมื่อพิชิตโทรลล์ได้
        </p>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'RpgLeaderboard',
  middleware: 'middlewareAuth',
  data () {
    let user = null
    try { user = JSON.parse(localStorage.getItem('userData')) } catch (e) {}
    return { user, leaderboard: [], myStats: null, loading: true, failed: false }
  },
  head () {
    return {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Kanit:wght@400;500;600;700&display=swap' }
      ]
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        const [lb, stats] = await Promise.all([
          this.$axios.$get(process.env.API_RPG_LEADERBOARD, { params: { limit: 10 } }),
          this.$axios.$get(process.env.API_RPG_MY_STATS)
        ])
        this.leaderboard = lb.result || []
        this.myStats = stats.result && stats.result.summary ? stats.result.summary : null
      } catch (error) {
        this.failed = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

.rpg-lb-page {
  min-height: 100vh; min-height: 100dvh;
  background: #140f1e;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  position: relative;
}
.rpg-bg {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(232, 179, 74, 0.06), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(124, 60, 168, 0.12), transparent 45%);
  pointer-events: none;
}
.rpg-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(232, 179, 74, 0.12);
}
.rpg-top h1 { margin: 0; font-size: 18px; font-weight: 600; }
.rpg-back {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(232, 179, 74, 0.35);
  color: #e8b34a;
  text-decoration: none;
}
.lb-body {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 16px calc(24px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lb-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(232, 179, 74, 0.18);
  border-radius: 14px;
  padding: 18px;
}
.lb-card h2 { margin: 0 0 12px; font-size: 15px; color: #f4d27a; }
.my-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ms-item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 6px; background: rgba(255, 255, 255, 0.04); border-radius: 10px; }
.ms-val { font-family: 'Cinzel', serif; font-size: 22px; color: #e8b34a; }
.ms-label { font-size: 12px; color: rgba(237, 230, 214, 0.6); }
.lb-empty { margin: 0; padding: 18px 0; text-align: center; font-size: 13px; color: rgba(237, 230, 214, 0.5); }
.lb-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.lb-item {
  display: grid;
  grid-template-columns: 44px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  border-radius: 10px;
}
.lb-item.lb-me { border-color: rgba(232, 179, 74, 0.4); }
.lb-rank { color: #e8b34a; font-family: 'Cinzel', serif; }
.lb-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lb-best { color: #e8b34a; font-family: 'Cinzel', serif; }
.lb-wins { color: #6fdba0; font-size: 12.5px; white-space: nowrap; }
.lb-note { margin: 12px 0 0; font-size: 12px; color: rgba(237, 230, 214, 0.45); }
</style>
