// Example usage of Arcade Points Scraping Services
// This file demonstrates how to use the new scraping functionality

import {
  ArcadeScrapingService,
  ProfileDetectionService,
  PopupService,
} from "../services";

/**
 * Example 1: Basic scraping from profile URL
 */
async function exampleBasicScraping() {
  const profileUrl =
    "https://www.cloudskillsboost.google/public_profiles/your-profile-id";

  try {
    console.log("🔍 Scraping arcade data from profile...");
    const arcadeData = await ArcadeScrapingService.scrapeArcadeData(profileUrl);

    if (arcadeData) {
      console.log("✅ Successfully scraped data:");
      console.log(`👤 User: ${arcadeData.userDetails?.userName}`);
      console.log(`🏆 Total Points: ${arcadeData.arcadePoints?.totalPoints}`);
      console.log(`🎯 Game Points: ${arcadeData.arcadePoints?.gamePoints}`);
      console.log(`❓ Trivia Points: ${arcadeData.arcadePoints?.triviaPoints}`);
      console.log(`⚡ Skill Points: ${arcadeData.arcadePoints?.skillPoints}`);
      console.log(
        `⭐ Special Points: ${arcadeData.arcadePoints?.specialPoints}`
      );
      console.log(`📜 Badges Found: ${arcadeData.badges?.length || 0}`);
    } else {
      console.log("❌ Failed to scrape data");
    }
  } catch (error) {
    console.error("💥 Error:", error);
  }
}

/**
 * Example 2: Scraping from current page (when on Google Cloud Skills Boost)
 */
function exampleCurrentPageScraping() {
  console.log("🔍 Scraping from current page...");

  const arcadeData = ArcadeScrapingService.extractArcadeDataFromCurrentPage();

  if (arcadeData && arcadeData.badges && arcadeData.badges.length > 0) {
    console.log("✅ Found data on current page:");
    console.log(`📜 Badges: ${arcadeData.badges.length}`);
    console.log(`🏆 Total Points: ${arcadeData.arcadePoints?.totalPoints}`);

    // Log first few badges
    arcadeData.badges.slice(0, 3).forEach((badge, index) => {
      console.log(
        `🏅 Badge ${index + 1}: ${badge.title} (${badge.points} points)`
      );
    });
  } else {
    console.log("❌ No badges found on current page");
  }
}

/**
 * Example 3: Using auto-detection service
 */
async function exampleAutoDetection() {
  console.log("🤖 Setting up auto-detection...");

  try {
    // Initialize auto-detection
    await ProfileDetectionService.initialize();
    console.log("✅ Auto-detection initialized");

    // Manual trigger
    const data = await ProfileDetectionService.manualCheck();
    if (data) {
      console.log(`🔄 Manual check found ${data.badges?.length || 0} badges`);
    }

    // Get current profile URL if available
    const currentUrl = ProfileDetectionService.getCurrentProfileUrl();
    if (currentUrl) {
      console.log(`🔗 Current profile URL: ${currentUrl}`);
    }
  } catch (error) {
    console.error("💥 Auto-detection error:", error);
  }
}

/**
 * Example 4: Using popup service with scraping fallback
 */
async function examplePopupServiceScraping() {
  console.log("🎮 Using popup service with scraping...");

  try {
    // This will try API first, then fallback to scraping
    await PopupService.refreshData();
    console.log("✅ Popup data refreshed (API + Scraping fallback)");

    // This will use only scraping
    await PopupService.refreshDataByScraping();
    console.log("✅ Popup data refreshed (Scraping only)");
  } catch (error) {
    console.error("💥 Popup service error:", error);
  }
}

/**
 * Example 5: Custom badge detection and point calculation
 */
