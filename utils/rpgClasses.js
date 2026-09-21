export const RPG_CLASSES = [
  { id: 'warrior', name: 'นักรบ', desc: 'ทนทาน ถึกสุดในปาร์ตี้ เก่งการประจัญบาน', icon: 'fa-shield-halved' },
  { id: 'rogue', name: 'โจร', desc: 'ว่องไว เก่งเรื่องเลี่ยงกับดักและงัดล็อก', icon: 'fa-user-ninja' },
  { id: 'mage', name: 'นักเวท', desc: 'ความรู้แน่น เก่งไขปริศนาและเวทมนตร์ แต่ HP น้อย', icon: 'fa-hat-wizard' },
  { id: 'cleric', name: 'นักบวช', desc: 'สมดุลรอบด้าน ทนพอตัว ไหวพริบดี เหมาะกับมือใหม่', icon: 'fa-mortar-pestle' }
]

export function rpgClassById (id) {
  return RPG_CLASSES.find(c => c.id === id) || null
}
