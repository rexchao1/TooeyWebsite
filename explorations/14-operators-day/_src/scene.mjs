// Builds the two window interiors as inline SVG strings.
// Every diner is one cover, every container is one dish. site.js moves them.

const r = (n) => Math.round(n * 10) / 10;

// Deterministic shuffle so the room fills in a natural, repeatable order.
function shuffled(n, seed) {
  const a = [...Array(n).keys()];
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DINER_BODY = 'M-30,12 C-31,-26 -24,-50 0,-52 C24,-50 31,-26 30,12 Z';

function diner(cls, x, y, s, extra = '', variant = 0) {
  const headR = [16, 15, 17, 15.5][variant % 4];
  const headDx = [0, 2, -2, 1][variant % 4];
  const hair =
    variant % 3 === 1
      ? `<circle cx="${headDx + 9}" cy="-92" r="7"/>` // a bun
      : variant % 5 === 2
      ? `<rect x="${headDx - 17}" y="-100" width="34" height="7" rx="3"/>` // a cap brim
      : '';
  return `<g class="${cls}" ${extra} transform="translate(${r(x)} ${r(y)}) scale(${s})">` +
    `<circle cx="${headDx}" cy="-78" r="${headR}"/>${hair}<path d="${DINER_BODY}"/></g>`;
}

export function shopSVG() {
  const back = { y: 352, s: 0.74, xs: [200, 350, 500, 650, 800], off: 48, w: 74 };
  const front = { y: 470, s: 1, xs: [140, 320, 500, 680, 860], off: 64, w: 96 };
  const seats = [];
  for (const row of [back, front]) {
    for (const cx of row.xs) {
      seats.push({ x: cx - row.off, y: row.y, s: row.s, row });
      seats.push({ x: cx + row.off, y: row.y, s: row.s, row });
    }
  }
  const order = shuffled(seats.length, 1414);
  const rank = new Array(seats.length);
  order.forEach((seatIdx, k) => (rank[seatIdx] = k));

  const tables = (row) =>
    row.xs
      .map(
        (cx) =>
          `<rect x="${cx - row.w / 2}" y="${row.y - 2}" width="${row.w}" height="${7 * row.s}" rx="2"/>` +
          `<rect x="${cx - 3 * row.s}" y="${row.y + 4}" width="${6 * row.s}" height="${(row === back ? 70 : 60)}"/>` +
          `<rect x="${cx - 18 * row.s}" y="${row.y + (row === back ? 70 : 60)}" width="${36 * row.s}" height="4" rx="2"/>`
      )
      .join('');

  const diners = (rowSel) =>
    seats
      .map((s, i) => (s.row === rowSel ? diner('d', s.x, s.y, s.s, `opacity="0" data-i="${i}" data-x="${s.x}" data-y="${s.y}" data-s="${s.s}" data-rank="${rank[i]}"`, i) : ''))
      .join('');

  // The reflection: the same room, full, mirrored in the glass.
  const ghosts = seats.map((s, i) => diner('g', s.x, s.y, s.s, '', i)).join('');
  const ghostTables = [back, front]
    .map((row) => row.xs.map((cx) => `<rect x="${cx - row.w / 2}" y="${row.y - 2}" width="${row.w}" height="${6 * row.s}" rx="2"/>`).join(''))
    .join('');

  const pendants = [120, 310, 500, 690, 880]
    .map(
      (x) =>
        `<line x1="${x}" y1="0" x2="${x}" y2="64" class="cord"/>` +
        `<path class="shade" d="M${x - 26},92 L${x - 12},64 L${x + 12},64 L${x + 26},92 Z"/>`
    )
    .join('');
  const glows = [120, 310, 500, 690, 880]
    .map((x) => `<ellipse cx="${x}" cy="104" rx="120" ry="96" fill="url(#glow)"/>`)
    .join('');

  return `<svg class="scene scene-shop" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="wallLit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F2B866"/><stop offset=".5" stop-color="#D98A45"/><stop offset="1" stop-color="#9A4F2C"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#FFE3A6" stop-opacity=".9"/><stop offset="1" stop-color="#FFE3A6" stop-opacity="0"/></radialGradient>
    <linearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2=".7">
      <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".28" stop-color="#fff" stop-opacity="1"/>
      <stop offset=".42" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity=".9"/>
      <stop offset="1" stop-color="#fff" stop-opacity=".4"/>
    </linearGradient>
    <filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <mask id="glassMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="560">
      <rect width="1000" height="560" fill="url(#sheenGrad)"/>
    </mask>
  </defs>
  <rect class="room-dark" x="-600" y="-300" width="2200" height="1160"/>
  <g class="room-lit" opacity="0">
    <rect x="-600" y="-300" width="2200" height="1160" fill="url(#wallLit)"/>
    <rect class="wainscot" x="-600" y="262" width="2200" height="600"/>
    <line class="rail" x1="-600" y1="262" x2="1600" y2="262"/>
    ${glows}
  </g>
  <g class="pendants">${pendants}</g>
  <g class="people">
    <g class="server" transform="translate(560 452)" opacity="0">
      <circle cx="0" cy="-158" r="15"/><path d="M-24,-10 C-26,-80 -22,-136 0,-138 C22,-136 26,-80 24,-10 Z"/><rect x="-9" y="-12" width="7" height="12"/><rect x="3" y="-12" width="7" height="12"/>
    </g>
    ${diners(back)}
    <g class="tables">${tables(back)}</g>
    ${diners(front)}
    <g class="tables">${tables(front)}</g>
  </g>
  <rect class="floor" x="-600" y="534" width="2200" height="400"/>
  <g class="reflection" opacity="0" mask="url(#glassMask)" filter="url(#soft)">
    <g transform="translate(1012 -10) scale(-1 1) skewX(-3)">
      <g class="ghost-tables">${ghostTables}</g>
      ${ghosts}
    </g>
  </g>
  <g class="sheen" opacity=".35">
    <polygon points="180,0 300,0 60,560 -60,560"/>
    <polygon points="330,0 360,0 120,560 90,560"/>
    <polygon points="760,0 860,0 640,560 540,560"/>
  </g>
  <g class="mullions">
    <rect x="-600" y="-300" width="2200" height="310"/>
    <rect x="-600" y="96" width="2200" height="9"/>
    <rect x="496" y="0" width="8" height="900"/>
  </g>
</svg>`;
}

export const DISHES = [
  { name: 'Short rib', color: '#6E2B1F' },
  { name: 'Soup', color: '#C9802F' },
  { name: 'Tart', color: '#E2B95C' },
  { name: 'Crudo', color: '#D98471', blank: true },
];

export function baseSVG() {
  const xs = [190, 360, 530, 700];
  const containers = DISHES.map((d, i) => {
    const x = xs[i];
    const top = 30, bot = 112, wt = 96, wb = 84;
    const body = `M${x - wt / 2},${top} L${x + wt / 2},${top} L${x + wb / 2},${bot} L${x - wb / 2},${bot} Z`;
    return `<g class="tub" data-i="${i}">
      <clipPath id="tubClip${i}"><path d="${body}"/></clipPath>
      <path class="tub-body" d="${body}"/>
      <rect class="tub-fill" clip-path="url(#tubClip${i})" x="${x - 50}" y="${bot}" width="100" height="0" fill="${d.color}"/>
      <rect class="tub-lid" x="${x - wt / 2 - 4}" y="${top - 7}" width="${wt + 8}" height="8" rx="3"/>
      <g class="tape" transform="rotate(${[-2, 1.5, -1, 2][i]} ${x} 66)">
        <rect class="tape-strip" x="${x - 38}" y="50" width="76" height="32" rx="2"/>
        <text class="tape-num" x="${x - 4}" y="75" text-anchor="middle">${d.blank ? '\u2014' : [16, 24, 10][i]}</text>
        <path class="tick" d="M${x + 16},68 l5,6 l11,-15" pathLength="1"/>
      </g>
    </g>`;
  }).join('');

  const tiles = `<pattern id="tile" width="44" height="22" patternUnits="userSpaceOnUse">
      <rect width="44" height="22" fill="none" stroke="#C9B48E" stroke-opacity=".55" stroke-width="1.2"/>
    </pattern>`;

  const cook = (cls, x, extra = '') =>
    `<g class="${cls}" ${extra} transform="translate(${x} 232)">` +
    `<rect x="-17" y="-128" width="34" height="12" rx="4"/><circle cx="0" cy="-104" r="17"/>` +
    `<path d="M-34,6 C-36,-40 -28,-80 0,-82 C28,-80 36,-40 34,6 Z"/></g>`;

  return `<svg class="scene scene-base" viewBox="70 -4 860 234" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
  <defs>${tiles}
    <filter id="softB" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <radialGradient id="tube"><stop offset="0" stop-color="#FFF6DC" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6DC" stop-opacity="0"/></radialGradient>
  </defs>
  <rect class="room-dark" x="-900" y="-200" width="2800" height="680"/>
  <g class="room-lit" opacity="1">
    <rect x="-900" y="-200" width="2800" height="680" fill="#EFDDB4"/>
    <rect x="-900" y="-200" width="2800" height="680" fill="url(#tile)"/>
    <ellipse cx="500" cy="10" rx="620" ry="150" fill="url(#tube)"/>
  </g>
  <rect class="tube" x="300" y="-8" width="400" height="8" rx="4"/>
  <rect class="shelf" x="96" y="112" width="720" height="9" rx="2"/>
  <path class="bracket" d="M140,121 v26 h10 v-16 Z M760,121 v26 h-10 v-16 Z"/>
  ${containers}
  <rect class="unlit" x="-900" y="-200" width="2800" height="680" opacity="0"/>
  <g class="cooks">
    ${cook('cook', 300, 'data-k="0" opacity="0"')}
    ${cook('cook', 640, 'data-k="1" opacity="0"')}
  </g>
  <g class="ghost-cooks" opacity="0" filter="url(#softB)">
    <g transform="translate(1010 -6) scale(-1 1)">
      ${cook('gc', 170)}${cook('gc', 470)}
    </g>
  </g>
  <rect class="counter" x="-900" y="212" width="2800" height="12"/>
  <rect class="counter-under" x="-900" y="224" width="2800" height="260"/>
  <g class="sheen" opacity=".3">
    <polygon points="120,0 190,0 90,280 20,280"/>
    <polygon points="820,0 900,0 800,280 720,280"/>
  </g>
</svg>`;
}
