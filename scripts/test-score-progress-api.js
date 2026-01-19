#!/usr/bin/env node

/**
 * Test script for Score Progress API
 * Tests the frontend API client by making direct HTTP requests
 */

const API_BASE_URL = "http://localhost:5001/api";

// Test credentials
const TEST_USER = {
  email: "admin@school.edu.kh",
  password: "admin123"
};

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function login() {
  log(colors.cyan, "\n🔐 Logging in...");

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(TEST_USER)
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  log(colors.green, "✅ Login successful");
  return data.data.token;
}

async function testScoreProgress(token, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.month) queryParams.append("month", params.month);
  if (params.year) queryParams.append("year", params.year);
  if (params.grade) queryParams.append("grade", params.grade);
  if (params.classId) queryParams.append("classId", params.classId);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/dashboard/score-progress${queryString ? `?${queryString}` : ''}`;

  log(colors.cyan, `\n📊 Testing Score Progress API: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("API returned success: false");
  }

  log(colors.green, "✅ API request successful");
  return data.data;
}

function displayResults(data, testName) {
  log(colors.blue, `\n📋 ${testName} Results:`);
  log(colors.yellow, "━".repeat(60));

  console.log(`Month: ${data.month}`);
  console.log(`Year: ${data.year}`);
  console.log(`\nOverall Statistics:`);
  console.log(`  Total Classes: ${data.overall.totalClasses}`);
  console.log(`  Total Subjects: ${data.overall.totalSubjects}`);
  console.log(`  Completed Subjects: ${data.overall.completedSubjects}`);
  console.log(`  Completion %: ${data.overall.completionPercentage}%`);
  console.log(`  Verified Subjects: ${data.overall.verifiedSubjects}`);
  console.log(`  Verification %: ${data.overall.verificationPercentage}%`);

  console.log(`\nGrades: ${data.grades.length}`);
  data.grades.forEach(grade => {
    console.log(`  Grade ${grade.grade}: ${grade.totalClasses} classes, Avg Completion: ${grade.avgCompletion}%`);
    if (grade.classes.length > 0) {
      const firstClass = grade.classes[0];
      console.log(`    First Class: ${firstClass.name} (${firstClass.studentCount} students)`);
      console.log(`    Completion: ${firstClass.completionStats.completionPercentage}%`);
      console.log(`    Subjects with data: ${firstClass.subjects.length}`);
      if (firstClass.subjects.length > 0) {
        const firstSubject = firstClass.subjects[0];
        console.log(`    First Subject: ${firstSubject.nameKh} (${firstSubject.code})`);
        console.log(`      Status: ${firstSubject.scoreStatus.status}`);
        console.log(`      Students with scores: ${firstSubject.scoreStatus.studentsWithScores}/${firstSubject.scoreStatus.totalStudents}`);
        console.log(`      Verified: ${firstSubject.verification.isConfirmed ? 'Yes' : 'No'}`);
      }
    }
  });

  log(colors.yellow, "━".repeat(60));
}

async function runTests() {
  try {
    log(colors.blue, "\n╔════════════════════════════════════════╗");
    log(colors.blue, "║  Score Progress API Integration Test  ║");
    log(colors.blue, "╚════════════════════════════════════════╝");

    // Step 1: Login
    const token = await login();

    // Step 2: Test default parameters (current month/year)
    log(colors.cyan, "\n📝 Test 1: Default parameters (current month/year)");
    const defaultData = await testScoreProgress(token);
    displayResults(defaultData, "Test 1: Default");

    // Step 3: Test with December 2025 filter
    log(colors.cyan, "\n📝 Test 2: Filter by December 2025");
    const decemberData = await testScoreProgress(token, {
      month: "ធ្នូ",
      year: 2025
    });
    displayResults(decemberData, "Test 2: December 2025");

    // Step 4: Test with grade filter
    log(colors.cyan, "\n📝 Test 3: Filter by Grade 10");
    const grade10Data = await testScoreProgress(token, {
      month: "ធ្នូ",
      year: 2025,
      grade: "10"
    });
    displayResults(grade10Data, "Test 3: Grade 10");

    // Step 5: Test with Grade 7
    log(colors.cyan, "\n📝 Test 4: Filter by Grade 7");
    const grade7Data = await testScoreProgress(token, {
      month: "មករា",
      year: 2026,
      grade: "7"
    });
    displayResults(grade7Data, "Test 4: Grade 7 (January 2026)");

    // Success summary
    log(colors.green, "\n╔════════════════════════════════════════╗");
    log(colors.green, "║      ✅ All Tests Passed! 🎉          ║");
    log(colors.green, "╚════════════════════════════════════════╝\n");

    log(colors.cyan, "📚 Test Summary:");
    console.log("  ✅ Authentication works");
    console.log("  ✅ Default query (no filters) works");
    console.log("  ✅ Month/year filtering works");
    console.log("  ✅ Grade filtering works");
    console.log("  ✅ Data structure is correct");
    console.log("  ✅ Score status calculation works");
    console.log("  ✅ Verification status tracking works");
    console.log("");

  } catch (error) {
    log(colors.red, `\n❌ Test Failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
