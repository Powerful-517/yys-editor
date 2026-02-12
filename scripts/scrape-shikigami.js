const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '../public/assets/Shikigami');
const JSON_FILE = path.join(__dirname, '../src/data/Shikigami.json');

// Rarity types mapping
const RARITY_TYPES = ['ssr', 'sp', 'ur', 'sr', 'r', 'n', 'l', 'g'];

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
          console.log(`✓ Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
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

// Fetch HTML content
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parse shikigami data from HTML using regex
function parseShikigami(html, rarity) {
  const results = [];

  // Match pattern: <div class="shishen_item">...<img src="...">...<span class="name">...</span>...
  const itemRegex = /<div class="shishen_item">[\s\S]*?<a href="(\d+)\.html">[\s\S]*?<img src="([^"]+)"[\s\S]*?<span class="name">([^<]+)<\/span>/g;

  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const [, id, imgSrc, name] = match;
    results.push({
      id,
      name: name.trim(),
      imgSrc,
      rarity: rarity.toUpperCase()
    });
  }

  return results;
}

// Main function
async function main() {
  try {
    console.log('Starting Shikigami scraper...\n');

    const allShikigami = [];

    // Scrape each rarity type
    for (const rarity of RARITY_TYPES) {
      console.log(`Fetching ${rarity.toUpperCase()} Shikigami...`);
      const url = `https://yys.163.com/shishen/index.html?type=${rarity}`;

      try {
        const html = await fetchHTML(url);
        const shikigami = parseShikigami(html, rarity);
        console.log(`Found ${shikigami.length} ${rarity.toUpperCase()} Shikigami\n`);
        allShikigami.push(...shikigami);

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Error fetching ${rarity}:`, err.message);
      }
    }

    console.log(`\nTotal Shikigami found: ${allShikigami.length}`);

    if (allShikigami.length === 0) {
      console.log('\n⚠ No Shikigami found. The website structure may have changed.');
      console.log('Please check the HTML structure manually or use browser DevTools.');
      return;
    }

    console.log('\nDownloading images...\n');

    // Ensure directories exist
    RARITY_TYPES.forEach(rarity => {
      ensureDir(path.join(IMAGE_DIR, rarity));
    });

    // Download images with progress
    let downloaded = 0;
    for (const shikigami of allShikigami) {
      const { id, imgSrc, rarity } = shikigami;
      const filename = `${id}.png`;
      const filepath = path.join(IMAGE_DIR, rarity.toLowerCase(), filename);

      try {
        await downloadImage(imgSrc, filepath);
        downloaded++;
      } catch (err) {
        console.error(`✗ Failed ${id}: ${err.message}`);
      }
    }

    console.log(`\nDownloaded ${downloaded}/${allShikigami.length} images`);

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
    console.log(`Total: ${allShikigami.length} Shikigami`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
