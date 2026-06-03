# Indian Kanoon Legal Judgment Crawler

A sophisticated web crawler that extracts legal judgments from Indian Kanoon for research purposes.

## Features

✅ **Multi-Source Crawling**: Crawls multiple IPC sections and legal topics  
✅ **Smart PDF Handling**: Downloads PDFs or generates them from HTML/text  
✅ **Duplicate Detection**: Skips already downloaded judgments  
✅ **Court-Specific Limits**: Separate limits for Supreme Court and High Court  
✅ **Metadata Generation**: Comprehensive CSV metadata file  
✅ **Respectful Crawling**: Built-in delays and retry logic  
✅ **Error Recovery**: Automatic retries and detailed logging  

## Installation

### Prerequisites
- Node.js 16+ and npm

### Install Dependencies

```bash
cd crawler
npm install
```

This will install:
- `axios` - HTTP client
- `cheerio` - HTML parsing
- `puppeteer` - PDF generation
- `csv-writer` - CSV export
- `winston` - Logging

## Configuration

Edit `config.js` to customize:

```javascript
{
  // Search URLs to crawl
  searchUrls: [
    'https://indiankanoon.org/search/?formInput=section%20302%20ipc',
    'https://indiankanoon.org/search/?formInput=section%20304B%20ipc',
    'https://indiankanoon.org/search/?formInput=section%20498A%20ipc',
    'https://indiankanoon.org/search/?formInput=pocso'
  ],

  // Download limits
  limits: {
    highCourtJudgments: 10,      // Download 10 High Court judgments
    supremeCourtJudgments: 10,   // Download 10 Supreme Court judgments
    maxPagesPerSearch: 5         // Max search result pages
  },

  // Crawler settings
  crawler: {
    delayBetweenRequests: 2000,  // 2 second delay
    timeout: 30000,              // 30 second timeout
    retryAttempts: 3             // Retry 3 times on failure
  }
}
```

## Usage

### Run the Crawler

```bash
npm start
```

or

```bash
node index.js
```

### Output Structure

```
crawler/
├── downloads/
│   ├── pdfs/              # Downloaded/generated PDFs
│   ├── html/              # HTML source files
│   └── metadata.csv       # Comprehensive metadata
└── logs/
    ├── crawler.log        # All logs
    └── error.log          # Error logs only
```

## Metadata CSV Columns

The generated `metadata.csv` contains:

| Column | Description |
|--------|-------------|
| `filename` | PDF filename |
| `title` | Case title |
| `caseNumber` | Case number/appeal number |
| `court` | Court name |
| `courtType` | Supreme Court / High Court / Other |
| `date` | Judgment date |
| `citation` | Legal citation |
| `bench` | Judge(s) name |
| `wordCount` | Number of words in judgment |
| `fileSizeMB` | PDF file size in MB |
| `pdfSource` | downloaded / generated |
| `sourceUrl` | Indian Kanoon URL |
| `pdfUrl` | Original PDF URL (if available) |
| `downloadedAt` | Timestamp |
| `htmlFile` | HTML source filename |

## How It Works

### 1. **Search Phase**
```
Search URL → Extract Judgment URLs → Filter by Court Type
```

### 2. **Processing Phase**
For each judgment:
```
1. Check if already downloaded (skip duplicates)
2. Extract judgment details (title, court, date, text)
3. Download PDF if available
4. If no PDF: Generate PDF from HTML/text
5. Save metadata
6. Respect rate limits
```

### 3. **Smart Limits**
- Stops when both Supreme Court AND High Court limits reached
- Tracks each court type separately
- Continues crawling until both limits met

### 4. **Duplicate Handling**
- Maintains set of downloaded URLs
- Loads existing metadata.csv on startup
- Skips re-downloading same judgments
- Perfect for resumable crawling

## Example Output

