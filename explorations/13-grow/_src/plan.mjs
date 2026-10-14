// Generates the drawing: one SVG world in which every mark is a unit.
// Default markup is the finished state (what no-JS and reduced motion show).
// site.js sets the starting states and animates from there.

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n) => Math.round(n * 10) / 10;

export const WORLD = {
  sheetA: { x: -40, y: -40, w: 1080, h: 1030 },
  sheetFullW: 2220,
};

const DISHES = [
  { name: 'Gnocchi', pred: 22, prep: 24 },
  { name: 'Short rib', pred: 16, prep: 18 },
  { name: 'Caesar', pred: 28, prep: 31 },
  { name: 'Lamb special', blank: true },
];

const TABLE_COLS = [150, 320, 640, 810];
const TABLE_ROWS = [330, 450, 570];
const REGULAR = { x: 596, y: 450 };

export function buildWorld() {
  const rand = rng(1312);
  const o = [];
  const S = WORLD.sheetA;
  const full = WORLD.sheetFullW;

  o.push(`<defs>
  <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="hatch-line"/></pattern>
  <linearGradient id="rollShade" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#f3c79c"/><stop offset=".35" stop-color="#fde3c6"/><stop offset=".7" stop-color="#e9b688"/><stop offset="1" stop-color="#cf9a6c"/>
  </linearGradient>
  <linearGradient id="rollShadow" x1="0" x2="1"><stop offset="0" stop-color="#2b1a33" stop-opacity=".16"/><stop offset="1" stop-color="#2b1a33" stop-opacity="0"/></linearGradient>
  <radialGradient id="candleGlow"><stop offset="0" stop-color="#fff4dc" stop-opacity=".95"/><stop offset=".55" stop-color="#fff4dc" stop-opacity=".5"/><stop offset="1" stop-color="#fff4dc" stop-opacity="0"/></radialGradient>
  <clipPath id="sheetClip"><rect id="sheetClipRect" x="${S.x}" y="${S.y - 20}" width="${full}" height="${S.h + 40}"/></clipPath>
</defs>`);

  // Table under the sheet, and the sheet itself
  o.push(`<rect class="table" x="-3000" y="-3000" width="9000" height="8000"/>`);
  o.push(`<g id="paper">
  <rect id="sheet" class="sheet" x="${S.x}" y="${S.y}" width="${full}" height="${S.h}"/>
  <rect id="sheetFrame" class="frame" x="${S.x + 18}" y="${S.y + 18}" width="${full - 36}" height="${S.h - 36}"/>
</g>`);

  // ---------- Plan A (ink, built) ----------
  o.push(`<g id="planA">`);
  o.push(`<rect class="floor" x="40" y="40" width="920" height="200"/>`);
  o.push(`<rect class="floor" id="diningFloor" x="40" y="240" width="920" height="420"/>`);

  // fixtures
  o.push(`<g id="fixtures">`);
  // range with six burners
  o.push(`<rect class="fx" x="60" y="52" width="170" height="60"/>`);
  for (const cx of [88, 145, 202]) for (const cy of [69, 95]) o.push(`<circle class="fx-thin" cx="${cx}" cy="${cy}" r="9"/>`);
  o.push(`<rect class="fx hatched" x="245" y="52" width="120" height="60"/>`);
  o.push(`<rect class="fx" x="380" y="52" width="120" height="60"/><line class="fx-thin" x1="440" y1="52" x2="440" y2="112"/>`);
  // sink
  o.push(`<rect class="fx" x="60" y="172" width="104" height="54"/><rect class="fx-thin" x="68" y="180" width="40" height="38" rx="6"/><rect class="fx-thin" x="116" y="180" width="40" height="38" rx="6"/>`);
  // prep table
  o.push(`<rect class="fx steel" x="540" y="50" width="402" height="174"/>`);
  // pass counter
  o.push(`<rect class="fx hatched" x="520" y="232" width="440" height="18"/>`);
  // bar and stools
  o.push(`<rect class="fx hatched" x="906" y="290" width="40" height="330"/>`);
  // host stand / POS
  o.push(`<g id="pos"><rect class="fx" x="560" y="604" width="54" height="36"/><rect class="ink-fill" x="572" y="611" width="30" height="16" rx="2"/></g>`);
  o.push(`</g>`);

  // tables + chairs
  const seats = [];
  const tables = [];
  let ti = 0;
  for (const cy of TABLE_ROWS) for (const cx of TABLE_COLS) {
    tables.push({ cx, cy, i: ti });
    o.push(`<circle class="glow" id="glow${ti}" cx="${cx}" cy="${cy}" r="62" fill="url(#candleGlow)"/>`);
    o.push(`<rect class="tbl" id="tbl${ti}" x="${cx - 28}" y="${cy - 28}" width="56" height="56"/>`);
    for (const [dx, dy] of [[-44, 0], [44, 0], [0, -44], [0, 44]]) {
      const s = { x: cx + dx, y: cy + dy, t: ti };
      seats.push(s);
      o.push(`<circle class="chair" cx="${s.x}" cy="${s.y}" r="9"/>`);
    }
    ti++;
  }
  for (let k = 0; k < 8; k++) {
    const s = { x: 884, y: Math.round(312 + k * 41), t: -1 };
    seats.push(s);
    o.push(`<circle class="chair" cx="${s.x}" cy="${s.y}" r="8"/>`);
  }

  // walls (drawn last in the plan so they sit on top)
  o.push(`<g id="walls">
  <path class="wall" pathLength="1" d="M40 150 V40 H960 V660 H860"/>
  <path class="wall" pathLength="1" d="M600 660 H520"/>
  <path class="wall" pathLength="1" d="M450 660 H360"/>
  <path class="wall" pathLength="1" d="M120 660 H40 V200"/>
  <path class="wall inner" pathLength="1" d="M40 240 H440"/>
  <path class="glass" d="M120 656 H360 M120 664 H360 M600 656 H860 M600 664 H860"/>
  <path class="door" d="M450 660 V592"/><path class="swing" d="M520 660 A68 68 0 0 0 450 592"/>
  <path class="door" d="M40 200 H90"/><path class="swing" d="M40 150 A50 50 0 0 1 90 200"/>
</g>`);

  // pans: one square per portion to make
  o.push(`<g id="pans">`);
  DISHES.forEach((d, i) => {
    const px = 556 + i * 96;
    o.push(`<g class="pan" id="pan${i}">`);
    o.push(`<rect class="pan-rim" x="${px}" y="58" width="84" height="118" rx="3"/>`);
    if (!d.blank) {
      for (let n = 0; n < d.prep; n++) {
        const c = n % 5, r = Math.floor(n / 5);
        const over = n >= d.pred;
        o.push(`<rect class="portion${over ? ' over' : ''}" x="${px + 6 + c * 15}" y="${158 - r * 15}" width="12" height="12"/>`);
      }
      const rowTop = 158 - Math.floor((d.pred - 1) / 5) * 15 - 2;
      o.push(`<path class="pred" d="M${px - 7} ${rowTop} H${px + 91}"/>`);
      o.push(`<text class="pan-name" x="${px}" y="194">${d.name}</text>`);
      o.push(`<text class="pan-count" x="${px}" y="217">${d.prep}</text>`);
    } else {
      o.push(`<text class="pan-name" x="${px}" y="194">${d.name}</text>`);
      o.push(`<text class="pencil" id="pencil"><tspan x="${px + 9}" y="86">Too new</tspan><tspan x="${px + 9}" y="102">to call,</tspan><tspan x="${px + 9}" y="118">so we</tspan><tspan x="${px + 9}" y="134">don't.</tspan></text>`);
    }
    o.push(`</g>`);
  });
  o.push(`</g>`);

  // last night's sales: one dot per dish sold (transient)
  o.push(`<g id="sales" class="transient">`);
  for (const t of tables) {
    const n = 4 + Math.floor(rand() * 11);
    const cells = [...Array(16).keys()].sort(() => rand() - 0.5).slice(0, n);
    for (const c of cells) {
      const x = t.cx - 16.5 + (c % 4) * 11, y = t.cy - 16.5 + Math.floor(c / 4) * 11;
      o.push(`<circle class="sale" cx="${x}" cy="${y}" r="3.4"/>`);
    }
  }
  for (let k = 0; k < 8; k++) {
    const n = 1 + Math.floor(rand() * 2);
    for (let j = 0; j < n; j++) o.push(`<circle class="sale" cx="${918 + j * 12}" cy="${312 + k * 41}" r="3.4"/>`);
  }
  o.push(`</g>`);
  o.push(`<text id="salesNote" class="note transient" x="560" y="712">Last night's sales, one dot per dish.</text>`);
  o.push(`<g id="envelope" class="transient"><rect class="env" x="574" y="600" width="28" height="20"/><path class="env-flap" d="M574 600 L588 612 L602 600"/></g>`);

  // guests: one circle per cover. Ink = a normal Tuesday; blue = proposed growth.
  const chairSeats = seats.filter((s) => !(s.x === REGULAR.x && s.y === REGULAR.y));
  const order = [...chairSeats.keys()].sort(() => rand() - 0.5);
  const inkSeats = order.slice(0, 19).map((k) => chairSeats[k]);
  const blueSeats = order.slice(19, 33).map((k) => chairSeats[k]);
  o.push(`<g id="guests">`);
  o.push(`<circle class="guest ink-g regular" cx="${REGULAR.x}" cy="${REGULAR.y}" r="8.5" data-t="10"/>`);
  inkSeats.forEach((s) => o.push(`<circle class="guest ink-g" cx="${s.x}" cy="${s.y}" r="8.5" data-t="${s.t}"/>`));
  blueSeats.forEach((s, k) => {
    const week = k < 5 ? 2 : k < 10 ? 3 : 4;
    o.push(`<circle class="guest blue-g" cx="${s.x}" cy="${s.y}" r="7.5" data-week="${week}" data-t="${s.t}"/>`);
  });
  o.push(`</g>`);
  // the still drawing shows the last Tuesday: tables with guests are lit
  const litT = new Set([...inkSeats, ...blueSeats].map((s) => s.t).filter((t) => t >= 0).concat([10]));
  for (let k = 0; k < o.length; k++) {
    o[k] = o[k].replace(/class="glow" id="glow(\d+)"/, (m, t) => litT.has(+t) ? `class="glow on" id="glow${t}"` : m)
      .replace(/class="tbl" id="tbl(\d+)"/, (m, t) => litT.has(+t) ? `class="tbl lit" id="tbl${t}"` : m);
  }
  o.push(`<g id="rings">${[15, 20, 25].map((r, k) => `<circle class="ring" cx="${REGULAR.x}" cy="${REGULAR.y}" r="${r}" data-week="${k + 2}"/>`).join('')}</g>`);

  // staff: one marker per person on the shift (proposed)
  const staff = [
    { x: 150, y: 142 }, { x: 305, y: 142 }, { x: 480, y: 410 }, { x: 480, y: 540 },
  ];
  o.push(`<g id="staff">`);
  staff.forEach((p, k) => o.push(`<g class="staffer" data-x="${p.x}" data-y="${p.y}" transform="translate(${p.x} ${p.y})"><rect class="staff-c" x="-9" y="-9" width="18" height="18" transform="rotate(45)"/></g>`));
  o.push(`</g>`);
  o.push(`</g>`); // planA

  // ---------- hour strip: the scale bar becomes a shift plan ----------
  o.push(`<g id="strip">`);
  o.push(`<g id="scalebar">`);
  for (let k = 0; k < 8; k++) o.push(`<rect class="${k % 2 ? 'sb-light' : 'sb-dark'}" x="${120 + k * 87.5}" y="862" width="87.5" height="10"/>`);
  o.push(`</g>`);
  o.push(`<g id="hours"><rect class="hour-box" x="120" y="862" width="700" height="10"/>`);
  for (let k = 1; k < 7; k++) o.push(`<line class="hour-tick" x1="${120 + k * 100}" y1="862" x2="${120 + k * 100}" y2="872"/>`);
  o.push(`<text class="strip-label" x="120" y="950">4pm</text><text class="strip-label" x="820" y="950" text-anchor="end">11pm</text></g>`);
  const busy = [0.1, 0.16, 0.26, 0.42, 0.62, 0.82, 0.97, 1, 0.9, 0.74, 0.56, 0.4, 0.26, 0.15, 0.08];
  const pts = busy.map((v, k) => [120 + k * 50, 860 - v * 34]);
  let d = `M${pts[0][0]} ${r1(pts[0][1])}`;
  for (let k = 1; k < pts.length; k++) {
    const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
    const mx = (x0 + x1) / 2;
    d += ` C${mx} ${r1(y0)} ${mx} ${r1(y1)} ${x1} ${r1(y1)}`;
  }
  o.push(`<path id="busy" class="busy" pathLength="1" d="${d}"/>`);
  const bars = [[120, 820], [270, 720], [220, 820], [320, 720]];
  o.push(`<g id="bars">`);
  bars.forEach(([a, b], k) => o.push(`<rect class="bar-dot" x="-3.6" y="-3.6" width="7.2" height="7.2" transform="translate(102 ${884 + k * 13}) rotate(45)"/><rect class="shift-bar" x="${a}" y="${880 + k * 13}" width="${b - a}" height="8"/>`));
  o.push(`</g>`);
  o.push(`<text id="rotaLabel" class="rota-label" x="120" y="822">Tuesday: 2 line, 2 floor</text>`);
  o.push(`</g>`);

  // ---------- proposed: patio, street, second place ----------
  o.push(`<g id="patio">
  <path class="b-line" pathLength="1" d="M120 672 V800 H860 V672"/>
  ${[200, 330, 620, 760].map((x) => `<circle class="b-thin" cx="${x}" cy="${738}" r="15"/><circle class="b-thin" cx="${x - 27}" cy="738" r="7"/><circle class="b-thin" cx="${x + 27}" cy="738" r="7"/>`).join('')}
</g>`);

  o.push(`<g clip-path="url(#sheetClip)">`);
  o.push(`<g id="street"><path class="curb" pathLength="1" d="M1110 -22 V972"/><path class="curb" pathLength="1" d="M1290 -22 V972"/></g>`);
  o.push(`<g id="placeB">
  <path class="b-wall" pathLength="1" d="M1340 160 H2060 V640 H1730"/>
  <path class="b-wall" pathLength="1" d="M1670 640 H1340 V160"/>
  <path class="b-line" pathLength="1" d="M1340 300 H1640"/>
  <rect class="b-thin" x="1700" y="292" width="360" height="14"/>
  ${[0, 1, 2, 3].map((k) => `<rect class="b-thin" x="${1760 + k * 56}" y="190" width="42" height="64" rx="3"/>`).join('')}
  <rect class="b-thin" x="1370" y="180" width="140" height="44"/>
  ${[1450, 1580, 1830, 1960].flatMap((x) => [400, 540].map((y) => `<rect class="b-thin" x="${x - 22}" y="${y - 22}" width="44" height="44"/>`)).join('')}
  <path class="b-thin" d="M1670 640 V584"/><path class="b-thin" d="M1730 640 A60 60 0 0 0 1670 580"/>
  <text id="placeName" class="place-name" x="1700" y="718" text-anchor="middle">Your place</text>
</g>`);
  o.push(`<g id="link"><path id="linkPath" class="b-line" pathLength="1" d="M966 140 H1200 V230 H1334"/><circle class="b-dot" cx="966" cy="140" r="4.5"/><circle class="b-dot" cx="1334" cy="230" r="4.5"/></g>`);
  o.push(`</g>`);

  // the roll of paper at the sheet's right edge
  o.push(`<g id="roll" transform="translate(${S.x + full} 0)"><rect x="0" y="${S.y - 6}" width="34" height="${S.h + 12}" fill="url(#rollShadow)"/><rect x="-14" y="${S.y - 8}" width="26" height="${S.h + 16}" rx="13" fill="url(#rollShade)" class="roll-body"/></g>`);

  // numbered tags for the still drawing
  const tags = [[420, 622, 1], [548, 40, 2], [92, 840, 3], [560, 410, 4], [1330, 690, 5]];
  o.push(`<g id="tags" aria-hidden="true">${tags.map(([x, y, n]) => `<g class="tag" transform="translate(${x} ${y})"><circle r="17"/><text y="6" text-anchor="middle">${n}</text></g>`).join('')}</g>`);

  return o.join('\n');
}
