// Generates placeholder fabric photography (draped woven textile) as WebP.
// Replace with real product photography from the CMS before launch.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = new URL("../public/media/", import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

const fabrics = {
  "summer-ivory":   { base: "#efe9dc", thread: "#d9d0bd", light: "#fffaf0", fold: 0.0045, pitch: 3, seed: 3 },
  "winter-charcoal":{ base: "#3a3836", thread: "#2a2826", light: "#8a857e", fold: 0.0035, pitch: 5, seed: 11 },
  "japanese-white": { base: "#f4f2ee", thread: "#e2ded6", light: "#ffffff", fold: 0.006,  pitch: 2, seed: 7 },
  "cotton-sand":    { base: "#d8ccb4", thread: "#c3b597", light: "#f5ecd8", fold: 0.004,  pitch: 4, seed: 21 },
  "luxury-navy":    { base: "#1d2430", thread: "#141a23", light: "#6b7a92", fold: 0.0038, pitch: 3, seed: 5 },
  "daily-grey":     { base: "#9a9893", thread: "#86847f", light: "#e4e1db", fold: 0.0042, pitch: 3, seed: 17 },
  "winter-brown":   { base: "#5b4636", thread: "#4a3829", light: "#b39375", fold: 0.0036, pitch: 5, seed: 29 },
  "black-silk":     { base: "#141414", thread: "#0a0a0a", light: "#6d6658", fold: 0.005,  pitch: 2, seed: 41 },
  // Accessories
  "shemagh-red":    { base: "#f3eee6", thread: "#e3dccf", light: "#fffaf2", fold: 0.004,  pitch: 2, seed: 53, check: "#7d0c12" },
  "ghutra-white":   { base: "#f7f5f0", thread: "#ebe7df", light: "#ffffff", fold: 0.005,  pitch: 2, seed: 61 },
  "sedairi-camel":  { base: "#a57d52", thread: "#8f6a43", light: "#e2c49c", fold: 0.0035, pitch: 4, seed: 67 },
};

