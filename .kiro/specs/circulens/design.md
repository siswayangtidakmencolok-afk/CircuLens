# Design Document — CircuLens

## Overview

CircuLens is a browser-only, AI-powered decision-support application for chili lifecycle intelligence. It combines local computer vision inference (ONNX.js / OpenVINO JS / WebAssembly) with contextual data fusion and a rule-based Decision Engine to surface actionable, explainable recommendations across the full chili value chain — from field plant monitoring to post-harvest distribution.

The application is a React + TypeScript single-page application (SPA). There is no application server or Python backend. All AI inference runs client-side. Data persistence is handled by Supabase (preferred) or Firebase, accessed directly from the browser via their respective JavaScript SDKs.

The system is organized around four modules (A, B, C, D) and three user roles (Farmer, Collector/Aggregator, Distributor). An entry-point Role Selector gates access and configures role-aware navigation throughout the session.

---

## Architecture

### Layered Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     React UI Layer                         │
│  RoleSelector  │  ModuleA  │  ModuleB  │  ModuleC/D        │
├───────────────────────────────────────────────────────────┤
│                Application Services Layer                  │
│  InferenceService  │  DecisionEngine  │  ContextFusion     │
├───────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                      │
│  ModelLoader (ONNX/OpenVINO)  │  StorageService (Supabase) │
└───────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **No backend server.** All computation — including AI inference — runs entirely in the browser. The Supabase JavaScript client communicates directly with Supabase's hosted REST/Realtime APIs.

2. **Inference isolation.** The `InferenceService` is a single abstraction boundary between UI and ML runtime. It can wrap ONNX.js, OpenVINO JS, or a WASM-compiled model interchangeably. UI components never call ML runtime APIs directly.

3. **Decision Engine is pure logic.** The Decision Engine has no side effects. It accepts typed input and returns typed output deterministically. This makes it fully unit- and property-testable.

4. **Context fusion is additive.** Visual analysis produces a base risk estimate. Context data (time since harvest, storage duration, temperature, metadata) is fused as a post-processing step that can only maintain or increase (never decrease below visual baseline) the inferred risk level without context.

5. **Role-aware routing.** Role state is held in React context. Navigation and module access are derived from role at render time — no separate permission store is needed at prototype scale.

---

## Component Structure

```
src/
├── main.tsx                        # React entry point
├── App.tsx                         # Root: RoleProvider + Router
│
├── context/
│   └── RoleContext.tsx             # Role state, role-aware module access map
│
├── components/
│   ├── RoleSelector/
│   │   └── RoleSelector.tsx        # Entry-point role selection screen
│   ├── shared/
│   │   ├── PrototypeAIBadge.tsx    # Persistent "Prototype AI" label
│   │   ├── ExplainabilityPanel.tsx # "Why?" rationale display
│   │   ├── LoadingIndicator.tsx    # Inference-in-progress spinner
│   │   ├── RiskBadge.tsx           # LOW / MODERATE / HIGH with severity styling
│   │   └── DisclaimerModal.tsx     # One-time onboarding disclaimer
│   │
│   ├── ModuleA/
│   │   ├── PlantMonitor.tsx        # Image capture/upload + trigger analysis
│   │   └── PlantResultPanel.tsx    # Visual Health Status + result fields
│   │
│   ├── ModuleB/
│   │   ├── GrowthTimeline.tsx      # Chronological observation history
│   │   ├── MonitoringTrendCard.tsx # Trend derivation + display
│   │   └── HarvestReadinessCard.tsx# Qualitative readiness indicator
│   │
│   ├── ModuleC/
│   │   ├── BatchAssessment.tsx     # Image upload + context data form
│   │   └── BatchResultPanel.tsx    # Batch ID + full result display
│   │
│   └── ModuleD/
│       └── DecisionPanel.tsx       # Priority + Recommended Action + Explainability
│
├── services/
│   ├── inferenceService.ts         # Abstraction over ONNX/OpenVINO/WASM runtime
│   ├── modelLoader.ts              # Model weight loading + browser cache management
│   ├── decisionEngine.ts           # Condition → Risk → Priority → Action pipeline
│   ├── contextFusion.ts            # Visual result + context data fusion
│   └── storageService.ts           # Supabase/Firebase CRUD + error handling
│
├── hooks/
│   ├── useInference.ts             # Loading state, error, result for inference calls
│   ├── useObservations.ts          # Module A/B observation CRUD + subscription
│   └── useBatchAssessments.ts      # Module C batch record CRUD + subscription
│
├── types/
│   └── index.ts                    # All shared TypeScript types and enums
│
└── utils/
    ├── trendAnalysis.ts            # Monitoring trend derivation from status sequences
    └── batchId.ts                  # Batch ID generation utility
```

