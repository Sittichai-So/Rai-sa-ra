import { LEGACY_BOARD_ENABLED } from '~/utils/rpgFeatures'

export default function ({ redirect }) {
  if (!LEGACY_BOARD_ENABLED) {
    return redirect('/rpg')
  }
}
