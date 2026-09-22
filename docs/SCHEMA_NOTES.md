# SCHEMA_NOTES — รูปแบบข้อมูลจริงของระบบ RPG (สำหรับอ้างอิงก่อนเขียนเนื้อหาบท 4-10)

เอกสารนี้คือผล Phase 0 (สำรวจโค้ด) ของ `Rai-Sara RPG — Master Plan บท 1-10` สรุปรูปแบบข้อมูลจริงที่มีอยู่ในโค้ด
ไม่ใช่การออกแบบใหม่ — ใช้เอกสารนี้อ้างอิง field name ที่ถูกต้องก่อนเพิ่มเนื้อหาใหม่ทุกครั้ง

## 1. Quest (`game/data/quests.js`, ตรรกะที่ `game/systems/quests.js`)

```js
questId: {
  id: 'questId',
  title: 'ชื่อเควส',
  giver: 'elder',          // อ้างอิง npcId ใน npcs.js หรือ 'board' สำหรับเควสบอร์ด
  chapter: 3,               // ใช้แสดงผลเฉยๆ ไม่มีผลต่อ logic
  requires: { quest: 'silent_valley', status: 'QUEST_COMPLETED' },  // ไม่ใส่ = รับได้ทันที
  description: '...',
  location: '...',
  objectives: [
    { id: 'travel', text: '...', hint: '...', on: { type: 'PLAYER_ENTER_AREA', area: 'dungeon' }, satisfiedBy: { flag: 'visited:dungeon' } },
    { id: 'guardian', text: '...', hint: '...', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'troll_bridge', success: true } },
    { id: 'return', text: '...', hint: '...', final: true }   // final:true = objective นี้ถูก mark done อัตโนมัติตอน completeQuest เรียก ไม่ต้องมี on/hint ก็ได้แต่ใส่ไว้เพื่อโชว์ใน journal
  ],
  rewards: {
    gold: 120, exp: 140,
    items: [{ id: 'potion_large', qty: 2 }],   // id ต้องมีจริงใน items.js
    flags: ['dragonGateCleared'],               // setFlag อัตโนมัติ
    story: 'chapterFinale'                      // เซ็ต state.storyProgress (ยังไม่มีใครอ่านค่านี้ในโค้ดปัจจุบันนอกจาก conditions.js's cond.story — ใช้เป็น debug/future gate ได้)
  },
  onAcceptFlags: ['dragonGateStarted']   // setFlag ตอน startQuest สำเร็จ (ก่อนเช็ค objective ใดๆ)
}
```

**สถานะ**: `QUEST_NOT_STARTED → QUEST_ACCEPTED → QUEST_IN_PROGRESS → QUEST_COMPLETED / QUEST_FAILED`
`isReady(id)` = objective ที่ไม่ใช่ `final` ครบทุกตัวแล้ว → เรียก `completeQuest(id)` ได้ (มักเรียกจาก NPC dialogue choice `{completeQuest: id}`)

**`matches(on, event)` (ใช้ทั้งใน quests.js และ dm.js แยกกันแต่ logic เหมือนกัน)**: event ต้อง `type` ตรง แล้วทุก key อื่นใน `on` ต้องตรงกับ `event.payload[key]` เป๊ะ (`===`) — ไม่รองรับ range/partial match

**Event types ที่มีอยู่จริง** (จาก `game/systems/worldEvents.js`): `PLAYER_ENTER_AREA{area}`, `PLAYER_ENTER_GAME{area}`, `PLAYER_ENTER_DUNGEON{area}`, `PLAYER_INTERACT_NPC{npcId}`, `PLAYER_EVENT_RESOLVED{eventId,encounterId,choiceId,success,tier,kind}`, `PLAYER_ENEMY_DEFEATED{enemyId,encounterId,isQuestBoss}`, `PLAYER_RETURN_TO_VILLAGE{from,fresh}`, `PLAYER_COMPLETE_OBJECTIVE`, `PLAYER_INTERACT_ENCOUNTER{id}`, `PLAYER_LEVEL_UP{level}`, `PLAYER_ITEM_GAINED`, `QUEST_ACCEPTED/COMPLETED/FAILED{questId}`, `PLAYER_DISCOVER{id}`