---

## Data Models

All types are defined in `src/types/index.ts`.

### Core Enums

```typescript
export type UserRole = 'farmer' | 'collector' | 'distributor';

export type DeteriorationRisk = 'LOW' | 'MODERATE' | 'HIGH';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type MonitoringTrend = 'improving' | 'stable' | 'declining';

export type HarvestReadiness = 'Not Ready' | 'Approaching Readiness' | 'Visually Ready';

export type VisualHealthStatus =
  | 'Healthy'
  | 'Minor Stress'
  | 'Moderate Stress'
  | 'Severe Stress'
  | 'Unknown';
```

### Module A — Plant Observation

```typescript
export interface PlantObservation {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: string;              // ISO 8601
  imageRef: string;               // local blob URL or storage path reference (not raw image)
  visualHealthStatus: VisualHealthStatus;
  visibleRiskIndicator: number;   // 0.0–1.0 normalised score
  possibleAbnormality: string;    // free-text description or "None detected"
  confidenceIndicator: 'Low' | 'Medium' | 'High';
  monitoringTrend: MonitoringTrend;
}
```

### Module B — Monitoring Session

```typescript
export interface MonitoringSession {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  observations: PlantObservation[];
  trend: MonitoringTrend;
  maturityProgressionLog: MaturityEntry[];
  harvestReadiness: HarvestReadiness;
}

export interface MaturityEntry {
  observationId: string;
  timestamp: string;
  growthStage: string;  // e.g. "Flowering", "Green Fruit", "Colour Break", "Mature"
}
```

### Module C — Batch Assessment

```typescript
export interface BatchAssessment {
  id: string;              // Batch ID (UUID-based)
  userId: string;
  createdAt: string;
  imageRef: string;
  contextData: ContextData | null;
  visualCondition: VisualCondition;
  deteriorationRisk: DeteriorationRisk;
  priority: Priority;
  recommendedAction: RecommendedAction;
}

export interface ContextData {
  timeSinceHarvestHours: number | null;
  storageDurationHours: number | null;
  estimatedStorageTempCelsius: number | null;
  userMetadata: string;           // free-text batch notes
}

export interface VisualCondition {
  colorUniformity: 'High' | 'Medium' | 'Low';
  visibleDamage: boolean;
  surfaceDiscoloration: boolean;
  surfaceAbnormalities: boolean;
  apparentDeterioration: 'None' | 'Mild' | 'Moderate' | 'Severe';
  apparentFreshness: 'Fresh' | 'Borderline' | 'Degraded';
  rawScore: number;               // 0.0–1.0 deterioration proxy score from inference
}
```

### Module D — Decision Engine Output

```typescript
export interface RecommendedAction {
  priority: Priority;
  action: string;                 // human-readable directive
  explainability: ExplainabilityRecord;
}

export interface ExplainabilityRecord {
  rationale: string;              // "Why?" narrative
  visualSignalsUsed: string[];    // list of visual features that drove the decision
  contextInputsUsed: string[];    // list of context fields used (empty if none)
  riskBasis: DeteriorationRisk;
}
```

### Inference Engine

```typescript
export interface InferenceResult {
  module: 'A' | 'C';
  rawOutput: Record<string, number>;  // model output tensor as named map
  processingTimeMs: number;
}

export interface InferenceError {
  code: 'IMAGE_UNPROCESSABLE' | 'MODEL_NOT_LOADED' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}
```

---

## Services

### InferenceService (`inferenceService.ts`)

The single entry point for all AI inference. Abstracts the underlying runtime (ONNX.js, OpenVINO JS, or WASM).

