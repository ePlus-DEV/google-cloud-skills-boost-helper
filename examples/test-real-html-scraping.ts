// Test scraping with real HTML structure
// This file tests the scraping service against real Google Cloud Skills Boost HTML

import ArcadeScrapingService from "../services/arcadeScrapingService";
import type { BadgeData } from "../types";

/**
 * Test function using real HTML structure from user's profile
 */
function testScrapingWithRealHTML() {
  console.log("🧪 Testing scraping with real HTML structure...");

  // Create a mock HTML document based on the real structure provided
  const mockHTML = `
    <main id="jump-content">
      <div class="text--center">
        <ql-avatar class="profile-avatar l-mbl" size="160"></ql-avatar>
        <h1 class="ql-display-small">David Nguyen</h1>
        <p class="ql-body-large l-mbl">Member since 2025</p>
        
        <div class="profile-badges">
          <div class="profile-badge">
            <a class="badge-image" href="https://www.cloudskillsboost.google/public_profiles/6a206ee7-7bbb-4286-a58d-b68b907917d7/badges/17022418">
              <img role="presentation" src="https://cdn.qwiklabs.com/QEwQsPPKuxc%2Brietc%2BXLxTJBfkvD%2FU5eumZy65snfug%3D">
            </a>
            <span class="ql-title-medium l-mts">Skills Boost Arcade Trivia July 2025 Week 3</span>
            <span class="ql-body-medium l-mbs">Earned Jul 19, 2025 EDT</span>
          </div>
          
          <div class="profile-badge">
            <a class="badge-image" href="https://www.cloudskillsboost.google/public_profiles/6a206ee7-7bbb-4286-a58d-b68b907917d7/badges/17021943">
              <img role="presentation" src="https://cdn.qwiklabs.com/2xq%2FehvKFO538a7wgnXLwLjM1I3MzpnTxrmka6Q7YFo%3D">
            </a>
            <span class="ql-title-medium l-mts">Skills Boost Arcade Trivia July 2025 Week 2</span>
            <span class="ql-body-medium l-mbs">Earned Jul 19, 2025 EDT</span>
          </div>
          
          <div class="profile-badge">
            <a class="badge-image" href="https://www.cloudskillsboost.google/public_profiles/6a206ee7-7bbb-4286-a58d-b68b907917d7/badges/17021857">
              <img role="presentation" src="https://cdn.qwiklabs.com/%2FlmnsaZW3c4Wvtys6EJic1JULjVO0gQVNfAyc%2BXOjZw%3D">
            </a>
            <span class="ql-title-medium l-mts">Level 2: Modern Application Deployment</span>
            <span class="ql-body-medium l-mbs">Earned Jul 19, 2025 EDT</span>
          </div>
          
          <div class="profile-badge">
            <a class="badge-image" href="https://www.cloudskillsboost.google/public_profiles/6a206ee7-7bbb-4286-a58d-b68b907917d7/badges/16958460">
              <img role="presentation" src="https://cdn.qwiklabs.com/rkL0SVAyPxbi8qK2XYqldHt6RLpSgshWSGzOTUPMgek%3D">
            </a>
            <span class="ql-title-medium l-mts">Level 1: Core Infrastructure and Security</span>
            <span class="ql-body-medium l-mbs">Earned Jul 15, 2025 EDT</span>
          </div>
          
          <div class="profile-badge">
            <a class="badge-image" href="https://www.cloudskillsboost.google/public_profiles/6a206ee7-7bbb-4286-a58d-b68b907917d7/badges/16953261">
              <img role="presentation" src="https://cdn.qwiklabs.com/PbxtVE0V6R%2F8Mr9MmtZAloV8BXtkiBqT22OfzCw7ZTQ%3D">
            </a>
            <span class="ql-title-medium l-mts">Skills Boost Arcade Trivia July 2025 Week 1</span>
            <span class="ql-body-medium l-mbs">Earned Jul 14, 2025 EDT</span>
          </div>
          
          <div class="profile-badge">
            <a class="badge-image" href="https://www.cloudskillsboost.google/public_profiles/6a206ee7-7bbb-4286-a58d-b68b907917d7/badges/16941964">
              <img role="presentation" src="https://cdn.qwiklabs.com/w3WxhA%2B0penzRifSGggTcd%2F4o5k03b6jHhpzBia7nrg%3D">
            </a>
            <span class="ql-title-medium l-mts">Skills Boost Arcade Base Camp July 2025</span>
            <span class="ql-body-medium l-mbs">Earned Jul 14, 2025 EDT</span>
          </div>
          
          <div class="profile-badge">
            <a class="badge-image" href="https://www.cloudskillsboost.google/public_profiles/6a206ee7-7bbb-4286-a58d-b68b907917d7/badges/16940931">
              <img role="presentation" src="https://cdn.qwiklabs.com/8OvKuOpNbyEug%2Bmag1JV2XvNxnAwqjXcHWQVIPXH%2Fjs%3D">
            </a>
            <span class="ql-title-medium l-mts">ExtraSkillestrial!</span>
            <span class="ql-body-medium l-mbs">Earned Jul 14, 2025 EDT</span>
          </div>
        </div>
      </div>
    </main>
  `;

  // Parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(mockHTML, "text/html");

  console.log("📋 Testing user details extraction...");
  const userDetails = (ArcadeScrapingService as any).extractUserDetails(doc);
  console.log("✅ User Details:", userDetails);

  console.log("📋 Testing badge extraction...");
  const badges = (ArcadeScrapingService as any).extractBadges(doc);
  console.log(`✅ Found ${badges.length} badges:`);

  badges.forEach((badge: BadgeData, index: number) => {
    console.log(`🏅 Badge ${index + 1}:`);
    console.log(`   Title: ${badge.title}`);
    console.log(`   Points: ${badge.points}`);
    console.log(`   Date: ${badge.dateEarned}`);
    console.log(`   Image: ${badge.imageURL ? "Present" : "Missing"}`);
  });

  console.log("📋 Testing point calculation...");
  const arcadePoints = (
    ArcadeScrapingService as any
  ).calculateArcadePointsFromBadges(badges);
  console.log("✅ Calculated Points:", arcadePoints);

  // Expected results based on the real HTML and official arcade point rules:
  const expectedBadges = [
    { title: "Skills Boost Arcade Trivia July 2025 Week 3", points: 1 }, // Arcade Weekly Trivia = 1 point
    { title: "Skills Boost Arcade Trivia July 2025 Week 2", points: 1 }, // Arcade Weekly Trivia = 1 point
    { title: "Level 2: Modern Application Deployment", points: 0.5 }, // Skill badge = 0.5 points
    { title: "Level 1: Core Infrastructure and Security", points: 0.5 }, // Skill badge = 0.5 points
    { title: "Skills Boost Arcade Trivia July 2025 Week 1", points: 1 }, // Arcade Weekly Trivia = 1 point
    { title: "Skills Boost Arcade Base Camp July 2025", points: 1 }, // Arcade Monthly/Game = 1 point
    { title: "ExtraSkillestrial!", points: 2 }, // Arcade Special Edition = 2 points
  ];

  // Total calculation:
  // - 3 Arcade Trivia badges = 3 arcade points
  // - 2 Skill badges = 1 arcade point (2 skill badges = 1 arcade point)
  // - 1 Base Camp badge = 1 arcade point
  // - 1 Special Edition badge = 2 arcade points
  // Total = 3 + 1 + 1 + 2 = 7 arcade points
  const expectedTotalPoints = 7;

  console.log("🧪 Validation:");
  console.log(
    `Expected badges: ${expectedBadges.length}, Found: ${badges.length}`
  );
  console.log(
    `Expected total points: ${expectedTotalPoints}, Calculated: ${arcadePoints.totalPoints}`
  );

  // Validate each badge
  expectedBadges.forEach((expected, index) => {
    const found = badges[index];
    if (found) {
      const titleMatch = found.title === expected.title;
      const pointsMatch = found.points === expected.points;
      console.log(
        `Badge ${index + 1}: Title ${titleMatch ? "✅" : "❌"}, Points ${
          pointsMatch ? "✅" : "❌"
        }`
      );

      if (!titleMatch) {
        console.log(`  Expected: "${expected.title}"`);
        console.log(`  Found: "${found.title}"`);
      }
      if (!pointsMatch) {
        console.log(
          `  Expected points: ${expected.points}, Found: ${found.points}`
        );
      }
    } else {
      console.log(`Badge ${index + 1}: ❌ Missing`);
    }
  });

  return {
    userDetails,
    badges,
    arcadePoints,
    validation: {
      badgeCount: badges.length === expectedBadges.length,
      totalPoints: arcadePoints.totalPoints === expectedTotalPoints,
    },
  };
}

