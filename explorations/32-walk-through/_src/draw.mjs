// Tooey, exploration 32: the walk-through.
// Writes the one continuous line drawing of the restaurant into index.html,
// between <!-- drawing:start --> and <!-- drawing:end -->.
// Run: node draw.mjs
//
// The building is drawn as one long elevation, 6430 x 1000 units:
//   street front 0-1430 | dining room 1430-2900 | counter 2900-3930 |
//   kitchen line 3930-5320 | prep table 5320-6430
// Floor at y 840, ceiling at y 160.
//
// Each room is a <g class="room"> with layers, back to front:
//   wash  lamplight glows (fade in once the lines are drawn)
//   fill  lamplit surfaces (menu board, window glass, the prep sheet)
//   ln    line work, timed structure (s), furniture (f), detail (d, back)
//   live  pieces that move on arrival (guests, receipt, tickets, cooks, counts)
import fs from 'node:fs';

const here = new URL('.', import.meta.url).pathname;
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const n = (v) => Math.round(v * 10) / 10;

const P = (d, cls) => `<path d="${d}"${cls ? ` class="${cls}"` : ''}/>`;
const R = (x, y, w, h) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
const RR = (x, y, w, h, r) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
const C = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${r} ${r} 0 1 0 ${n(2 * r)} 0a${r} ${r} 0 1 0 ${n(-2 * r)} 0`;
const E = (cx, cy, rx, ry) => `M${n(cx - rx)} ${n(cy)}a${rx} ${ry} 0 1 0 ${n(2 * rx)} 0a${rx} ${ry} 0 1 0 ${n(-2 * rx)} 0`;
const L = (x1, y1, x2, y2) => `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
const G = (cx, cy, rx, ry, o = 1, cls = '', style = '') =>
  `<ellipse class="glow${cls ? ' ' + cls : ''}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" style="--o:${o}${style ? ';' + style : ''}"/>`;
const F = (d, fo = 0.5, cls = '', style = '') =>
  `<path d="${d}" class="lamp${cls ? ' ' + cls : ''}" style="--fo:${fo}${style ? ';' + style : ''}"/>`;

// hatched wall section between x0 and x1
function section(x0, x1, y0, y1) {
  let d = '';
  for (let y = y0 + 4; y < y1 + (x1 - x0); y += 18) {
    const ya = Math.min(y, y1), xa = x0 + (y - ya);
    const yb = Math.max(y - (x1 - x0), y0), xb = x0 + (y - yb);
    if (xa < x1 && xb > x0) d += L(xa, ya, Math.min(xb, x1), yb);
  }
  return d;
}

// brick or tile courses over a region, skipping holes; some joints dropped so
// the coursing thins out the way a pencil hatch does
function courses({ x0, x1, y0, y1, h, w, holes = [], drop = 0.4 }) {
  const hit = (x, y) => holes.some(([a, b, c, e]) => x >= a && x <= c && y >= b && y <= e);
  let d = '';
  for (let y = y0, row = 0; y <= y1; y += h, row++) {
    const off = row % 2 ? w / 2 : 0;
    let run = null;
    const flush = () => { if (run) { d += `M${n(run[0])} ${n(y)}H${n(run[1])}`; run = null; } };
    for (let x = x0 - off; x < x1; x += w) {
      const a = Math.max(x, x0), b = Math.min(x + w, x1);
      if (b - a < 4) continue;
      if (hit(a + 1, y) || hit(b - 1, y) || hit((a + b) / 2, y) || rnd() < drop) { flush(); continue; }
      if (run && Math.abs(run[1] - a) < 0.5) run[1] = b; else { flush(); run = [a, b]; }
      if (b < x1 && y + h <= y1 && !hit(b, y + h / 2) && !hit(b, y + h - 1) && !hit(b, y + 1) && rnd() > drop * 0.8) {
        d += `M${n(b)} ${n(y)}V${n(y + h)}`;
        // keep the horizontal run going after the joint
      }
    }
    flush();
  }
  return d;
}