```
2024-01-15 10:30:15 [INFO]: Starting Indian Kanoon Crawler...
2024-01-15 10:30:16 [INFO]: Loaded 5 existing URLs to skip duplicates
2024-01-15 10:30:18 [INFO]: Crawling search URL: https://indiankanoon.org/search/?formInput=section%20302%20ipc
2024-01-15 10:30:20 [INFO]: Extracted 25 judgment URLs
2024-01-15 10:30:22 [INFO]: Processing: State vs. John Doe
2024-01-15 10:30:25 [INFO]: PDF downloaded: State_vs_John_Doe.pdf
2024-01-15 10:30:25 [INFO]: ✓ Processed successfully
2024-01-15 10:30:25 [INFO]: Stats: SC=1/10, HC=0/10

========================================
CRAWLER STATISTICS
========================================
Total Judgments Processed: 20
Supreme Court Judgments: 10
High Court Judgments: 10
PDFs Downloaded: 12
PDFs Generated: 8
Errors: 0
Duplicates Skipped: 5
========================================
```

## Error Handling

The crawler handles:
- ✅ Network timeouts (auto-retry)
- ✅ PDF download failures (generates from HTML)
- ✅ Rate limiting (built-in delays)
- ✅ Missing data (graceful fallbacks)
- ✅ Duplicate URLs (skip automatically)

## Logging

Logs are saved in `logs/` directory:
- `crawler.log` - All activity
- `error.log` - Errors only

Log levels: `error`, `warn`, `info`, `debug`

## Resumable Crawling

The crawler supports resume:

1. **First run**: Downloads 10 SC + 10 HC judgments
2. **Increase limits** in `config.js`:
   ```javascript
   limits: {
     highCourtJudgments: 20,
     supremeCourtJudgments: 20
   }
   ```
3. **Run again**: Automatically skips first 20, downloads 20 more

## Legal & Ethical Considerations

⚠️ **Important Notes**:

1. **Respect Terms of Service**: Always review and comply with Indian Kanoon's Terms of Service
2. **Rate Limiting**: Built-in 2-second delays between requests
3. **Academic/Research Use**: Intended for legal research and education
4. **No Bulk Scraping**: Designed for limited, targeted crawling
5. **Public Court Records**: Only accesses publicly available judgments

## Troubleshooting

### Puppeteer Installation Issues (Windows)

If Puppeteer fails to install:

```bash
npm install puppeteer --ignore-scripts
```

Then manually download Chromium.

### Memory Issues

For large-scale crawling:
```bash
node --max-old-space-size=4096 index.js
```

### Timeout Errors

Increase timeout in `config.js`:
```javascript
crawler: {
  timeout: 60000  // 60 seconds
}
```

## Advanced Usage

### Custom Search URLs

Add more search URLs in `config.js`:

```javascript
searchUrls: [
  'https://indiankanoon.org/search/?formInput=dowry%20death',
  'https://indiankanoon.org/search/?formInput=section%20377%20ipc',
  'https://indiankanoon.org/search/?formInput=contempt%20of%20court'
]
```

### Filter by Year

Modify search URL:
```
https://indiankanoon.org/search/?formInput=section%20302%20ipc&year=2023
```

### Export to Database

After crawling, import `metadata.csv` to your database:

```javascript
const csv = require('csv-parser');
const fs = require('fs');

fs.createReadStream('downloads/metadata.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Insert into database
    db.insert('judgments', row);
  });
```

## Contributing

To extend functionality:
1. Add new scrapers in `scrapers/`
2. Add utilities in `utils/`
3. Update `config.js` with new settings
4. Follow existing logging patterns

## License

MIT License - For educational and research purposes

## Support

For issues:
1. Check logs in `logs/crawler.log`
2. Verify configuration in `config.js`
3. Test with smaller limits first
4. Ensure stable internet connection

---

**Disclaimer**: This tool is provided for educational and research purposes only. Users are responsible for ensuring their usage complies with applicable laws and terms of service.
