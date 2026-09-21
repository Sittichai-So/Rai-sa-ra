const PHI = (1 + Math.sqrt(5)) / 2
const EPS = 1e-4

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const len = a => Math.sqrt(dot(a, a))
const norm = (a) => {
  const l = len(a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

function shapeVertices (sides) {
  if (sides === 4) { return [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] }
  if (sides === 6) {
    const v = []
    for (const x of [-1, 1]) { for (const y of [-1, 1]) { for (const z of [-1, 1]) { v.push([x, y, z]) } } }
    return v
  }
  if (sides === 8) { return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] }
  if (sides === 10) {
    const c = 0.105
    const h = c * (Math.sin(Math.PI * 0.4) + 2 * Math.sin(Math.PI * 0.2)) / (2 * Math.sin(Math.PI * 0.2) - Math.sin(Math.PI * 0.4))
    const v = [[0, 0, h], [0, 0, -h]]
    for (let i = 0; i < 5; i++) {
      const upper = (i * 72) * Math.PI / 180
      const lower = (i * 72 + 36) * Math.PI / 180
      v.push([Math.cos(upper), Math.sin(upper), c])
      v.push([Math.cos(lower), Math.sin(lower), -c])
    }
    return v
  }
  if (sides === 12) {
    const inv = 1 / PHI
    const v = []
    for (const x of [-1, 1]) { for (const y of [-1, 1]) { for (const z of [-1, 1]) { v.push([x, y, z]) } } }
    for (const a of [-1, 1]) {
      for (const b of [-1, 1]) {
        v.push([0, a * inv, b * PHI])
        v.push([a * inv, b * PHI, 0])
        v.push([a * PHI, 0, b * inv])
      }
    }
    return v
  }
  const v = []
  for (const a of [-1, 1]) {
    for (const b of [-1, 1]) {
      v.push([0, a, b * PHI])
      v.push([a, b * PHI, 0])
      v.push([a * PHI, 0, b])
    }
  }
  return v
}

function hullFaces (vertices) {
  const center = vertices.reduce((s, p) => add(s, p), [0, 0, 0]).map(x => x / vertices.length)
  const found = new Map()
  const n = vertices.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        let normal = cross(sub(vertices[j], vertices[i]), sub(vertices[k], vertices[i]))
        if (len(normal) < EPS) { continue }
        normal = norm(normal)
        let d = dot(normal, vertices[i])
        if (d < dot(normal, center)) {
          normal = scale(normal, -1)
          d = -d
        }
        let ok = true
        const onPlane = []
        for (let m = 0; m < n; m++) {
          const side = dot(normal, vertices[m]) - d
          if (side > EPS) { ok = false; break }
          if (Math.abs(side) <= EPS) { onPlane.push(m) }
        }
        if (ok && onPlane.length >= 3) { found.set(onPlane.join(','), { indices: onPlane, normal }) }
      }
    }
  }
  return [...found.values()]
}

function faceBasis (normal) {
  let ref = [0, 1, 0]
  if (Math.abs(dot(ref, normal)) > 0.95) { ref = [1, 0, 0] }
  const u = norm(cross(ref, normal))
  const v = cross(normal, u)
  return { u, v }
}

function labelFaces (faces, sides) {
  const labels = new Array(faces.length).fill(0)
  if (sides === 4) {
    faces.forEach((f, i) => { labels[i] = i + 1 })
    return labels
  }
  const used = new Set()
  let next = 1
  faces.forEach((f, i) => {
    if (used.has(i)) { return }
    const opposite = faces.findIndex((g, j) => j !== i && !used.has(j) && dot(f.normal, g.normal) < -0.999)
    labels[i] = next
    used.add(i)
    if (opposite >= 0) {
      labels[opposite] = sides + 1 - next
      used.add(opposite)
    }
    next += 1
  })
  return labels
}

const cache = {}

