import path from 'path';
import fs from 'fs';

// ISOLATED TEST DATABASE: Running security tests must NEVER mutate or pollute the dev/prod database!
const TEST_DB_FILE = path.join(process.cwd(), '.data', 'test_security_db.json');
process.env.DHANYADHAN_DB_FILE = TEST_DB_FILE;

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
  getFacultyContributions,
} from '../src/lib/firebase/admin';
import { POST as loginRoute } from '../src/app/api/auth/login/route';
import {
  POST as contributionsPostRoute,
  GET as contributionsGetRoute,
  PUT as contributionsPutRoute,
  DELETE as contributionsDeleteRoute,
} from '../src/app/api/contributions/route';
import { GET as studentsGetRoute } from '../src/app/api/students/route';
import { PUT as campaignPutRoute } from '../src/app/api/campaign/route';
import { POST as crUsersPostRoute } from '../src/app/api/admin/cr-users/route';
import { POST as adminSeedPostRoute } from '../src/app/api/admin/seed/route';
import { GET as reportsExportGetRoute } from '../src/app/api/reports/export/route';
import {
  GET as facultyGetRoute,
  POST as facultyPostRoute,
  PUT as facultyPutRoute,
  DELETE as facultyDeleteRoute,
} from '../src/app/api/faculty/route';
import {
  GET as facultyContrGetRoute,
  POST as facultyContrPostRoute,
  DELETE as facultyContrDeleteRoute,
} from '../src/app/api/faculty/contributions/route';
import { AUTH_COOKIE_NAME } from '../src/lib/auth';

