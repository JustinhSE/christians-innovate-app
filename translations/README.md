# Bible Translation Import

This directory contains Bible translations in JSON format that will be imported into the database.

## Supported Format

Each JSON file should contain an array of verse objects:

```json
[
  {
    "pk": 1,
    "translation": "KJV",
    "book": 1,
    "chapter": 1,
    "verse": 1,
    "text": "In the beginning God created the heaven and the earth."
  },
  ...
]
```

## Adding New Translations

1. Download the translation JSON file (e.g., `NKJV.json`, `BSB.json`)
2. Place it in this `/translations` folder
3. The filename (without `.json`) will be used as the translation code

## Importing Translations

Run the import script:

```bash
npm run import:bibles
```

The script will:
- Automatically detect all `.json` files in this folder
- Import each translation into the `bible_verses` table
- Show progress and statistics
- Handle duplicates (will update existing verses)

## Current Translations

- **KJV** - King James Version

## Environment Variables Required

Make sure these are set in your `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (required for bulk imports)
