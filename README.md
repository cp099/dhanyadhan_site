# DHANYADHAN (धान्यधन)
### Department of Commerce • SDG Cell Social-Impact Campaign Platform

Dhanyadhan is an institutional web application uniting approximately 1,360 students across all 17 Commerce classes alongside Department Faculty to contribute food grains and monetary resources towards a common departmental impact target, aligning directly with **SDG 2 (Zero Hunger)** and **SDG 12 (Responsible Consumption)**.

---

## 🌾 Core Architectural & Security Principles

1. **One Department • One Combined 17-Class & Faculty Campaign**:
   - All 17 classes compete in a single unified leaderboard ranked strictly by **Equivalent Impact KG**.
   - Department Faculty are integrated via a dedicated Faculty Control Panel, aggregating their contributions directly into the central departmental impact metrics without distorting student cohort competitions.

2. **Strict Student & Donor Privacy Guarantee (Zero-Knowledge Public Views)**:
   - Individual student financial donations, grain weights, and transaction histories are **strictly confidential**.
   - Public class pages display **Student Names and Ranks ONLY**.
   - Private amounts are never exposed over public APIs or client-side listeners.

3. **Mandatory Payment Proof & Format Verification**:
   - Monetary donations require verified transaction receipts compressed as Base64 data URIs (`image/png`, `image/jpeg`, `image/webp`).
   - Raw HTTP/HTTPS URLs are strictly rejected to eliminate Server-Side Request Forgery (SSRF).
   - SVG uploads are blocked to eliminate Stored Cross-Site Scripting (XSS) vectors.

4. **Broken Object-Level Authorization (BOLA / IDOR) Defense**:
   - Class Representatives are locked to their assigned `classId`.
   - On updates (`PUT`) and deletions (`DELETE`), the backend queries the authoritative stored record to verify the resource's true origin class before proceeding.
   - Cross-domain barriers ensure Student endpoints cannot touch Faculty records and vice versa.

5. **Trusted Server-Side Calculation & Atomic Aggregation**:
   - Equivalent KG conversions are executed server-side via trusted rules. Tampered client values are discarded and recalculated.
   - Cascading updates (**Contributor $\to$ Class/Faculty $\to$ Department $\to$ Leaderboards**) execute atomically on creation, modification, and deletion.

6. **Untrusted Header Spoofing Mitigation**:
   - Untrusted identity headers (e.g. `x-user-uid`) are strictly prohibited in staging and production environments.
   - All session authentication is derived from verified, tamper-proof session cookies.

7. **CSV Formula Injection (CWE-1236) Neutralization**:
   - Tabular exports escape formula execution characters (`=`, `+`, `-`, `@`, tab, carriage return) by prepending single quotes (`'`).
   - Download headers enforce RFC 5987 / RFC 6266 sanitized file nomenclature.

8. **Strict Numeric Boundary Checking & Parameter Sanitization**:
   - All numeric inputs are validated as finite, positive numbers (`val > 0` and `Number.isFinite(val)`).
   - Cross-type parameter bleeding is neutralized (e.g. grain fields are zeroed out on pure monetary donations).

9. **Historical Conversion Integrity**:
   - Every contribution transaction records `conversionVersion`, `moneyToKgRateUsed`, and `grainConversionFactorUsed` to ensure historical records remain immutable when future campaign parameters change.

---

## 🏛️ The 17 Commerce Classes

| Year | Classes |
| :--- | :--- |
| **Year 1** | 1 BCom A, 1 BCom B, 1 BCom AFA, 1 BCom A&T, 1 BCom F&I |
| **Year 2** | 2 BCom A, 2 BCom B, 2 BCom AFA, 2 BCom A&T, 2 BCom F&I |
| **Year 3** | 3 BCom A, 3 BCom B, 3 BCom AFA, 3 BCom A&T, 3 BCom F&I |
| **Masters** | M.Com 1, M.Com 2 |

---

## 💻 Tech Stack

