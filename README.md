# DHANYADHAN (धान्यधन)
### Department of Commerce • SDG Cell Social-Impact Campaign Platform

Dhanyadhan is an institutional web application uniting approximately 1,360 students across all 17 Commerce classes to contribute food grains and monetary resources towards a common departmental impact target, aligning directly with **SDG 2 (Zero Hunger)** and **SDG 12 (Responsible Consumption)**.

---

## 🌾 Core Architectural Principles

1. **One Department • One Combined 17-Class Competition**:
   - All 17 classes compete in a single unified leaderboard ranked strictly by **Equivalent Impact KG**.
   - No segregated year-wise, program-wise, or UG vs PG competitions.

2. **Strict Public Privacy Guarantee**:
   - Individual student financial donations, grain weights, and transaction histories are **strictly confidential**.
   - Public class pages display **Student Names and Ranks ONLY**.
   - Private numbers are never exposed over public APIs or client-side listeners.

3. **Trusted Server-Side Calculation & Atomic Aggregation**:
   - Equivalent KG conversions are executed server-side via trusted rules. Tampered client values are discarded.
   - Cascading updates (**Student $\to$ Class $\to$ Department $\to$ Leaderboards**) update atomically on creation, edit, or deletion.

4. **Zero Assumed Values in Production**:
   - Campaign targets, money-to-KG rates, grain multipliers, milestones, and branding are dynamically configured in the SDG Admin Console.
   - The platform displays an unconfigured indicator banner until official parameters are finalized by the SDG Cell.

5. **Historical Conversion Integrity**:
   - Every contribution transaction records the `conversionVersion`, `moneyToKgRateUsed`, and `grainConversionFactorUsed` to ensure historical records remain immutable when future campaign rules change.

6. **No Verification Status System**:
   - Class Representatives are the authorized personnel logging student contributions. There are no `pending` or `flagged` approval queues; records directly update live aggregates upon submission.

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

### 4. Run Automated Security Test Suite
Execute the 10 mandatory security boundary tests and data-integrity verifications:
```bash
npm run test:security
```

---

## 🛡️ Security Suite Verification (10 Scenarios)

| # | Test Scenario | Expected Outcome | Result |
|---|---|---|---|
| 1 | CR A reading Class B students | **DENIED (HTTP 403)** | ✓ PASS |
| 2 | CR A creating Class B contribution | **DENIED (HTTP 403)** | ✓ PASS |
| 3 | CR A modifying own classId | **DENIED (HTTP 403)** | ✓ PASS |
| 4 | CR A accessing Class B route/data | **DENIED (HTTP 403)** | ✓ PASS |
| 5 | Unauthenticated contribution write | **DENIED (HTTP 401)** | ✓ PASS |
| 6 | Public raw contribution access | **DENIED (HTTP 401)** | ✓ PASS |
| 7 | Public private student totals | **DENIED (HTTP 401)** | ✓ PASS |
| 8 | Tampered Equivalent KG (e.g. 9999) | **RECALCULATED BY SERVER** | ✓ PASS |
| 9 | CR modifying campaign configuration | **DENIED (HTTP 403)** | ✓ PASS |
| 10| SDG Admin accessing all 17 classes | **ALLOWED (HTTP 200)** | ✓ PASS |

---

## 📂 Project Structure

```
├── firestore.rules               # Cloud Firestore security rules
├── scripts/
│   └── test-security.ts          # Automated 10-point security test suite
├── src/
│   ├── app/
│   │   ├── (public)/             # Homepage, Class pages, About page
│   │   ├── cr/                   # Class Representative isolated console
│   │   ├── admin/                # SDG Cell master administration console
│   │   ├── login/                # Authentication portal with quick roles
│   │   └── api/                  # Trusted server endpoints & CSV exports
│   ├── components/
│   │   ├── ui/                   # Navbar, Footer, UI primitives
│   │   └── public/               # Hero, ProgressSection, Leaderboard, Podium
│   └── lib/
│       ├── calculations.ts       # Equivalent KG calculation & deterministic tie-breaking
│       ├── constants.ts          # 17 official classes metadata & presets
│       ├── types.ts              # Full TypeScript schema
│       └── firebase/             # Client & Admin SDK operations
```

---

## 🌐 Deploying to Vercel

1. Push code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete Dhanyadhan campaign platform"
   git push -u origin main
   ```
2. Link the repository on [Vercel](https://vercel.com).
3. Add production environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string for Firebase Admin SDK)
4. Deploy!
