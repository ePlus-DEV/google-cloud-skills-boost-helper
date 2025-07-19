/**
 * Test Arcade Dashboard Scraping
 * Chạy file này trong console tại https://go.cloudskillsboost.google/arcade
 */

import ArcadeDashboardService from "../services/arcadeDashboardService";

/**
 * Test arcade dashboard scraping on real page
 */
function testArcadeDashboardScraping() {
  console.log("🧪 Testing Arcade Dashboard Scraping...");

  // Check if we're on the right page
  if (!ArcadeDashboardService.isArcadeDashboardPage()) {
    console.error("❌ Not on arcade dashboard page!");
    console.log(
      "Please navigate to: https://go.cloudskillsboost.google/arcade"
    );
    return;
  }

  console.log("✅ Confirmed on arcade dashboard page");

  // Extract data
  const dashboardData = ArcadeDashboardService.extractArcadeDashboardData();

  console.log("📊 Arcade Dashboard Data:");
  console.log(`Total Arcade Points: ${dashboardData.totalArcadePoints}`);
  console.log(`Current League: ${dashboardData.currentLeague}`);

  if (dashboardData.nextLeague) {
    console.log(`Next League: ${dashboardData.nextLeague}`);
    console.log(`Points to Next League: ${dashboardData.pointsToNextLeague}`);
  }

  if (dashboardData.userDetails?.userName) {
    console.log(`User Name: ${dashboardData.userDetails.userName}`);
  }

  if (dashboardData.leaderboard?.position) {
    console.log(
      `Leaderboard Position: #${dashboardData.leaderboard.position}${
        dashboardData.leaderboard.totalParticipants
          ? ` of ${dashboardData.leaderboard.totalParticipants}`
          : ""
      }`
    );
  }

  console.log(
    `Game Status: ${dashboardData.gameStatus?.isActive ? "Active" : "Inactive"}`
  );

  if (dashboardData.gameStatus?.timeRemaining) {
    console.log(`Time Remaining: ${dashboardData.gameStatus.timeRemaining}`);
  }

  if (dashboardData.gameStatus?.currentEvent) {
    console.log(`Current Event: ${dashboardData.gameStatus.currentEvent}`);
  }

  return dashboardData;
}

/**
 * Test with mock HTML (for testing selectors)
 */
function testWithMockHTML() {
  console.log("🧪 Testing with Mock Arcade Dashboard HTML...");

  const mockHTML = `
    <div class="arcade-dashboard">
      <div class="user-profile">
        <span class="user-name">John Doe</span>
        <img class="profile-image" src="https://example.com/avatar.jpg" alt="Profile">
      </div>
      
      <div class="arcade-points-display">
        <h1 class="ql-display-large">42</h1>
        <span class="ql-body-medium">Arcade Points</span>
      </div>
      
      <div class="league-info">
        <span class="current-league">Gold League</span>
        <div class="progress-to-next">
          <span>15 points to Platinum</span>
        </div>
      </div>
      
      <div class="leaderboard">
        <span class="user-rank">#156 of 2,450 participants</span>
      </div>
      
      <div class="game-status">
        <span class="time-remaining">5 days, 12 hours remaining</span>
        <span class="current-event">Skills Boost Arcade Game August 2025</span>
      </div>
    </div>
  `;

  // Create a temporary container
  const container = document.createElement("div");
  container.innerHTML = mockHTML;
  container.id = "test-arcade-container";
  container.style.display = "none";
  document.body.appendChild(container);

  // Test extraction
  const originalQuerySelector = document.querySelector;
  const originalQuerySelectorAll = document.querySelectorAll;

  // Override querySelector to search in our mock container first
  document.querySelector = function (selector: string) {
    const mockResult = container.querySelector(selector);
    if (mockResult) return mockResult;
    return originalQuerySelector.call(document, selector);
  };

  document.querySelectorAll = function (selector: string) {
    const mockResults = container.querySelectorAll(selector);
    if (mockResults.length > 0) return mockResults;
    return originalQuerySelectorAll.call(document, selector);
  };

  // Test extraction
  const mockData = ArcadeDashboardService.extractArcadeDashboardData();

  console.log("📊 Mock Test Results:");
  console.log(`Expected Points: 42, Got: ${mockData.totalArcadePoints}`);
  console.log(`Expected League: Gold, Got: ${mockData.currentLeague}`);

  // Restore original functions
  document.querySelector = originalQuerySelector;
  document.querySelectorAll = originalQuerySelectorAll;

  // Clean up
  document.body.removeChild(container);

  // Validate results
  const validations = [
    { test: "Points", expected: 42, actual: mockData.totalArcadePoints },
    { test: "League", expected: "Gold", actual: mockData.currentLeague },
    {
      test: "Game Active",
      expected: true,
      actual: mockData.gameStatus?.isActive,
    },
  ];

  let passed = 0;
  validations.forEach((validation) => {
    if (validation.expected === validation.actual) {
      console.log(`✅ ${validation.test}: PASS`);
      passed++;
    } else {
      console.log(
        `❌ ${validation.test}: FAIL (expected: ${validation.expected}, got: ${validation.actual})`
      );
    }
  });

  console.log(
    `\n📈 Mock Test Summary: ${passed}/${validations.length} tests passed`
  );

  return mockData;
}

/**
 * Auto-detect and run appropriate test
 */
function runArcadeDashboardTest() {
  const currentUrl = window.location.href;

  if (currentUrl.includes("go.cloudskillsboost.google/arcade")) {
    console.log("🎯 Running live arcade dashboard test...");
    return testArcadeDashboardScraping();
  } else {
    console.log("🧪 Running mock HTML test...");
    console.log(
      "For live testing, navigate to: https://go.cloudskillsboost.google/arcade"
    );
    return testWithMockHTML();
  }
}

// Export functions for manual use
(window as any).testArcadeDashboardScraping = testArcadeDashboardScraping;
(window as any).testWithMockHTML = testWithMockHTML;
(window as any).runArcadeDashboardTest = runArcadeDashboardTest;

console.log("🔧 Arcade Dashboard tests loaded!");
console.log("Available functions:");
console.log("- testArcadeDashboardScraping() - Test on real arcade page");
console.log("- testWithMockHTML() - Test with mock data");
console.log(
  "- runArcadeDashboardTest() - Auto-detect and run appropriate test"
);

// Auto-run test
runArcadeDashboardTest();

export {
  testArcadeDashboardScraping,
  testWithMockHTML,
  runArcadeDashboardTest,
};
