<template>
  <div class="rpg-map-page">
    <div class="rpg-bg" />
    <header class="rpg-top">
      <nuxt-link to="/rpg" class="rpg-back">
        <i class="fas fa-door-open" />
      </nuxt-link>
      <h1>แผนที่การผจญภัย</h1>
      <nuxt-link to="/rpg/leaderboard" class="lb-link">
        <i class="fas fa-trophy" /> <span>กระดานผู้นำ</span>
      </nuxt-link>
    </header>

    <main class="map-body">
      <div class="parchment-panel">
        <img src="~/assets/images/rpg-world/map/compass.png" class="compass-icon" alt="">
        <img src="~/assets/images/rpg-world/map/banner.png" class="banner-icon" alt="">
        <h2 class="map-title">ตำนานนักผจญภัย</h2>

        <nuxt-link to="/rpg" class="region region-village">
          <img src="~/assets/images/rpg-world/map/houses.png" alt="">
          <span class="region-name">หมู่บ้าน</span>
        </nuxt-link>

        <nuxt-link to="/rpg/forest" class="region region-forest">
          <img src="~/assets/images/rpg-world/map/forest.png" alt="">
          <span class="region-name">ป่าต้องคำสาป</span>
        </nuxt-link>

        <nuxt-link to="/rpg/valley" class="region region-valley">
          <img src="~/assets/images/rpg-world/map/mountain.png" alt="">
          <span class="region-name">หุบเขาร้าง</span>
        </nuxt-link>

        <nuxt-link to="/rpg/dungeon" class="region region-dragon">
          <img src="~/assets/images/rpg-world/map/volcano.png" alt="">
          <span class="region-name">ประตูสู่รังมังกร</span>
        </nuxt-link>
      </div>

      <div class="map-legend">
        <span class="legend-item"><i class="fas fa-map-marker-alt unlocked-dot" /> เข้าไปเล่นได้แล้ว</span>
        <span class="legend-item"><i class="fas fa-lock locked-dot" /> กำลังพัฒนา</span>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'RpgWorldMap',
  middleware: 'middlewareAuth'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Kanit:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.rpg-map-page {
  min-height: 100vh; min-height: 100dvh;
  background: #140f1e;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  position: relative;
  overflow-x: hidden;
}

.rpg-bg {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(232, 179, 74, 0.06), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(124, 60, 168, 0.12), transparent 45%);
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
  background: rgba(20, 15, 30, 0.6);
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

.map-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 28px 16px calc(28px + env(safe-area-inset-bottom));
}

.parchment-panel {
  position: relative;
  width: min(640px, 100%);
  height: 460px;
  background-image: url('~/assets/images/rpg-world/map/parchment.png');
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.3);
}

.compass-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  opacity: 0.85;
}
.banner-icon {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  opacity: 0.9;
}
.map-title {
  position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Cinzel', serif;
  font-size: 16px;
  color: #4a3620;
  margin: 0;
  white-space: nowrap;
}

.region {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.region:hover { transform: scale(1.08); }
.region img { width: 56px; height: 56px; }
.region-name {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  color: #4a3620;
  background: rgba(244, 233, 208, 0.75);
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.region.locked { cursor: default; opacity: 0.55; }
.region.locked:hover { transform: none; }
.region.locked img { filter: grayscale(60%); }
.region-lock {
  font-size: 9px;
  color: #8a6a3a;
  display: flex;
  align-items: center;
  gap: 3px;
}

.region-village { top: 300px; left: 90px; }
.region-forest { top: 190px; left: 220px; }
.region-valley { top: 260px; left: 380px; }
.region-dragon { top: 130px; left: 480px; }

.map-legend {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: rgba(237, 230, 214, 0.6);
}
.legend-item { display: flex; align-items: center; gap: 6px; }
.unlocked-dot { color: #6fdba0; }
.locked-dot { color: rgba(237, 230, 214, 0.4); }

@media (max-width: 520px) {
  .parchment-panel { height: 380px; }
  .region img { width: 42px; height: 42px; }
  .region-village { top: 250px; left: 40px; }
  .region-forest { top: 160px; left: 140px; }
  .region-valley { top: 220px; left: 250px; }
  .region-dragon { top: 100px; left: 310px; }
}
.lb-link {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border: 1px solid rgba(232, 179, 74, 0.3);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px;
  color: #e8b34a;
  text-decoration: none;
}
.lb-link:hover { background: rgba(232, 179, 74, 0.1); }
</style>
