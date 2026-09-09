import { ensureCleanSession } from '~/utils/auth'

// ไม่ redirect session ที่ยัง valid ออกไป — ให้หน้า login/register แสดงกล่อง
// "เข้าสู่ระบบอยู่แล้ว" พร้อมปุ่มออกจากระบบ (กันไม่ให้ session เก่าดักคนที่อยากสมัครใหม่)
// หน้าที่เดียวของ middleware นี้คือล้าง session ที่หมดอายุ/เสีย
export default function () {
  if (!process.client) { return }
  ensureCleanSession()
}
