# Arcade Points Scraping - Implementation Guide

## 🎯 Overview

This document provides implementation details for scraping Google Cloud Skills Boost arcade points using two different approaches:

1. **Browser Extension Approach** (Current implementation)
2. **Node.js Server Approach** (Reference implementation)

Both approaches are now compatible and use similar selectors.

## 🚀 Browser Extension Usage

### Quick Start

```javascript
// Example 1: Scrape from profile URL
const profileUrl = "https://www.cloudskillsboost.google/public_profiles/your-id";
const arcadeData = await ArcadeScrapingService.scrapeArcadeData(profileUrl);

// Example 2: Scrape current page
const currentData = ArcadeScrapingService.extractArcadeDataFromCurrentPage();

// Example 3: Use popup service with fallback
await PopupService.refreshDataByScraping();
```

### Selector Strategy

The extension uses a **multi-tier fallback strategy**:

```javascript
// Tier 1: Look for .profile-badges container
const container = document.querySelector('.profile-badges');
if (container) {
  // Search within container for badge elements
}

// Tier 2: Look for individual .profile-badge elements  
const badges = document.querySelectorAll('.profile-badge');

// Tier 3: Generic fallback search
// Search for any elements that might be badges
```

## 🔧 Node.js Server Reference

### From Your Controller Code

```javascript
$('.profile-badge').each((index, badge) => {
  // Extract title using Google's design system
  const badgeTitle = $(badge).find('.ql-title-medium').text().trim();
  
  // Extract date from badge
  const badgeDateText = $(badge).find('.ql-body-medium').text().trim();
  
  // Parse date format: "Nov 15, 2024"
  const badgeDateMatch = badgeDateText.match(/(\\w{3})\\s+(\\d{1,2}),\\s+(\\d{4})/);
  
  if (badgeDateMatch) {
    const badgeDate = new Date(`${badgeDateMatch[3]}-${badgeDateMatch[2]}-${badgeDateMatch[1]}T00:00:00-0400`);
    // Process badge...
  }
});
```

### Key Differences

| Aspect | Browser Extension | Node.js Server |
|--------|------------------|----------------|
| Environment | Client-side | Server-side |
| Parser | DOMParser | Cheerio |
| Selector | `.profile-badges` → `.profile-badge` | `.profile-badge` directly |
| User Detection | `.ql-display-small` | Same |
| Avatar | `ql-avatar.profile-avatar` | Same |

## 🎨 Compatible Selectors

### Both implementations now support:

```javascript
// Badge Container
".profile-badges"        // Extension primary
".profile-badge"         // Both (individual items)

// Title Extraction  
".ql-title-medium"       // Google Design System (Both)
".badge-title"           // Fallback (Extension)
".badge-name"            // Fallback (Extension)

// Date Extraction
".ql-body-medium"        // Google Design System (Both)  
".date-earned"           // Fallback (Extension)
".completion-date"       // Fallback (Extension)

// User Details
".ql-display-small"      // Profile name (Both)
"ql-avatar.profile-avatar" // Profile avatar (Both)
```

## 🧪 Testing & Debugging

### Browser Extension Testing

```javascript
// Open browser console on Google Cloud Skills Boost profile page

// Test 1: Check container approach
console.log("Container:", document.querySelector('.profile-badges'));

// Test 2: Check individual badges
console.log("Individual badges:", document.querySelectorAll('.profile-badge').length);

// Test 3: Run scraping
const data = ArcadeScrapingService.extractArcadeDataFromCurrentPage();
console.log("Scraped data:", data);

// Test 4: Use example debugging
await exampleMonitoringAndDebugging();
```

### Server Testing

```javascript
// In your Node.js environment
const cheerio = require('cheerio');

// Load profile HTML
const $ = cheerio.load(profileHTML);

// Test selectors
console.log("Profile name:", $('.ql-display-small').text());
console.log("Badge count:", $('.profile-badge').length);

// Test badge extraction
$('.profile-badge').each((i, badge) => {
  const title = $(badge).find('.ql-title-medium').text().trim();
  const date = $(badge).find('.ql-body-medium').text().trim();
  console.log(`Badge ${i+1}: ${title} (${date})`);
});
```

## ⚡ Performance Considerations

### Browser Extension
- ✅ Real-time processing
- ✅ No network overhead  
- ✅ Works offline
- ⚠️ Limited by browser resources

### Node.js Server
- ✅ Stable environment
- ✅ Better error handling
- ✅ Can cache results
- ⚠️ Requires network requests

## 🛠️ Configuration Options

### Extension Configuration

```javascript
// In your popup or options page
const config = {
  waitTimeout: 10000,      // Wait time for badges to load
  fallbackEnabled: true,   // Enable fallback methods
  debugMode: true,         // Enable console logging
  autoDetection: true      // Enable auto-detection
};

ArcadeScrapingService.configure(config);
```

### Server Configuration

```javascript
// In your Node.js controller
const config = {
  dateRange: {
    start: new Date('2024-03-22T00:00:00'),
    end: new Date('2024-04-20T23:59:59')
  },
  badgeCategories: {
    skillBadges: ['badge1', 'badge2'],
    regularBadges: ['badge3', 'badge4']
  }
};
```

## 🔄 Migration Path

If you're moving from server-side to browser extension:

```javascript
// Before (Server)
$('.profile-badge').each((index, badge) => {
  const title = $(badge).find('.ql-title-medium').text().trim();
  // Process...
});

// After (Extension)
document.querySelectorAll('.profile-badge').forEach((badge, index) => {
  const title = badge.querySelector('.ql-title-medium')?.textContent?.trim();
  // Process...
});
```

## 📊 Error Handling

### Extension Error Handling

```javascript
try {
  const data = await ArcadeScrapingService.scrapeArcadeData(url);
  if (!data) {
    console.log("No data found - check selectors");
  }
} catch (error) {
  console.error("Scraping failed:", error);
  // Fallback to alternative method
}
```

### Server Error Handling

```javascript
try {
  const $ = await gcp.get(profileUrl);
  if (!$('.profile-badge').length) {
    throw new Error("No badges found");
  }
} catch (error) {
  console.error("Failed to load profile:", error);
  return res.redirect('/');
}
```

## 🎯 Best Practices

1. **Always use fallback strategies**
2. **Include comprehensive logging**
3. **Test with multiple profile types**
4. **Handle edge cases (no badges, private profiles)**
5. **Implement proper error boundaries**
6. **Use semantic selectors when available**
7. **Monitor for Google UI changes**

## 📚 Examples

See `examples/arcade-scraping-examples.ts` for complete working examples of all approaches.
