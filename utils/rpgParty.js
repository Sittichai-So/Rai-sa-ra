export function myPartyCode (user) {
  const id = (user && (user._id || user.id)) || 'guest'
  return String(id).slice(-6).toUpperCase()
}

export function resolvePartyCode (route, user) {
  return (route.query && route.query.party) || myPartyCode(user)
}
