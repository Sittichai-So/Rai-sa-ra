const LINK = /^\[([^\]]+)\]\(([^)]+)\)(.*)$/

function parseCell (text) {
  const cell = text.trim().replace(/`/g, '')
  const m = LINK.exec(cell)
  if (m) { return { text: m[1].replace(/&quot;/g, '"'), url: m[2], extra: m[3].trim() } }
  return { text: cell, url: null, extra: '' }
}

export function parseCreditsSection (markdown, headingPrefix) {
  const lines = String(markdown || '').split(/\r?\n/)
  const start = lines.findIndex(l => l.startsWith('## ') && l.slice(3).trim().startsWith(headingPrefix))
  if (start < 0) { return [] }
  const groups = []
  let current = null
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('## ')) { break }
    if (line.startsWith('### ')) {
      const title = line.slice(4).replace(/\s*\([^)]*\)/g, '').replace(/\s+—.*$/, '').replace(/`/g, '').trim()
      current = { title, rows: [] }
      groups.push(current)
      continue
    }
    if (!current || !line.trim().startsWith('|')) { continue }
    const cells = line.trim().replace(/^\||\|$/g, '').split('|')
    if (cells.length < 4 || /^\s*:?-{3,}/.test(cells[0])) { continue }
    if (current.rows.length === 0 && !current.headerSeen) {
      current.headerSeen = true
      continue
    }
    const [files, source, author, license] = cells.map(parseCell)
    current.rows.push({ files: files.text, source, author: author.text, license: license.text })
  }
  return groups.filter(g => g.rows.length).map(({ title, rows }) => ({ title, rows }))
}
