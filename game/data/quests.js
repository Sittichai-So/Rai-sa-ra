export const QUESTS = {
  whispering_forest: {
    id: 'whispering_forest',
    title: 'เสียงกระซิบแห่งป่า',
    giver: 'elder',
    chapter: 1,
    description: 'ชาวบ้านรายงานว่ามีเสียงประหลาดดังออกมาจากป่าทางเหนือทุกค่ำคืน ผู้เฒ่าประจำหมู่บ้านต้องการให้คุณไปตรวจสอบ',
    location: 'ป่าต้องคำสาป (ทางเหนือของหมู่บ้าน)',
    objectives: [
      { id: 'travel', text: 'เดินทางไปยังป่าทางเหนือ', hint: 'เดินตามทางดินขึ้นเหนือจนสุดหมู่บ้าน แล้วกด E ที่ประตูออกผจญภัย', on: { type: 'PLAYER_ENTER_AREA', area: 'forest' }, satisfiedBy: { flag: 'visited:forest' } },
      { id: 'footprints', text: 'ตรวจสอบรอยเท้าปริศนา', hint: 'มองหารอยเท้าบนพื้นดินใกล้ทางเข้าป่า แล้วกด E เพื่อตรวจสอบ', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'forest_footprints' } },
      { id: 'source', text: 'ค้นหาต้นตอของเสียงกระซิบ', hint: 'เสียงกระซิบดังมาจากทางตะวันออกเฉียงเหนือ มองหาต้นไม้ใหญ่กลวง', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'whisper_source' } },
      { id: 'confront', text: 'เผชิญหน้ากับสิ่งมีชีวิตในป่า', hint: 'สิ่งที่ซ่อนอยู่น่าจะอยู่ลึกเข้าไปทางมุมตะวันออกเฉียงเหนือ เตรียมตัวให้พร้อมก่อนเข้าไป', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'shadow_wolf' } },
      { id: 'return', text: 'กลับไปรายงานผู้เฒ่าในหมู่บ้าน', hint: 'กลับไปที่หมู่บ้านแล้วคุยกับผู้เฒ่า', final: true }
    ],
    rewards: {
      gold: 60,
      exp: 80,
      items: [{ id: 'potion_large', qty: 1 }],
      flags: ['forestCleared', 'forestBossDefeated'],
      story: 'chapter2'
    },
    onAcceptFlags: ['elderQuestStarted', 'forestUnlocked']
  },
  silent_valley: {
    id: 'silent_valley',
    title: 'เสียงเงียบแห่งหุบเขา',
    giver: 'elder',
    chapter: 2,
    requires: { quest: 'whispering_forest', status: 'QUEST_COMPLETED' },
    description: 'หลังป่าสงบลง ผู้เฒ่าได้รับข่าวว่าหุบเขาร้างทางตะวันออกเงียบผิดปกติ นักเดินทางที่ผ่านไปไม่มีใครกลับมาเล่าเรื่องอะไรเลย',
    location: 'หุบเขาร้าง',
    objectives: [
      { id: 'travel', text: 'เดินทางไปยังหุบเขาร้าง', hint: 'เปิดแผนที่โลกแล้วเลือกหุบเขาร้าง', on: { type: 'PLAYER_ENTER_AREA', area: 'valley' }, satisfiedBy: { flag: 'visited:valley' } },
      { id: 'rockslide', text: 'ผ่านหินถล่มกลางทางไปให้ได้', hint: 'เดินไปกลางหุบเขา หินอาจถล่มลงมา', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'rockslide' } },
      { id: 'ladder', text: 'ลงไปตรวจสอบบันไดเชือกทางเหนือของหุบเขา', hint: 'มองหาบันไดเชือกที่ผาทางด้านขวาบน แล้วกด E', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'rickety_ladder' } },
      { id: 'return', text: 'กลับไปรายงานผู้เฒ่าในหมู่บ้าน', hint: 'กลับไปที่หมู่บ้านแล้วคุยกับผู้เฒ่า', final: true }
    ],
    rewards: {
      gold: 90,
      exp: 100,
      items: [{ id: 'potion_large', qty: 2 }],
      flags: ['valleyCleared', 'dragonGateKnown'],
      story: 'chapter3'
    },
    onAcceptFlags: ['valleyQuestStarted']
  },
  goblin_menace: {
    id: 'goblin_menace',
    title: 'ก็อบลินหน้าประตูหมู่บ้าน',
    giver: 'board',
    chapter: 1,
    description: 'ก็อบลินสอดแนมตัวหนึ่งแอบซุ่มอยู่ริมทางเหนือของหมู่บ้าน คอยขโมยผักและข่มขู่คนเดินผ่าน',
    location: 'ทางเดินริมประตูเหนือของหมู่บ้าน',
    objectives: [
      { id: 'defeat', text: 'กำจัดก็อบลินสอดแนมที่ซุ่มอยู่ริมทางเหนือ', hint: 'มันซุ่มอยู่บนทางดินใกล้ประตูเหนือ กด E เพื่อเข้าโจมตี', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'goblin_scout' } }
    ],
    rewards: { gold: 25, exp: 30, items: [{ id: 'bandage', qty: 2 }], flags: ['goblinMenaceSolved'] }
  },
  dragon_gate: {
    id: 'dragon_gate',
    title: 'ผู้พิทักษ์ประตูมังกร',
    giver: 'elder',
    chapter: 3,
    requires: { quest: 'silent_valley', status: 'QUEST_COMPLETED' },
    description: 'ลึกเข้าไปในภูเขาไฟทางตะวันออกมีประตูหินโบราณที่เชื่อกันว่านำไปสู่รังของมังกรเฒ่าไฟกาฬ แต่ก่อนจะเข้าใกล้ตัวมังกรได้ ต้องผ่านโทรลล์เขี้ยวเหล็กที่เฝ้าสะพานแรกให้ได้ก่อน',
    location: 'ประตูสู่รังมังกร',
    objectives: [
      { id: 'travel', text: 'เดินทางไปยังประตูสู่รังมังกร', hint: 'เปิดแผนที่โลกแล้วเลือกประตูสู่รังมังกร', on: { type: 'PLAYER_ENTER_AREA', area: 'dungeon' }, satisfiedBy: { flag: 'visited:dungeon' } },
      { id: 'guardian', text: 'ฝ่าผู้พิทักษ์ที่ขวางทางอยู่', hint: 'เดินลึกเข้าไปจนสุดทางเดิน จะเจอโทรลล์เขี้ยวเหล็กขวางสะพานอยู่', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'troll_bridge', success: true } },
      { id: 'return', text: 'กลับไปรายงานผู้เฒ่าในหมู่บ้าน', hint: 'กลับไปที่หมู่บ้านแล้วคุยกับผู้เฒ่า', final: true }
    ],
    rewards: {
      gold: 120,
      exp: 140,
      items: [{ id: 'potion_large', qty: 2 }, { id: 'sword_steel', qty: 1 }],
      flags: ['dragonGateCleared'],
      story: 'chapter4'
    },
    onAcceptFlags: ['dragonGateStarted']
  },
  ch4: {
    id: 'ch4',
    title: 'สิ่งที่มังกรรู้',
    giver: 'elder',
    chapter: 4,
    requires: { quest: 'dragon_gate', status: 'QUEST_COMPLETED' },
    description: 'ประตูสู่รังมังกรเปิดออกแล้ว ผู้เฒ่าขอให้คุณลงไปจัดการกับมังกรเฒ่าไฟกาฬที่กำลังตื่นขึ้นลึกลงไปในภูเขา',
    location: 'ถ้ำมังกร',
    objectives: [
      { id: 'travel', text: 'เดินทางไปยังถ้ำมังกร', hint: 'เปิดแผนที่โลกแล้วเลือกถ้ำมังกร', on: { type: 'PLAYER_ENTER_AREA', area: 'dragon_lair' }, satisfiedBy: { flag: 'visited:dragon_lair' } },
      { id: 'lava', text: 'ผ่านทางเดินลาวาให้ได้', hint: 'เดินลึกเข้าไปในถ้ำ จะเจอทางแคบที่มีลาวาไหลขวางอยู่', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'lava_crossing', success: true } },
      { id: 'bones', text: 'ตรวจสอบกองกระดูกนักผจญภัย', hint: 'มองหากองกระดูกใกล้ปากถ้ำ แล้วกด E เพื่อตรวจสอบ', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'adventurer_bones' } },
      { id: 'confront', text: 'เผชิญหน้ามังกรเฒ่าไฟกาฬ', hint: 'เดินเข้าไปให้สุดถ้ำ จะเจอมังกรนอนขดตัวอยู่บนกองสมบัติ', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'dragon_ancient' } },
      { id: 'listen', text: 'ฟังเรื่องราวของมังกร', hint: 'หลังต่อสู้ มังกรจะเล่าความจริงบางอย่างให้ฟัง', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'dragon_ancient' } },
      { id: 'return', text: 'กลับไปรายงานผู้เฒ่าในหมู่บ้าน', hint: 'กลับไปที่หมู่บ้านแล้วคุยกับผู้เฒ่า', final: true }
    ],
    rewards: {
      gold: 150,
      exp: 200,
      items: [],
      flags: ['ch4Cleared'],
      story: 'chapter5'
    },
    onAcceptFlags: ['ch4Started']
  },
  ch5: {
    id: 'ch5',
    title: 'บันทึกที่ถูกซ่อน',
    giver: 'healer',
    chapter: 5,
    requires: { quest: 'ch4', status: 'QUEST_COMPLETED' },
    description: 'หมอสมุนไพรที่สงสัยผู้เฒ่ามานาน ชี้ทางให้คุณไปค้นหาบันทึกเก่าที่ซ่อนอยู่ในถ้ำเก่า',
    location: 'ถ้ำเก่า',
    objectives: [
      { id: 'wall', text: 'ค้นหาห้องลับในถ้ำเก่า', hint: 'มองหาผนังที่ดูผิดปกติในถ้ำเก่า แล้วกด E เพื่อตรวจสอบ', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'cave_odd_wall' } },
      { id: 'journal', text: 'อ่านบันทึกร้อยปี', hint: 'เปิดกระเป๋าไอเทมแล้วดูบันทึกร้อยปีที่เก็บมาได้', on: { type: 'PLAYER_ITEM_GAINED', id: 'century_journal' } },
      { id: 'return', text: 'กลับไปหาหมอสมุนไพรในหมู่บ้าน', hint: 'กลับไปที่หมู่บ้านแล้วคุยกับหมอสมุนไพร', final: true }
    ],
    rewards: {
      gold: 90,
      exp: 160,
      items: [],
      flags: ['ch5Cleared'],
      story: 'chapter6'
    },
    onAcceptFlags: ['ch5Started']
  },
  ch6: {
    id: 'ch6',
    title: 'สิ่งที่หายไปจากหุบเขา',
    giver: 'elder',
    chapter: 6,
    requires: { quest: 'ch5', status: 'QUEST_COMPLETED' },
    description: 'หุบเขาร้างเงียบผิดปกติยิ่งกว่าเดิม มีบางอย่างกำลังดูดพลังชีวิตอยู่ที่นั่น',
    location: 'หุบเขาร้าง',
    objectives: [
      { id: 'clue', text: 'ตามหาทิศทางของวงพิธี', hint: 'มองหาซากสัตว์แปลกๆ ในหุบเขา แล้วกด E เพื่อตรวจสอบ', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'drained_corpse' } },
      { id: 'mist', text: 'ฝ่าหมอกม่วงให้ได้', hint: 'เดินลึกเข้าไปในหุบเขา จะเจอหมอกม่วงขวางทาง', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'purple_mist' } },
      { id: 'guardian', text: 'ปราบผู้เฝ้าวงพิธี', hint: 'เดินลึกเข้าไปจนสุด จะเจอปีศาจร่างใหญ่เฝ้าวงพิธีอยู่', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'ritual_guardian' } },
      { id: 'return', text: 'กลับไปรายงานผู้เฒ่าในหมู่บ้าน', hint: 'กลับไปที่หมู่บ้านแล้วคุยกับผู้เฒ่า', final: true }
    ],
    rewards: {
      gold: 180,
      exp: 240,
      items: [],
      flags: ['ch6Cleared'],
      story: 'chapter7'
    },
    onAcceptFlags: ['ch6Started']
  },
  lost_pup: {
    id: 'lost_pup',
    title: 'ลูกหมาป่าหลงทาง',
    giver: 'board',
    chapter: 1,
    description: 'ชาวบ้านได้ยินเสียงร้องคราง "แงว..." ริมทางกลางหมู่บ้าน ดูเหมือนลูกหมาป่าหลงฝูงมา ใครช่วยพามันกลับไปที',
    location: 'ริมทางกลางหมู่บ้าน',
    objectives: [
      { id: 'help', text: 'ช่วยพาลูกหมาป่ากลับไปหาฝูง', hint: 'ลูกหมาป่าอยู่ริมทางกลางหมู่บ้าน กด E เพื่อเข้าไปดู', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'lost_pup', choiceId: 'help' } }
    ],
    failOn: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'lost_pup', choiceId: 'ignore' },
    rewards: { gold: 15, exp: 25, items: [{ id: 'potion_small', qty: 1 }], flags: ['pupReturned'] }
  }
}

export const BOARD_QUEST_IDS = ['goblin_menace', 'lost_pup']
