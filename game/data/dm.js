export const DM_SCRIPTS = [
  {
    id: 'prologue',
    on: { type: 'PLAYER_ENTER_AREA', area: 'village' },
    if: { notFlag: 'prologueSeen' },
    delay: 700,
    pages: [
      { text: 'ตะวันเริ่มลับขอบฟ้า คุณก้าวเข้าสู่หมู่บ้านลมเย็นหลังการเดินทางอันยาวนาน กลิ่นควันไฟจากปล่องบ้านลอยอวลอยู่ในอากาศ' },
      { text: 'แต่ชาวบ้านที่ยืนอยู่ริมทางกลับมองไปทางเหนือ ด้วยสีหน้าที่ไม่ค่อยสบายใจนัก' },
      { text: 'บางที... ผู้เฒ่าประจำหมู่บ้านที่ยืนอยู่ข้างอนุสาวรีย์เก่าอาจรู้ว่าเกิดอะไรขึ้น' }
    ],
    choices: [{ label: 'เริ่มต้นการผจญภัย', do: [{ setFlag: 'prologueSeen' }, { narrate: 'ใช้ปุ่มลูกศรหรือ W A S D เดิน และกด E เมื่ออยู่ใกล้ผู้คนหรือสิ่งของเพื่อโต้ตอบ' }] }]
  },
  {
    id: 'village_return',
    on: { type: 'PLAYER_RETURN_TO_VILLAGE', fresh: false },
    if: { any: [{ quest: 'whispering_forest', ready: true }, { quest: 'silent_valley', ready: true }] },
    delay: 700,
    pages: [
      { text: 'คุณเดินกลับเข้าหมู่บ้านลมเย็นทั้งที่ร่างกายยังระบมจากการเดินทาง ชาวบ้านที่เห็นคุณเริ่มกระซิบกระซาบกันด้วยสายตาที่ต่างจากเมื่อก่อน' },
      { text: 'ผู้เฒ่ากำลังยืนรออยู่ที่อนุสาวรีย์เก่า ดูเหมือนเขาจะรู้แล้วว่าคุณกลับมาพร้อมข่าวสำคัญ' }
    ],
    choices: []
  },
  {
    id: 'village_return_plain',
    on: { type: 'PLAYER_RETURN_TO_VILLAGE', fresh: false },
    if: { not: { any: [{ quest: 'whispering_forest', ready: true }, { quest: 'silent_valley', ready: true }] } },
    mode: 'banner',
    text: 'คุณกลับมาถึงหมู่บ้านลมเย็น ควันไฟจากปล่องบ้านยังลอยอ้อยอิ่งเหมือนเดิม'
  },
  {
    id: 'welcome_back',
    on: { type: 'PLAYER_ENTER_GAME', area: 'village' },
    if: { all: [{ flag: 'prologueSeen' }, { not: { any: [{ quest: 'whispering_forest', ready: true }, { quest: 'silent_valley', ready: true }] } }] },
    delay: 700,
    recap: true,
    pages: [
      { text: 'ลมเย็นพัดผ่านหมู่บ้านลมเย็นอีกครั้ง ควันไฟจากปล่องบ้านลอยอ้อยอิ่งอยู่เหนือหลังคา เรื่องราวของคุณยังดำเนินต่อไป' }
    ],
    choices: []
  },
  {
    id: 'welcome_back_ready',
    on: { type: 'PLAYER_ENTER_GAME', area: 'village' },
    if: { all: [{ flag: 'prologueSeen' }, { any: [{ quest: 'whispering_forest', ready: true }, { quest: 'silent_valley', ready: true }] }] },
    delay: 700,
    pages: [
      { text: 'คุณกลับมาถึงหมู่บ้านลมเย็นอีกครั้ง ชาวบ้านเริ่มกระซิบกระซาบกันด้วยสายตาที่ต่างจากเมื่อก่อน' },
      { text: 'ผู้เฒ่ากำลังยืนรออยู่ที่อนุสาวรีย์เก่า ดูเหมือนเขารู้แล้วว่าคุณมีข่าวสำคัญ' }
    ],
    choices: []
  },
  {
    id: 'village_gate',
    on: { type: 'PLAYER_INTERACT_ENCOUNTER', id: 'village_gate' },
    if: { quest: 'whispering_forest', status: ['QUEST_NOT_STARTED', 'QUEST_FAILED'] },
    pages: [
      { text: 'ประตูไม้เก่าคร่ำครึของหมู่บ้านเปิดแง้มอยู่ ลมเย็นจากป่าทางเหนือพัดกลิ่นดินชื้นเข้ามา' },
      { text: 'ยังไม่มีใครมอบภารกิจให้คุณ... ผู้เฒ่าที่อนุสาวรีย์อาจมีเรื่องที่ควรรู้ก่อนออกไป' }
    ],
    choices: [
      { label: 'ออกไปสำรวจป่าเลย', do: [{ travel: 'forest' }] },
      { label: 'กลับไปคุยกับผู้เฒ่าก่อน', do: [] }
    ]
  },
  {
    id: 'village_gate_quest',
    on: { type: 'PLAYER_INTERACT_ENCOUNTER', id: 'village_gate' },
    if: { quest: 'whispering_forest', active: true },
    pages: [
      { text: 'ตรงหน้าคือประตูออกจากหมู่บ้าน เลยไปเป็นทางดินที่ทอดเข้าสู่ป่าทางเหนือ ท้องฟ้าเหนือยอดไม้เริ่มมืดครึ้ม' }
    ],
    choices: [
      { label: 'ออกเดินทางเข้าป่า', do: [{ travel: 'forest' }] },
      { label: 'ยังไม่พร้อม', do: [] }
    ]
  },
  {
    id: 'village_gate_after',
    on: { type: 'PLAYER_INTERACT_ENCOUNTER', id: 'village_gate' },
    if: { quest: 'whispering_forest', status: 'QUEST_COMPLETED' },
    pages: [{ text: 'ประตูเหนือของหมู่บ้านเงียบสงบกว่าเดิมมาก ทางดินที่เคยน่ากลัวตอนนี้ดูเหมือนเส้นทางธรรมดาอีกเส้น' }],
    choices: [
      { label: 'เดินทางกลับเข้าป่า', do: [{ travel: 'forest' }] },
      { label: 'ยังไม่ไป', do: [] }
    ]
  },
  {
    id: 'forest_enter_quest',
    on: { type: 'PLAYER_ENTER_AREA', area: 'forest' },
    if: { all: [{ quest: 'whispering_forest', active: true }, { notFlag: 'forestIntroSeen' }] },
    delay: 900,
    pages: [
      { text: 'ฝนเริ่มตกพรำๆ ขณะที่คุณก้าวเข้าสู่ชายป่าทางเหนือ กลิ่นดินเปียกปนกับกลิ่นใบไม้เน่าลอยมาตามลม' },
      { text: 'ทันใดนั้น เสียงบางอย่างดังมาจากพุ่มไม้เบื้องหน้า ก่อนจะเงียบลงกะทันหัน...' }
    ],
    choices: [
      { label: 'เดินเข้าไปดูที่พุ่มไม้', do: [{ setFlag: 'forestIntroSeen' }, { narrate: 'คุณย่องเข้าไปใกล้ แต่พบเพียงกระต่ายป่าตัวหนึ่งวิ่งหนีออกไป ทว่าพื้นดินตรงนั้นมีรอยบางอย่างกดลึกอยู่' }] },
      { label: 'เดินอ้อมไปทางอื่น', do: [{ setFlag: 'forestIntroSeen' }, { narrate: 'คุณเลือกเดินอ้อมพุ่มไม้ไป เสียงลมพัดผ่านต้นไม้เบาๆ แต่ความรู้สึกว่ามีอะไรจ้องมองอยู่ยังไม่หายไป' }] },
      { label: 'มองหาร่องรอยบนพื้น', do: [{ setFlag: 'forestIntroSeen' }, { highlightMarker: 'footprints' }, { narrate: 'คุณสังเกตเห็นรอยบางอย่างกดลึกอยู่บนพื้นไม่ไกลนัก ลองเดินตามไปดูสิ' }] }
    ]
  },
  {
    id: 'forest_enter_plain',
    on: { type: 'PLAYER_ENTER_AREA', area: 'forest' },
    if: { not: { all: [{ quest: 'whispering_forest', active: true }, { notFlag: 'forestIntroSeen' }] } },
    mode: 'banner',
    delay: 900,
    text: 'ป่าต้องคำสาปกลืนคุณเข้าไปในเงามืดของตัวเอง เสียงใบไม้เสียดสีกันดังราวกับกระซิบ'
  },
  {
    id: 'valley_enter',
    on: { type: 'PLAYER_ENTER_AREA', area: 'valley' },
    mode: 'banner',
    delay: 900,
    text: 'หุบเขาร้างเงียบสนิทจนได้ยินเสียงลมหายใจของตัวเอง หินผาทั้งสองฝั่งตั้งตระหง่านราวกับคอยจับจ้องทุกย่างก้าว'
  },
  {
    id: 'dungeon_enter',
    once: true,
    on: { type: 'PLAYER_ENTER_DUNGEON' },
    delay: 900,
    pages: [
      { text: 'ประตูหินหนักอึ้งปิดลงข้างหลังคุณ อากาศเย็นชื้นกลิ่นสนิมและควันไฟเก่าลอยมาจากทางลึกเข้าไป' },
      { text: 'ไอร้อนจากลึกเข้าไปในภูเขาไฟลอยปนกับกลิ่นกำมะถัน ไม่มีใครกลับออกมาจากที่นี่โดยไม่ได้รับบาดแผล... เตรียมใจให้พร้อมก่อนก้าวต่อไป' }
    ],
    choices: [{ label: 'ก้าวเข้าไป', do: [] }]
  },
  {
    id: 'dragon_gate_cleared',
    once: true,
    on: { type: 'PLAYER_EVENT_RESOLVED', eventId: 'troll_bridge', success: true },
    delay: 700,
    pages: [
      { text: 'โทรลล์เขี้ยวเหล็กถอยหนีไปสุดกำลัง เสียงคำรามของมันจางหายเข้าไปในความมืด' },
      { text: 'ลึกเข้าไปจากตรงนี้ ไอร้อนและกลิ่นกำมะถันลอยมาแรงขึ้นเรื่อยๆ นี่คือทางที่นำไปสู่รังของมังกรเฒ่าไฟกาฬจริงๆ... แต่นั่นคงเป็นการผจญภัยของอีกวันหนึ่ง' },
      { text: 'ตอนนี้กลับไปรายงานผู้เฒ่าที่หมู่บ้านก่อนดีกว่า' }
    ],
    choices: []
  },
  {
    id: 'dragon_lair_reveal',
    once: true,
    on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'dragon_ancient' },
    delay: 700,
    pages: [
      { text: 'พอแล้ว เจ้าแข็งแกร่งพอ' },
      { text: 'ฟังให้ดี เมื่อร้อยปีก่อน พ่อมดนามว่ามรกาฬถูกผนึกไว้ด้วยชีวิตของพวกเราสามตน หมาป่าเงา โทรลล์เขี้ยวเหล็ก และข้า' },
      { text: 'สองผนึกแตกแล้ว ด้วยมือของเจ้า' },
      { text: 'คนที่ส่งเจ้ามา คนที่เจ้าเรียกว่าผู้เฒ่า... เขาเคยเรียกตัวเองว่ามรกาฬ' }
    ],
    choices: [
      {
        label: 'ข้าเชื่อเจ้า',
        do: [
          { setFlag: 'trust_dragon' },
          { giveItem: { id: 'dragon_scale', qty: 1 } },
          { narrate: 'งั้นจงกลับไปและอย่าให้มันรู้ว่าเจ้ารู้ เก็บสิ่งนี้ไว้ วันหนึ่งเจ้าจะต้องใช้มัน' }
        ]
      },
      {
        label: 'เจ้าโกหก ผู้เฒ่าช่วยหมู่บ้านมาตลอด',
        do: [
          { giveItem: { id: 'dragon_scale', qty: 1 } },
          { narrate: 'งั้นจงไปหาความจริงเอง แล้วเจ้าจะกลับมา เก็บสิ่งนี้ไว้ วันหนึ่งเจ้าจะต้องใช้มัน' }
        ]
      }
    ]
  },
  {
    id: 'century_journal_read',
    once: true,
    on: { type: 'PLAYER_ITEM_GAINED', id: 'century_journal' },
    delay: 600,
    pages: [
      { text: 'วันที่หนึ่งร้อยสิบสอง ของสงคราม เราผนึกมรกาฬได้แล้ว แต่ไม่อาจสังหารเขา เขาผูกชีวิตไว้กับแก่นกระดูกของตนเอง' },
      { text: 'ผู้พิทักษ์ทั้งสามยอมสละอิสรภาพเป็นผนึก ตราบใดที่ยังมีชีวิต มรกาฬจะเป็นเพียงชายชราไร้พลัง' },
      { text: 'หากวันหนึ่งมีชายชราผู้ใจดีปรากฏในหมู่บ้านลมเย็น ขอให้ลูกหลานจงระวัง' },
      { text: 'ใบหน้าในภาพวาดหน้าสุดท้าย... คือผู้เฒ่า' }
    ],
    choices: []
  },
  {
    id: 'ritual_guardian_choice',
    once: true,
    on: { type: 'PLAYER_ENEMY_DEFEATED', enemyId: 'ritual_guardian' },
    delay: 700,
    pages: [
      { text: 'ปีศาจร่างใหญ่ล้มลงกับพื้น วงพิธีตรงกลางยังคงเรืองแสงสีม่วงอยู่ พร้อมด้วยเศษซากพิธีกรรมกระจัดกระจาย' }
    ],
    choices: [
      {
        label: 'ทำลายวงพิธี',
        do: [
          { setFlag: 'ritual_destroyed' },
          { narrate: 'แสงม่วงแตกกระจาย ไกลออกไปในหมู่บ้าน ใครบางคนร้องเสียงหลง' }
        ]
      },
      {
        label: 'เก็บหลักฐาน',
        do: [
          { giveItem: { id: 'ritual_evidence', qty: 1 } },
          { setFlag: 'evidence_taken' },
          { narrate: 'คุณเก็บเศษหลักฐานจากวงพิธีใส่กระเป๋าไว้' }
        ]
      }
    ]
  }
]