**⚠️ ไม่มี event สำหรับ "บอสตาย" แยกจาก "event ทอยเต๋าสำเร็จ"** — `PLAYER_ENEMY_DEFEATED` ยิงเฉพาะจาก encounter ชนิด `type:'enemy'` (ระบบ Combat.js ต่อสู้หลายยก) ส่วนบอสแบบ dialogue-check ครั้งเดียว (เช่นโทรลล์) ยิง `PLAYER_EVENT_RESOLVED` แทน — **มังกรบท 4 ที่ plan อยากให้เป็นการต่อสู้หลายยกจริง (`endAtHpPercent`) จะยิง `PLAYER_ENEMY_DEFEATED`** ต้องผูก objective ด้วย event นี้ ไม่ใช่ `PLAYER_EVENT_RESOLVED`

## 2. DM Script (`game/data/dm.js`, ตรรกะที่ `game/systems/dm.js`)

```js
{
  id: 'scriptId',
  once: true,                                   // true = setFlag('dm:scriptId') กันเล่นซ้ำ ถ้าไม่ใส่ = เล่นได้ทุกครั้งที่ event ตรง
  on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'troll_bridge', success: true },
  if: { all: [...] },                            // เงื่อนไขเสริม เช็คผ่าน conditions.js (ดูหัวข้อ 8)
  delay: 700,                                    // ms ก่อนเปิด dialogue (ให้ popup อื่นปิดตัวก่อน)
  recap: true,                                   // (เฉพาะบางสคริปต์) แปะสรุปเควสปัจจุบันต่อท้าย pages อัตโนมัติ
  pages: [ { text: '...' }, { mode: 'dm', text: '...' } ],  // mode 'dm' = แสดงเป็นเสียง DM, ไม่ใส่ mode = ข้อความบรรยายปกติ (โทนเดียวกัน ต่างแค่ label)
  choices: [ { label: 'ก้าวเข้าไป', do: [ { setFlag: 'x' }, { startQuest: 'ch4' }, { travel: 'dungeon' }, { highlightMarker: 'footprints' }, { narrate: '...' }, { toast: '...' } ] } ]
}
```
หรือแบบ banner (ไม่ต้องกดต่อ, ปิดเอง):
```js
{ id: 'x', on: {...}, mode: 'banner', text: '...' }
```

**Action ที่ `runActions` รองรับจริง**: `setFlag`, `narrate` (เปิด banner ใหม่ซ้อน), `startQuest`, `serverInteract` (ต้องมี hook), `highlightMarker`, `travel`, `toast` — **ไม่มี** `giveItem`/`completeQuest`/`openShop` ใน dm.js (มีเฉพาะใน dialogue.js ของ NPC เท่านั้น — ดูหัวข้อ 3) ถ้าอยากให้ DM script ให้ไอเทม/เปิดร้าน ต้องเพิ่ม action handler ใหม่ใน `runActions` ของ `game/systems/dm.js` เอง

## 3. NPC (`game/data/npcs.js`, ตรรกะที่ `game/systems/dialogue.js`)

```js
npcId: {
  id: 'npcId', name: 'ชื่อ NPC', sprite: 'elder',
  rules: [
    { when: { quest: 'dragon_gate', ready: true }, start: 'report_dragon' },  // เช็คบนลงล่าง ตัวแรกที่ตรง = ใช้
    { start: 'intro' }   // fallback สุดท้าย ไม่มี when
  ],
  nodes: {
    nodeId: {
      pages: [ { mode: 'dm', text: '...' }, { text: '...' } ],  // หรือเป็น function: pages: ctx => [...] (ใช้ ctx.hint(questId) / ctx.pick(npcLineKey))
      choices: [
        { label: 'รับภารกิจ', do: [ { startQuest: 'ch4' }, { npc: { met: true } } ], next: 'accepted' },
        { label: 'ถามเพิ่ม', when: {...}, next: 'ask' }   // choice เองก็มี when ได้ (กรองด้วย conditions.js เหมือนกัน)
      ]
    }
  }
}
```