- **Framework**: Next.js 16+ (App Router with Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with an institutional Forest & Emerald green theme (`#0a241b`, `#155e42`, `#22c55e`, `#fbfaf7`)
- **Icons & Effects**: Lucide React
- **Data & Security**: Cloud Firestore, Firebase Auth, Firebase Admin SDK, Firebase Security Rules (`firestore.rules`)
- **CSV Engine**: PapaParse for high-performance client & server CSV streaming
- **Test Runner**: Node.js & tsx for automated security testing against isolated mock environments

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Production Build
```bash
npm run build
npm start
```

### 4. Run Automated Security & Integrity Suite
Execute the 25 automated security scenarios (35 strict assertions):
```bash
npm run test:security
```

---

## 🛡️ Security Suite Verification (25 Scenarios • 35 Assertions)

All 25 security scenarios are verified on every continuous integration run against an isolated test database:

| # | Security Scenario | Threat / Vulnerability Vector | Expected Outcome | Verification Status |
|---|---|---|---|:---:|
| 1 | CR A reading Class B students | Horizontal Privilege Escalation | **DENIED (HTTP 403)** | ✓ PASS |
| 2 | CR A creating Class B contribution | BOLA / Unauthorized Record Creation | **DENIED (HTTP 403)** | ✓ PASS |
| 3 | CR A modifying own classId | Privilege Elevation / Class Tampering | **DENIED (HTTP 403)** | ✓ PASS |
| 4 | CR A accessing Class B route/data | Unauthorized Class Data Retrieval | **DENIED (HTTP 403)** | ✓ PASS |
| 5 | Unauthenticated contribution write | Broken Authentication | **DENIED (HTTP 401)** | ✓ PASS |
| 6 | Public raw contribution access | Sensitive Data Exposure | **DENIED (HTTP 401)** | ✓ PASS |
| 7 | Public private student totals | Privacy Leak / Information Disclosure | **DENIED (HTTP 401)** | ✓ PASS |
| 8 | Tampered Equivalent KG submission | Parameter Tampering (e.g. 9999 KG) | **RECALCULATED BY SERVER** | ✓ PASS |
| 9 | CR modifying campaign configuration | Central Governance Privilege Bypass | **DENIED (HTTP 403)** | ✓ PASS |
| 10 | SDG Admin accessing all 17 classes | Superadmin Role Verification | **ALLOWED (HTTP 200)** | ✓ PASS |
| 11 | Monetary donation without receipt | Proof-of-Payment Bypass | **DENIED (HTTP 400)** | ✓ PASS |
| 12 | Monetary donation with valid proof | Legitimate Transaction Verification | **ALLOWED (HTTP 200)** | ✓ PASS |
| 13 | Monetary donation with non-image proof | Stored XSS / Malicious File Upload | **DENIED (HTTP 400)** | ✓ PASS |
| 14 | Adding & fetching faculty records | Faculty Directory Management | **ALLOWED (HTTP 200)** | ✓ PASS |
| 15 | Faculty monetary entry without receipt | Proof-of-Payment Bypass | **DENIED (HTTP 400)** | ✓ PASS |
| 16 | Faculty totals roll up to central portal | Aggregation Completeness Verification | **VERIFIED IN SUMMARY** | ✓ PASS |
| 17 | CR accessing faculty endpoints | Vertical Privilege Escalation | **DENIED (HTTP 403)** | ✓ PASS |
| 18 | Untrusted Header Spoofing (`x-user-uid`) | Header Injection / Identity Impersonation | **DENIED (HTTP 401)** | ✓ PASS |
| 19 | BOLA / IDOR Cross-Class Edit | Cross-Tenant Object Modification | **DENIED (HTTP 403)** | ✓ PASS |
| 20 | BOLA / IDOR Cross-Class Deletion | Cross-Tenant Object Deletion | **DENIED (HTTP 403)** | ✓ PASS |
| 21 | CR modifying faculty record via student API | Domain Crossing / Parameter Tampering | **DENIED (HTTP 400/403)** | ✓ PASS |
| 22 | Faculty deleting student record | Cross-Role Authorization Bypass | **DENIED (HTTP 403)** | ✓ PASS |
| 23 | Negative amount & cross-parameter bleed | Accounting Manipulation / State Poisoning | **DENIED / SANITIZED** | ✓ PASS |
| 24 | Unauthenticated Admin Seed invocation | Administrative Backdoor Access | **DENIED (HTTP 401)** | ✓ PASS |
| 25 | CSV Formula Injection (CWE-1236) | Spreadsheet Command Execution (`=cmd`) | **SANITIZED WITH LEADING `'`** | ✓ PASS |

---

## 📡 REST API Reference

### Public Endpoints (Unauthenticated)
- `GET /api/campaign/summary`: Sanitized aggregate impact totals, campaign status, and milestone progression.
- `GET /api/leaderboard`: Unified 17-class standings ranked by Equivalent Impact KG.
- `GET /api/leaderboard/[classId]`: Public cohort metrics and zero-knowledge student ranking (Rank & Name ONLY).

### Authenticated Endpoints
- `POST /api/auth/login`: Issues signed HTTP-only authentication session cookies.
- `GET /api/auth/session`: Returns current authenticated identity profile and authorized role.
- `POST /api/auth/logout`: Clears the session cookie.
- `GET|POST|PUT|DELETE /api/contributions`: Class Representative portal for student contribution logging.
- `GET|POST /api/students`: Roster management scoped to the assigned class cohort.
- `POST /api/students/import`: Bulk student roster upload with safe string sanitization (capped at 1,000 entries).
- `GET|POST|PUT|DELETE /api/faculty`: Faculty roster registry management.
- `GET|POST|DELETE /api/faculty/contributions`: Faculty member donation logging with mandatory receipt validation.
- `GET /api/reports/export`: CSV export engine with CWE-1236 spreadsheet formula neutralization.
- `POST /api/admin/cr-users`: SDG Admin provisioning of Class Representative credentials.
- `POST /api/admin/seed`: Departmental seed runner strictly gated by `sdg_admin` privileges.

---

## 📂 Project Structure

```
├── firestore.rules               # Cloud Firestore security rules
├── scripts/
│   └── test-security.ts          # Automated 25-scenario security test suite
├── src/
│   ├── app/
│   │   ├── (public)/             # Public portal: Homepage, Class pages, About page
│   │   ├── cr/                   # Class Representative isolated console
│   │   ├── admin/                # SDG Cell master administration console
│   │   ├── faculty/              # Department Faculty management console
│   │   ├── login/                # Institutional authentication portal
│   │   └── api/                  # Trusted server endpoints, validations & CSV engine
│   ├── components/
│   │   ├── ui/                   # Navbar, Footer, UI primitives
│   │   └── public/               # Hero, ProgressSection, Leaderboard, Podium
│   └── lib/
│       ├── auth.ts               # Session verification & role guards
│       ├── calculations.ts       # Equivalent KG calculation & deterministic tie-breaking
│       ├── constants.ts          # 17 official classes metadata & presets
│       ├── types.ts              # Full TypeScript institutional schema
│       └── firebase/             # Client & Admin SDK operations
```

---

## 🌐 Deploying to Production

1. Push code to the institutional repository:
   ```bash
   git add .
   git commit -m "feat: complete Dhanyadhan campaign platform"
   git push -u origin main
   ```
2. Link the repository on [Vercel](https://vercel.com).
3. Set production environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string for Firebase Admin SDK)
4. Deploy and verify with `npm run test:security`.

