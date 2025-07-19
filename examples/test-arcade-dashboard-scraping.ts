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

  // Display available events
  if (
    dashboardData.availableEvents &&
    dashboardData.availableEvents.length > 0
  ) {
    console.log(
      `\n🎮 Available Events (${dashboardData.availableEvents.length}):`
    );
    dashboardData.availableEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Points: ${event.points}`);
      if (event.accessCode) console.log(`   Access Code: ${event.accessCode}`);
      if (event.description)
        console.log(
          `   Description: ${event.description.substring(0, 100)}...`
        );
      console.log(`   Active: ${event.isActive ? "Yes" : "No"}`);
    });
  } else {
    console.log("\n🎮 No available events found");
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
 * Test Base Camp event extraction with real HTML
 */
function testBaseCampEventExtraction() {
  console.log("🧪 Testing Base Camp Event Extraction...");

  const baseCampHTML = `
    <div class="dark-back pt-4 py-3" style="background-image: url('https://i.ibb.co/SRMTB41/BGimg-form.png');">
      <div class="container ">
        <div class="card scrollBox animate">
          <div class="row no-gutters">
            <div class="col-lg-6 align-items-center">
              <div class="card-body">
               <a href="https://www.cloudskillsboost.google/games/6313?utm_source=qwiklabs&utm_medium=lp&utm_campaign=basecamp-July-arcade25"> 
                 <img src="https://i.ibb.co/Vp3ybXk5/base-july.png" alt="base-camp" class="card-img-top specialBadge">
               </a>
              </div>
            </div>
            <div class="col-lg-6 p-5">
              <br>
              <h3 class="card-title">The Arcade Base Camp July</h3>
              <p class="pt-2">Welcome to Base Camp, where you'll develop key Google Cloud skills and earn an exclusive credential that will open doors to the cloud for you. No prior experience is required!</p>
              <p class="pt-2"><span style="color:#f94db4;">Access code:</span> 1q-basecamp-07190</p>
              <p>Arcade points: 1</p>
             <a href="https://www.cloudskillsboost.google/games/6313?utm_source=qwiklabs&utm_medium=lp&utm_campaign=basecamp-July-arcade25"> 
               <button class="btn mt-1 subsBtn">START!</button>
             </a>
            </div>
          </div>
        </div>
      </div>
      <div id="level3"></div>
      <br>
    </div>
  `;

  // Create temporary container
  const container = document.createElement("div");
  container.innerHTML = baseCampHTML;
  container.id = "test-basecamp-container";
  container.style.display = "none";
  document.body.appendChild(container);

  // Test extraction
  const originalQuerySelector = document.querySelector;
  const originalQuerySelectorAll = document.querySelectorAll;

  // Override selectors to search in our container
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

  // Extract events
  const dashboardData = ArcadeDashboardService.extractArcadeDashboardData();

  // Restore original functions
  document.querySelector = originalQuerySelector;
  document.querySelectorAll = originalQuerySelectorAll;

  // Clean up
  document.body.removeChild(container);

  console.log("🎯 Base Camp Event Test Results:");

  if (
    dashboardData.availableEvents &&
    dashboardData.availableEvents.length > 0
  ) {
    const baseCampEvent = dashboardData.availableEvents.find((event) =>
      event.title.toLowerCase().includes("base camp")
    );

    if (baseCampEvent) {
      console.log("✅ Base Camp Event Found:");
      console.log(`   Title: ${baseCampEvent.title}`);
      console.log(`   Points: ${baseCampEvent.points}`);
      console.log(`   Access Code: ${baseCampEvent.accessCode}`);
      console.log(`   Active: ${baseCampEvent.isActive}`);
      console.log(`   Game URL: ${baseCampEvent.gameUrl}`);

      // Validate expected values
      const validations = [
        {
          test: 'Title contains "Base Camp"',
          expected: true,
          actual: baseCampEvent.title.includes("Base Camp"),
        },
        { test: "Points = 1", expected: 1, actual: baseCampEvent.points },
        {
          test: "Access Code exists",
          expected: true,
          actual: !!baseCampEvent.accessCode,
        },
        {
          test: 'Access Code = "1q-basecamp-07190"',
          expected: "1q-basecamp-07190",
          actual: baseCampEvent.accessCode,
        },
        { test: "Is Active", expected: true, actual: baseCampEvent.isActive },
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
        `\n📈 Base Camp Test Summary: ${passed}/${validations.length} tests passed`
      );

      return baseCampEvent;
    } else {
      console.log("❌ Base Camp event not found in extracted events");
    }
  } else {
    console.log("❌ No events extracted from Base Camp HTML");
  }

  return null;
}

/**
 * Test Weekly Trivia events extraction with real HTML
 */
function testWeeklyTriviaExtraction() {
  console.log("🧪 Testing Weekly Trivia Events Extraction...");

  const weeklyTriviaHTML = `
    <div class="row pt-5 align-items-center">
      <div class="col-lg-3 col-md-6 col-sm-12 mb-2">
        <h5 class="card-title pb-2">Week 1</h5>
        <div class="card">
          <div class="card-body">
            <a href="https://www.cloudskillsboost.google/games/6314?utm_source=qwiklabs&utm_medium=lp&utm_campaign=arcade25-July-trivia">
              <img src="https://i.ibb.co/XZ0MHN56/week-1-july.png" class="card-img-top specialBadge" alt="Week 1">
            </a>
          </div>
        </div>
        <br>
        <p class="mt-2"><span style="color:#f94db4;">Access code:</span> 1q-trivia-19029</p>
        <p>Arcade points: 1</p>
        <a href="https://www.cloudskillsboost.google/games/6314?utm_source=qwiklabs&utm_medium=lp&utm_campaign=arcade25-July-trivia">
          <button class="btn mt-1 subsBtn">START!</button>
        </a>
      </div>
      <div class="col-lg-3 col-md-6 col-sm-12 mb-2">
        <h5 class="card-title pb-2">Week 2</h5>
        <div class="card">
          <div class="card-body">
            <a href="https://www.cloudskillsboost.google/games/6315?utm_source=qwiklabs&utm_medium=lp&utm_campaign=arcade25-July-trivia">
              <img src="https://i.ibb.co/XrK5ZbkH/week-2-july.png" class="card-img-top specialBadge" alt="Week 2">
            </a>
          </div>
        </div>
        <br>
        <p><span style="color:#f94db4;">Access code:</span> 1q-trivia-32292</p>
        <p>Arcade points: 1</p>
        <a href="https://www.cloudskillsboost.google/games/6315?utm_source=qwiklabs&utm_medium=lp&utm_campaign=arcade25-July-trivia">
          <button class="btn mt-1 subsBtn">START!</button>
        </a>
      </div>
      <div class="col-lg-3 col-md-6 col-sm-12 mb-2">
        <h5 class="card-title pb-2">Week 3</h5>
        <div class="card">
          <div class="card-body">
            <a href="https://www.cloudskillsboost.google/games/6316?utm_source=qwiklabs&utm_medium=lp&utm_campaign=arcade25-July-trivia">
              <img src="https://i.ibb.co/B2LzfPqR/week-3-july.png" class="card-img-top specialBadge" alt="Week 3">
            </a>
          </div>
        </div>
        <br>
        <p><span style="color:#f94db4;">Access code:</span> 1q-trivia-70043</p>
        <p>Arcade points: 1</p>
        <a href="https://www.cloudskillsboost.google/games/6316?utm_source=qwiklabs&utm_medium=lp&utm_campaign=arcade25-July-trivia">
          <button class="btn mt-1 subsBtn">START!</button>
        </a>
      </div>
      <div class="col-lg-3 col-md-6 col-sm-12 mb-2">
        <h5 class="card-title pb-2">Week 4</h5>
        <div class="card">
          <div class="card-body">
            <a href="https://www.cloudskillsboost.google/games/6317?utm_source=qwiklabs&utm_medium=lp&utm_campaign=arcade25-July-trivia">
              <img src="https://i.ibb.co/Swc4QWNY/week-4-july.png" class="card-img-top specialBadge" alt="Week 4">
            </a>
          </div>
        </div>
        <br>
        <p><span style="color:#f94db4;">Access code:</span> 1q-trivia-55192</p> 
        <p>Arcade points: 1</p>
        <a href="https://www.cloudskillsboost.google/games/6317?utm_source=qwiklabs&utm_medium=lp&utm_campaign=arcade25-July-trivia">
          <button class="btn mt-1 subsBtn">START!</button>
        </a>
      </div>
    </div>
  `;

  // Create temporary container
  const container = document.createElement("div");
  container.innerHTML = weeklyTriviaHTML;
  container.id = "test-trivia-container";
  container.style.display = "none";
  document.body.appendChild(container);

  // Test extraction
  const originalQuerySelector = document.querySelector;
  const originalQuerySelectorAll = document.querySelectorAll;

  // Override selectors to search in our container first
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

  // Extract events
  const dashboardData = ArcadeDashboardService.extractArcadeDashboardData();

  // Restore original functions
  document.querySelector = originalQuerySelector;
  document.querySelectorAll = originalQuerySelectorAll;

  // Clean up
  document.body.removeChild(container);

  console.log("🎯 Weekly Trivia Test Results:");

  if (
    dashboardData.availableEvents &&
    dashboardData.availableEvents.length > 0
  ) {
    console.log(`Found ${dashboardData.availableEvents.length} trivia events:`);

    const expectedEvents = [
      { week: 1, accessCode: "1q-trivia-19029" },
      { week: 2, accessCode: "1q-trivia-32292" },
      { week: 3, accessCode: "1q-trivia-70043" },
      { week: 4, accessCode: "1q-trivia-55192" },
    ];

    let passed = 0;
    let totalTests = 0;

    dashboardData.availableEvents.forEach((event, index) => {
      console.log(`\n📅 Event ${index + 1}:`);
      console.log(`   Title: ${event.title}`);
      console.log(`   Points: ${event.points}`);
      console.log(`   Access Code: ${event.accessCode}`);
      console.log(`   Active: ${event.isActive}`);

      // Validate expected values
      const expectedWeek = expectedEvents[index];
      if (expectedWeek) {
        totalTests += 4; // 4 tests per event

        // Test 1: Title contains week number
        if (event.title.toLowerCase().includes(`week ${expectedWeek.week}`)) {
          console.log(`   ✅ Title contains Week ${expectedWeek.week}: PASS`);
          passed++;
        } else {
          console.log(
            `   ❌ Title should contain Week ${expectedWeek.week}: FAIL`
          );
        }

        // Test 2: Points = 1
        if (event.points === 1) {
          console.log(`   ✅ Points = 1: PASS`);
          passed++;
        } else {
          console.log(`   ❌ Points should be 1: FAIL (got ${event.points})`);
        }

        // Test 3: Access code matches
        if (event.accessCode === expectedWeek.accessCode) {
          console.log(`   ✅ Access Code matches: PASS`);
          passed++;
        } else {
          console.log(
            `   ❌ Access Code should be ${expectedWeek.accessCode}: FAIL (got ${event.accessCode})`
          );
        }

        // Test 4: Is active
        if (event.isActive) {
          console.log(`   ✅ Is Active: PASS`);
          passed++;
        } else {
          console.log(`   ❌ Should be Active: FAIL`);
        }
      }
    });

    console.log(
      `\n📈 Weekly Trivia Test Summary: ${passed}/${totalTests} tests passed`
    );

    return dashboardData.availableEvents;
  } else {
    console.log("❌ No trivia events extracted from Weekly Trivia HTML");
    return null;
  }
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
(window as any).testBaseCampEventExtraction = testBaseCampEventExtraction;
(window as any).testWeeklyTriviaExtraction = testWeeklyTriviaExtraction;
(window as any).runArcadeDashboardTest = runArcadeDashboardTest;

console.log("🔧 Arcade Dashboard tests loaded!");
console.log("Available functions:");
console.log("- testArcadeDashboardScraping() - Test on real arcade page");
console.log("- testWithMockHTML() - Test with mock data");
console.log(
  "- testBaseCampEventExtraction() - Test Base Camp event extraction"
);
console.log(
  "- testWeeklyTriviaExtraction() - Test Weekly Trivia events extraction"
);
console.log(
  "- runArcadeDashboardTest() - Auto-detect and run appropriate test"
);

// Auto-run test
runArcadeDashboardTest();

export {
  testArcadeDashboardScraping,
  testWithMockHTML,
  testBaseCampEventExtraction,
  testWeeklyTriviaExtraction,
  runArcadeDashboardTest,
};