function room(id, i, Ly) {
  const g = (k) => (Ly[k] || []).join('');
  return `<g class="room" id="r-${id}" data-i="${i}">
<g class="wash">${g('wash')}</g>
<g class="fill">${g('fill')}</g>
<g class="ln back" data-t="d">${g('back')}</g>
<g class="ln s" data-t="s">${g('s')}</g>
<g class="ln f" data-t="f">${g('f')}</g>
<g class="ln d" data-t="d">${g('d')}</g>
${Ly.live || ''}
</g>`;
}
const blank = () => ({ wash: [], fill: [], back: [], s: [], f: [], d: [], live: '' });

/* ------------------------------------------------------------------ */
/* 0. The street front                                                  */
const st = blank();
st.s.push(P('M0 840H1400'), P('M0 872H1400', 'faint'));
let kerb = '';
for (let x = 70; x < 1400; x += 130) kerb += `M${x} 840V872`;
st.d.push(P(kerb, 'faint'));
// facade, cornice, sign band
st.s.push(P('M260 840V104'), P('M240 86H1400M240 86V104H1400'), P('M260 120H1400'), P('M260 372H1400M260 436H1400'));
// upper floor
for (const cx of [410, 700, 990, 1270]) {
  st.s.push(P(R(cx - 65, 170, 130, 150)));
  st.f.push(P(`M${cx - 76} 322H${cx + 76}M${cx - 76} 331H${cx + 76}`));
  st.d.push(P(R(cx - 58, 177, 116, 136) + `M${cx} 177V313M${cx - 58} 246H${cx + 58}`, 'faint'));
}
st.fill.push(F(R(1212, 177, 116, 136), 0.32));
st.wash.push(G(1270, 248, 95, 105, 0.55));
// awning
st.f.push(P('M470 440H930L960 500H440Z'));
let val = 'M440 500';
for (let x = 440; x < 960; x += 40) val += `Q${x + 20} 522 ${x + 40} 500`;
st.f.push(P(val));
let stripes = '';
for (let k = 1; k < 10; k++) stripes += L(470 + k * 46, 440, 440 + k * 52, 500);
st.d.push(P(stripes, 'faint'));
st.d.push(P('M478 440L456 408M922 440L944 408', 'faint'));
// doorway and the two leaves (they swing open on arrival)
st.s.push(P(R(552, 516, 296, 324)), P('M564 840V528H836V840'), P('M538 840V850H862V840'));
st.f.push(`<g class="door-l">${P(R(566, 530, 134, 310))}${P(R(580, 546, 106, 170))}${P(R(580, 736, 106, 90))}${P(R(683, 640, 6, 124), 'strong')}${P('M594 612L646 560M602 650L680 572', 'faint')}</g>`);
st.f.push(`<g class="door-r">${P(R(700, 530, 134, 310))}${P(R(714, 546, 106, 170))}${P(R(714, 736, 106, 90))}${P(R(711, 640, 6, 124), 'strong')}${P('M728 612L780 560M736 650L814 572', 'faint')}</g>`);
st.fill.push(F(R(566, 530, 268, 310), 0.3, 'doorlight'));
// what the open door shows: the dining room inside, lit
st.f.push(`<g class="inside">${P('M700 530V586M676 604Q678 588 700 587Q722 588 724 604Z')}${P('M624 728H776M700 728V832M680 840L700 830L720 840')}${P(C(650, 668, 15) + 'M624 728C626 702 636 688 650 688C662 688 670 698 672 712')}${P('M748 704Q748 714 754 714Q760 714 760 704ZM754 714V728', 'faint')}</g>`);
st.fill.push(`<path d="M566 840H834L990 900H410Z" class="spill"/>`);
st.wash.push(G(700, 700, 230, 230, 0.75, 'doorglow'));
// sconces
st.f.push(P(R(522, 572, 10, 40)), P('M532 586H540'), P(C(552, 588, 12)));
st.f.push(P(R(868, 572, 10, 40)), P('M868 586H860'), P(C(848, 588, 12)));
st.fill.push(F(C(552, 588, 12), 0.95), F(C(848, 588, 12), 0.95));
st.wash.push(G(552, 596, 82, 100, 0.95), G(848, 596, 82, 100, 0.95));
// menu case
st.f.push(P(R(330, 560, 110, 150)), P(R(340, 570, 90, 130), 'faint'));
let menu = 'M356 590H414';
for (let k = 0; k < 7; k++) { const y = 612 + k * 12; menu += `M350 ${y}H${n(372 + rnd() * 26)}M412 ${y}H420`; }
st.d.push(P(menu));
st.fill.push(F(R(340, 570, 90, 130), 0.55));
st.wash.push(G(385, 636, 100, 125, 0.8));
// the front window, lit inside
st.s.push(P(R(926, 466, 418, 338)));
st.f.push(P('M916 806H1354M916 816H1354'), P('M936 560H1334'), P('M1135 560V800'));
st.d.push(P(R(936, 476, 398, 318), 'faint'));
for (const cx of [1030, 1240]) {
  st.f.push(P(`M${cx} 476V596`), P(`M${cx - 28} 624Q${cx - 27} 597 ${cx} 596Q${cx + 27} 597 ${cx + 28} 624Z`));
  st.fill.push(F(E(cx, 624, 27, 4), 0.95));
  st.wash.push(G(cx, 660, 120, 140, 0.9));
}
st.f.push(P(C(1000, 714, 21)), P('M962 796C966 762 982 742 1000 742C1018 742 1034 762 1038 796'));
st.f.push(P(C(1274, 714, 21)), P('M1236 796C1240 762 1256 742 1274 742C1292 742 1308 762 1312 796'));
st.d.push(P('M1060 766H1214'), P('M1112 744Q1112 756 1120 756Q1128 756 1128 744ZM1120 756V766M1150 744Q1150 756 1158 756Q1166 756 1166 744ZM1158 756V766'));
st.fill.push(F(R(936, 476, 398, 318), 0.24));
st.d.push(P('M958 548L1010 496M972 566L1040 498', 'faint'));
// planter
st.f.push(P('M862 798L868 840H908L914 798Z'));
st.d.push(P('M888 798C884 770 870 750 856 742M888 798C890 764 900 748 918 738M888 798C888 776 884 752 892 722M888 798C878 784 866 780 854 784M888 798C898 786 910 784 920 788'));
// street lamp
st.f.push(P('M150 818V262'), P(R(138, 818, 24, 22)), P('M150 276C152 244 190 238 218 252'), P('M206 252H230L236 290H200Z'), P('M202 252L218 240L234 252'));
st.fill.push(F('M206 252H230L236 290H200Z', 0.9));
st.wash.push(G(218, 310, 95, 135, 0.85));
// party wall: the cut into the building
st.s.push(P('M1400 86V840M1430 86V840M1400 86H1430'));
st.d.push(P(section(1400, 1430, 86, 840), 'faint'));
// brickwork
st.back.push(P(courses({
  x0: 262, x1: 1398, y0: 126, y1: 820, h: 20, w: 46, drop: 0.5,
  holes: [[258, 366, 1402, 442], [330, 164, 490, 338], [620, 164, 780, 338], [910, 164, 1070, 338], [1190, 164, 1350, 338],
    [432, 432, 968, 852], [320, 550, 450, 720], [512, 562, 568, 620], [832, 562, 888, 620], [912, 456, 1360, 822], [848, 700, 924, 842]]
}), 'faint2'));

