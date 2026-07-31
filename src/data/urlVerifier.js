const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { loadTicketFile } = require('../api/ticketReader');

const DOWNLOAD_URL_COLUMN = 'Download Link=Direct Download';
const SHARE_URL_COLUMN = 'Document View and Download=Public Share URL';
const CONCURRENCY = 10;
const REQUEST_TIMEOUT_MS = 20000;

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

const filenameFromUrl = urlString => {
  try {
    const url = new URL(urlString);
    return decodeURIComponent(url.pathname.split('/').pop() || '');
  } catch {
    return '';
  }
};

const verifyDestination = async row => {
  const destination = row.Filename.replace(/\.pdf$/i, '');
  const shareUrl = row[SHARE_URL_COLUMN];
  const downloadUrl = row[DOWNLOAD_URL_COLUMN]?.trim();
  const problems = [];

  const pngPath = path.join(__dirname, 'imgs', `${destination}.png`);
  if (!fs.existsSync(pngPath)) {
    problems.push(`png missing: ${destination}.png`);
  }

  if (!shareUrl) problems.push('share URL missing in CSV');
  if (!downloadUrl) problems.push('download URL missing in CSV');

  if (shareUrl) {
    try {
      const res = await axios.get(shareUrl, {
        timeout: REQUEST_TIMEOUT_MS,
        maxRedirects: 5,
        responseType: 'text',
        validateStatus: () => true,
      });
      if (res.status !== 200) problems.push(`share URL status ${res.status}`);
    } catch (e) {
      problems.push(`share URL fetch failed: ${e.code || e.message}`);
    }
  }

  if (downloadUrl) {
    try {
      const res = await axios.get(downloadUrl, {
        timeout: REQUEST_TIMEOUT_MS,
        maxRedirects: 5,
        responseType: 'arraybuffer',
        validateStatus: () => true,
      });
      if (res.status !== 200) {
        problems.push(`download URL status ${res.status}`);
      } else {
        const head = Buffer.from(res.data.slice(0, 5)).toString('ascii');
        if (head !== '%PDF-') problems.push(`download URL is not a PDF (leading bytes: ${JSON.stringify(head)})`);

        const urlFilename = filenameFromUrl(downloadUrl).replace(/\.pdf$/i, '');
        const normalize = s => s.replace(/[^a-z0-9]+/gi, '').toLowerCase();
        if (normalize(urlFilename) !== normalize(destination)) {
          problems.push(`URL filename "${urlFilename}" does not match destination "${destination}"`);
        }
      }
    } catch (e) {
      problems.push(`download URL fetch failed: ${e.code || e.message}`);
    }
  }

  return { destination, problems };
};

const verifyAll = async () => {
  const rows = await loadTicketFile();
  console.log(`verifying ${rows.length} destinations (concurrency=${CONCURRENCY})...`);

  const results = await runPool(rows, async row => {
    const result = await verifyDestination(row);
    if (result.problems.length === 0) {
      console.log(`  OK   ${result.destination}`);
    } else {
      console.log(`  FAIL ${result.destination}`);
      result.problems.forEach(p => console.log(`         - ${p}`));
    }
    return result;
  });

  const failed = results.filter(r => r.problems.length > 0);
  console.log('');
  console.log(`=== SUMMARY: ${results.length - failed.length} ok, ${failed.length} failed ===`);
  if (failed.length > 0) {
    failed.forEach(r => console.log(`  FAIL ${r.destination}: ${r.problems.join('; ')}`));
    process.exitCode = 1;
  }
};

verifyAll().catch(e => {
  console.error('verifier crashed', e);
  process.exit(1);
});