**Action ที่ dialogue.js's `runActions` รองรับ** (มากกว่า dm.js): `startQuest`, `completeQuest` (คืน reward แล้วเปิด loot panel อัตโนมัติผ่าน `session.reward`), `setFlag`, `npc` (patch npcState เช่น `{met:true}`), `giveItem`, `narrate`, `openShop` (`session.panel='shop'`), `openBoard`, `innRest`, `travel`

**`NPC_LINES`** (บทพูดสุ่มตามเงื่อนไข ใช้ผ่าน `ctx.pick(key)`): array ของ `{ when: {...}, text: '...' }` เรียงจากเงื่อนไขเฉพาะเจาะจงสุดไปทั่วไปสุด (ตัวสุดท้ายไม่มี `when` = fallback) — ใช้กับ "บทพูดสุ่ม/ตามสถานะ" ของ NPC รอง เช่น ป้ามาลี/หมอสมุนไพร/ชาวบ้าน ตามที่ plan ต้องการ

## 4. Event ทอยเต๋าแบบทอยครั้งเดียว (`back-rai-sara/src/rpg/Events.js`)

```js
eventId: {
  npc: { name: 'โทรลล์เขี้ยวเหล็ก', icon: 'fa-hand-fist', tier: 'large' },  // optional, ใช้โชว์เป็น "เจอ NPC/สัตว์" ไม่ใช่ NPC จริงในระบบ npcs.js
  title: 'โทรลล์ยึดสะพาน', text: '...',
  choices: [
    { id: 'fight', label: 'ต่อสู้ฝ่าไป', check: { stat: 'str', dc: 14 },
      success: { text: '...', itemGained: 'กระบองโทรลล์', statBonus: { str: 1 }, gold: 10, exp: 20, loot: true, setFlags: ['x'] },
      failure: { text: '...', hpDelta: -15 } }
  ]
}
```
- `check.stat` ต้องเป็น `str`/`agi`/`int` (ไม่มี wis/cha ในระบบนี้) — ทอย d20 + ค่า stat จริงของผู้เล่น (ไม่รวม gear bonus ต่างจาก Combat.js)
- `success`/`failure` รองรับ: `text`, `hpDelta` (ค่าลบ = เสีย), `damageRange: [min,max]` (สุ่มแทน hpDelta คงที่), `itemGained`, `statBonus: {str/agi/int: n}`, `gold`, `exp`, `loot: true` (เปิด treasure roll เพิ่มจาก `rollTreasure()`), `setFlags: []`, `keepAvailable: true` (event ไม่ถูก mark done เล่นซ้ำได้)
- **นี่คือระบบสำหรับเหตุการณ์ที่ "ทอยครั้งเดียวจบ" เท่านั้น** ไม่ใช่ Combat.js — บอสที่ต้องมี "เฟส"/"HP ที่ลดหลั่น"/"เกราะ" **ต้องอยู่ใน Combat.js's ENEMIES ไม่ใช่ Events.js**

## 5. ศัตรูแบบต่อสู้หลายยก (`back-rai-sara/src/rpg/Combat.js`)

```js
enemyId: {
  id: 'enemyId', name: '...', portrait: 'wolf', hp: 26, ac: 12, atk: 4, dmg: '1d6+2', fleeDc: 12,
  exp: 60, gold: [25, 40], loot: [{ item: 'ชื่อของ (ข้อความล้วน ไม่ใช่ item id จริง)', chance: 1 }],
  intro: '...', hit: ['...', '...'], miss: ['...', '...'], defeat: '...'
}
```
- **ไม่มี field `phases`, `endAtHpPercent`, `armored` อยู่ในปัจจุบัน** — ทั้งหมดต้องเพิ่มใหม่ (ดูหัวข้อ 9 ว่าใครต้องแก้)
- `loot[].item` เป็น**ข้อความ**ไม่ใช่ item id (เข้าสู่ inventory ผ่าน `describeItem()` fallback เป็น trophy ขายได้อย่างเดียว equip ไม่ได้) — ถ้าต้องการรางวัลที่ equip ได้ (เช่นเกล็ดมังกร) ต้องให้ผ่าน quest/dialogue reward (`items:[{id,...}]`) ไม่ใช่ผ่าน `loot`
- `CLASS_SKILLS` (skill เฉพาะคลาส) อยู่ไฟล์เดียวกัน — ต่อ 1 คลาส 1 สกิลคงที่ ไม่มีระบบเรียนสกิลใหม่/เลือกสกิล
- flow การจบสู้ปัจจุบัน: จบเมื่อ `enemy.hp <= 0` เท่านั้น (`enemyRound()` เช็คบรรทัดแรก) — ไม่มี hook ระหว่างยกให้ตรวจ "ถึง % นี้แล้วให้จบเลย"