/* ------------------------------------------------------------------ */
/* 1. The dining room                                                   */
const dn = blank();
dn.s.push(P('M1430 840H2880'), P('M1430 160H2880'));
dn.d.push(P('M1430 176H2880', 'faint'), P('M1430 818H2880', 'faint'));
dn.f.push(P('M1430 600H2880M1430 608H2880'));
let wains = '';
for (let x = 1560; x < 2880; x += 130) wains += `M${x} 608V818`;
dn.back.push(P(wains, 'faint2'));
dn.s.push(P('M2880 160V840M2920 160V840'));
dn.f.push(P('M2872 176H2928M2872 188H2928M2872 822H2928'));

function chair(bx, s) {
  const x = (dx) => n(bx + dx * s);
  return P(`M${x(0)} 840L${x(4)} 704L${x(-6)} 566`) +
    P(`M${x(-14)} 570Q${x(-6)} 562 ${x(4)} 566M${x(-3)} 612L${x(5)} 613M${x(-1)} 640L${x(6)} 641`) +
    P(`M${x(2)} 700H${x(64)}M${x(4)} 708H${x(62)}`) +
    P(`M${x(58)} 708L${x(62)} 840`);
}
function guest(hx, s, i) {
  return `<g class="guest" style="--gi:${i}"><g transform="translate(${hx} 700) scale(${s} 1)">` +
    P(C(10, -124, 19)) +
    P('M-14 0C-18 -40 -14 -80 2 -98Q12 -104 22 -95C32 -72 34 -40 30 -8') +
    P('M-14 0H60M30 -8H62Q70 -6 66 0') +
    P('M60 2L64 136H84M66 0L72 134') +
    P('M16 -84C22 -58 40 -50 72 -52') +
    '</g></g>';
}
const TABLES = [1700, 2160, 2620];
let guests = '', gi = 0;
TABLES.forEach((cx, ti) => {
  dn.f.push(P(R(cx - 104, 648, 208, 10)), P(`M${cx} 658V828`), P(`M${cx - 46} 840L${cx - 8} 826H${cx + 8}L${cx + 46} 840`));
  dn.f.push(chair(cx - 160, 1), chair(cx + 160, -1));
  dn.d.push(P(`M${cx - 78} 646Q${cx - 60} 650 ${cx - 42} 646M${cx + 42} 646Q${cx + 60} 650 ${cx + 78} 646`));
  dn.d.push(P(`M${cx - 36} 630Q${cx - 36} 640 ${cx - 30} 640Q${cx - 24} 640 ${cx - 24} 630ZM${cx - 30} 640V648M${cx + 24} 630Q${cx + 24} 640 ${cx + 30} 640Q${cx + 36} 640 ${cx + 36} 630ZM${cx + 30} 640V648`, 'faint'));
  // the table lamp: it comes on as the table fills
  dn.f.push(P(`M${cx} 648V628M${cx - 7} 648H${cx + 7}`), P(`M${cx - 15} 628L${cx - 9} 608H${cx + 9}L${cx + 15} 628Z`));
  dn.fill.push(F(`M${cx - 15} 628L${cx - 9} 608H${cx + 9}L${cx + 15} 628Z`, 0.95, 'tl', `--td:${ti}`));
  dn.wash.push(G(cx, 626, 160, 120, 1, 'tglow', `--td:${ti}`));
  // pendant over each table
  dn.f.push(P(`M${cx} 160V418`), P(`M${cx - 50} 470Q${cx - 48} 420 ${cx} 418Q${cx + 48} 420 ${cx + 50} 470Z`));
  dn.d.push(P(E(cx, 470, 50, 6)), P(`M${cx - 48} 476L${cx - 126} 640M${cx + 48} 476L${cx + 126} 640`, 'faint2'));
  dn.fill.push(F(E(cx, 471, 46, 5), 0.95));
  dn.wash.push(G(cx, 560, 200, 220, 0.62));
  guests += guest(cx - 136, 1, gi++) + guest(cx + 136, -1, gi++);
});
for (const cx of [1930, 2390]) {
  dn.f.push(P(R(cx - 75, 250, 150, 112)));
  dn.d.push(P(R(cx - 63, 262, 126, 88), 'faint'), P(`M${cx - 63} 330C${cx - 40} 300 ${cx - 10} 318 ${cx + 10} 306C${cx + 30} 296 ${cx + 50} 312 ${cx + 63} 304`, 'faint'), P(C(cx + 30, 286, 8), 'faint'));
}
// coat stand by the door
dn.f.push(P('M1500 822V430'), P('M1476 840L1500 822L1524 840'), P('M1500 452L1478 436M1500 452L1522 436'));
dn.d.push(P('M1480 440C1468 474 1466 524 1472 566H1494C1500 524 1494 474 1488 442', 'faint'));
dn.live = `<g class="live guests">${guests}</g>`;

