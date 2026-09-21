export const ZONE_INFO = {
  forest: { name: 'ป่าต้องคำสาป', desc: 'ต้นไม้บิดเบี้ยวปกคลุมทางเดิน แสงแดดแทบส่องไม่ถึงพื้น' },
  valley: { name: 'หุบเขาร้าง', desc: 'หินผาสูงชันขนาบสองข้างทาง ลมหนาวพัดโหยหวนไม่ขาดสาย' },
  dragongate: { name: 'ประตูสู่รังมังกร', desc: 'อากาศเริ่มร้อนระอุ กลิ่นกำมะถันลอยมาตามลม จุดหมายอยู่ไม่ไกลแล้ว' }
}

export function zoneInfoFor (board, tileId) {
  const tile = board.find(t => t.id === tileId)
  return (tile && ZONE_INFO[tile.zone]) || null
}
