export const ITEMS = {
  potion_small: { id: 'potion_small', name: 'ยาฟื้นพลังเล็ก', type: 'consumable', heal: 12, price: 25, sell: 10, icon: 'potion_red', desc: 'ฟื้นพลังชีวิต 12 แต้ม' },
  potion_large: { id: 'potion_large', name: 'ยาฟื้นพลังใหญ่', type: 'consumable', heal: 26, price: 55, sell: 22, icon: 'potion_blue', desc: 'ฟื้นพลังชีวิต 26 แต้ม' },
  bandage: { id: 'bandage', name: 'ผ้าพันแผล', type: 'consumable', heal: 6, price: 10, sell: 4, icon: 'medipack', desc: 'ฟื้นพลังชีวิต 6 แต้ม' },
  sword_iron: { id: 'sword_iron', name: 'ดาบเหล็ก', type: 'weapon', slot: 'weapon', atk: 1, price: 60, sell: 25, icon: 'sword', desc: 'โจมตีแม่นขึ้นและแรงขึ้น +1' },
  leather_armor: { id: 'leather_armor', name: 'เกราะหนัง', type: 'armor', slot: 'armor', ac: 1, price: 60, sell: 25, icon: 'armor', desc: 'ค่าป้องกัน (AC) +1' },
  sword_steel: { id: 'sword_steel', name: 'ดาบเหล็กกล้า', type: 'weapon', slot: 'weapon', atk: 2, price: 150, sell: 60, icon: 'sword', desc: 'ดาบตีขึ้นรูปอย่างดี โจมตีแม่นขึ้นและแรงขึ้น +2' },
  chain_armor: { id: 'chain_armor', name: 'เกราะโซ่', type: 'armor', slot: 'armor', ac: 2, price: 150, sell: 60, icon: 'armor', desc: 'เกราะถักจากห่วงเหล็ก ค่าป้องกัน (AC) +2' },
  elixir_vigor: { id: 'elixir_vigor', name: 'ยาอายุวัฒนะ', type: 'consumable', heal: 40, price: 90, sell: 36, icon: 'potion_blue', desc: 'ฟื้นพลังชีวิต 40 แต้ม กลั่นจากสมุนไพรหายาก' }
}

export const SHOP_STOCK = ['potion_small', 'potion_large', 'bandage', 'sword_iron', 'leather_armor', 'sword_steel', 'chain_armor', 'elixir_vigor']

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
