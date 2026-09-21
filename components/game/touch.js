export function detectTouch () {
  try {
    if (localStorage.getItem('rpgTouch') === '1') { return true }
    return (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || navigator.maxTouchPoints > 0
  } catch (e) {
    return false
  }
}
