const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const axios = require('axios');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const { loadTicketFile } = require('../api/ticketReader');

const DOWNLOAD_URL_COLUMN = 'Download Link=Direct Download';
const CONCURRENCY = 5;
const REQUEST_TIMEOUT_MS = 30000;
const PIXELMATCH_THRESHOLD = 0.15;
const FAIL_PERCENT = 10; // above this, treat as a real content mismatch
const WORK_DIR = path.join(os.tmpdir(), 'ticket-visual-diff');
const IMGS_DIR = path.join(__dirname, 'imgs');

fs.mkdirSync(WORK_DIR, { recursive: true });

// Rotate an RGBA buffer 90° counter-clockwise. Landscape (w×h) → Portrait (h×w).
const rotate90ccw = (src, w, h) => {
  const dst = Buffer.alloc(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      const dx = y;
      const dy = w - 1 - x;
      const d = (dy * h + dx) * 4;
      dst[d] = src[s];
      dst[d + 1] = src[s + 1];
      dst[d + 2] = src[s + 2];
      dst[d + 3] = src[s + 3];
    }
  }
  return dst;
};

const runPool = async (items, worker) => {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
};

const diffDestination = async row => {
  const destination = row.Filename.replace(/\.pdf$/i, '');
  const downloadUrl = row[DOWNLOAD_URL_COLUMN]?.trim();
  const pngPath = path.join(IMGS_DIR, `${destination}.png`);
  const pdfPath = path.join(WORK_DIR, `${destination}.pdf`);
  const renderPrefix = path.join(WORK_DIR, `${destination}-page`);
  const renderedPath = `${renderPrefix}-1.png`;
  const problems = [];

  if (!fs.existsSync(pngPath)) return { destination, problems: [`png missing: ${destination}.png`], diffPercent: null };
  if (!downloadUrl) return { destination, problems: ['download URL missing'], diffPercent: null };

  try {
    const res = await axios.get(downloadUrl, {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });
    if (res.status !== 200) return { destination, problems: [`download status ${res.status}`], diffPercent: null };
    fs.writeFileSync(pdfPath, Buffer.from(res.data));
  } catch (e) {
    return { destination, problems: [`download failed: ${e.code || e.message}`], diffPercent: null };
  }

  try {
    execFileSync(
      'pdftoppm',
      ['-png', '-scale-to', '2048', '-f', '1', '-l', '1', pdfPath, renderPrefix],
      { stdio: 'pipe' },
    );
  } catch (e) {
    return { destination, problems: [`pdftoppm failed: ${e.message}`], diffPercent: null };
  }

  const ref = PNG.sync.read(fs.readFileSync(pngPath));
  const rendered = PNG.sync.read(fs.readFileSync(renderedPath));

  // Reference PNGs are landscape (2048×1024); PDFs render portrait (1024×2048).
  // Rotate the reference CCW so both are portrait for the pixel comparison.
  let cmpRefData = ref.data;
  let cmpW = ref.width;
  let cmpH = ref.height;
  if (rendered.width === ref.height && rendered.height === ref.width) {
    cmpRefData = rotate90ccw(ref.data, ref.width, ref.height);
    cmpW = ref.height;
    cmpH = ref.width;
  } else if (rendered.width !== ref.width || rendered.height !== ref.height) {
    return {
      destination,
      problems: [`size mismatch: ref ${ref.width}x${ref.height} vs rendered ${rendered.width}x${rendered.height}`],
      diffPercent: null,
    };
  }

  const diff = new PNG({ width: cmpW, height: cmpH });
  const changed = pixelmatch(cmpRefData, rendered.data, diff.data, cmpW, cmpH, {
    threshold: PIXELMATCH_THRESHOLD,
  });
  const total = cmpW * cmpH;
  const percent = (changed / total) * 100;

  if (percent > FAIL_PERCENT) {
    const diffPath = path.join(WORK_DIR, `${destination}-DIFF.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    problems.push(`visual diff ${percent.toFixed(2)}% (kept: ${diffPath}, ${pdfPath}, ${renderedPath})`);
  } else {
    try { fs.unlinkSync(pdfPath); fs.unlinkSync(renderedPath); } catch {}
  }

  return { destination, problems, diffPercent: percent };
};

const verifyAll = async () => {
  const rows = await loadTicketFile();
  console.log(
    `visual-diffing ${rows.length} destinations (concurrency=${CONCURRENCY}, pixelmatch threshold=${PIXELMATCH_THRESHOLD}, fail>${FAIL_PERCENT}%)`,
  );
  console.log(`work dir: ${WORK_DIR}`);

  const results = await runPool(rows, async row => {
    const r = await diffDestination(row);
    const pct = r.diffPercent !== null ? r.diffPercent.toFixed(2).padStart(6) + '%' : '   ---';
    const status = r.problems.length === 0 ? 'OK  ' : 'FAIL';
    console.log(`  ${status} ${pct}  ${r.destination}`);
    r.problems.forEach(p => console.log(`         - ${p}`));
    return r;
  });

  const failed = results.filter(r => r.problems.length > 0);
  const percents = results.filter(r => r.diffPercent !== null).map(r => r.diffPercent).sort((a, b) => a - b);
  const median = percents.length ? percents[Math.floor(percents.length / 2)] : 0;
  const max = percents.length ? percents[percents.length - 1] : 0;

  console.log('');
  console.log(`=== SUMMARY: ${results.length - failed.length} ok, ${failed.length} failed ===`);
  console.log(`    median diff: ${median.toFixed(2)}%, max diff: ${max.toFixed(2)}%`);
  if (failed.length > 0) {
    failed.forEach(r =>
      console.log(`  FAIL ${r.destination}${r.diffPercent !== null ? ' (' + r.diffPercent.toFixed(2) + '%)' : ''}: ${r.problems.join('; ')}`),
    );
    console.log(`\nDiff images kept in ${WORK_DIR}/ for inspection.`);
    process.exitCode = 1;
  }
};

verifyAll().catch(e => {
  console.error('visual-diff crashed', e);
  process.exit(1);
});