```typescript
interface InferenceService {
  /**
   * Run inference on an image File object.
   * Returns a normalized InferenceResult or throws InferenceError.
   * All processing stays within the browser — no network calls are made.
   */
  analyze(imageFile: File, module: 'A' | 'C'): Promise<InferenceResult>;

  /** Returns true if the model for the given module is loaded and ready. */
  isReady(module: 'A' | 'C'): boolean;
}
```

**OpenVINO JS Integration Note:** When OpenVINO JS is available in the browser (via the `@openvino/node` WASM distribution or direct browser bundle), `InferenceService` will prefer it over ONNX.js for optimized local execution with lower latency. The abstraction layer ensures the UI is unaffected by which runtime is active.

### ModelLoader (`modelLoader.ts`)

Handles model weight fetching and browser-side caching using the Cache API.

```typescript
interface ModelLoader {
  /** Load model weights for a module. Uses Cache API to avoid re-download. */
  load(module: 'A' | 'C'): Promise<void>;
  /** Returns load status for each module. */
  getStatus(): Record<'A' | 'C', 'loading' | 'ready' | 'error'>;
}
```

**Caching strategy:** Model files are fetched once per browser origin and stored in `caches.open('circulens-models-v1')`. On subsequent page loads, model bytes are read from cache rather than re-fetched. If the cache entry is absent or corrupt, the loader re-fetches and re-stores.

### DecisionEngine (`decisionEngine.ts`)

A pure function pipeline. No side effects.

```typescript
function deriveDecision(
  visualCondition: VisualCondition,
  contextData: ContextData | null,
  role: UserRole
): RecommendedAction
```

**Pipeline logic:**

1. **Base risk** is derived from `VisualCondition.rawScore` and `apparentDeterioration`:
   - `rawScore >= 0.7` or `Severe` deterioration → HIGH
   - `rawScore >= 0.4` or `Moderate` deterioration → MODERATE
   - Otherwise → LOW

2. **Context escalation** (additive only — never reduces risk below visual baseline):
   - `timeSinceHarvestHours > 72` → escalate one level
   - `storageDurationHours > 48` → escalate one level
   - `estimatedStorageTempCelsius > 30` → escalate one level
   - Combined escalations are capped at HIGH

3. **Priority mapping:**
   - HIGH risk → Priority: HIGH
   - MODERATE risk → Priority: MEDIUM
   - LOW risk → Priority: LOW

4. **Action selection** is role- and risk-aware:
   - Farmer + any risk → plant-level action (inspect, treat, schedule harvest)
   - Collector/Distributor + HIGH → immediate distribution or cold-chain action
   - Collector/Distributor + MODERATE → monitor, recheck within 24h
   - Collector/Distributor + LOW → standard handling, record confirmed

5. **Explainability record** is built alongside decision, referencing which visual signals and context inputs contributed.

### ContextFusion (`contextFusion.ts`)

A helper called by `decisionEngine.ts` to normalize and apply context data escalation logic:

```typescript
function fuseContext(
  baseRisk: DeteriorationRisk,
  contextData: ContextData | null
): { finalRisk: DeteriorationRisk; contextInputsUsed: string[] }
```

### StorageService (`storageService.ts`)

Wraps Supabase (or Firebase) client calls. All calls include user account scoping.

```typescript
interface StorageService {
  saveObservation(obs: PlantObservation): Promise<void>;
  getObservations(userId: string, sessionId: string): Promise<PlantObservation[]>;
  saveBatchAssessment(batch: BatchAssessment): Promise<void>;
  getBatchAssessments(userId: string): Promise<BatchAssessment[]>;
  saveMonitoringSession(session: MonitoringSession): Promise<void>;
  getMonitoringSessions(userId: string): Promise<MonitoringSession[]>;
}
```

On write failure, the service throws a typed `StorageError` that the calling hook catches to surface a user-facing notification with retry option.

---

## Interfaces and State Management

### RoleContext

```typescript
interface RoleContextValue {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  allowedModules: ModuleKey[];  // derived from role
}
```

`allowedModules` is derived deterministically from `role`:
- `farmer` → `['A', 'B']`
- `collector` → `['C', 'D']`
- `distributor` → `['C', 'D']`

Role is stored in `sessionStorage` (not `localStorage`) so role selection persists across page refreshes within the same session, but clears on browser close. Persisted data (observations, batches) is never deleted on role change.