/* ------------------------------------------------------------------ */
/* 2. Behind the counter                                                */
const ct = blank();
ct.s.push(P('M2920 840H3900'), P('M2920 160H3900'));
ct.s.push(P('M2960 330H3860M2960 338H3860'), P('M2960 450H3860M2960 458H3860'));
let brk = '';
for (const x of [3000, 3420, 3820]) brk += `M${x} 338L${x + 14} 354M${x} 458L${x + 14} 474`;
ct.d.push(P(brk, 'faint'));
let bottles = '';
for (let x = 2986; x < 3840; x += 30 + rnd() * 10) {
  if (rnd() < 0.18) continue;
  const h = 34 + rnd() * 24, w = 14 + (rnd() < 0.3 ? 4 : 0), t = 330 - h;
  bottles += `M${n(x)} 330V${n(t)}Q${n(x)} ${n(t - 10)} ${n(x + w / 2 - 3)} ${n(t - 14)}V${n(t - 26)}H${n(x + w / 2 + 3)}V${n(t - 14)}Q${n(x + w)} ${n(t - 10)} ${n(x + w)} ${n(t)}V330`;
}
ct.d.push(P(bottles));
let glasses = '';
for (let x = 2990; x < 3850; x += 28) {
  if ((x > 3160 && x < 3400) || (x > 3440 && x < 3560)) continue;
  glasses += `M${x} 450H${x + 14}M${x + 7} 450V433M${x} 412Q${x} 433 ${x + 7} 433Q${x + 14} 433 ${x + 14} 412`;
}
ct.d.push(P(glasses, 'faint'));
ct.s.push(P('M2970 590H3850M2970 604H3850'), P('M2990 604V840M3830 604V840'));
let slats = '';
for (let x = 3014; x < 3820; x += 24) slats += `M${x} 612V834`;
ct.back.push(P(slats, 'faint2'));
// the POS
ct.f.push(P('M3196 452L3370 446L3378 568L3204 574Z'), P('M3288 571L3292 588'), P('M3258 590Q3290 580 3322 590'));
ct.d.push(P('M3208 462L3360 457L3366 558L3214 563Z', 'faint'));
let tiles = '';
for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) tiles += R(3222 + c * 46, 474 + r * 38, 38, 28);
tiles += R(3226, 548 - 2, 128, 6);
ct.d.push(P(tiles, 'faint'));
ct.fill.push(F('M3208 462L3360 457L3366 558L3214 563Z', 0.5));
ct.fill.push(F(R(3268, 512, 38, 28), 0.95, 'tap'));
ct.wash.push(G(3288, 512, 160, 120, 0.75));
// the receipt printer, and its receipt
ct.f.push(P('M3440 590V542Q3440 532 3450 532H3538Q3548 532 3548 542V590Z'), P('M3462 546H3526'), P(C(3532, 574, 4)));
let print = 'M3480 410H3510';
const widths = [22, 30, 18, 26, 30, 14, 24, 28, 20, 26, 16, 30, 22];
widths.forEach((w, k) => { const y = 422 + k * 9; print += `M3478 ${y}H${3478 + w}M${3516 - 4} ${y}H3516`; });
print += 'M3478 548H3516';
ct.live = `<g class="live" clip-path="url(#clip-rc)"><g class="receipt">${P('M3468 548V408C3468 400 3472 396 3480 398L3522 396V548', 'paper')}${P(print, 'print')}</g></g>`;
// pendants and stools
for (const cx of [3110, 3720]) {
  ct.f.push(P(`M${cx} 160V364`), P(`M${cx - 32} 404L${cx - 12} 364H${cx + 12}L${cx + 32} 404Z`));
  ct.fill.push(F(E(cx, 405, 28, 4), 0.95));
  ct.wash.push(G(cx, 510, 170, 190, 0.66));
}
for (const cx of [3070, 3620, 3780]) {
  ct.f.push(P(`M${cx - 30} 688H${cx + 30}Q${cx + 30} 698 ${cx} 700Q${cx - 30} 698 ${cx - 30} 688Z`), P(`M${cx - 20} 699L${cx - 28} 840M${cx + 20} 699L${cx + 28} 840`));
  ct.d.push(P(`M${cx - 24} 778H${cx + 24}`));
}
// wall to the kitchen
ct.s.push(P('M3900 160V300M3930 160V300M3900 300H3930'));
ct.d.push(P(section(3900, 3930, 160, 300), 'faint'));

