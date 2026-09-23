# CREDITS — Rai-Sara RPG Asset Credits

รวมเครดิตของ asset ทุกชิ้นที่ใช้ในเกม "ตำนานนักผจญภัย" (ทั้งระบบเดินสำรวจใหม่และระบบกระดานเดิม) จากไฟล์ `CREDITS.txt` ที่กระจายอยู่ตามโฟลเดอร์ asset เดิม รวมไว้ที่เดียวตามที่ Master Plan บท 1-10 กำหนด (ข้อ 1.8) **เพิ่ม asset ใหม่ทุกครั้งให้บันทึกไว้ในไฟล์นี้ (ไม่ใช่แยกไฟล์ CREDITS.txt ใหม่ตามโฟลเดอร์อีก)**

## กติกา
- ใช้ได้เฉพาะ asset สัญญาอนุญาต **CC0 / CC-BY / OGA-BY** เท่านั้น
- แพ็กที่เป็น CC-BY ต้องใส่บรรทัดเครดิตตามที่ระบุไว้ให้ครบ
- ห้ามใช้ตัวละครลิขสิทธิ์ (เช่นตัวละครจาก D&D อย่างเป็นทางการ) หรือภาพ/เสียงที่ไม่ทราบที่มา

---

## ระบบเดินสำรวจ (`/rpg`, `/rpg/forest`, `/rpg/valley`, `/rpg/dungeon`, `/rpg/cave`) — `assets/images/rpg-world/`

### หมู่บ้าน (Village) — พื้น/ต้นไม้/ของประดับ
**Open RPG Fantasy Tilesets (OpenRTP Tiles)** โดย finalbossblues — https://finalbossblues.itch.io/openrtp-tiles
ใบอนุญาต: **CC0 1.0** (ไม่ต้องให้เครดิต)
ตัดจาก `exterior.png` (RPG Maker 2000/2003 chipset, 16x16) แปลงพื้นหลังสีชมพู (255,103,139) เป็น alpha จริงก่อนตัด
ไฟล์: `tile_grass/dirt/water.png`, `tree_big/round/dead.png`, `bush_flower/green.png`, `stump.png`, `flower_patch.png`, `fence_h.png`, `signpost.png`, `well.png`, `campfire.png`, `torch.png`, `statue.png`, `monument.png`, `tent.png`, `bench.png`, `flowerpot.png`, `jug.png`

**Serene Village (revamped)** โดย LimeZu — https://limezu.itch.io/serenevillagerevamped
ใบอนุญาต: **CC-BY 4.0** — ต้องเครดิต **"LimeZu (limezu.itch.io)"**
ใช้เฉพาะสไปรต์บ้าน 4 หลัง: `house_red/green/blue.png`, `house_big.png`

### ตัวละครผู้เล่น/NPC/มอนสเตอร์ในโลกเดินสำรวจ
**Ninja Adventure Asset Pack** โดย pixel-boy (with AAA) — https://pixel-boy.itch.io/ninja-adventure-asset-pack
ใบอนุญาต: **CC0 1.0** (ไม่ต้องให้เครดิต)
ใช้: สไปรต์ตัวละคร/NPC/สัตว์ 4 ทิศเดินได้ (`sprites/`), รูปหน้า portrait (`portraits/`), ไอคอนไอเทม (`items/`)

**16x16 DungeonTileset II** โดย 0x72 — https://0x72.itch.io/dungeontileset-ii (v1.7)
ใบอนุญาต: **CC0 1.0** (ไม่ต้องให้เครดิต — ระบุไว้ในหน้าแพ็กว่า "ใช้ได้ตามใจ")
ใช้: walk-cycle สำรอง (`classes/*.png` เดิม เลิกใช้แล้ว ระบบปัจจุบันใช้ Ninja Adventure แทน)

### ป่าต้องคำสาป (Forest)
**Free Topdown Fantasy - Forest** โดย aamatniekss — https://aamatniekss.itch.io/topdown-fantasy-forest
ใบอนุญาต: ฟรีใช้ได้ทั้งส่วนตัว/เชิงพาณิชย์ ดัดแปลงได้ **ไม่ใช่ CC0** (ห้ามขายต่อ asset ดิบ ให้เครดิตถ้าทำได้) — **แพ็กเดียวในโปรเจกต์ที่ไม่ใช่ CC0** ทีมมีแผนเปลี่ยนเป็น OpenRTP ทั้งหมดในอนาคต (ดู `docs/rpg-roadmap.md`)
ใช้: `tile_grass/dirt/water/darkgrass.png`, `tree_bushy/pine.png`, `bush_big/small.png`, `log.png`, `reeds.png`, `boulder.png`, `tile_cliff.png`, `mushroom_cluster/single.png`

**OpenRTP Tiles** โดย finalbossblues — **CC0 1.0**
ใช้: `wild-tileset-openrtp.png` (พื้นหญ้า/หญ้าเข้ม/ดิน/น้ำ+ริมฝั่ง)

### ดันเจี้ยน (Dungeon) และถ้ำเก่า (Cave)
**16x16 DungeonTileset II** โดย 0x72 — **CC0 1.0**
ใช้: `dungeon-tileset.png` (พื้น/ผนัง 7 เฟรม), `knight.png` (ผู้เล่นเดิน 8 เฟรม), `ogre.png` (บอสโทรลล์ 8 เฟรม), `chest_full_open_anim_f0.png`, `wall_banner_red/blue.png`, `skull.png`, `floor_ladder.png`, `doors_leaf_closed.png`, `skelet_idle_anim_f0.png`, `flask_big_red.png` — โซนถ้ำเก่าที่เพิ่มภายหลัง (`/rpg/cave`) ใช้ tileset ชุดเดียวกันนี้ซ้ำ ไม่มี asset ใหม่

