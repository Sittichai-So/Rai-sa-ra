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
      exp: 770,
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
      exp: 350,
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
      gold: 260,
      exp: 710,
      items: [],
      flags: ['ch6Cleared'],
      story: 'chapter7'
    },
    onAcceptFlags: ['ch6Started']
  },
  ch7: {
    id: 'ch7',
    title: 'หน้ากากหลุด',
    giver: 'elder',
    chapter: 7,
    requires: { quest: 'ch6', status: 'QUEST_COMPLETED' },
    description: 'ผู้เฒ่าเปิดเผยตัวตนที่แท้จริงว่าคือมรกาฬ ปลุกกองทัพโครงกระดูกทั่วหมู่บ้าน คุณต้องช่วยคนที่ทำได้แล้วหนีออกไป',
    location: 'หมู่บ้านลมเย็น',
    objectives: [
      { id: 'monument', text: 'ไปที่อนุสาวรีย์เก่ากลางหมู่บ้าน', hint: 'อนุสาวรีย์อยู่ทางทิศตะวันตกของหมู่บ้าน', on: { type: 'PLAYER_INTERACT_ENCOUNTER', id: 'monument_reveal' } },
      { id: 'commander', text: 'ปราบแม่ทัพกระดูกที่ประตูหมู่บ้าน', hint: 'แม่ทัพกระดูกขวางทางออกที่ประตูเหนืออยู่', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'bone_commander' } },
      { id: 'return', text: 'หนีเข้าป่าไปรวมกับผู้รอดชีวิต', hint: 'เดินทางไปป่าทางเหนือแล้วคุยกับชาวบ้านหัวฟักทอง', final: true }
    ],
    rewards: {
      gold: 300,
      exp: 790,
      items: [],
      flags: ['ch7Cleared'],
      story: 'chapter8'
    },
    onAcceptFlags: ['ch7Started']
  },
  ch8: {
    id: 'ch8',
    title: 'ผู้ถูกเนรเทศ',
    giver: 'villager',
    chapter: 8,
    requires: { quest: 'ch7', status: 'QUEST_COMPLETED' },
    description: 'ผู้รอดชีวิตตั้งค่ายในป่า คุณต้องรวบรวมพันธมิตรอย่างน้อยหนึ่งฝ่ายก่อนมรกาฬจะไปถึงมังกร',
    location: 'ค่ายผู้ลี้ภัยในป่า',
    objectives: [
      { id: 'return', text: 'ชวนพันธมิตรอย่างน้อยหนึ่งฝ่าย แล้วกลับไปที่กองไฟ', hint: 'สำรวจป่าดูว่ามีใครที่จะร่วมมือกับคุณได้บ้าง แล้วกลับมาบอกที่กองไฟ', final: true }
    ],
    rewards: {
      gold: 300,
      exp: 1050,
      items: [],
      flags: ['ch8Cleared'],
      story: 'chapter9'
    },
    onAcceptFlags: ['ch8Started']
  },
  ch9: {
    id: 'ch9',
    title: 'ผู้พิทักษ์คนสุดท้าย',
    giver: 'villager',
    chapter: 9,
    requires: { quest: 'ch8', status: 'QUEST_COMPLETED' },
    description: 'มรกาฬส่งกองทัพกระดูกไปฆ่ามังกรเฒ่าไฟกาฬ ผนึกสุดท้าย คุณต้องไปถึงถ้ำมังกรก่อนและปกป้องมันให้ได้',
    location: 'ถ้ำมังกร',
    objectives: [
      { id: 'travel', text: 'ไปถึงถ้ำมังกรก่อนกองทัพ', hint: 'เปิดแผนที่โลกแล้วเลือกถ้ำมังกร', on: { type: 'PLAYER_ENTER_AREA', area: 'dragon_lair' } },
      { id: 'wave1', text: 'ระลอกที่ 1: ต้านกองโครงกระดูกคืนชีพ', hint: 'เดินเข้าไปหน้ามังกร กองทัพกระดูกจะบุกเข้ามา', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'skeleton_horde' } },
      { id: 'wave2', text: 'ระลอกที่ 2: ต้านวิญญาณหมาป่าเงา', hint: 'อยู่ใกล้มังกรไว้ ระลอกต่อไปจะตามมาหลังปกป้องมังกรเสร็จ', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'wolf_spirit' } },
      { id: 'wave3', text: 'ระลอกที่ 3: ปราบเงาโทรลล์', hint: 'ระลอกสุดท้ายคือเงาของโทรลล์เขี้ยวเหล็ก', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'troll_shadow' } },
      { id: 'key', text: 'ฟังคำของมังกร', hint: 'ปกป้องผนึกสุดท้ายให้ได้ แล้วมังกรจะพูดกับคุณ', on: { type: 'PLAYER_ITEM_GAINED', id: 'monument_key' } },
      { id: 'return', text: 'กลับไปที่ค่ายในป่า', hint: 'กลับไปค่ายผู้ลี้ภัยแล้วคุยกับชาวบ้านหัวฟักทอง', final: true }
    ],
    rewards: {
      gold: 250,
      exp: 1080,
      items: [],
      flags: ['ch9Cleared'],
      story: 'chapter10'
    },
    onAcceptFlags: ['ch9Started']
  },
  ch10: {
    id: 'ch10',
    title: 'ราชันย์กระดูก',
    giver: 'villager',
    chapter: 10,
    requires: { quest: 'ch9', status: 'QUEST_COMPLETED' },
    description: 'มรกาฬซ่อนตัวอยู่ในหอคอยใต้อนุสาวรีย์เก่าของหมู่บ้าน ใช้กุญแจอนุสาวรีย์เปิดทาง แล้วยุติร้อยปีของมันเสีย',
    location: 'หอคอยมรกาฬ',
    objectives: [
      { id: 'enter', text: 'เปิดทางเข้าใต้อนุสาวรีย์ด้วยกุญแจ', hint: 'กลับไปที่หมู่บ้านลมเย็น แล้วกด E ที่อนุสาวรีย์เก่าทางทิศตะวันตก', on: { type: 'PLAYER_ENTER_AREA', area: 'tower' } },
      { id: 'floor1', text: 'ชั้น 1: ผ่านห้องใต้ดิน', hint: 'โครงกระดูกขวางบันไดวนอยู่ในห้องใต้ดิน', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'crypt_skeletons' } },
      { id: 'floor2', text: 'ชั้น 2: ผ่านคลังวิญญาณ', hint: 'ตู้หนังสือต้องสาปตั้งขวางทางขึ้นชั้นบนสุด', on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'cursed_bookshelf' } },
      { id: 'boss', text: 'ชั้น 3: ปราบมรกาฬ', hint: 'มรกาฬรออยู่บนบัลลังก์กระดูกชั้นบนสุด ถ้าเกราะกระดูกปกคลุมตัวมัน อย่าลืมเกล็ดมังกร', on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'morkal' } },
      { id: 'return', text: 'กลับสู่ค่ายในป่า', hint: 'กลับไปที่ค่ายผู้ลี้ภัยแล้วคุยกับชาวบ้านหัวฟักทอง', final: true }
    ],
    rewards: {
      gold: 500,
      exp: 820,
      items: [],
      flags: ['ch10Cleared', 'gameCleared'],
      story: 'epilogue'
    },
    onAcceptFlags: ['ch10Started']
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