### useInference Hook

```typescript
interface UseInferenceReturn {
  analyze: (file: File, module: 'A' | 'C') => Promise<void>;
  result: InferenceResult | null;
  error: InferenceError | null;
  isLoading: boolean;
}
```

Manages the full lifecycle: loading state, error state, and result delivery. Components use this hook; they never call `InferenceService` directly.

### useObservations and useBatchAssessments Hooks

Both follow the same pattern:

```typescript
interface UseObservationsReturn {
  observations: PlantObservation[];
  save: (obs: PlantObservation) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
  retrySave: () => void;
}
```

---

## Module A — Plant Monitoring Flow

1. Farmer navigates to Module A.
2. `PlantMonitor` renders an image capture/upload control.
3. On image submission:
   a. `useInference.analyze(file, 'A')` is called.
   b. `LoadingIndicator` renders while `isLoading === true`.
   c. On success, `PlantResultPanel` renders with all five result fields + `PrototypeAIBadge`.
   d. On error, a descriptive error message and resubmit prompt render.
4. Farmer optionally saves the observation. `useObservations.save()` persists to Supabase.
5. `DecisionEngine.deriveDecision()` is called with `VisualCondition` and `role = 'farmer'` to produce plant-level action.
6. `ExplainabilityPanel` renders the "Why?" rationale.

---

## Module B — Growth and Harvest Monitoring Flow

1. Farmer navigates to Module B.
2. `useObservations` loads saved observations for the current session.
3. `GrowthTimeline` renders all observations in chronological order.
4. `MonitoringTrendCard` calls `trendAnalysis.deriveTrend(observations)` and displays the result.
5. `HarvestReadinessCard` displays a `HarvestReadiness` value derived from the most recent growth stage — never a predicted date.
6. All outputs are labeled `PrototypeAIBadge`.

### Trend Derivation Algorithm (`trendAnalysis.ts`)

```typescript
function deriveTrend(observations: PlantObservation[]): MonitoringTrend {
  // Map VisualHealthStatus to numeric scores
  const scoreMap: Record<VisualHealthStatus, number> = {
    'Healthy': 4, 'Minor Stress': 3, 'Moderate Stress': 2, 'Severe Stress': 1, 'Unknown': 0
  };
  const scores = observations
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(o => scoreMap[o.visualHealthStatus]);
  
  if (scores.length < 2) return 'stable';
  const delta = scores[scores.length - 1] - scores[0];
  if (delta > 0) return 'improving';
  if (delta < 0) return 'declining';
  return 'stable';
}
```

---

## Module C — Post-Harvest Batch Assessment Flow

1. Collector/Aggregator or Distributor navigates to Module C.
2. `BatchAssessment` renders:
   - Image upload control
   - Optional `ContextData` form (time since harvest, storage duration, temperature, notes)
3. On submission:
   a. `useInference.analyze(file, 'C')` runs browser-local inference.
   b. Raw inference output is mapped to `VisualCondition`.
   c. `DecisionEngine.deriveDecision(visualCondition, contextData, role)` produces `RecommendedAction`.
   d. A `BatchAssessment` record is constructed with a generated Batch ID.
4. `BatchResultPanel` renders Batch ID, Visual Condition, Risk, Priority, Action, and `ExplainabilityPanel`.
5. `useBatchAssessments.save()` persists the record.

---

## Module D — Decision Engine UI

`DecisionPanel` is the UI counterpart to the `decisionEngine.ts` service. It renders:
- Priority badge (with severity-matched CSS class: `priority--high`, `priority--medium`, `priority--low`)
- Recommended Action text
- `ExplainabilityPanel` with visual signals list, context inputs list, and risk basis
- Disclaimer: "CircuLens recommends. You decide."
- `PrototypeAIBadge`

---

## Error Handling

| Scenario | Handling |
|---|---|
| Image unprocessable (too dark, no chili detected) | `InferenceError.code = 'IMAGE_UNPROCESSABLE'` → descriptive message + resubmit prompt |
| Model assets fail to load | `InferenceError.code = 'MODEL_NOT_LOADED'` → user-visible error, AI analysis marked unavailable |
| Inference timeout (> 30 s) | `InferenceError.code = 'TIMEOUT'` → timeout message + retry option |
| Cloud write failure | `StorageError` → toast notification "Record not saved" + retry button |
| Cloud read failure | Stale cached data shown with warning banner |
| Role change | No data loss; `allowedModules` re-derived from new role |