## 6. Item (`game/data/items.js` ฝั่งหน้าบ้าน + `back-rai-sara/src/rpg/Combat.js`'s `ITEM_EFFECTS` ฝั่งหลังบ้านสำหรับไอเทมใช้ฟื้นพลัง)

```js
itemId: { id: 'itemId', name: '...', type: 'weapon'|'armor'|'consumable', slot: 'weapon'|'armor', atk: 2, ac: 2, heal: 40, price: 90, sell: 36, icon: 'sword'|'armor'|'potion_red'|'potion_blue', desc: '...' }
```
- `slot` มีแค่ `weapon`/`armor` สอง slot คงที่ (ไม่มี accessory/ring) — gear bonus ถูก clamp ที่ `MAX_GEAR_BONUS = 3` ฝั่ง server (`RpgWorldRoom.js` บรรทัด 10) **ถ้าเทียร์ 4-5 ให้ atk/ac เกิน 3 ต้องขยับค่านี้ก่อน ไม่งั้นโดน clamp เงียบๆ**
- ไอเทม `consumable` ที่ใช้ตอนต่อสู้/นอกสู้ได้ต้องเพิ่มคู่กันทั้งสองไฟล์ (frontend `items.js` สำหรับร้านค้า/แสดงผล + backend `Combat.js`'s `ITEM_EFFECTS` สำหรับ heal จริง) — ไอเทมเนื้อเรื่อง (เกล็ดมังกร ฯลฯ) ที่ "ขายไม่ได้ทิ้งไม่ได้" **ไม่มี mechanism ห้ามขาย/ทิ้งอยู่ในโค้ดปัจจุบัน** (shop คำนวณราคาขายจาก `sell` ทุกไอเทมใน inventory เหมือนกันหมด) ต้องเพิ่ม field ใหม่ (เช่น `questItem: true`) แล้วแก้ `HudShop.vue`/`controller.sell()` ให้เช็ค field นี้

## 7. Zone Encounter (`back-rai-sara/src/rpg/WorldZones.js`)

```js
export const RESPAWN_POINTS = { zoneName: { x, y } }
export const ENCOUNTERS = {
  zoneName: [
    { id: 'x', type: 'enemy'|'dialogue'|'treasure'|'trap'|'rest', enemy: 'enemyId', eventId: 'eventId', trigger: 'proximity'|'interact', x, y, radius, isBoss: true, isQuestBoss: true, healAmount: 15 }
  ]
}
export const RANDOM_ENCOUNTERS = { zoneName: { minDistance, cooldownMs, safe: [{x,y,r}], table: {enemy,treasure,trap,npc,story,nothing}, enemies: [...], npcEvents: [...], storyEvents: [...] } }
```
- **`ENCOUNTERS` คีย์ด้วย `zone` string เดี่ยวเท่านั้น ไม่มีแนวคิด "variant" อยู่เลยในปัจจุบัน** — นี่คือช่องว่างใหญ่ที่สุดสำหรับ section 6.4 ของ master plan (ต้องออกแบบใหม่ ดูหัวข้อ 9)
- `isBoss: true` (บนตัว encounter ไม่ใช่ตัวศัตรู) = ชนะแล้วยิง `worldVictory` + บันทึกลง leaderboard (`persistRpgRuns`) — ใช้ได้ทั้ง `type:'enemy'` และ `type:'dialogue'`
- พิกัด x/y ต้อง**ตรงกันเป๊ะ**กับพิกัดฝั่ง client (`game/maps/<zone>Map.js`'s `ENCOUNTER_MARKERS`) — ไม่มีการแชร์ไฟล์ระหว่าง repo ต้อง sync มือทุกครั้ง (สาเหตุบั๊กที่เคยเกิดหลายรอบ ดู `docs/rpg-roadmap.md`)

## 8. Flag/Condition (`game/systems/conditions.js`, ใช้ตรงกันทั้ง quest/dm/npc rule)

```js
{ flag: 'x' } | { notFlag: 'x' }
{ quest: 'id', status: 'QUEST_COMPLETED' | [...] , ready: true, active: true, available: true }
{ npc: 'npcId', key: 'met', equals: true }
{ all: [...] } | { any: [...] } | { not: {...} }
{ level: {gte: 5} } | { gold: {gte: 100} } | { item: 'id', qty: 2 } | { story: 'chapter2' | [...] }
```
- `setFlag(name)` ไม่มี namespace บังคับ — ตัวอย่างที่มีอยู่จริงใช้ตรงตัว (`prologueSeen`, `forestUnlocked`) และแบบมี prefix คั่นด้วย `:` (`visited:forest`) เอง — **master plan เขียนไว้ว่า "ถ้าโค้ดใช้ `ns:key` ให้แปลงเป็น" — สรุปคือไม่มีมาตรฐานบังคับ ใช้ชื่อตรงตามตารางหัวข้อ 8 ของ master plan ได้เลยแบบไม่มี prefix (เช่น `trust_dragon`) เพื่อความง่าย**

## 9. Save (`back-rai-sara/src/model/rpgSave.model.js` + `src/rpg/rpgSave.service.js`)

Mongo schema เป็น `Schema.Types.Mixed` ล้วน (`data`, `cleared`) — **ไม่ต้อง migrate schema เลยสำหรับ field ใหม่ใดๆ** แต่ `rpgSave.service.js`'s `sanitizeProfile()`/`loadCleared()`/`markCleared()` มี **allowlist ฮาร์ดโค้ด** ที่ต้องแก้ไขทุกครั้งที่เพิ่มโซนใหม่ ไม่งั้นข้อมูลโซนนั้นถูกทิ้งเงียบๆ:

```js
const MAPS = ['village', 'forest', 'valley', 'dungeon']   // ใช้เช็ค currentMap ก่อนบันทึก
const ZONES = ['village', 'forest', 'valley', 'dungeon']  // ใช้เช็คก่อน loadCleared/markCleared
```

**🐛 พบบั๊กจริงระหว่างสำรวจ (ไม่เกี่ยวกับบท 4-10 โดยตรง แต่กระทบทันที)**: โซน `cave` ที่เพิ่งสร้างเสร็จก่อนหน้านี้ **ไม่ได้ถูกเพิ่มเข้าสองรายการนี้** ผลคือ (1) ถ้าผู้เล่น save ขณะอยู่ในถ้ำเก่า แล้วโหลดใหม่ `currentMap` จะถูกรีเซ็ตกลับเป็น `'village'` เงียบๆ (2) หีบ/กับดักที่เก็บในถ้ำเก่าจะไม่ถูกจำว่าเก็บแล้วข้ามเซสชัน (ไม่ error แค่เงียบๆ ไม่ persist) — **ต้องเพิ่ม `'cave'`, `'dragon_lair'`, `'mork_tower'` เข้าทั้งสอง array นี้ตอน Phase 1** (แก้ง่าย แค่เพิ่ม string แต่ถ้าลืมจะดีบั๊กยากเพราะไม่มี error/warning ใดๆ)

**Sanitizer อื่นที่ควรรู้**: `worldFlags` จำกัด 500 key, `inventory` จำกัด 60 ชิ้น, `quests` จำกัด 40 เควส (แต่ละเควสจำกัด 20 objective) — ตัวเลขพวกนี้เพียงพอสำหรับบท 4-10 แต่ถ้าเควสต์รวมเกิน 40 หรือ flag รวมเกิน 500 (มีความเป็นไปได้เมื่อรวม flag ทั้งหมดในหัวข้อ 8 ของ master plan + ของเดิม) ต้องขยับค่าพวกนี้ด้วย — **ตอนนี้ flag ใหม่ตามตาราง master plan มีประมาณ 14 ตัว รวมของเดิมไม่น่าเกิน 30 ตัว ยังไม่ชนขีดจำกัด**
**Anti-cheat การเติบโต (`withinGrowth`)**: จำกัดทองคำ/EXP ที่เพิ่มได้ต่อครั้งตามเวลาที่ผ่านไป (กันโกงยิง save ถี่ๆ) ไม่กระทบเนื้อหาปกติ แต่ถ้า reward เควสตอนจบเกมให้ทองคำ/EXP ก้อนใหญ่มากในทีเดียว (เช่นจบบท 10 ให้ EXP เยอะมาก) ให้เช็คว่าตัวเลขไม่ชน `GOLD_BURST=400`/`EXP_BURST=300` ต่อการ save หนึ่งครั้ง (ระบบ debounce ผลัก save ทุก 5 วิอยู่แล้วปกติไม่ชน แต่ reward ก้อนใหญ่ตอนจบบทควรระวัง)

## 10. ขั้นตอนสร้างโซนใหม่ (ยืนยันจริงจากการสร้างโซน `cave` ในเซสชันก่อนหน้า)

Master plan อยากได้ 2 โซนใหม่ (ถ้ำมังกร, หอคอยมรกาฬ) — ขั้นตอนที่ใช้ได้จริง (สร้างไฟล์ 5+2 ไฟล์ต่อโซน):

**ฝั่ง frontend**:
1. `game/maps/<zone>Map.js` — export `TILE`/`WALL_FRAMES`/`TILE_SIZE`/`MAP_COLS`/`MAP_ROWS`/`buildRoomMap()`/`spawnPoint()`/`DECORATIONS`/`ENCOUNTER_MARKERS`/`LOCAL_INTERACTABLES` (รูปแบบเดียวกับ `dungeonMap.js`/`caveMap.js`) — **กำแพงด้านบนต้อง 2 แถว (แถวลาย + แถวทึบ) กำแพงด้านอื่น 1 แถวพอ** (บั๊กที่เจอมาแล้วในดันเจี้ยน/ถ้ำเก่า)
2. `game/scenes/<Zone>PreloadScene.js` — โหลดภาพ, จบด้วย `this.scene.start('<Zone>')`
3. `game/scenes/<Zone>Scene.js` — extends `ZoneScene`, implement `buildWorld()`/`addPlayerColliders()`/`markerDefs()`/`worldReady()`
4. `components/game/<Zone>Canvas.vue` — ห่อ `ZoneCanvas` พร้อม `zone="<zone>"`, `:scenes`, `:room-id`, `:class-id`
5. `pages/rpg/<zone>.vue` — มี class picker ถ้าอยากให้เข้าตรงได้โดยไม่ผ่าน travel()
6. เพิ่ม `<zone>: '/rpg/<zone>'` ใน `ROUTES` ของ `game/systems/worldController.js`
7. ถ้าอยากมีวงจรกลางวัน-กลางคืน ให้ตรวจ `showDayNight()` ใน `ZoneCanvas.vue` (ปัจจุบัน exclude `dungeon`/`cave` เพราะเป็นที่ในร่ม — ถ้ำมังกร/หอคอยก็ควร exclude เช่นกัน)

**ฝั่ง backend**: เพิ่ม `RESPAWN_POINTS[zone]`, `ENCOUNTERS[zone]`, (ถ้าต้องการ) `RANDOM_ENCOUNTERS[zone]` ใน `WorldZones.js` — พิกัดต้องตรงกับฝั่ง client เป๊ะ

**การเชื่อมจากอนุสาวรีย์/ทางเข้าเฉพาะจุด** (ไม่ใช่จากแผนที่โลก): ดูรูปแบบ `village_gate` ใน `dm.js`/`npcs.js` — ใช้ `PLAYER_INTERACT_ENCOUNTER` + `LOCAL_INTERACTABLES` kind พิเศษ ผูกกับ `onLocalInteract()` ใน `worldController.js` (ปัจจุบันรองรับ kind: `npc`/`gate`/`board`/`sign`/`exit` — ทางเข้าหอคอยใต้อนุสาวรีย์ต้องเพิ่ม kind ใหม่ เช่น `tower_entrance` หรือใช้ `gate` เดิมแล้วเปลี่ยนปลายทาง)

## 11. ประเมินงานหัวข้อ 6 ของ Master Plan: ข้อมูลล้วน vs ต้องเขียน logic ใหม่

| หัวข้อ | ระดับงาน | รายละเอียด |
|---|---|---|
| 6.1 เลเวล/EXP | **แก้ค่าคงที่** | `MAX_LEVEL`/`HP_PER_LEVEL` ใน `RpgWorldRoom.js` (backend) + `EXP_PER_LEVEL`/`MAX_LEVEL` ใน `game/systems/gameState.js` (frontend, ปัจจุบันคำนวณ level จาก exp ฝั่ง client ล้วนๆ ไม่ใช่ server-authoritative — เป็นจุดที่ปลอดภัยอยู่แล้วเพราะ exp มาจาก reward ที่ server ควบคุมทางอ้อมผ่าน sanitizer's `withinGrowth`) ต้องแก้สูตร `levelFromExp`/`expIntoLevel` ให้ไม่คงที่ต่อเลเวลแล้ว (ปัจจุบันหาร EXP_PER_LEVEL ตรงๆ ใช้ไม่ได้กับสูตรขั้นบันไดใหม่ ต้องเขียนใหม่เป็น loop สะสม) |
| 6.2 ไอเทม 5 เทียร์ | **ข้อมูลล้วน** | เพิ่มใน `items.js`/`SHOP_STOCK` เหมือนที่ทำกับเทียร์ 2 ไปแล้ว ยกเว้นไอเทม "ขายไม่ได้" ต้อง logic ใหม่เล็กน้อย (ดูหัวข้อ 6) |
| 6.3.1 `endAtHpPercent` | **logic ใหม่** | เพิ่มเช็คใน `enemyRound()`/`resolveAttack()` (Combat.js) และ `endCombat()` (rpgWorldHandler.js) |
| 6.3.2 เฟสบอส | **logic ใหม่ (ใหญ่)** | ต้องขยาย `combat` state ให้เก็บเฟสปัจจุบัน, ส่ง `phaseChanged` event ใหม่ให้ client เปลี่ยน sprite/scale/tint กลางการต่อสู้ (ปัจจุบันไม่มี event นี้เลย ต้องเพิ่ม socket event ใหม่ + handler ฝั่ง client) |
| 6.3.3 เกราะ | **logic ใหม่** | เพิ่ม field `armored`/`armorBroken` ใน combat state, ปรับสูตรดาเมจใน `resolveAttack()` |
| 6.3.4 เรียกลูกน้อง | **logic ใหม่** | ปัจจุบัน combat รองรับศัตรูตัวเดียวต่อครั้งเท่านั้น (`player.combat.enemy` เป็น object เดี่ยว) ต้องเปลี่ยนเป็น array หรือระบบ "เรียก encounter ใหม่ต่อคิว" — เป็นงานใหญ่สุดในหมวดนี้ ควรพิจารณาว่าจะ simulate ด้วยวิธีง่ายกว่า (เช่น ลูกน้องที่เรียกมาเป็นแค่ debuff/ดาเมจเสริมไม่ใช่ตัวที่ต้องเลือกโจมตีแยก) เพื่อลดงาน |
| 6.3.5 ดูดชีวิต | **logic ใหม่ (เล็ก)** | เพิ่มใน `enemyTurn()`: ถ้า enemy มี field `lifesteal: true` ให้ enemy.hp += damage ที่ทำ |
| 6.4 zone variant | **logic ใหม่ (ใหญ่)** | ต้องออกแบบใหม่ทั้งการเก็บ variant (แนะนำ: เก็บเป็น field บน player save เช่น `state.zoneVariants[zone]` คำนวณจาก flag ตอน `worldJoin`, ส่งไปเป็นส่วนหนึ่งของ payload `worldJoined`) และแก้ `ENCOUNTERS`/`RESPAWN_POINTS` ให้ index ด้วย `zone+variant` หรือฟังก์ชันเลือกชุดข้อมูลแทน object ตรงๆ |
| 6.5 พันธมิตร | **ข้อมูลล้วนเป็นหลัก** | เก็บเป็น flag ธรรมดา อ่านค่าตอนคำนวณ encounter ของบท 9/10 (ส่วนที่เป็น logic คือ "อ่าน flag แล้วปรับ encounter list" ซึ่งเป็นส่วนหนึ่งของ 6.4 อยู่แล้ว) |
| 6.6 ป้องกันมังกร (multi-wave) | **logic ใหม่ (ใหญ่)** | ไม่มีแนวคิด "ต่อสู้หลายระลอกในเหตุการณ์เดียว" ในระบบปัจจุบันเลย (encounter ปัจจุบันคือ "ครั้งเดียวจบ") ต้องออกแบบ event orchestration ใหม่ทั้งหมด แนะนำให้ทำเป็นเควสเชนของ event ธรรมดา 3 event ต่อเนื่องกันแทนการสร้างระบบ "wave" ใหม่ทั้งระบบ (ประหยัดงานกว่ามาก ได้ผลลัพธ์เหมือนกัน) |

## 12. ข้อขัดแย้งระหว่างเอกสาร Master Plan กับโค้ดจริงที่ต้องตัดสินใจก่อน Phase 1

1. **ชื่อเควส**: master plan อ้างอิง `startQuest: ch4` ทั่วเอกสาร แต่บทที่ 3 ที่มีอยู่จริงใช้ quest id `dragon_gate` (คนละชื่อกับที่ plan สมมติ) — เสนอ: ใช้ `ch4`..`ch10` ตามที่ plan เขียนไว้เป๊ะสำหรับเควสใหม่ (ไม่ต้องเปลี่ยนชื่อ `dragon_gate` เดิม เพราะเปลี่ยนชื่อ quest id ที่มีอยู่แล้วจะทำให้เซฟผู้เล่นเก่าที่มีเควสนี้ค้างอยู่พังได้)
2. **บั๊ก MAPS/ZONES allowlist ไม่รวม `cave`** (หัวข้อ 9 ด้านบน) — ควรแก้เป็นงานแรกสุดของ Phase 1 ก่อนเพิ่มโซนใหม่อีก 2 โซน ไม่งั้นจะเจอบั๊กเดิมซ้ำอีก 2 รอบ
3. **`MAX_GEAR_BONUS = 3`** — ถ้าไอเทมเทียร์ 4-5 ตั้งใจให้ atk/ac มากกว่า +3 ต้องขยับค่านี้ก่อน ไม่งั้นค่าจะโดน clamp เงียบๆ ไม่มี error แนะนำให้ตัดสินใจตัวเลขเทียร์ 3-5 ก่อนเริ่ม Phase 1.2
4. **6.3.4 เรียกลูกน้อง**: เสนอให้ simulate แบบง่าย (ดูหัวข้อ 11) แทนการสร้างระบบ multi-enemy combat เต็มรูปแบบ เพื่อประหยัดงานหลายเท่า ผลลัพธ์ในเกม (ความรู้สึกยาก/มีลูกน้องช่วย) ยังได้เหมือนเดิม
5. **6.6 ป้องกันมังกร**: เสนอให้ทำเป็นเควสเชน event ต่อเนื่อง 3 event (ของเดิมมีอยู่แล้ว) แทนการสร้างระบบ "wave" ใหม่ทั้งระบบ ตามเหตุผลในหัวข้อ 11
6. **`loot[].item` ใน Combat.js เป็นข้อความ ไม่ใช่ item id จริง** — เกล็ดมังกร/ไอเทมเนื้อเรื่องอื่นที่ต้องใช้ต่อ (equip ได้/ใช้เป็นเงื่อนไข) ต้องแจกผ่านทาง quest reward หรือ NPC dialogue's `giveItem` เท่านั้น ห้ามแจกผ่าน enemy `loot` field
7. **ไม่มี mechanism "ขายไม่ได้/ทิ้งไม่ได้"** สำหรับไอเทมเนื้อเรื่องในโค้ดปัจจุบัน — ต้องเพิ่ม field ใหม่ (เสนอ `questItem: true`) และแก้จุดขาย/ทิ้ง 1-2 จุด

---
*เอกสารนี้เป็นผล Phase 0 ของ Master Plan บท 1-10 (อ่านโค้ดจริง ไม่แก้โค้ด) สร้างโดย Claude Sonnet 5 วันที่ 22 กันยายน 2026 — รอการยืนยันจากเจ้าของโปรเจกต์ตามข้อ 0.5 ก่อนเริ่ม Phase 1*
