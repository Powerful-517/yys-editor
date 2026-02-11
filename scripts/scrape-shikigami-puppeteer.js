const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '../public/assets/Shikigami');
const JSON_FILE = path.join(__dirname, '../src/data/Shikigami.json');

// Rarity types mapping: URL parameter -> directory name
const RARITY_TYPES = [
  { urlParam: 'ssr', dir: 'ssr' },
  { urlParam: 'sp', dir: 'sp' },
  { urlParam: 'ur', dir: 'ur' },
  { urlParam: 'sr', dir: 'sr' },
  { urlParam: 'r', dir: 'r' },
  { urlParam: 'n', dir: 'n' },
  { urlParam: 'ld', dir: 'l' },
  { urlParam: 'gt', dir: 'g' }
];

// Ensure image directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Main function
async function main() {
  let browser;

  try {
    console.log('Starting Shikigami scraper with Puppeteer...\n');

    // Launch browser
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const allShikigami = [];
    const seenIds = new Set();

    // Scrape each rarity type
    for (const rarity of RARITY_TYPES) {
      console.log(`Fetching ${rarity.dir.toUpperCase()} Shikigami (type=${rarity.urlParam})...`);
      const url = `https://yys.163.com/shishen/index.html?type=${rarity.urlParam}`;

      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for content to load
        await page.waitForSelector('.shishen_item', { timeout: 10000 });

        // Extract data from page
        const shikigami = await page.evaluate((rarityDir) => {
          const items = document.querySelectorAll('.shishen_item');
          const results = [];

          items.forEach(item => {
            const link = item.querySelector('a');
            const img = item.querySelector('img');
            const nameSpan = item.querySelector('.name');

            if (link && img && nameSpan) {
              const href = link.getAttribute('href');
              const imgSrc = img.getAttribute('src');
              const name = nameSpan.textContent.trim();
              const id = href.replace('.html', '');

              results.push({
                id,
                name,
                imgSrc,
                rarity: rarityDir.toUpperCase()
              });
            }
          });

          return results;
        }, rarity.dir);

        // Add only unique shikigami (avoid duplicates)
        shikigami.forEach(s => {
          if (!seenIds.has(s.id)) {
            seenIds.add(s.id);
            allShikigami.push(s);
          }
        });

        console.log(`Found ${shikigami.length} ${rarity.dir.toUpperCase()} Shikigami (${seenIds.size} unique total)\n`);

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Error fetching ${rarity}:`, err.message);
      }
    }

    await browser.close();

    console.log(`\nTotal unique Shikigami found: ${allShikigami.length}`);

    if (allShikigami.length === 0) {
      console.log('\n⚠ No Shikigami found. Please check the website manually.');
      return;
    }

    // Sort by ID descending (newest first)
    allShikigami.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    console.log(`Sorted by ID (newest first): ${allShikigami[0].id} -> ${allShikigami[allShikigami.length - 1].id}`);

    console.log('\nDownloading images...\n');

    // Ensure directories exist
    RARITY_TYPES.forEach(rarity => {
      ensureDir(path.join(IMAGE_DIR, rarity.dir));
    });

    // Download images with progress
    let downloaded = 0;
    const total = allShikigami.length;

    for (let i = 0; i < allShikigami.length; i++) {
      const shikigami = allShikigami[i];
      const { id, imgSrc, rarity, name } = shikigami;
      const filename = `${id}.png`;
      const filepath = path.join(IMAGE_DIR, rarity.toLowerCase(), filename);

      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        downloaded++;
        process.stdout.write(`\rProgress: ${downloaded}/${total} (${name}) - skipped`);
        continue;
      }

      try {
        await downloadImage(imgSrc, filepath);
        downloaded++;
        process.stdout.write(`\rProgress: ${downloaded}/${total} (${name})`);
      } catch (err) {
        console.error(`\n✗ Failed ${id} (${name}): ${err.message}`);
      }
    }

    console.log(`\n\nDownloaded ${downloaded}/${total} images`);

    // Update JSON file
    console.log('\nUpdating JSON configuration...');
    const jsonData = allShikigami.map(s => ({
      avatar: `/assets/Shikigami/${s.rarity.toLowerCase()}/${s.id}.png`,
      name: s.name,
      rarity: s.rarity
    }));

    fs.writeFileSync(JSON_FILE, JSON.stringify(jsonData, null, 4), 'utf8');
    console.log(`✓ Updated ${JSON_FILE}`);

    console.log('\n✓ Scraping completed successfully!');
    console.log(`Total: ${allShikigami.length} unique Shikigami`);
    console.log(`Sorted by ID descending (newest first)`);

  } catch (error) {
    console.error('Error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();