function svg({ base, thread, light, fold, pitch, seed, sheen = 0.35, check }, w, h, { macro = false } = {}) {
  // Overscan so displaced edges never show inside the frame.
  const o = 200;
  const W = w + o * 2;
  const H = h + o * 2;
  const p = macro ? 26 : pitch;
  const weave = macro
    ? `<pattern id="weave" width="${p * 2}" height="${p * 2}" patternUnits="userSpaceOnUse">
        <rect width="${p * 2}" height="${p * 2}" fill="${thread}"/>
        <rect x="0" y="${p * 0.08}" width="${p * 2}" height="${p * 0.84}" fill="url(#yh)"/>
        <rect x="0" y="${p * 1.08}" width="${p * 2}" height="${p * 0.84}" fill="url(#yh)"/>
        <rect x="${p * 0.08}" y="0" width="${p * 0.84}" height="${p}" rx="${p * 0.35}" fill="url(#yv)"/>
        <rect x="${p * 1.08}" y="${p}" width="${p * 0.84}" height="${p}" rx="${p * 0.35}" fill="url(#yv)"/>
      </pattern>`
    : `<pattern id="weave" width="${p * 2}" height="${p * 2}" patternUnits="userSpaceOnUse">
        <rect width="${p * 2}" height="${p * 2}" fill="${base}"/>
        <rect x="0" y="0" width="${p}" height="${p * 0.9}" fill="${thread}"/>
        <rect x="${p}" y="${p}" width="${p}" height="${p * 0.9}" fill="${thread}"/>
      </pattern>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${o} ${o} ${w} ${h}">
  <defs>
    <linearGradient id="yh" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${thread}"/><stop offset="0.45" stop-color="${light}"/><stop offset="1" stop-color="${thread}"/>
    </linearGradient>
    <linearGradient id="yv" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${thread}"/><stop offset="0.5" stop-color="${base}"/><stop offset="1" stop-color="${thread}"/>
    </linearGradient>
    ${weave}
    ${check ? `<pattern id="check" width="${macro ? 220 : 64}" height="${macro ? 220 : 64}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="100%" height="100%" fill="${base}"/>
        <rect x="0" y="0" width="100%" height="${macro ? 70 : 20}" fill="${check}" opacity="0.92"/>
        <rect x="0" y="0" width="${macro ? 70 : 20}" height="100%" fill="${check}" opacity="0.92"/>
      </pattern>` : ""}
    <filter id="cloth" x="-100" y="-100" width="${W + 200}" height="${H + 200}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${macro ? fold * 2 : fold * 1.15} ${macro ? fold * 2 : fold * 0.35}" numOctaves="3" seed="${seed}" result="folds"/>
      <feDisplacementMap in="SourceGraphic" in2="folds" scale="${macro ? 10 : 30}" xChannelSelector="R" yChannelSelector="G" result="warped"/>
      <feTurbulence type="fractalNoise" baseFrequency="${macro ? 0.35 : 1.2} ${macro ? 0.05 : 0.2}" numOctaves="2" seed="${seed + 1}" result="fiber"/>
      <feColorMatrix in="fiber" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${macro ? 0.22 : 0.12} 0" result="fiberA"/>
      <feComposite in="fiberA" in2="warped" operator="over" result="textured"/>
      <feGaussianBlur in="folds" stdDeviation="${macro ? 2 : 6}" result="foldsSoft"/>
      <feDiffuseLighting in="foldsSoft" surfaceScale="${macro ? 3 : 22}" diffuseConstant="1.15" lighting-color="#ffffff" result="shade">
        <feDistantLight azimuth="225" elevation="${macro ? 55 : 32}"/>
      </feDiffuseLighting>
      <feSpecularLighting in="foldsSoft" surfaceScale="${macro ? 3 : 22}" specularConstant="${sheen}" specularExponent="18" lighting-color="${light}" result="spec">
        <feDistantLight azimuth="225" elevation="${macro ? 55 : 32}"/>
      </feSpecularLighting>
      <feBlend in="textured" in2="shade" mode="multiply" result="lit"/>
      <feComposite in="lit" in2="spec" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" result="final"/>
      <feComponentTransfer in="final"><feFuncR type="gamma" exponent="0.78"/><feFuncG type="gamma" exponent="0.78"/><feFuncB type="gamma" exponent="0.78"/></feComponentTransfer>
    </filter>
    <radialGradient id="vig" cx="50%" cy="45%" r="80%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  ${check
    ? `<g filter="url(#cloth)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#check)"/><rect x="0" y="0" width="${W}" height="${H}" fill="url(#weave)" opacity="0.18"/></g>`
    : `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#weave)" filter="url(#cloth)"/>`}
  <rect x="${o}" y="${o}" width="${w}" height="${h}" fill="url(#vig)"/>
</svg>`;
}

// Lighting filters leave a faint seam on the outer pixels; render bigger and crop.
const B = 16;
const render = (f, w, h, file, quality, opts) =>
  sharp(Buffer.from(svg(f, w + B * 2, h + B * 2, opts)))
    .extract({ left: B, top: B, width: w, height: h })
    .webp({ quality })
    .toFile(`${OUT}${file}.webp`);

const jobs = [];
const only = process.argv.slice(2);
for (const [name, f] of Object.entries(fabrics)) {
  if (only.length && !only.includes(name)) continue;
  jobs.push(render(f, 1200, 1500, `${name}`, 80));
  jobs.push(render(f, 1200, 1200, `${name}-macro`, 82, { macro: true }));
}
if (!only.length) {
// Wide hero drape
jobs.push(render({ base: "#24221f", thread: "#161513", light: "#d8cbb0", fold: 0.0021, pitch: 2, seed: 43, sheen: 0.75 }, 2400, 1500, `hero-drape`, 78));
jobs.push(render({ ...fabrics["luxury-navy"], base: "#16130f", thread: "#0d0b08", light: "#b89a5a", fold: 0.0026 }, 1600, 1600, `box-backdrop`, 78));
}
await Promise.all(jobs);
console.log("textures written to", OUT);
