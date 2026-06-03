# Quick Start Guide - Indian Kanoon Crawler

Get up and running in 3 minutes!

## Step 1: Install Dependencies (2 minutes)

```bash
cd crawler
npm install
```

**Note**: Puppeteer download may take 1-2 minutes (downloads Chromium).

## Step 2: Run the Crawler (30 seconds)

```bash
npm start
```

## Step 3: Check Results

After completion, check:

```
crawler/
└── downloads/
    ├── pdfs/           → Your PDFs here (20 files)
    ├── html/           → HTML source files
    └── metadata.csv    → Spreadsheet with all data
```

## What Happens?

The crawler will:

1. ✅ Visit 4 search pages on Indian Kanoon
2. ✅ Find judgments for Section 302, 304B, 498A IPC + POCSO
3. ✅ Download **10 Supreme Court** judgments
4. ✅ Download **10 High Court** judgments
5. ✅ Generate PDFs (download original or create from text)
6. ✅ Create `metadata.csv` with all details
7. ✅ Skip duplicates automatically

## Expected Output

```
========================================
CRAWLER STATISTICS
========================================
Total Judgments Processed: 20
Supreme Court Judgments: 10
High Court Judgments: 10
PDFs Downloaded: 12
PDFs Generated: 8
Errors: 0
========================================

✓ Crawler completed successfully!
```

## Viewing Results

### Open PDFs
Navigate to `downloads/pdfs/` and open any PDF

### Open Metadata CSV
Open `downloads/metadata.csv` in Excel/Google Sheets

### View Logs
Check `logs/crawler.log` for detailed activity

## Customization

Want to download more? Edit `config.js`:

```javascript
limits: {
  highCourtJudgments: 50,      // Change from 10 to 50
  supremeCourtJudgments: 50    // Change from 10 to 50
}
```

Then run again:
```bash
npm start
```

It will resume and download 40 more judgments!

## Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "Puppeteer failed to download"
```bash
npm install puppeteer --ignore-scripts
```

### Crawler stops early
- Check internet connection
- Check logs in `logs/error.log`
- Increase timeout in `config.js`

### No PDFs generated
- Check if `downloads/pdfs/` folder exists
- Check file permissions
- Look for errors in `logs/crawler.log`

## Next Steps

✅ **Run on schedule**: Use cron/Task Scheduler  
✅ **Import to database**: Parse `metadata.csv`  
✅ **Analyze judgments**: Use your LegalLawAgent backend  
✅ **Add more searches**: Edit `searchUrls` in `config.js`  

## Need Help?

1. Check `README.md` for detailed docs
2. View `logs/crawler.log` for debug info
3. Test with smaller limits first (e.g., 2 judgments each)

---

**Ready?** Run `npm start` and watch the magic! 🚀