**OpenRTP Tiles** โดย finalbossblues — **CC0 1.0**
ใช้: `dungeon-tileset-openrtp.png` (พื้น/ผนังหินเขียวเทา), คบเพลิงร่วมกับหมู่บ้าน

### แผนที่โลก (`/rpg/map`)
**Cartography Pack** โดย Kenney — https://kenney.nl/assets/cartography-pack
ใบอนุญาต: **CC0 1.0** (ไม่ต้องให้เครดิต)
ตัดจาก `spritesheet_default.png` และ `parchmentFolded.png`
ไฟล์: `compass.png`, `houses.png` (หมู่บ้าน), `forest.png` (ป่าต้องคำสาป), `mountain.png` (หุบเขาร้าง — ใช้ซ้ำเป็นไอคอนถ้ำเก่าด้วย ปรับด้วย CSS filter grayscale/brightness ให้ต่างจากหุบเขา), `volcano.png` (ประตูสู่รังมังกร), `banner.png`, `parchment.png`

### เสียง
**RPG Audio / UI Audio / Impact Sounds** โดย Kenney — **CC0 1.0**
ใช้: เสียง UI (คลิก/ลูกเต๋า/เหตุการณ์/สมบัติ/ดาเมจ/ชนะ/แพ้)

**Ninja Adventure Asset Pack** โดย pixel-boy — **CC0 1.0**
ใช้: เพลงประจำโซน (Village, Dark Forest, Lost Village, Dungeon, Fight) + เสียง success/levelup/gameover/hit
ไฟล์ทั้งหมดแปลงเป็น MP3 เพื่อความเข้ากันได้กับ Safari/iOS

---

## ระบบกระดานเดิม (`/rpg/board`, ปิดใช้งานชั่วคราว) — `assets/images/rpg/`

**Isometric Miniature Dungeon** โดย Kenney — https://kenney.nl/assets/isometric-miniature-dungeon
ใบอนุญาต: **CC0 1.0** (ไม่ต้องให้เครดิต)
ใช้: พื้นดันเจี้ยนไอโซเมตริก, ส่วนประกอบฉาก (ประตู/กำแพง/บันได/ลัง/ถัง), `hero-monster.png` (สำรองไม่ได้ใช้งานจริงแล้ว)

**Isometric Hero and Creatures** โดย Clint Bellanger — https://opengameart.org/content/isometric-hero-and-creatures
ใบอนุญาต: **CC-BY 3.0** — ต้องเครดิต **Clint Bellanger**
ใช้: `hero-warrior/rogue/mage/cleric.png` (ตัวละครผู้เล่นทั้ง 4 คลาส), `monster-goblin/ogre/skeleton/boss/neutral.png` (มอนสเตอร์บนกระดาน ปรับสีด้วย ColorMatrix)

**Nature Kit** โดย Kenney — **CC0 1.0**
ใช้: ต้นไม้ประดับฉากป่า 2 ต้น (`tree_pineTallA_detailed`, `tree_oak`) ปรับสีด้วย ColorMatrix

---

## เกม Zombie Strike — (อ้างอิงแยกต่างหาก ถ้ามี ให้เพิ่มที่นี่เมื่อพบไฟล์ CREDITS เดิม)

*ยังไม่ได้รวมไว้ที่นี่ — ถ้าพบไฟล์เครดิตของ Zombie Strike ให้เพิ่มหัวข้อนี้ตอนแก้ไขครั้งถัดไป*

---

## มังกรเฒ่าไฟกาฬ (บท 4, 9, 10)

**RPG Enemies: 11 Dragons** โดย Stephen "Redshrike" Challener, MrBeast, Surt, Blarumyrran, Sharm, Zabin — https://opengameart.org/content/rpg-enemies-11-dragons
ใบอนุญาต: **CC-BY 3.0** — ต้องเครดิต **"Credit to: Stephen "Redshrike" Challener, MrBeast, Surt, Blarumyrran, Sharm, Zabin"**
`dragon_ancient.png` ตัดจากภาพตัวมังกรสามหัวขนาดใหญ่ตรงกลางชีต (ตัวเด่นสุดในแพ็ก 11 ตัว) ใช้เป็นภาพนิ่งมุมด้านข้างวางไว้ชิดผนังบนของถ้ำมังกร ไม่มี walk-cycle 4 ทิศ (ตามสเปกที่ผู้ใช้กำหนด)

ผู้ใช้ยังดาวน์โหลด **Pixel Bosses. Yes!** (`Bosses.png` ในโฟลเดอร์เดียวกัน) มาเป็นตัวเลือกสำรอง แต่เลือกใช้แพ็กข้างต้นแทนเพราะเป็นตัวเลือกที่แผนแม่บทแนะนำเป็นอันดับแรกและมีสไปรต์มังกร "เฒ่า" ที่ดูใหญ่โตน่าเกรงขามชัดเจนกว่า — ไฟล์ `Bosses.png` เก็บไว้เผื่อใช้งานอื่นในอนาคต ยังไม่ได้ใช้จริงในเกม

## โซนใหม่ (บท 4, 10)

โซนใหม่ "ถ้ำมังกร" และ "หอคอยมรกาฬ" ตั้งใจใช้ tileset ถ้ำ/ดันเจี้ยนเดิมที่มีเครดิตอยู่แล้วด้านบน (0x72 DungeonTileset II / OpenRTP) ไม่ต้องเพิ่มรายการใหม่หากไม่มีการดาวน์โหลด asset เพิ่ม
