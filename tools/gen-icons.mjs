// Sinh icon PWA (PNG) bằng Node thuần: mèo vàng trên nền xanh. Chạy: node tools/gen-icons.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const BLUE = hex('#188FE4'), YEL = hex('#FFDE00'), DK = hex('#E8A700'), INK = hex('#14284B'), PINK = hex('#F45AA5'), CHEEK = hex('#F8A4B3'), WHITE = hex('#FFFFFF');

const inTri = (px, py, a, b, c) => {
  const s = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]);
  const p = [px, py], d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
const inEll = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
// Mèo trong khung 100x100 (cùng hình học với bộ mèo của app thu chi).
function cat(x, y) {
  if (inEll(x, y, 37, 46, 6.2, 6.2) || inEll(x, y, 63, 46, 6.2, 6.2)) {
    return inEll(x, y, 38, 47.5, 3.2, 3.2) || inEll(x, y, 62, 47.5, 3.2, 3.2) ? INK : WHITE;
  }
  if (inTri(x, y, [47, 51], [53, 51], [50, 55.5])) return PINK;
  if (inEll(x, y, 28, 57, 5, 4.4) || inEll(x, y, 72, 57, 5, 4.4)) return CHEEK;
  if (inTri(x, y, [27, 31], [27.6, 18], [38, 25.4]) || inTri(x, y, [73, 31], [72.4, 18], [62, 25.4])) return DK;
  if (inEll(x, y, 50, 46, 32, 27) || inTri(x, y, [21, 40], [24, 11], [46, 24]) || inTri(x, y, [79, 40], [76, 11], [54, 24])) return YEL;
  return null;
}
const rrect = (x, y, r) => { const dx = Math.max(Math.abs(x - 50) - (50 - r), 0), dy = Math.max(Math.abs(y - 50) - (50 - r), 0); return dx * dx + dy * dy <= r * r; };

function crc32(buf) { let c, crc = 0xffffffff; for (const b of buf) { c = (crc ^ b) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); };
function png(size, { scale, round }) {
  const raw = Buffer.alloc(size * (size * 4 + 1)), SS = 3;
  for (let j = 0; j < size; j++) {
    raw[j * (size * 4 + 1)] = 0;
    for (let i = 0; i < size; i++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const x = (i + (sx + .5) / SS) / size * 100, y = (j + (sy + .5) / SS) / size * 100;
        if (round && !rrect(x, y, 22)) continue;
        const cx = (x - 50) / scale + 50, cy = (y - 52) / scale + 50;
        const col = cat(cx, cy) || BLUE;
        r += col[0]; g += col[1]; b += col[2]; a++;
      }
      const n = SS * SS, o = j * (size * 4 + 1) + 1 + i * 4;
      raw.set(a ? [r / a, g / a, b / a, a / n * 255].map(Math.round) : [0, 0, 0, 0], o);
    }
  }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(size, 0); ih.writeUInt32BE(size, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const out = f => new URL('../icons/' + f, import.meta.url);
writeFileSync(out('icon-192.png'), png(192, { scale: 1.05, round: true }));
writeFileSync(out('icon-512.png'), png(512, { scale: 1.05, round: true }));
writeFileSync(out('apple-touch-icon.png'), png(180, { scale: 1.05, round: false }));
writeFileSync(out('icon-maskable-512.png'), png(512, { scale: 0.8, round: false }));
console.log('ok');
