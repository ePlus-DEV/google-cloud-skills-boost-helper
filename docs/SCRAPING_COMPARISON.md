# Scraping Approaches Comparison

This document compares different approaches to scraping Google Cloud Skills Boost profiles for arcade points and badges.

## Browser Extension Approach (Current)

### Technology Stack

- **Environment**: Browser Extension (Chrome MV3)
- **Language**: TypeScript
- **Parser**: DOMParser (native browser API)
- **Runtime**: Client-side in browser

### Key Features

- ✅ Real-time scraping from current page
- ✅ Auto-detection with mutation observers
- ✅ Fallback mechanisms (API → Scraping)
- ✅ Client-side processing (no server required)
- ✅ Works with any profile URL
- ✅ Supports both `.profile-badges` container and individual `.profile-badge` elements

### Badge Detection Selectors

```typescript
// Container approach
const profileBadgesContainer = doc.querySelector(".profile-badges");

// Individual badge selectors within container or directly
const badgeSelectors = [
  ".profile-badge", // Individual badge items
  ".badge-card",
  ".achievement-card",
  ".earned-badge",
  ".badge-item",
  ".badge",
  ".completion-badge",
  ".skill-badge",
];

// Title extraction
const titleSelectors = [
  ".ql-title-medium", // Google's design system
  ".badge-title",
  ".badge-name",
  "h3",
  "h4",
  ".title",
];

// Date extraction
const dateSelectors = [
  ".ql-body-medium", // Google's design system
  ".date-earned",
  ".earned-date",
  ".completion-date",
];
```

## Node.js Server Approach (Reference)

### Technology Stack

- **Environment**: Node.js Server
- **Language**: JavaScript
- **Parser**: Cheerio (jQuery-like server-side)
- **Runtime**: Server-side

### Key Features

- ✅ Server-side processing
- ✅ Works with public profile URLs
- ✅ Can handle multiple profiles
- ✅ More stable parsing (controlled environment)
- ✅ Can implement caching/database storage

### Badge Detection Approach

```javascript
// Direct selector approach
$(".profile-badge").each((index, badge) => {
  // Extract badge title
  const badgeTitle = $(badge).find(".ql-title-medium").text().trim();

  // Extract badge date
  const badgeDateText = $(badge).find(".ql-body-medium").text().trim();

  // Process badge data...
});

// User details extraction
let profileName = $(".ql-display-small").text().trim();
let profileAvatar = $("ql-avatar.profile-avatar").attr("src");
```

## Unified Approach (Current Implementation)

Our browser extension now combines both approaches:

### Primary Strategy: Container-First

1. **Look for `.profile-badges` container first**
   - Search for various badge selectors within container
   - More targeted and efficient

### Fallback Strategy: Individual Elements

2. **If container not found, look for `.profile-badge` elements directly**
   - Compatible with Node.js controller approach
   - Handles different page structures

### Final Fallback: Generic Search

3. **If specific selectors fail, use generic element detection**
   - Broad search across document
   - Pattern matching for badge-like elements

## Selector Compatibility Matrix

| Selector                   | Extension | Node.js | Purpose                     |
| -------------------------- | --------- | ------- | --------------------------- |
| `.profile-badges`          | ✅        | ❌      | Container for all badges    |
| `.profile-badge`           | ✅        | ✅      | Individual badge item       |
| `.ql-title-medium`         | ✅        | ✅      | Badge title (Google Design) |
| `.ql-body-medium`          | ✅        | ✅      | Badge date (Google Design)  |
| `.ql-display-small`        | ✅        | ✅      | Profile name                |
| `ql-avatar.profile-avatar` | ✅        | ✅      | Profile avatar              |

## Advantages of Each Approach

### Browser Extension Advantages

- **Real-time**: Works on current page without API calls
- **Privacy**: No data sent to external servers
- **Performance**: Client-side processing
- **Flexibility**: Can adapt to page changes instantly
- **User Control**: Works entirely within user's browser

### Node.js Server Advantages

- **Reliability**: Stable server environment
- **Scalability**: Can process multiple profiles
- **Storage**: Easy database integration
- **Control**: Full control over parsing environment
- **Caching**: Can implement sophisticated caching strategies

## Current Status

The browser extension now implements a **hybrid approach** that:

1. ✅ **Supports both container (`.profile-badges`) and individual (`.profile-badge`) approaches**
2. ✅ **Uses Google's design system selectors (`.ql-title-medium`, `.ql-body-medium`)**
3. ✅ **Has multiple fallback mechanisms for robustness**
4. ✅ **Includes comprehensive debugging and logging**
5. ✅ **Works with various Google Cloud Skills Boost page structures**

## Testing Recommendations

### For Extension Testing

```javascript
// Test container approach
console.log(document.querySelector(".profile-badges"));

// Test individual badge approach
console.log(document.querySelectorAll(".profile-badge").length);

// Test Google design selectors
document
  .querySelectorAll(".ql-title-medium")
  .forEach((el) => console.log("Title:", el.textContent.trim()));
```

### For Server Testing

```javascript
// Test with Cheerio
const $ = cheerio.load(html);
console.log($(".profile-badge").length);
console.log($(".ql-title-medium").first().text());
```

## Future Improvements

1. **Adaptive Selector Learning**: Automatically learn new selectors from successful parses
2. **Performance Monitoring**: Track which selectors work best over time
3. **A/B Testing**: Compare different parsing strategies
4. **Error Reporting**: Collect parsing failures to improve selectors