/* ------------------------------------------------------------------ */
/* 3. The kitchen line                                                  */
const kt = blank();
kt.s.push(P('M3930 840H5320'), P('M3930 160H5320'));
kt.s.push(P('M4010 300L4060 192H5140L5190 300Z'), P('M4010 300V314H5190V300'), P('M4480 160V192M4720 160V192'));
let filt = '';
for (let k = 0; k < 4; k++) {
  const x0 = 4092 + k * 258;
  filt += R(x0, 210, 236, 76);
  for (let j = 0; j < 10; j++) filt += L(x0 + 8 + j * 23, 284, x0 + 28 + j * 23, 212);
}
kt.d.push(P(filt, 'faint'));
kt.s.push(P('M3960 636H5300M3960 650H5300'));
kt.f.push(P('M3972 650V840M5288 650V840M4300 650V840M4630 650V840M4960 650V840'));
kt.d.push(P('M4116 690H4156M4446 690H4486M4776 690H4816M5104 690H5144'));
kt.f.push(P('M4060 330H5140M4060 336H5140'), P('M4060 324V342M5140 324V342'));
const HL = [4170, 4510, 4850];
for (const x of HL) {
  kt.f.push(P(R(x, 424, 240, 14)), P(`M${x + 24} 314V424M${x + 216} 314V424`));
  kt.fill.push(F(R(x + 6, 438, 228, 4), 0.95));
  kt.wash.push(G(x + 120, 560, 210, 170, 0.92));
}
// tickets clip on to the rail
const TK = [4120, 4240, 4316, 4440, 4600, 4800, 4920, 5004];
let tickets = '';
TK.forEach((x, k) => {
  let lines = `M${x + 8} 352H${x + 36}`;
  for (let j = 0; j < 4; j++) lines += `M${x + 8} ${364 + j * 10}H${n(x + 22 + rnd() * 20)}`;
  tickets += `<g class="ticket" style="--ti:${k}">${P(R(x, 338, 52, 68), 'paper')}${P(lines, 'print')}${P(`M${x + 20} 332V342M${x + 32} 332V342`)}</g>`;
});
// cooks step on to the line
const CK = [4290, 4630, 4970];
let cooks = '';
CK.forEach((cx, k) => {
  cooks += `<g class="cook" style="--ci:${k}">` +
    P(`M${cx - 64} 636C${cx - 62} 588 ${cx - 44} 558 ${cx} 556C${cx + 44} 558 ${cx + 62} 588 ${cx + 64} 636`) +
    P(C(cx, 532, 20)) +
    P(`M${cx - 18} 512V498H${cx + 18}V512`) +
    P(`M${cx - 18} 498C${cx - 34} 494 ${cx - 30} 468 ${cx - 12} 472C${cx - 8} 456 ${cx + 8} 456 ${cx + 12} 472C${cx + 30} 468 ${cx + 34} 494 ${cx + 18} 498`) +
    P(`M${cx - 15} 558L${cx} 578L${cx + 15} 558`) +
    P(C(cx - 10, 596, 2) + C(cx + 10, 596, 2) + C(cx - 10, 614, 2) + C(cx + 10, 614, 2), 'faint') +
    P(`M${cx - 44} 590C${cx - 40} 612 ${cx - 30} 628 ${cx - 16} 636M${cx + 44} 590C${cx + 40} 612 ${cx + 30} 628 ${cx + 16} 636`) +
    '</g>';
});
// pots, steam, plates, clock
kt.f.push(P('M4044 636V572H4124V636'), P('M4038 572H4130'), P('M4048 572Q4084 554 4120 572'), P('M4044 590H4034V604H4044M4124 590H4134V604H4124'));
kt.f.push(P('M5186 636V600H5250V636'), P('M5180 600H5256'), P('M5250 610H5296'));
let steam = '';
for (const [x, top] of [[4066, 420], [4086, 400], [4106, 430], [5208, 470], [5226, 456]]) {
  steam += `<path d="M${x} ${x > 5000 ? 590 : 548}C${x - 12} ${top + 90} ${x + 12} ${top + 60} ${x} ${top + 30}C${x - 10} ${top + 10} ${x + 8} ${top} ${x} ${top - 16}" style="--sd:${n(rnd() * 3)}s"/>`;
}
for (const x of [4460, 4800]) kt.d.push(P(`M${x - 44} 634Q${x} 642 ${x + 44} 634Q${x} 626 ${x - 44} 634ZM${x - 16} 630Q${x} 618 ${x + 16} 630`));
kt.f.push(P(C(5252, 400, 28)));
kt.d.push(P('M5252 376V382M5252 418V424M5228 400H5234M5270 400H5276'), P('M5252 400V382M5252 400L5240 414', 'strong'));
kt.back.push(P(courses({
  x0: 3944, x1: 5306, y0: 452, y1: 630, h: 22, w: 44, drop: 0.42,
  holes: [[4214, 440, 4366, 640], [4554, 440, 4706, 640], [4894, 440, 5046, 640], [4028, 540, 4142, 640], [5172, 590, 5300, 640]]
}) + courses({ x0: 3944, x1: 4004, y0: 194, y1: 430, h: 22, w: 44, drop: 0.4 }) +
  courses({ x0: 5198, x1: 5306, y0: 194, y1: 430, h: 22, w: 44, drop: 0.4, holes: [[5218, 366, 5288, 434]] }), 'faint2'));