function createMockRequest(
  url: string,
  method: string,
  options?: {
    body?: any;
    userUid?: string;
    rawHeaders?: Record<string, string>;
  }
): NextRequest {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (options?.userUid) {
    headers.set('Cookie', `${AUTH_COOKIE_NAME}=${options.userUid}`);
  }
  if (options?.rawHeaders) {
    for (const [k, v] of Object.entries(options.rawHeaders)) {
      headers.set(k, v);
    }
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
  try {
    console.log('\n======================================================');
    console.log('   DHANYADHAN: 25-SCENARIO DEFENSIVE SECURITY SUITE');
    console.log('======================================================\n');

  // Step 0: Ensure fresh isolated DB
  if (fs.existsSync(TEST_DB_FILE)) {
    try {
      fs.unlinkSync(TEST_DB_FILE);
    } catch (e) {}
  }
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
  // TEST 14: Adding and fetching faculty records via /api/faculty
  // ----------------------------------------------------
  console.log('Test 14: Adding and fetching faculty records');
  const req14Add = createMockRequest('http://localhost:3000/api/faculty', 'POST', {
    userUid: 'sdg-admin-1',
    body: {
      name: 'Dr. Ramesh Narayan',
      designation: 'Associate Professor',
      department: 'Department of Commerce',
      employeeId: 'EMP-FAC-999',
      email: 'ramesh.narayan@dhanyadhan.edu',
    },
  });
  const res14Add = await facultyPostRoute(req14Add);
  const data14Add = await res14Add.json();
  const createdFacId = data14Add.faculty?.id;
  assert(
    res14Add.status === 201 && !!createdFacId,
    'SDG Admin can create new faculty member record (HTTP 201)',
    `Expected status 201 and created ID, got ${res14Add.status}`
  );

  const req14Get = createMockRequest('http://localhost:3000/api/faculty', 'GET', {
    userUid: 'faculty-coord-1',
  });
  const res14Get = await facultyGetRoute(req14Get);
  const data14Get = await res14Get.json();
  const foundFaculty = data14Get.faculty?.some((f: any) => f.id === createdFacId);
  assert(
    res14Get.status === 200 && foundFaculty,
    'Faculty Coordinator can fetch full faculty directory (HTTP 200)',
    `Expected status 200 with new faculty, got ${res14Get.status}`
  );

  // ----------------------------------------------------
  // TEST 15: Faculty monetary contribution with mandatory payment proof
  // ----------------------------------------------------
  console.log('Test 15: Mandatory payment screenshot validation for faculty monetary entries');
  const req15NoProof = createMockRequest('http://localhost:3000/api/faculty/contributions', 'POST', {
    userUid: 'faculty-coord-1',
    body: {
      facultyId: createdFacId,
      type: 'money',
      moneyAmount: 500,
      // paymentProofUrl omitted!
    },
  });
  const res15NoProof = await facultyContrPostRoute(req15NoProof);
  const data15NoProof = await res15NoProof.json();
  assert(
    res15NoProof.status === 400 && data15NoProof.error?.includes('mandatory'),
    'Faculty monetary entry without screenshot verification is REJECTED (HTTP 400)',
    `Expected 400 with mandatory message, got ${res15NoProof.status}: ${data15NoProof.error}`
  );

  const req15WithProof = createMockRequest('http://localhost:3000/api/faculty/contributions', 'POST', {
    userUid: 'faculty-coord-1',
    body: {
      facultyId: createdFacId,
      type: 'money',
      moneyAmount: 500,
      paymentProofUrl: mockProof,
    },
  });
  const res15WithProof = await facultyContrPostRoute(req15WithProof);
  const data15WithProof = await res15WithProof.json();
  assert(
    res15WithProof.status === 201 && data15WithProof.contribution?.paymentProofUrl === mockProof,
    'Faculty monetary entry with compressed screenshot is ACCEPTED and PERSISTED (HTTP 201)',
    `Expected 201 with saved payment proof, got ${res15WithProof.status}`
  );

  // ----------------------------------------------------
  // TEST 16: Faculty contributions reflect in Public Campaign Summary
  // ----------------------------------------------------
  console.log('Test 16: Faculty contributions aggregated into PublicCampaignSummary');
  const summaryBefore = await getPublicCampaignSummary();
  const initialFacultyImpact = summaryBefore.facultyTotalEquivalentKg || 0;
  const initialTotalImpact = summaryBefore.totalImpactKg || 0;

  // Log a 50 KG grain donation for faculty member
  const req16Grain = createMockRequest('http://localhost:3000/api/faculty/contributions', 'POST', {
    userUid: 'faculty-coord-1',
    body: {
      facultyId: createdFacId,
      type: 'grain',
      grainQuantityKg: 50,
      notes: 'Test Grain Donation',
    },
  });
  const res16Grain = await facultyContrPostRoute(req16Grain);
  assert(
    res16Grain.status === 201,
    'Faculty grain contribution recorded successfully (HTTP 201)',
    `Expected status 201, got ${res16Grain.status}`
  );

  const summaryAfter = await getPublicCampaignSummary();
  const newFacultyImpact = summaryAfter.facultyTotalEquivalentKg || 0;
  const newTotalImpact = summaryAfter.totalImpactKg || 0;

  assert(
    newFacultyImpact === initialFacultyImpact + 50 && newTotalImpact === initialTotalImpact + 50,
    `Public Campaign Summary reflects faculty impact (+50 KG added to total department campaign)`,
    `Expected faculty impact ${initialFacultyImpact + 50}, got ${newFacultyImpact}; total ${initialTotalImpact + 50}, got ${newTotalImpact}`
  );

  // ----------------------------------------------------
  // TEST 17: Class Admin (CR) cannot access or mutate faculty records (HTTP 403)
  // ----------------------------------------------------
  console.log('Test 17: Class Admin (CR) blocked from faculty control panel endpoints');
  const req17CRPost = createMockRequest('http://localhost:3000/api/faculty', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      name: 'Dr. Unauthorized CR Addition',
      designation: 'Lecturer',
    },
  });
  const res17CRPost = await facultyPostRoute(req17CRPost);
  assert(
    res17CRPost.status === 403,
    'Class Admin (CR) blocked from adding faculty members (HTTP 403 Forbidden)',
    `Expected status 403, got ${res17CRPost.status}`
  );

  const req17CRContr = createMockRequest('http://localhost:3000/api/faculty/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      facultyId: createdFacId,
      type: 'grain',
      grainQuantityKg: 20,
    },
  });
  const res17CRContr = await facultyContrPostRoute(req17CRContr);
  assert(
    res17CRContr.status === 403,
    'Class Admin (CR) blocked from recording faculty contributions (HTTP 403 Forbidden)',
    `Expected status 403, got ${res17CRContr.status}`
  );

  // ----------------------------------------------------
  // TEST 18: Untrusted Header Spoofing (x-user-uid) without cookie -> DENIED (HTTP 401)
  // ----------------------------------------------------
  console.log('Test 18: Untrusted Header Spoofing (x-user-uid) without cookie is REJECTED');
  const req18 = createMockRequest('http://localhost:3000/api/students?classId=1-bcom-a', 'GET', {
    rawHeaders: { 'x-user-uid': 'sdg-admin-1' }, // Spoof attempt without cookie
  });
  const res18 = await studentsGetRoute(req18);
  assert(
    res18.status === 401,
    'Spoofed x-user-uid header without valid session cookie is REJECTED (HTTP 401)',
    `Expected 401, got ${res18.status}`
  );

  // ----------------------------------------------------
  // TEST 19: BOLA / IDOR Cross-Class Contribution Modification -> DENIED (HTTP 403)
  // ----------------------------------------------------
  console.log('Test 19: BOLA / IDOR Cross-Class Contribution Modification');
  const contrClassA = await recordContribution({
    studentId: 'std-seed-1-bcom-a-1',
    classId: '1-bcom-a',
    type: 'grain',
    grainType: 'Rice',
    grainQuantityKg: 15,
    actor: { uid: 'sdg-admin-1', email: 'admin@dhanyadhan.edu', name: 'Admin' },
  });

  // CR of 2-bcom-afa attempts to modify contrClassA:
  const req19 = createMockRequest('http://localhost:3000/api/contributions', 'PUT', {
    userUid: 'cr-2-bcom-afa',
    body: {
      contributionId: contrClassA.id,
      classId: '2-bcom-afa', // passes fake classId
      grainQuantityKg: 50,
    },
  });
  const res19 = await contributionsPutRoute(req19);
  assert(
    res19.status === 403,
    'CR of 2-bcom-afa attempting to edit 1-bcom-a contribution (BOLA/IDOR) is REJECTED (HTTP 403)',
    `Expected 403, got ${res19.status}`
  );

  // ----------------------------------------------------
  // TEST 20: BOLA / IDOR Cross-Class Contribution Deletion -> DENIED (HTTP 403)
  // ----------------------------------------------------
  console.log('Test 20: BOLA / IDOR Cross-Class Contribution Deletion');
  const req20 = createMockRequest(`http://localhost:3000/api/contributions?id=${contrClassA.id}&classId=2-bcom-afa`, 'DELETE', {
    userUid: 'cr-2-bcom-afa',
  });
  const res20 = await contributionsDeleteRoute(req20);
  assert(
    res20.status === 403,
    'CR of 2-bcom-afa attempting to delete 1-bcom-a contribution (BOLA/IDOR) is REJECTED (HTTP 403)',
    `Expected 403, got ${res20.status}`
  );

  // ----------------------------------------------------
  // TEST 21: CR Attempting to Modify or Delete Faculty Contribution -> DENIED (HTTP 403)
  // ----------------------------------------------------
  console.log('Test 21: CR Attempting to Modify or Delete Faculty Contribution via Student Endpoint');
  const facContrs = await getFacultyContributions();
  const facContribId = facContrs[0]?.id;

  const req21Put = createMockRequest('http://localhost:3000/api/contributions', 'PUT', {
    userUid: 'cr-2-bcom-afa',
    body: {
      contributionId: facContribId,
      classId: '2-bcom-afa',
      grainQuantityKg: 10,
    },
  });
  const res21Put = await contributionsPutRoute(req21Put);
  assert(
    res21Put.status === 403,
    'CR attempting to edit Faculty contribution via student endpoint is REJECTED (HTTP 403)',
    `Expected 403, got ${res21Put.status}`
  );

  const req21Del = createMockRequest(`http://localhost:3000/api/contributions?id=${facContribId}&classId=2-bcom-afa`, 'DELETE', {
    userUid: 'cr-2-bcom-afa',
  });
  const res21Del = await contributionsDeleteRoute(req21Del);
  assert(
    res21Del.status === 403,
    'CR attempting to delete Faculty contribution via student endpoint is REJECTED (HTTP 403)',
    `Expected 403, got ${res21Del.status}`
  );

  // ----------------------------------------------------
  // TEST 22: Faculty User Deleting Student Contribution -> DENIED (HTTP 403)
  // ----------------------------------------------------
  console.log('Test 22: Faculty User Deleting Student Contribution');
  const req22 = createMockRequest(`http://localhost:3000/api/faculty/contributions?id=${contrClassA.id}`, 'DELETE', {
    userUid: 'faculty-coord-1',
  });
  const res22 = await facultyContrDeleteRoute(req22);
  assert(
    res22.status === 403,
    'Faculty Coordinator attempting to delete student contribution is REJECTED (HTTP 403)',
    `Expected 403, got ${res22.status}`
  );

  // ----------------------------------------------------
  // TEST 23: Negative Number and Cross-Type Parameter Bleeding Injection -> REJECTED / SANITIZED
  // ----------------------------------------------------
  console.log('Test 23: Negative Number and Cross-Type Parameter Bleeding Injection');
  const req23NegMoney = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      studentId: 'std-seed-2-bcom-afa-1',
      classId: '2-bcom-afa',
      type: 'money',
      moneyAmount: -500,
      paymentProofUrl: mockProof,
    },
  });
  const res23NegMoney = await contributionsPostRoute(req23NegMoney);
  assert(
    res23NegMoney.status === 400,
    'Negative money contribution is REJECTED (HTTP 400)',
    `Expected 400, got ${res23NegMoney.status}`
  );

  const req23CrossBleed = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      studentId: 'std-seed-2-bcom-afa-1',
      classId: '2-bcom-afa',
      type: 'grain',
      grainType: 'Rice',
      grainQuantityKg: 10,
      moneyAmount: -500, // Bleeding negative money into grain type
    },
  });
  const res23CrossBleed = await contributionsPostRoute(req23CrossBleed);
  const data23CrossBleed = await res23CrossBleed.json();
  assert(
    res23CrossBleed.status === 201 && data23CrossBleed.contribution?.moneyAmount === 0,
    'Cross-type negative money in grain donation is zeroed out and sanitized',
    `Expected moneyAmount === 0, got ${data23CrossBleed.contribution?.moneyAmount}`
  );

  // ----------------------------------------------------
  // TEST 24: Unauthenticated Admin Seed Endpoint -> DENIED (HTTP 403)
  // ----------------------------------------------------
  console.log('Test 24: Unauthenticated Admin Seed Endpoint');
  const req24Seed = createMockRequest('http://localhost:3000/api/admin/seed', 'POST', {
    userUid: undefined,
    body: { applyDemoCampaignConfig: true },
  });
  const res24Seed = await adminSeedPostRoute(req24Seed);
  assert(
    res24Seed.status === 403,
    'Unauthenticated admin seed invocation is REJECTED (HTTP 403)',
    `Expected 403, got ${res24Seed.status}`
  );

  // ----------------------------------------------------
  // TEST 25: CSV Formula Injection (CWE-1236) Neutralization
  // ----------------------------------------------------
  console.log('Test 25: CSV Formula Injection (CWE-1236) Neutralization');
  const req25 = createMockRequest('http://localhost:3000/api/contributions', 'POST', {
    userUid: 'cr-2-bcom-afa',
    body: {
      studentId: 'std-seed-2-bcom-afa-1',
      classId: '2-bcom-afa',
      type: 'grain',
      grainType: 'Rice',
      grainQuantityKg: 5,
      notes: '=cmd|\'/C calc\'!A0',
    },
  });
  await contributionsPostRoute(req25);

  const req25Export = createMockRequest('http://localhost:3000/api/reports/export?type=contribution&classId=2-bcom-afa', 'GET', {
    userUid: 'cr-2-bcom-afa',
  });
  const res25Export = await reportsExportGetRoute(req25Export);
  const csvText = await res25Export.text();
  assert(
    csvText.includes(`"'=cmd|'/C calc'!A0"`),
    'Spreadsheet formula trigger prefix is neutralized with leading quote in CSV export',
    'Expected formula character to be escaped with single quote'
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
  } finally {
    if (fs.existsSync(TEST_DB_FILE)) {
      try {
        fs.unlinkSync(TEST_DB_FILE);
      } catch (e) {
        // ignore
      }
    }
  }
}

runSecuritySuite().catch((err) => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
