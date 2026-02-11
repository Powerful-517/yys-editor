# Shikigami Scraper

This script scrapes Shikigami data from the official Onmyoji website and updates the configuration.

## Usage

1. Install dependencies:
```bash
cd scripts
npm install
```

2. Run the scraper:
```bash
npm run scrape
```

The script will:
- Fetch all Shikigami from different rarity types (SSR, SP, UR, SR, R, N, L, G)
- Download images to `public/assets/Shikigami/{rarity}/`
- Update `src/data/Shikigami.json` with the new data

## Output Structure

Images: `public/assets/Shikigami/{rarity}/{id}.png`
JSON: `src/data/Shikigami.json`

```json
[
  {
    "avatar": "/assets/Shikigami/ssr/596.png",
    "name": "神无月",
    "rarity": "SSR"
  }
]
```