kt.live = `<g class="live tickets">${tickets}</g><g class="live cooks">${cooks}</g><g class="steam">${steam}</g>`;

/* ------------------------------------------------------------------ */
/* 4. The prep table and the prep sheet                                 */
const pp = blank();
pp.s.push(P('M5320 840H6400'), P('M5320 160H6400'), P('M6400 160V840M6430 160V840M6400 160H6430'));
pp.d.push(P(section(6400, 6430, 160, 840), 'faint'));
pp.s.push(P(R(5420, 640, 880, 14)), P('M5440 654V840M6280 654V840M5860 654V840'));
pp.f.push(P('M5440 776H6280M5440 784H6280'));
pp.f.push(P('M5420 300H6300M5420 308H6300'));
pp.d.push(P('M5460 308L5480 328M6260 308L6240 328M5860 308L5880 328', 'faint'));
let shelf = '';
for (const [x, w, h] of [[5440, 54, 62], [5502, 54, 62], [5580, 40, 44], [5690, 70, 50], [5772, 70, 50], [5890, 46, 70], [5944, 46, 70], [6080, 80, 36], [6080, 80, 36], [6180, 54, 58]]) {
  shelf += R(x, 300 - h, w, h) + `M${x - 2} ${300 - h + 8}H${x + w + 2}`;
}
pp.d.push(P(shelf));
pp.d.push(P(R(5480, 760, 200, 16) + 'M5480 768H5680' + R(5940, 736, 60, 40) + R(6010, 736, 60, 40) + R(6120, 744, 120, 32), 'faint'));
// pendant over the table
pp.f.push(P('M5600 160V332'), P('M5560 368Q5562 334 5600 332Q5638 334 5640 368Z'));
pp.fill.push(F(E(5600, 369, 38, 4), 0.95));
pp.wash.push(G(5600, 480, 180, 200, 0.7));
// board, knife, veg, quart containers
pp.f.push(P(R(5440, 626, 230, 14)), P('M5500 624L5612 624Q5598 612 5560 612L5500 616Z'), P(R(5466, 616, 34, 8)));
pp.d.push(P(C(5454, 633, 3)), P(C(5640, 614, 12) + 'M5640 602Q5644 596 5650 594'), P('M5520 622Q5530 612 5540 620M5544 622Q5552 610 5562 620', 'faint'));
let quarts = '';
for (const x of [5690, 5740]) {
  quarts += `M${x + 3} 640L${x} 592H${x + 40}L${x + 37} 640` + R(x - 2, 586, 44, 6);
  pp.d.push(P(R(x + 8, 608, 24, 10), 'faint'));
}
pp.f.push(P(quarts));
// the prep sheet on its clipboard, leaning on the wall
pp.f.push(P(RR(5850, 396, 220, 242, 7)), P('M5932 404V390Q5932 384 5938 384H5982Q5988 384 5988 390V404'));
pp.d.push(P(C(5960, 393, 4)));
pp.f.push(P(R(5862, 412, 196, 216)));
pp.fill.push(F(R(5862, 412, 196, 216), 0.42));
pp.fill.push(G(6011, 540, 24, 70, 0.9, 'sheetglow'));
pp.wash.push(G(5960, 520, 240, 230, 0.85));
pp.s.push(P('M5872 452H6048', 'strong'));
pp.d.push(P('M5872 504H6048M5872 532H6048M5872 560H6048M5872 588H6048', 'faint'));
const ROWS = [['Short rib', 40, 27, 25], ['Risotto', 20, 33, 31], ['Burrata', 25, 19, 18], ['Half chicken', 30, 23, 22]];
let sheet = `<text class="t-title w" x="5872" y="444" style="--wd:0s">Friday</text>` +
  `<text class="t-head w" x="5994" y="474" text-anchor="end" style="--wd:.15s">Guess</text>` +
  `<text class="t-head w" x="6024" y="474" text-anchor="end" style="--wd:.2s">Tooey</text>` +
  `<text class="t-head w" x="6050" y="474" text-anchor="end" style="--wd:.25s">Sold</text>`;
