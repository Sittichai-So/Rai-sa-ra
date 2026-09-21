export const LABEL_FONT = "'Kanit', 'Sarabun', 'Tahoma', sans-serif"

export function makeLabel (scene, x, y, text) {
  return scene.add.text(x, y, text, {
    fontFamily: LABEL_FONT,
    fontSize: '15px',
    fontStyle: '600',
    color: '#fff4d6',
    stroke: '#0a0710',
    strokeThickness: 4,
    padding: { x: 2, y: 2 }
  }).setOrigin(0.5, 1).setScale(1 / scene.zoom)
}