export function buildDie (sides, radius) {
  const key = sides + ':' + radius
  if (cache[key]) { return cache[key] }
  const raw = shapeVertices(sides)
  const maxLen = Math.max(...raw.map(len))
  const vertices = raw.map(p => scale(p, radius / maxLen))
  const hull = hullFaces(vertices)
  const centroid = vertices.reduce((s, p) => add(s, p), [0, 0, 0]).map(x => x / vertices.length)
  const labels = labelFaces(hull, sides)
  const faces = hull.map((f, i) => {
    const { u, v } = faceBasis(f.normal)
    const pts = f.indices.map(idx => sub(vertices[idx], centroid))
    const c = pts.reduce((s, p) => add(s, p), [0, 0, 0]).map(x => x / pts.length)
    const flat = pts.map((p) => {
      const rel = sub(p, c)
      return [dot(rel, u), dot(rel, v)]
    })
    flat.sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]))
    const maxR = Math.max(...flat.map(p => Math.hypot(p[0], p[1])))
    return { label: labels[i], center: c, normal: f.normal, u, v, points: flat, size: Math.ceil(maxR * 2) + 2 }
  })
  const die = { faces, radius, sides }
  cache[key] = die
  return die
}

export function faceMatrix3 (face) {
  return [face.u, face.v, face.normal]
}

export function quatFromMatrixRows (rows) {
  const m00 = rows[0][0]; const m01 = rows[0][1]; const m02 = rows[0][2]
  const m10 = rows[1][0]; const m11 = rows[1][1]; const m12 = rows[1][2]
  const m20 = rows[2][0]; const m21 = rows[2][1]; const m22 = rows[2][2]
  const trace = m00 + m11 + m22
  let q
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1)
    q = [(m21 - m12) * s, (m02 - m20) * s, (m10 - m01) * s, 0.25 / s]
  } else if (m00 > m11 && m00 > m22) {
    const s = 2 * Math.sqrt(1 + m00 - m11 - m22)
    q = [0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s]
  } else if (m11 > m22) {
    const s = 2 * Math.sqrt(1 + m11 - m00 - m22)
    q = [(m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s]
  } else {
    const s = 2 * Math.sqrt(1 + m22 - m00 - m11)
    q = [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s]
  }
  return qNormalize(q)
}

export function qNormalize (q) {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]
}

export function qMul (a, b) {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
  ]
}

export function qInv (q) {
  return [-q[0], -q[1], -q[2], q[3]]
}

export function qAxisAngle (axis, angle) {
  const a = norm(axis)
  const s = Math.sin(angle / 2)
  return [a[0] * s, a[1] * s, a[2] * s, Math.cos(angle / 2)]
}

export function qToAxisAngle (q) {
  const w = Math.max(-1, Math.min(1, q[3]))
  const angle = 2 * Math.acos(w)
  const s = Math.sqrt(1 - w * w)
  if (s < 1e-6) { return { axis: [1, 0, 0], angle: 0 } }
  return { axis: [q[0] / s, q[1] / s, q[2] / s], angle }
}

export function qToMatrix3d (q, tx = 0, ty = 0, tz = 0) {
  const [x, y, z, w] = q
  const r00 = 1 - 2 * (y * y + z * z)
  const r01 = 2 * (x * y - z * w)
  const r02 = 2 * (x * z + y * w)
  const r10 = 2 * (x * y + z * w)
  const r11 = 1 - 2 * (x * x + z * z)
  const r12 = 2 * (y * z - x * w)
  const r20 = 2 * (x * z - y * w)
  const r21 = 2 * (y * z + x * w)
  const r22 = 1 - 2 * (x * x + y * y)
  return `matrix3d(${r00},${r10},${r20},0,${r01},${r11},${r21},0,${r02},${r12},${r22},0,${tx},${ty},${tz},1)`
}

export function rotateVector (q, v) {
  const p = [v[0], v[1], v[2], 0]
  const r = qMul(qMul(q, p), qInv(q))
  return [r[0], r[1], r[2]]
}

export function faceQuaternion (face) {
  return quatFromMatrixRows(faceMatrix3(face))
}

export function faceCss (face) {
  const [u, v, n] = [face.u, face.v, face.normal]
  const c = face.center
  return `matrix3d(${u[0]},${u[1]},${u[2]},0,${v[0]},${v[1]},${v[2]},0,${n[0]},${n[1]},${n[2]},0,${c[0]},${c[1]},${c[2]},1)`
}
