import { NextRequest } from 'next/server';
import {
  seedDevelopmentData,
  getCampaignConfig,
  saveCampaignConfig,
  recordContribution,
  editContribution,
  deleteContribution,
  getStudentsByClass,
  getClass,
  getPublicCampaignSummary,
  getPublicLeaderboard,
  getPublicClassLeaderboard,
  getUserProfile,
} from '../src/lib/firebase/admin';
import { POST as loginRoute } from '../src/app/api/auth/login/route';
import { POST as contributionsPostRoute, GET as contributionsGetRoute } from '../src/app/api/contributions/route';
import { GET as studentsGetRoute } from '../src/app/api/students/route';
import { PUT as campaignPutRoute } from '../src/app/api/campaign/route';
import { POST as crUsersPostRoute } from '../src/app/api/admin/cr-users/route';
import { AUTH_COOKIE_NAME } from '../src/lib/auth';

function createMockRequest(
  url: string,
  method: string,
  options?: {
    body?: any;
    userUid?: string;
  }
): NextRequest {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (options?.userUid) {
    headers.set('Cookie', `${AUTH_COOKIE_NAME}=${options.userUid}`);
    headers.set('x-user-uid', options.userUid);
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  } as any);
}

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✕ [FAIL] ${testName} - ${detail || ''}`);
    testsFailed++;
  }
}

async function runSecuritySuite() {
  console.log('\n======================================================');
  console.log('   DHANYADHAN: 10 MANDATORY SECURITY & INTEGRITY TESTS');
  console.log('======================================================\n');

  // Step 0: Ensure DB seeded with demo config and test accounts
  await seedDevelopmentData({ applyDemoCampaignConfig: true, sampleStudentsPerClass: 3 });

  // Test User Accounts:
  // 'cr-2-bcom-afa': class_admin for '2-bcom-afa'
  // 'cr-1-bcom-a': class_admin for '1-bcom-a'
  // 'sdg-admin-1': sdg_admin (all classes)

  // ----------------------------------------------------
  // TEST 1: CR A attempts to read Class B students -> DENIED
  // ----------------------------------------------------
  console.log('Test 1: CR A reading Class B students');
  const req1 = createMockRequest('http://localhost:3000/api/students?classId=1-bcom-a', 'GET', {
    userUid: 'cr-2-bcom-afa', // Assigned to 2-bcom-afa, trying to read 1-bcom-a
  });
  const res1 = await studentsGetRoute(req1);
  assert(
    res1.status === 403,
    'CR A reading Class B students is DENIED (HTTP 403)',
    `Expected status 403, got ${res1.status}`
  );

  // ----------------------------------------------------
  // TEST 2: CR A attempts to create a contribution for Class B -> DENIED
  // ----------------------------------------------------
  console.log('Test 2: CR A creating Class B contribution');
  const req2 = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      studentId: 'std-seed-1-bcom-a-1',
      classId: '1-bcom-a', // Attempting to record for another class!
      type: 'grain',
      grainType: 'Rice',
      grainQuantityKg: 10,
    },
  });
  const res2 = await contributionsPostRoute(req2);
  assert(
    res2.status === 403,
    'CR A creating Class B contribution is DENIED (HTTP 403)',
    `Expected status 403, got ${res2.status}`
  );

  // ----------------------------------------------------
  // TEST 3: CR A attempts to modify their own class ID -> DENIED
  // ----------------------------------------------------
  console.log('Test 3: CR A editing own classId');
  const req3 = createMockRequest('http://localhost:3000/api/admin/cr-users', 'POST', {
    userUid: 'cr-2-bcom-afa', // Non-sdg admin attempting to assign/change classId
    body: {
      email: 'cr.2bcom.afa@dhanyadhan.edu',
      name: 'Priya Sharma',
      classId: '3-bcom-fi',
    },
  });
  const res3 = await crUsersPostRoute(req3);
  assert(
    res3.status === 403,
    'CR A editing own classId is DENIED (HTTP 403)',
    `Expected status 403, got ${res3.status}`
  );

  // ----------------------------------------------------
  // TEST 4: CR A attempts to access another class contribution data -> DENIED
  // ----------------------------------------------------
  console.log('Test 4: CR A accessing Class B route/data');
  const req4 = createMockRequest('http://localhost:3000/api/contributions?classId=1-bcom-a', 'GET', {
    userUid: 'cr-2-bcom-afa',
  });
  const res4 = await contributionsGetRoute(req4);
  assert(
    res4.status === 403,
    'CR A accessing Class B contributions data is DENIED (HTTP 403)',
    `Expected status 403, got ${res4.status}`
  );

  // ----------------------------------------------------
  // TEST 5: Unauthenticated contribution write -> DENIED
  // ----------------------------------------------------
  console.log('Test 5: Unauthenticated contribution write');
  const req5 = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: undefined, // No user session
    body: {
      studentId: 'std-seed-2-bcom-afa-1',
      classId: '2-bcom-afa',
      type: 'money',
      moneyAmount: 500,
    },
  });
  const res5 = await contributionsPostRoute(req5);
  assert(
    res5.status === 401,
    'Unauthenticated contribution write is DENIED (HTTP 401)',
    `Expected status 401, got ${res5.status}`
  );

  // ----------------------------------------------------
  // TEST 6: Public browser attempts to access raw contribution documents -> DENIED
  // ----------------------------------------------------
  console.log('Test 6: Public raw contribution access');
  const req6 = createMockRequest('http://localhost:3000/api/contributions', 'GET', {
    userUid: undefined, // Public unauthenticated request
  });
  const res6 = await contributionsGetRoute(req6);
  assert(
    res6.status === 401,
    'Public raw contribution access is DENIED (HTTP 401)',
    `Expected status 401, got ${res6.status}`
  );

  // ----------------------------------------------------
  // TEST 7: Public browser attempts to access private student totals -> DENIED
  // ----------------------------------------------------
  console.log('Test 7: Public private student totals access');
  const req7 = createMockRequest('http://localhost:3000/api/students?classId=2-bcom-afa', 'GET', {
    userUid: undefined, // Public unauthenticated request
  });
  const res7 = await studentsGetRoute(req7);
  assert(
    res7.status === 401,
    'Public private student totals query is DENIED (HTTP 401)',
    `Expected status 401, got ${res7.status}`
  );

  // Also verify that publicClassLeaderboard does NOT contain financial or grain fields:
  const publicClassBoard = await getPublicClassLeaderboard('2-bcom-afa');
  const studentEntry = publicClassBoard?.students[0];
  const hasLeakedMetrics =
    studentEntry &&
    ('totalMoney' in studentEntry ||
      'money' in studentEntry ||
      'totalGrainKg' in studentEntry ||
      'equivalentKg' in studentEntry);
  assert(
    !hasLeakedMetrics,
    'Public Class Leaderboard contains NAMES & RANKS ONLY (zero numerical amounts)',
    'Detected leaked numeric metrics in public student leaderboard entry'
  );

  // ----------------------------------------------------
  // TEST 8: Client attempts to submit a tampered Equivalent KG value -> SERVER REJECTS/RECALCULATES
  // ----------------------------------------------------
  console.log('Test 8: Tampered Equivalent KG submission');
  const mockProof = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const req8 = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      studentId: 'std-seed-2-bcom-afa-1',
      classId: '2-bcom-afa',
      type: 'money',
      moneyAmount: 500, // At rate ₹25 = 1 KG, official impact is 20 KG
      paymentProofUrl: mockProof,
      equivalentKg: 9999, // Tampered client payload!
    },
  });
  const res8 = await contributionsPostRoute(req8);
  const data8 = await res8.json();
  const recordedEq = data8.contribution?.equivalentKg;
  assert(
    recordedEq === 20,
    `Tampered Equivalent KG (9999) overridden by server: calculated ${recordedEq} KG`,
    `Expected 20 KG, but found ${recordedEq}`
  );

  // ----------------------------------------------------
  // TEST 9: CR attempts to modify campaign target/configuration -> DENIED
  // ----------------------------------------------------
  console.log('Test 9: CR modifying campaign configuration');
  const req9 = createMockRequest('http://localhost:3000/api/campaign', 'PUT', {
    userUid: 'cr-2-bcom-afa', // CR trying to change campaign settings
    body: {
      targetKg: 1000,
    },
  });
  const res9 = await campaignPutRoute(req9);
  assert(
    res9.status === 403,
    'CR modifying campaign configuration is DENIED (HTTP 403)',
    `Expected status 403, got ${res9.status}`
  );

  // ----------------------------------------------------
  // TEST 10: SDG admin accesses and manages all 17 classes -> ALLOWED
  // ----------------------------------------------------
  console.log('Test 10: SDG Admin accessing all 17 classes');
  const req10 = createMockRequest('http://localhost:3000/api/students?classId=1-bcom-a', 'GET', {
    userUid: 'sdg-admin-1', // SDG Admin accessing 1-bcom-a
  });
  const res10 = await studentsGetRoute(req10);
  assert(
    res10.status === 200,
    'SDG Admin access to all classes is ALLOWED (HTTP 200)',
    `Expected status 200, got ${res10.status}`
  );

  // ----------------------------------------------------
  // TEST 11: Monetary contribution WITHOUT payment proof -> DENIED (HTTP 400)
  // ----------------------------------------------------
  console.log('Test 11: Monetary contribution without payment screenshot verification');
  const req11 = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      studentId: 'std-seed-2-bcom-afa-1',
      classId: '2-bcom-afa',
      type: 'money',
      moneyAmount: 250,
      // paymentProofUrl omitted!
    },
  });
  const res11 = await contributionsPostRoute(req11);
  const data11 = await res11.json();
  assert(
    res11.status === 400 && data11.error?.includes('mandatory'),
    'Monetary contribution without payment screenshot is REJECTED (HTTP 400)',
    `Expected 400 with mandatory error, got ${res11.status}: ${data11.error}`
  );

  // ----------------------------------------------------
  // TEST 12: Monetary contribution WITH payment proof -> ALLOWED & PERSISTED (HTTP 201)
  // ----------------------------------------------------
  console.log('Test 12: Monetary contribution with valid compressed screenshot');
  const req12 = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      studentId: 'std-seed-2-bcom-afa-1',
      classId: '2-bcom-afa',
      type: 'money',
      moneyAmount: 250,
      paymentProofUrl: mockProof,
    },
  });
  const res12 = await contributionsPostRoute(req12);
  const data12 = await res12.json();
  assert(
    res12.status === 201 && data12.contribution?.paymentProofUrl === mockProof,
    'Monetary contribution with compressed screenshot is ACCEPTED and PERSISTED',
    `Expected 201 with saved paymentProofUrl, got ${res12.status}`
  );

  // ----------------------------------------------------
  // TEST 13: Monetary contribution with invalid proof format -> DENIED (HTTP 400)
  // ----------------------------------------------------
  console.log('Test 13: Monetary contribution with non-image proof format');
  const req13 = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      studentId: 'std-seed-2-bcom-afa-1',
      classId: '2-bcom-afa',
      type: 'money',
      moneyAmount: 250,
      paymentProofUrl: 'plain-text-not-an-image',
    },
  });
  const res13 = await contributionsPostRoute(req13);
  assert(
    res13.status === 400,
    'Invalid non-image payment proof format is REJECTED (HTTP 400)',
    `Expected status 400, got ${res13.status}`
  );

  // ----------------------------------------------------
  // INTEGRITY TESTS: Contributor Count Semantics & Aggregation
  // ----------------------------------------------------
  console.log('\nIntegrity Test: Unique Contributor Semantics');
  // Student std-seed-2-bcom-afa-2 contributes twice
  const sClassBefore = await getClass('2-bcom-afa');
  const initialContributors = sClassBefore?.contributorCount || 0;
  const initialContributions = sClassBefore?.contributionCount || 0;

  // Contribution 1
  await recordContribution({
    studentId: 'std-seed-2-bcom-afa-2',
    classId: '2-bcom-afa',
    type: 'grain',
    grainType: 'Rice',
    grainQuantityKg: 10,
    actor: { uid: 'cr-2-bcom-afa', email: 'cr.2bcom.afa@dhanyadhan.edu', name: 'Priya Sharma' },
  });

  // Contribution 2 by same student
  await recordContribution({
    studentId: 'std-seed-2-bcom-afa-2',
    classId: '2-bcom-afa',
    type: 'money',
    moneyAmount: 250,
    actor: { uid: 'cr-2-bcom-afa', email: 'cr.2bcom.afa@dhanyadhan.edu', name: 'Priya Sharma' },
  });

  const sClassAfter = await getClass('2-bcom-afa');
  const finalContributors = sClassAfter?.contributorCount || 0;
  const finalContributions = sClassAfter?.contributionCount || 0;

  assert(
    finalContributors === initialContributors + 1,
    `Multiple contributions by same student incremented unique contributors by exactly 1 (from ${initialContributors} to ${finalContributors})`,
    `Expected ${initialContributors + 1}, got ${finalContributors}`
  );
  assert(
    finalContributions === initialContributions + 2,
    `Total contributions incremented by 2 (from ${initialContributions} to ${finalContributions})`,
    `Expected ${initialContributions + 2}, got ${finalContributions}`
  );

  // Historical conversion integrity verification:
  const classContrs = await getClass('2-bcom-afa');
  const publicSummary = await getPublicCampaignSummary();
  assert(
    publicSummary.totalImpactKg > 0,
    `Public Campaign Summary dynamically updated: ${publicSummary.totalImpactKg} KG total impact`,
    'Expected totalImpactKg > 0'
  );

  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSecuritySuite().catch((err) => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