---

## Prototype AI Labeling Strategy

Every AI-generated output surface must render `<PrototypeAIBadge />`. This is enforced by:
- `PlantResultPanel` — renders badge when `result !== null`
- `BatchResultPanel` — renders badge when `result !== null`
- `MonitoringTrendCard` — always renders badge
- `HarvestReadinessCard` — always renders badge
- `DecisionPanel` — always renders badge

The badge renders as a small pill: `Prototype AI ⚗️` with a muted warning color.

The one-time onboarding disclaimer is shown by `DisclaimerModal` on first render if `localStorage.getItem('circulens-disclaimer-acknowledged')` is absent. On acknowledgement, the key is set.

---

## Responsive Design and UI Standards

- Breakpoints: 375px (mobile), 768px (tablet), 1440px (desktop).
- CSS approach: Tailwind CSS utility classes (consistent with React + TypeScript stack).
- Color palette: earthy greens (healthy), amber (moderate risk), deep red (high risk), neutral off-white backgrounds — reflecting agricultural professionalism.
- Typography hierarchy:
  - Risk level uses `text-2xl font-bold` with role-specific color classes.
  - Recommended Action uses `text-lg font-medium`.
  - Explainability rationale uses `text-sm text-muted`.
- Loading indicator: full-width progress bar + spinner with "Analyzing..." label during inference.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property Reflection:** After completing the prework analysis, the following redundancies and consolidations were applied:
- Properties 2.3, 3.6, 4.8, and 9.1 all test "Prototype AI" labeling — consolidated into a single universal labeling property (Property 3).
- Properties 5.5, 5.6, 5.7 all test the risk-to-priority mapping for specific risk levels — consolidated into a single exhaustive property (Property 8) that covers all three levels.
- Properties 3.2 and 3.4 both test chronological/sequential ordering of stored collections — consolidated into a single ordering property (Property 5).
- Properties 7.1 and 3.1 / 4.5 both test persistence round-trips — consolidated into a single persistence property (Property 10).

---

### Property 1: Role-Aware Module Access

*For any* selected user role, all navigation items and modules rendered in the application must belong to the permitted module set for that role, and no module outside that set must be accessible.

**Validates: Requirements 1.2**

---

### Property 2: Role Change Does Not Destroy Persisted Data

*For any* persisted observation record or batch assessment record, switching the user's selected role — including switching away from and back to the original role — must leave the record unchanged and retrievable.

**Validates: Requirements 1.6**

---

### Property 3: Prototype AI Badge Presence on All AI Outputs

*For any* React component that renders an AI-generated assessment, trend, readiness indicator, or recommendation (in Module A, B, C, or D), the rendered DOM must contain a "Prototype AI" label element.

**Validates: Requirements 2.3, 3.6, 4.8, 9.1**

---

### Property 4: Module A Result Completeness

*For any* valid `InferenceResult` produced by Module A, the rendered `PlantResultPanel` must display all five required fields: Visual Health Status, Visible Risk Indicator, Possible Abnormality, Confidence indicator, and Monitoring Trend.

**Validates: Requirements 2.2**

---

### Property 5: Chronological Ordering of Stored Collections

*For any* collection of plant observations or maturity entries retrieved from storage with distinct timestamps, the rendered display order must be consistent with chronological sequence (earliest first or consistently latest first).

**Validates: Requirements 3.2, 3.4**

---

### Property 6: Monitoring Trend Consistency with Status Sequence

*For any* non-empty sequence of `PlantObservation` records with distinct `VisualHealthStatus` values, `deriveTrend` must return `improving` when the final numeric score exceeds the initial score, `declining` when it is less, and `stable` when they are equal.

**Validates: Requirements 3.3**

---

### Property 7: Harvest Readiness Indicator is Qualitative-Only

*For any* generated `HarvestReadiness` value, the rendered display must be one of the three allowed qualitative strings (`Not Ready`, `Approaching Readiness`, `Visually Ready`) and must not contain any date pattern (e.g., a string matching `\d{1,2}[\/\-\.]\d{1,2}` or ISO date format).