ROWS.forEach(([dish, g, t, s], k) => {
  const y = 497 + k * 28;
  sheet += `<text class="t-dish w" x="5872" y="${y}" style="--wd:${n(0.3 + k * 0.12)}s">${dish}</text>` +
    `<text class="t-guess w" x="5994" y="${y}" text-anchor="end" style="--wd:${n(0.85 + k * 0.14)}s">${g}</text>` +
    `<text class="t-tooey w" x="6024" y="${y + 1}" text-anchor="end" style="--wd:${n(1.55 + k * 0.32)}s">${t}</text>` +
    `<text class="t-sold w" x="6050" y="${y}" text-anchor="end" style="--wd:${n(2.85 + k * 0.16)}s">${s}</text>`;
});
sheet += `<text class="t-ex w" x="5872" y="616" style="--wd:3.4s">Example</text>`;
pp.live = `<g class="live sheet-text">${sheet}</g>`;
pp.back.push(P(courses({ x0: 5334, x1: 6396, y0: 330, y1: 630, h: 13, w: 26, drop: 0.55, holes: [[5540, 320, 5660, 380], [5840, 376, 6080, 642], [5430, 580, 5800, 642]] }), 'faint2'));

/* ------------------------------------------------------------------ */
const defs = `<defs>
<radialGradient id="g-lamp"><stop offset="0" stop-color="#f1d2a0" stop-opacity=".95"/><stop offset=".3" stop-color="#f1d2a0" stop-opacity=".62"/><stop offset=".62" stop-color="#f1d2a0" stop-opacity=".2"/><stop offset="1" stop-color="#f1d2a0" stop-opacity="0"/></radialGradient>
<linearGradient id="g-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d2a0" stop-opacity=".9"/><stop offset="1" stop-color="#f1d2a0" stop-opacity="0"/></linearGradient>
<clipPath id="clip-rc"><rect x="3420" y="300" width="160" height="246"/></clipPath>
</defs>`;

const svg = `${defs}
<g id="world">
${room('street', 0, st)}
${room('dining', 1, dn)}
${room('counter', 2, ct)}
${room('kitchen', 3, kt)}
${room('prep', 4, pp)}
</g>`;

const file = here + '../index.html';
const html = fs.readFileSync(file, 'utf8');
const out = html.replace(/(<!-- drawing:start -->)[\s\S]*?(<!-- drawing:end -->)/, `$1\n${svg}\n$2`);
fs.writeFileSync(file, out);
console.log('drawing written:', (svg.length / 1024).toFixed(1), 'KB');
