import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svg = readFileSync(join(root, 'public/icon.svg'))

for (const size of [192, 512]) {
  const out = join(root, `public/icon-${size}.png`)
  await sharp(svg).resize(size, size).png().toFile(out)
  console.log('wrote', out)
}