**Validates: Requirements 3.5**

---

### Property 8: Deterioration Risk Is a Valid Enum Member

*For any* batch assessment produced by `DecisionEngine.deriveDecision`, the `deteriorationRisk` field must be exactly one of: `LOW`, `MODERATE`, or `HIGH`.

**Validates: Requirements 4.4**

---

### Property 9: Risk-to-Priority Mapping is Exhaustive and Correct

*For any* `DeteriorationRisk` input to `DecisionEngine.deriveDecision`: if risk is `HIGH`, the returned Priority must be `HIGH` and the explainability rationale must contain urgency language; if risk is `MODERATE`, Priority must be `MEDIUM` and the rationale must reference monitoring or mitigation; if risk is `LOW`, Priority must be `LOW` and the rationale must state the basis for low risk.

**Validates: Requirements 5.1, 5.5, 5.6, 5.7**

---

### Property 10: Explainability Panel is Non-Empty and References Input Signals

*For any* `RecommendedAction` produced by the Decision Engine, the `explainability.rationale` must be a non-empty string, `explainability.visualSignalsUsed` must contain at least one entry, and `explainability.riskBasis` must equal the `deteriorationRisk` of the assessment.

**Validates: Requirements 5.2, 8.2**

---

### Property 11: Role-Appropriate Recommended Actions

*For any* call to `DecisionEngine.deriveDecision` with `role = 'farmer'`, the returned `action` string must reference plant-level concepts and must not reference batch-level concepts; for any call with `role = 'collector'` or `role = 'distributor'`, the action must reference batch-level concepts and must not reference plant-level concepts.

**Validates: Requirements 5.4**

---

### Property 12: Context Fusion Is Monotonically Non-Decreasing

*For any* `VisualCondition` input, calling `fuseContext` with a `ContextData` that contains at least one high-risk indicator (storage > 48 h, temperature > 30°C, or time since harvest > 72 h) must return a `finalRisk` that is greater than or equal to the base risk derived from visual analysis alone. Context data must never reduce risk below the visual baseline.

**Validates: Requirements 8.1**

---

### Property 13: Record Timestamps are Valid ISO Dates

*For any* saved `PlantObservation` or `BatchAssessment` record retrieved from storage, the `timestamp` or `createdAt` field must be a string that parses as a valid ISO 8601 date-time value and must not be null or undefined.

**Validates: Requirements 8.4**

---

### Property 14: Records are User-Scoped

*For any* record saved by user A, querying `StorageService` with user B's account identifier (where B ≠ A) must not return that record in the result set.

**Validates: Requirements 7.4**

---

### Property 15: No Accuracy Percentage Claims in AI Output

*For any* rendered AI result component (in Module A, B, C, or D), the text content of the component must not contain a substring matching the pattern of a percentage value used as an accuracy claim (e.g., `"X% accurate"`, `"accuracy: N%"`).

**Validates: Requirements 2.6, 9.3**

---

### Property 16: Loading Indicator Present During Inference

*For any* component in an active inference loading state (`isLoading === true`), the rendered DOM must contain a loading indicator element with accessible labeling (e.g., `aria-label="Analyzing..."` or equivalent).

**Validates: Requirements 10.4**

---

### Property 17: Risk Level Visual Severity Differentiation

*For any* rendered result component displaying a `DeteriorationRisk` or `Priority` value, the CSS class applied to the risk/priority element must correspond to the severity level — `HIGH` must use a class distinct from `MODERATE`, and `MODERATE` must use a class distinct from `LOW`.

**Validates: Requirements 10.5**

---

### Property 18: Module C Result Completeness

*For any* valid batch assessment result, the rendered `BatchResultPanel` must display all five required fields: Batch ID, Visual Condition summary, Deterioration Risk level, Priority classification, and Recommended Action.

**Validates: Requirements 4.2**

---

### Property 19: Persistence Round-Trip

*For any* valid `PlantObservation` or `BatchAssessment` record, calling `StorageService.saveObservation` (or `saveBatchAssessment`) followed by `getObservations` (or `getBatchAssessments`) for the same `userId` must return a collection that includes the saved record with all fields intact.

**Validates: Requirements 3.1, 4.5, 7.1**
