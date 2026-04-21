const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '_icon-build')
const sizes = [16, 32, 48, 64, 128, 256]

const pngs = sizes.map((s) => ({
  size: s,
  data: fs.readFileSync(path.join(buildDir, `icon-${s}.png`)),
}))

const headerSize = 6
const entrySize = 16
const dirSize = headerSize + entrySize * pngs.length

const header = Buffer.alloc(headerSize)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(pngs.length, 4)

const entries = Buffer.alloc(entrySize * pngs.length)
let offset = dirSize
for (let i = 0; i < pngs.length; i++) {
  const { size, data } = pngs[i]
  const base = i * entrySize
  entries[base] = size >= 256 ? 0 : size
  entries[base + 1] = size >= 256 ? 0 : size
  entries[base + 2] = 0
  entries[base + 3] = 0
  entries.writeUInt16LE(1, base + 4)
  entries.writeUInt16LE(32, base + 6)
  entries.writeUInt32LE(data.length, base + 8)
  entries.writeUInt32LE(offset, base + 12)
  offset += data.length
}

const out = Buffer.concat([header, entries, ...pngs.map((p) => p.data)])
const outPath = path.join(__dirname, '..', 'Logo.ico')
fs.writeFileSync(outPath, out)
console.log(`Wrote ${outPath} (${out.length} bytes, ${pngs.length} frames)`)
