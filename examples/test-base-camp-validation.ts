// Validation test for Base Camp = 1 point rule
// Run in browser console to verify correct point calculation

import ArcadeScrapingService from "../services/arcadeScrapingService";
import type { BadgeData } from "../types";

/**
 * Test Base Camp badge point calculation
 */
function testBaseCampPointCalculation() {
  console.log("🧪 Testing Base Camp badge point calculation...");

  // Create mock HTML with Base Camp badge
  const mockHTML = `
    <div class="profile-badges">
      <div class="profile-badge">
        <a class="badge-image" href="#">
          <img role="presentation" src="https://cdn.qwiklabs.com/test-base-camp.png">
        </a>
        <span class="ql-title-medium l-mts">Skills Boost Arcade Base Camp July 2025</span>
        <span class="ql-body-medium l-mbs">Earned Jul 14, 2025 EDT</span>
      </div>
    </div>
  `;

  // Parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(mockHTML, "text/html");

  // Extract badges using the service
  const badges = (ArcadeScrapingService as any).extractBadges(doc);

  console.log("📋 Badge extraction results:");
  console.log(`Found ${badges.length} badge(s)`);

  if (badges.length > 0) {
    const baseCampBadge = badges[0];
    console.log(`🏅 Badge: ${baseCampBadge.title}`);
    console.log(`🎯 Points: ${baseCampBadge.points}`);

    // Verify Base Camp = 1 point
    if (
      baseCampBadge.title.includes("Base Camp") &&
      baseCampBadge.points === 1
    ) {
      console.log("✅ PASS: Base Camp badge correctly calculated as 1 point");
    } else {
      console.log("❌ FAIL: Base Camp badge not calculated correctly");
      console.log(`Expected: 1 point, Got: ${baseCampBadge.points} points`);
    }
  } else {
    console.log("❌ FAIL: No badges found");
  }

  // Test total calculation
  console.log("📊 Testing total arcade points calculation...");
  const arcadePoints = (
    ArcadeScrapingService as any
  ).calculateArcadePointsFromBadges(badges);
  console.log(`Total Arcade Points: ${arcadePoints.totalPoints}`);
  console.log(`Game/Base Camp Points: ${arcadePoints.gamePoints}`);

  if (arcadePoints.totalPoints === 1 && arcadePoints.gamePoints === 1) {
    console.log("✅ PASS: Total calculation correct for Base Camp");
  } else {
    console.log("❌ FAIL: Total calculation incorrect");
  }

  return {
    badges,
    arcadePoints,
    success: badges.length > 0 && badges[0].points === 1,
  };
}

/**
 * Test real David Nguyen profile calculation
 */
function testRealProfileCalculation() {
  console.log("🧪 Testing real profile calculation with Base Camp...");

  const mockHTML = `
    <div class="profile-badges">
      <div class="profile-badge">
        <span class="ql-title-medium">Skills Boost Arcade Trivia July 2025 Week 3</span>
        <span class="ql-body-medium">Earned Jul 19, 2025 EDT</span>
      </div>
      <div class="profile-badge">
        <span class="ql-title-medium">Skills Boost Arcade Trivia July 2025 Week 2</span>
        <span class="ql-body-medium">Earned Jul 19, 2025 EDT</span>
      </div>
      <div class="profile-badge">
        <span class="ql-title-medium">Level 2: Modern Application Deployment</span>
        <span class="ql-body-medium">Earned Jul 19, 2025 EDT</span>
      </div>
      <div class="profile-badge">
        <span class="ql-title-medium">Level 1: Core Infrastructure and Security</span>
        <span class="ql-body-medium">Earned Jul 15, 2025 EDT</span>
      </div>
      <div class="profile-badge">
        <span class="ql-title-medium">Skills Boost Arcade Trivia July 2025 Week 1</span>
        <span class="ql-body-medium">Earned Jul 14, 2025 EDT</span>
      </div>
      <div class="profile-badge">
        <span class="ql-title-medium">Skills Boost Arcade Base Camp July 2025</span>
        <span class="ql-body-medium">Earned Jul 14, 2025 EDT</span>
      </div>
      <div class="profile-badge">
        <span class="ql-title-medium">ExtraSkillestrial!</span>
        <span class="ql-body-medium">Earned Jul 14, 2025 EDT</span>
      </div>
    </div>
  `;

  const parser = new DOMParser();
  const doc = parser.parseFromString(mockHTML, "text/html");

  const badges = (ArcadeScrapingService as any).extractBadges(doc);
  const arcadePoints = (
    ArcadeScrapingService as any
  ).calculateArcadePointsFromBadges(badges);

  console.log("📊 Badge Summary:");
  badges.forEach((badge: BadgeData, index: number) => {
    console.log(`${index + 1}. ${badge.title} = ${badge.points} points`);
  });

  console.log("\n🎯 Final Calculation:");
  console.log(`Trivia badges: ${arcadePoints.triviaPoints} points`);
  console.log(`Game/Base Camp: ${arcadePoints.gamePoints} points`);
  console.log(`Special Edition: ${arcadePoints.specialPoints} points`);
  console.log(`Skill badges: ${arcadePoints.skillPoints} points`);
  console.log(`TOTAL: ${arcadePoints.totalPoints} arcade points`);

  // Expected: 3 trivia + 1 base camp + 2 special + 1 skill = 7 points
  const expectedTotal = 7;
  if (arcadePoints.totalPoints === expectedTotal) {
    console.log(`✅ PASS: Total matches expected (${expectedTotal} points)`);
  } else {
    console.log(
      `❌ FAIL: Expected ${expectedTotal}, got ${arcadePoints.totalPoints}`
    );
  }

  // Check Base Camp specifically
  const baseCampBadge = badges.find((b: BadgeData) =>
    b.title.includes("Base Camp")
  );
  if (baseCampBadge && baseCampBadge.points === 1) {
    console.log("✅ PASS: Base Camp badge = 1 point");
  } else {
    console.log("❌ FAIL: Base Camp badge not 1 point");
  }

  return {
    badges,
    arcadePoints,
    success: arcadePoints.totalPoints === expectedTotal,
  };
}

// Export for use
(window as any).testBaseCampPointCalculation = testBaseCampPointCalculation;
(window as any).testRealProfileCalculation = testRealProfileCalculation;

console.log("🔧 Base Camp validation tests loaded!");
console.log(
  "Run: testBaseCampPointCalculation() or testRealProfileCalculation()"
);

export { testBaseCampPointCalculation, testRealProfileCalculation };