/**
 * Test the current page extraction (for console testing)
 */
function testCurrentPageExtraction() {
  console.log("🧪 Testing current page extraction...");

  // Check if we're on a profile page
  if (!window.location.href.includes("cloudskillsboost.google")) {
    console.log("❌ Not on Google Cloud Skills Boost - testing with mock data");
    return testScrapingWithRealHTML();
  }

  console.log("✅ On Google Cloud Skills Boost - extracting real data");
  const data = ArcadeScrapingService.extractArcadeDataFromCurrentPage();

  if (data) {
    console.log("📊 Extracted Data:");
    console.log(`User: ${data.userDetails?.userName || "Unknown"}`);
    console.log(`Total Points: ${data.arcadePoints?.totalPoints || 0}`);
    console.log(`Badges Found: ${data.badges?.length || 0}`);

    data.badges?.forEach((badge: BadgeData, index: number) => {
      console.log(
        `🏅 Badge ${index + 1}: ${badge.title} (${badge.points} pts)`
      );
    });
  } else {
    console.log("❌ No data extracted");
  }

  return data;
}

// Export for use in browser console
(window as any).testScrapingWithRealHTML = testScrapingWithRealHTML;
(window as any).testCurrentPageExtraction = testCurrentPageExtraction;

console.log("🔧 Test functions loaded! Use:");
console.log("- testScrapingWithRealHTML() - Test with mock HTML");
console.log("- testCurrentPageExtraction() - Test on current page");

export { testScrapingWithRealHTML, testCurrentPageExtraction };
