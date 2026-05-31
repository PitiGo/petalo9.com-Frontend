/**
 * Copia miniaturas a /static/media/ con los nombres hasheados que generaba CRA.
 * Permite que bundles antiguos cacheados en el navegador sigan encontrando las imágenes
 * mientras los usuarios reciben el JS nuevo de Vite.
 */
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '..', 'build');

// Mapeo hash CRA -> archivo actual en public/images (copiado a build/images por Vite)
const CRA_MEDIA_SHIMS = {
  'developer-illustration.5e85ae9a863c51258f9c.webp': 'images/developer-illustration.webp',
  'snake-3d.1f31ed237d0d3126094b.webp': 'images/snake-3d.webp',
  'hand-invaders-preview.f15ca3227766ce80077d.webp': 'images/hand-invaders-preview.webp',
  'supermarcos.9b678f9f1e0aa63eeb02.webp': 'images/supermarcos.webp',
  'guess-country.0596661b0241c3584da5.webp': 'images/guess-country.webp',
  'mamvsreptiles.f72e3f7b8f0e549dacfa.webp': 'images/mamvsreptiles.webp',
};

const outDir = path.join(BUILD_DIR, 'static', 'media');
fs.mkdirSync(outDir, { recursive: true });

let copied = 0;
for (const [hashedName, sourceRel] of Object.entries(CRA_MEDIA_SHIMS)) {
  const source = path.join(BUILD_DIR, sourceRel);
  const dest = path.join(outDir, hashedName);
  if (!fs.existsSync(source)) {
    console.warn(`CRA shim skipped (missing): ${sourceRel}`);
    continue;
  }
  fs.copyFileSync(source, dest);
  copied += 1;
}

console.log(`CRA media shims: ${copied} files in build/static/media/`);
