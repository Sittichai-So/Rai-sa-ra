export const ITEMS = {
  potion_small: { id: 'potion_small', name: 'ยาฟื้นพลังเล็ก', type: 'consumable', heal: 12, price: 25, sell: 10, icon: 'potion_red', desc: 'ฟื้นพลังชีวิต 12 แต้ม' },
  potion_large: { id: 'potion_large', name: 'ยาฟื้นพลังใหญ่', type: 'consumable', heal: 26, price: 55, sell: 22, icon: 'potion_blue', desc: 'ฟื้นพลังชีวิต 26 แต้ม' },
  bandage: { id: 'bandage', name: 'ผ้าพันแผล', type: 'consumable', heal: 6, price: 10, sell: 4, icon: 'medipack', desc: 'ฟื้นพลังชีวิต 6 แต้ม' },
  sword_iron: { id: 'sword_iron', name: 'ดาบเหล็ก', type: 'weapon', slot: 'weapon', atk: 1, price: 60, sell: 25, icon: 'sword', desc: 'โจมตีแม่นขึ้นและแรงขึ้น +1' },
  leather_armor: { id: 'leather_armor', name: 'เกราะหนัง', type: 'armor', slot: 'armor', ac: 1, price: 60, sell: 25, icon: 'armor', desc: 'ค่าป้องกัน (AC) +1' },
  sword_steel: { id: 'sword_steel', name: 'ดาบเหล็กกล้า', type: 'weapon', slot: 'weapon', atk: 2, price: 150, sell: 60, icon: 'sword', desc: 'ดาบตีขึ้นรูปอย่างดี โจมตีแม่นขึ้นและแรงขึ้น +2' },
  chain_armor: { id: 'chain_armor', name: 'เกราะโซ่', type: 'armor', slot: 'armor', ac: 2, price: 150, sell: 60, icon: 'armor', desc: 'เกราะถักจากห่วงเหล็ก ค่าป้องกัน (AC) +2' },
  elixir_vigor: { id: 'elixir_vigor', name: 'ยาอายุวัฒนะ', type: 'consumable', heal: 40, price: 90, sell: 36, icon: 'potion_blue', desc: 'ฟื้นพลังชีวิต 40 แต้ม กลั่นจากสมุนไพรหายาก' },
  sword_mithril: { id: 'sword_mithril', name: 'ดาบไมทริล', type: 'weapon', slot: 'weapon', atk: 3, price: 320, sell: 130, icon: 'sword', desc: 'โลหะเบาแต่แกร่ง โจมตีแม่นขึ้นและแรงขึ้น +3', unlockedBy: { quest: 'ch4', status: 'QUEST_COMPLETED' } },
  plate_armor: { id: 'plate_armor', name: 'เกราะแผ่นเหล็ก', type: 'armor', slot: 'armor', ac: 3, price: 320, sell: 130, icon: 'armor', desc: 'เกราะแผ่นเต็มตัว ค่าป้องกัน (AC) +3', unlockedBy: { quest: 'ch4', status: 'QUEST_COMPLETED' } },
  sword_spirit: { id: 'sword_spirit', name: 'ดาบวิญญาณ', type: 'weapon', slot: 'weapon', atk: 4, price: 600, sell: 240, icon: 'sword', desc: 'ดาบที่สั่นสะท้านด้วยพลังวิญญาณ โจมตีแม่นขึ้นและแรงขึ้น +4', unlockedBy: { quest: 'ch6', status: 'QUEST_COMPLETED' } },
  armor_spirit: { id: 'armor_spirit', name: 'เกราะวิญญาณ', type: 'armor', slot: 'armor', ac: 4, price: 600, sell: 240, icon: 'armor', desc: 'เกราะที่ปกป้องทั้งกายและใจ ค่าป้องกัน (AC) +4', unlockedBy: { quest: 'ch6', status: 'QUEST_COMPLETED' } },
  sword_king: { id: 'sword_king', name: 'ดาบราชันย์', type: 'weapon', slot: 'weapon', atk: 6, price: 1200, sell: 480, icon: 'sword', desc: 'อาวุธระดับตำนาน โจมตีแม่นขึ้นและแรงขึ้น +6', unlockedBy: { flag: 'ally_merchant' } },
  armor_king: { id: 'armor_king', name: 'เกราะราชันย์', type: 'armor', slot: 'armor', ac: 6, price: 1200, sell: 480, icon: 'armor', desc: 'เกราะระดับตำนาน ค่าป้องกัน (AC) +6', unlockedBy: { flag: 'ally_merchant' } },
  dragon_scale: { id: 'dragon_scale', name: 'เกล็ดมังกร', type: 'quest', questItem: true, icon: 'potion_blue', desc: 'เกล็ดจากมังกรเฒ่าไฟกาฬ ร้อนอุ่นในมืออยู่เสมอ ใช้ทำลายเกราะของศัตรูบางตัวได้' },
  century_journal: { id: 'century_journal', name: 'บันทึกร้อยปี', type: 'quest', questItem: true, icon: 'medipack', desc: 'บันทึกเก่าแก่ที่เปิดเผยตัวตนที่แท้จริงของผู้เฒ่า' },
  ritual_evidence: { id: 'ritual_evidence', name: 'หลักฐานวงพิธี', type: 'quest', questItem: true, icon: 'medipack', desc: 'เศษซากจากวงพิธีดูดชีวิตในหุบเขา ใช้เป็นหลักฐานยืนยันความจริงได้' },
  revive_potion: { id: 'revive_potion', name: 'ยาคืนชีพ', type: 'quest', questItem: true, icon: 'potion_red', desc: 'ยาหายากที่หมอสมุนไพรกลั่นให้ ฟื้นคืนพลังชีวิตอัตโนมัติเมื่อสิ้นสติครั้งแรก' },
  monument_key: { id: 'monument_key', name: 'กุญแจอนุสาวรีย์', type: 'quest', questItem: true, icon: 'medipack', desc: 'กุญแจโบราณที่เปิดทางลับใต้อนุสาวรีย์เก่าได้' }
}

export const SHOP_STOCK = ['potion_small', 'potion_large', 'bandage', 'sword_iron', 'leather_armor', 'sword_steel', 'chain_armor', 'elixir_vigor', 'sword_mithril', 'plate_armor', 'sword_spirit', 'armor_spirit', 'sword_king', 'armor_king']

export function itemById (id) {
  return ITEMS[id] || null
}

export function itemByName (name) {
  return Object.values(ITEMS).find(i => i.name === name) || null
}

export function describeItem (idOrName) {
  const known = itemById(idOrName) || itemByName(idOrName)
  if (known) { return known }
  return { id: 'trophy:' + idOrName, name: idOrName, type: 'trophy', sell: 6, icon: 'skull', desc: 'ของที่เก็บได้จากการผจญภัย ขายให้พ่อค้าได้' }
}