function exampleCustomBadgeDetection() {
  console.log("🎯 Custom badge detection example...");

  // This would be inside ArcadeScrapingService.calculateBadgePoints()
  const customCalculateBadgePoints = (
    title: string,
    imageURL: string
  ): number => {
    const titleLower = title.toLowerCase();
    const imageLower = imageURL.toLowerCase();

    // Custom rules for your specific use case
    if (titleLower.includes("cloud-hero-2024")) {
      return 15; // Special event badges
    }

    if (titleLower.includes("security-specialist")) {
      return 20; // High-value specialist badges
    }

    if (titleLower.includes("arcade-champion")) {
      return 25; // Championship badges
    }

    // Weekend challenge badges
    if (titleLower.includes("weekend") && titleLower.includes("challenge")) {
      return 8;
    }

    // Monthly quest series
    if (titleLower.match(/quest.*\d{4}.*month/)) {
      return 12;
    }

    // Default fallback
    return 1;
  };

  // Example usage
  const badges = [
    { title: "Cloud Hero 2024", imageURL: "badge-url-1" },
    { title: "Security Specialist", imageURL: "badge-url-2" },
    { title: "Weekend Challenge July", imageURL: "badge-url-3" },
  ];

  badges.forEach((badge) => {
    const points = customCalculateBadgePoints(badge.title, badge.imageURL);
    console.log(`🏅 ${badge.title}: ${points} points`);
  });
}

/**
 * Example 6: Monitoring and debugging
 */
async function exampleMonitoringAndDebugging() {
  console.log("🔧 Monitoring and debugging example...");

  // Enable verbose logging
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(`[${new Date().toISOString()}]`, ...args);
  };

  try {
    // Wait for badges to load
    console.log("⏳ Waiting for badges to load...");
    await ArcadeScrapingService.waitForBadgesToLoad(10000);
    console.log("✅ Badges loading completed");

    // Check what selectors are available
    const badgeSelectors = [
      ".badge-card",
      ".achievement-card",
      ".earned-badge",
      ".badge-item",
    ];

    badgeSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      console.log(
        `🔍 Selector "${selector}": ${elements.length} elements found`
      );
    });

    // Check for images that might be badges
    const images = document.querySelectorAll("img");
    let badgeImages = 0;
    images.forEach((img) => {
      const src = img.src.toLowerCase();
      const alt = (img.alt || "").toLowerCase();

      if (
        src.includes("badge") ||
        alt.includes("badge") ||
        src.includes("achievement") ||
        alt.includes("achievement")
      ) {
        badgeImages++;
        console.log(`🏅 Potential badge image: ${img.alt || img.src}`);
      }
    });

    console.log(`📊 Total potential badge images: ${badgeImages}`);
  } catch (error) {
    console.error("💥 Monitoring error:", error);
  }
}

/**
 * Example 7: Performance comparison
 */
async function examplePerformanceComparison() {
  console.log("⚡ Performance comparison: API vs Scraping");

  const profileUrl =
    "https://www.cloudskillsboost.google/public_profiles/your-profile-id";

  // Test API method (if available)
  console.time("API Method");
  try {
    const apiData = await fetch("/api/arcade-data", {
      method: "POST",
      body: JSON.stringify({ url: profileUrl }),
      headers: { "Content-Type": "application/json" },
    });
    console.timeEnd("API Method");
    console.log("✅ API method completed");
  } catch (error) {
    console.timeEnd("API Method");
    console.log("❌ API method failed");
  }

  // Test Scraping method
  console.time("Scraping Method");
  try {
    const scrapingData = await ArcadeScrapingService.scrapeArcadeData(
      profileUrl
    );
    console.timeEnd("Scraping Method");
    console.log("✅ Scraping method completed");
    console.log(`📊 Found ${scrapingData?.badges?.length || 0} badges`);
  } catch (error) {
    console.timeEnd("Scraping Method");
    console.log("❌ Scraping method failed");
  }
}

// Export examples for use in different contexts
export {
  exampleBasicScraping,
  exampleCurrentPageScraping,
  exampleAutoDetection,
  examplePopupServiceScraping,
  exampleCustomBadgeDetection,
  exampleMonitoringAndDebugging,
  examplePerformanceComparison,
};

// Usage instructions:
/*
To run these examples:

1. In browser console when on Google Cloud Skills Boost:
   exampleCurrentPageScraping();

2. In extension popup:
   await exampleBasicScraping();
   
3. In content script:
   await exampleAutoDetection();
   
4. For debugging:
   await exampleMonitoringAndDebugging();

5. Performance testing:
   await examplePerformanceComparison();
*/
