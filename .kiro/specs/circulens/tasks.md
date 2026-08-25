# Implementation Plan: CircuLens

## Overview

A React + TypeScript browser-only SPA. All AI inference runs client-side via ONNX.js or OpenVINO JS (WebAssembly). Cloud persistence is handled by Supabase. The build is organized into four phases: project foundation → core services (AI, Decision Engine, storage) → module UI components → integration and wiring.

---

## Tasks

- [ ] 1. Initialize project structure, types, and configuration
  - [ ] 1.1 Scaffold the Vite + React + TypeScript project with Tailwind CSS
    - Run `npm create vite@latest circulens -- --template react-ts`, install Tailwind CSS, configure `tailwind.config.ts` and `postcss.config.js`
    - Create the full `src/` directory tree matching the component structure in the design
    - Add `onnxruntime-web` (or `@openvino/node` browser bundle) and `@supabase/supabase-js` as dependencies
    - _Requirements: 10.1_

  - [ ] 1.2 Define all shared TypeScript types and enums in `src/types/index.ts`
    - Implement `UserRole`, `DeteriorationRisk`, `Priority`, `MonitoringTrend`, `HarvestReadiness`, `VisualHealthStatus` enums/types
    - Implement `PlantObservation`, `MonitoringSession`, `MaturityEntry`, `BatchAssessment`, `ContextData`, `VisualCondition`, `RecommendedAction`, `ExplainabilityRecord`, `InferenceResult`, `InferenceError` interfaces
    - _Requirements: 2.2, 4.2, 5.1_

  - [ ] 1.3 Implement `src/utils/batchId.ts` — UUID-based Batch ID generation
    - Export a `generateBatchId(): string` function that returns a UUID-formatted string
    - _Requirements: 4.2_

  - [ ] 1.4 Implement `src/utils/trendAnalysis.ts` — monitoring trend derivation
    - Implement `deriveTrend(observations: PlantObservation[]): MonitoringTrend` using the numeric score map defined in the design
    - Handle the edge case where `observations.length < 2` → return `'stable'`
    - _Requirements: 3.3_

  - [ ] 1.5 Write property test for `deriveTrend` (Property 6)
    - **Property 6: Monitoring Trend Consistency with Status Sequence**
    - For any non-empty sequence of observations with distinct `VisualHealthStatus` values, verify `deriveTrend` returns `improving` when final score > initial score, `declining` when final score < initial score, and `stable` when equal
    - **Validates: Requirements 3.3**

- [ ] 2. Implement application services layer
  - [ ] 2.1 Implement `src/services/modelLoader.ts` — model weight loading and Cache API management
    - Implement `load(module: 'A' | 'C'): Promise<void>` using `caches.open('circulens-models-v1')`
    - Implement `getStatus(): Record<'A' | 'C', 'loading' | 'ready' | 'error'>`
    - On cache miss: fetch model file, store in Cache API, then load into ONNX/OpenVINO runtime
    - On cache hit: read bytes directly without network request
    - _Requirements: 6.1, 6.3_

  - [ ] 2.2 Implement `src/services/inferenceService.ts` — AI inference abstraction
    - Implement `analyze(imageFile: File, module: 'A' | 'C'): Promise<InferenceResult>` wrapping the ONNX.js runtime
    - Implement `isReady(module: 'A' | 'C'): boolean`
    - Map runtime errors to typed `InferenceError` codes: `IMAGE_UNPROCESSABLE`, `MODEL_NOT_LOADED`, `TIMEOUT`, `UNKNOWN`
    - Enforce 30-second timeout and reject with `TIMEOUT` error code
    - _Requirements: 2.1, 4.1, 6.1, 6.2_

  - [ ] 2.3 Implement `src/services/contextFusion.ts` — context data escalation
    - Implement `fuseContext(baseRisk: DeteriorationRisk, contextData: ContextData | null): { finalRisk: DeteriorationRisk; contextInputsUsed: string[] }`
    - Apply additive escalation rules: `timeSinceHarvestHours > 72`, `storageDurationHours > 48`, `estimatedStorageTempCelsius > 30` each escalate risk one level; cap at `HIGH`
    - Context data must never reduce risk below the visual baseline
    - _Requirements: 8.1, 8.2_

  - [ ] 2.4 Write property test for `fuseContext` (Property 12)
    - **Property 12: Context Fusion Is Monotonically Non-Decreasing**
    - For any `VisualCondition` + `ContextData` with at least one high-risk indicator, verify `finalRisk >= baseRisk` and that no context data combination returns a risk level lower than the visual baseline
    - **Validates: Requirements 8.1**

  - [ ] 2.5 Implement `src/services/decisionEngine.ts` — pure decision pipeline
    - Implement `deriveDecision(visualCondition: VisualCondition, contextData: ContextData | null, role: UserRole): RecommendedAction`
    - Stage 1: derive base risk from `rawScore` and `apparentDeterioration` thresholds
    - Stage 2: call `fuseContext` for context escalation
    - Stage 3: map final risk to priority (`HIGH → HIGH`, `MODERATE → MEDIUM`, `LOW → LOW`)
    - Stage 4: select role- and risk-appropriate `action` string
    - Stage 5: build `ExplainabilityRecord` referencing visual signals and context inputs used
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6, 5.7_

  - [ ] 2.6 Write property test for `deriveDecision` — risk enum validity (Property 8)
    - **Property 8: Deterioration Risk Is a Valid Enum Member**
    - For any `VisualCondition` + `ContextData` input, verify the returned risk is exactly one of `LOW`, `MODERATE`, `HIGH`
    - **Validates: Requirements 4.4**

  - [ ] 2.7 Write property test for `deriveDecision` — risk-to-priority mapping (Property 9)
    - **Property 9: Risk-to-Priority Mapping is Exhaustive and Correct**
    - For `HIGH` input → Priority must be `HIGH` and rationale must contain urgency language; for `MODERATE` → Priority `MEDIUM` with monitoring/mitigation language; for `LOW` → Priority `LOW` with low-risk basis statement
    - **Validates: Requirements 5.1, 5.5, 5.6, 5.7**

  - [ ] 2.8 Write property test for `deriveDecision` — explainability non-empty (Property 10)
    - **Property 10: Explainability Panel is Non-Empty and References Input Signals**
    - Verify `rationale` is non-empty, `visualSignalsUsed` has ≥ 1 entry, and `riskBasis` equals the assessment's `deteriorationRisk`
    - **Validates: Requirements 5.2, 8.2**

  - [ ] 2.9 Write property test for `deriveDecision` — role-appropriate actions (Property 11)
    - **Property 11: Role-Appropriate Recommended Actions**
    - For `role = 'farmer'` the action must reference plant-level concepts; for `role = 'collector'` or `'distributor'` the action must reference batch-level concepts
    - **Validates: Requirements 5.4**

  - [ ] 2.10 Implement `src/services/storageService.ts` — Supabase CRUD wrapper
    - Implement all six methods: `saveObservation`, `getObservations`, `saveBatchAssessment`, `getBatchAssessments`, `saveMonitoringSession`, `getMonitoringSessions`
    - All writes must be scoped by `userId`
    - Throw typed `StorageError` on write failure; return stale cached data with warning on read failure
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ] 2.11 Write property test for `storageService` — persistence round-trip (Property 19)
    - **Property 19: Persistence Round-Trip**
    - For any valid `PlantObservation` or `BatchAssessment`, saving then reading back via the same `userId` must return a collection that includes the record with all fields intact
    - **Validates: Requirements 3.1, 4.5, 7.1**

  - [ ] 2.12 Write property test for `storageService` — user scoping (Property 14)
    - **Property 14: Records are User-Scoped**
    - A record saved for user A must not appear in query results for user B
    - **Validates: Requirements 7.4**

  - [ ] 2.13 Write property test for timestamps — valid ISO dates (Property 13)
    - **Property 13: Record Timestamps are Valid ISO Dates**
    - For any saved `PlantObservation` or `BatchAssessment` retrieved from storage, the `timestamp` / `createdAt` field must parse as a valid ISO 8601 date-time and must not be null or undefined
    - **Validates: Requirements 8.4**

- [ ] 3. Checkpoint — Ensure all service-layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement React context, hooks, and shared components
  - [ ] 4.1 Implement `src/context/RoleContext.tsx` — role state and module access
    - Implement `RoleContextValue`: `role`, `setRole`, `allowedModules`
    - Derive `allowedModules` from role: `farmer → ['A', 'B']`, `collector/distributor → ['C', 'D']`
    - Persist role to `sessionStorage` so selection survives page refresh but clears on browser close
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ] 4.2 Write property test for `RoleContext` — role-aware module access (Property 1)
    - **Property 1: Role-Aware Module Access**
    - For any selected role, `allowedModules` must contain only the permitted modules and no others
    - **Validates: Requirements 1.2**

  - [ ] 4.3 Implement `src/hooks/useInference.ts`
    - Manage loading state, `InferenceResult | null`, `InferenceError | null`
    - Expose `analyze(file, module)`, `result`, `error`, `isLoading`
    - Components must never call `InferenceService` directly
    - _Requirements: 2.1, 4.1, 10.4_

  - [ ] 4.4 Implement `src/hooks/useObservations.ts`
    - Manage `observations`, `save`, `isSaving`, `saveError`, `retrySave`
    - On save failure surface error; support manual retry
    - _Requirements: 3.1, 7.3_

  - [ ] 4.5 Implement `src/hooks/useBatchAssessments.ts`
    - Same pattern as `useObservations` for `BatchAssessment` records
    - _Requirements: 4.5, 7.3_

  - [ ] 4.6 Implement shared UI components in `src/components/shared/`
    - `PrototypeAIBadge.tsx`: small pill with `Prototype AI ⚗️` label, muted warning color
    - `RiskBadge.tsx`: renders `LOW / MODERATE / HIGH` with severity CSS classes (`risk--low`, `risk--moderate`, `risk--high`)
    - `ExplainabilityPanel.tsx`: renders `rationale`, `visualSignalsUsed`, `contextInputsUsed`, `riskBasis`; includes "CircuLens recommends. You decide." disclaimer
    - `LoadingIndicator.tsx`: full-width progress bar + spinner, `aria-label="Analyzing..."`, visible only when `isLoading === true`
    - `DisclaimerModal.tsx`: one-time onboarding modal; checks `localStorage.getItem('circulens-disclaimer-acknowledged')`; sets key on acknowledgement
    - _Requirements: 5.2, 5.3, 9.1, 9.2, 10.3, 10.4, 10.5_

- [ ] 5. Implement Role Selector and application shell
  - [ ] 5.1 Implement `src/components/RoleSelector/RoleSelector.tsx`
    - Render three selectable role cards (Farmer, Collector/Aggregator, Distributor)
    - On selection, call `setRole` from `RoleContext` and navigate to the role's default module
    - _Requirements: 1.1_

  - [ ] 5.2 Implement `src/App.tsx` and `src/main.tsx`
    - Wrap the app in `RoleProvider` and a client-side router
    - Show `RoleSelector` when `role === null`; render role-gated module routes when role is set
    - Mount `DisclaimerModal` at root so it fires once on first launch
    - _Requirements: 1.1, 1.2, 9.2_

  - [ ] 5.3 Write property test for role change — data preservation (Property 2)
    - **Property 2: Role Change Does Not Destroy Persisted Data**
    - Switching role away from and back to original role must leave all saved observations and batch records intact and retrievable
    - **Validates: Requirements 1.6**

- [ ] 6. Implement Module A — Plant Monitoring
  - [ ] 6.1 Implement `src/components/ModuleA/PlantMonitor.tsx`
    - Render image capture/upload control (file input + optional camera capture via `<input type="file" accept="image/*" capture>`)
    - On image submission call `useInference.analyze(file, 'A')`
    - Show `LoadingIndicator` while `isLoading === true`
    - Show error message and resubmit prompt when `error !== null`
    - _Requirements: 2.1, 2.4, 6.2, 10.4_

  - [ ] 6.2 Implement `src/components/ModuleA/PlantResultPanel.tsx`
    - Render all five required fields: Visual Health Status, Visible Risk Indicator, Possible Abnormality, Confidence indicator, Monitoring Trend
    - Mount `<PrototypeAIBadge />` whenever `result !== null`
    - Include `<ExplainabilityPanel />` with Decision Engine output for `role = 'farmer'`
    - Must not display any accuracy percentage string (e.g., `"X% accurate"`)
    - _Requirements: 2.2, 2.3, 2.6, 5.1, 9.3_

  - [ ] 6.3 Write property test for `PlantResultPanel` — result completeness (Property 4)
    - **Property 4: Module A Result Completeness**
    - For any valid `InferenceResult`, the rendered panel must contain all five required fields
    - **Validates: Requirements 2.2**

  - [ ] 6.4 Write property test for `PlantResultPanel` — Prototype AI badge presence (Property 3)
    - **Property 3: Prototype AI Badge Presence on All AI Outputs**
    - The rendered DOM must contain a "Prototype AI" label element when `result !== null`
    - **Validates: Requirements 2.3, 9.1**

  - [ ] 6.5 Write property test for `PlantResultPanel` — no accuracy percentage claims (Property 15)
    - **Property 15: No Accuracy Percentage Claims in AI Output**
    - The text content of the rendered component must not match the pattern of a percentage used as an accuracy claim
    - **Validates: Requirements 2.6, 9.3**

  - [ ] 6.6 Write property test for `PlantMonitor` / `PlantResultPanel` — loading indicator accessibility (Property 16)
    - **Property 16: Loading Indicator Present During Inference**
    - When `isLoading === true`, the rendered DOM must contain a loading indicator with accessible labeling (`aria-label="Analyzing..."` or equivalent)
    - **Validates: Requirements 10.4**

- [ ] 7. Implement Module B — Growth and Harvest Monitoring
  - [ ] 7.1 Implement `src/components/ModuleB/GrowthTimeline.tsx`
    - Use `useObservations` to load saved observations for the current session
    - Display observations in chronological order (earliest first)
    - _Requirements: 3.2_

  - [ ] 7.2 Implement `src/components/ModuleB/MonitoringTrendCard.tsx`
    - Call `trendAnalysis.deriveTrend(observations)` and display the result
    - Mount `<PrototypeAIBadge />` unconditionally
    - _Requirements: 3.3, 3.6, 9.1_

  - [ ] 7.3 Implement `src/components/ModuleB/HarvestReadinessCard.tsx`
    - Display `HarvestReadiness` value derived from the most recent growth stage observation
    - Allowed display values: `Not Ready`, `Approaching Readiness`, `Visually Ready`
    - Must not contain any date pattern string
    - Mount `<PrototypeAIBadge />` unconditionally
    - _Requirements: 3.5, 3.6, 9.4_

  - [ ] 7.4 Write property test for `GrowthTimeline` — chronological ordering (Property 5)
    - **Property 5: Chronological Ordering of Stored Collections**
    - For any collection of observations with distinct timestamps, the rendered order must be chronologically consistent
    - **Validates: Requirements 3.2, 3.4**

  - [ ] 7.5 Write property test for `HarvestReadinessCard` — qualitative-only output (Property 7)
    - **Property 7: Harvest Readiness Indicator is Qualitative-Only**
    - The rendered display must be one of the three allowed qualitative strings and must not contain any date pattern
    - **Validates: Requirements 3.5**

- [ ] 8. Implement Module C — Post-Harvest Batch Assessment
  - [ ] 8.1 Implement `src/components/ModuleC/BatchAssessment.tsx`
    - Render image upload control and optional `ContextData` form (time since harvest, storage duration, temperature, metadata)
    - On submission: call `useInference.analyze(file, 'C')`, map raw output to `VisualCondition`, call `decisionEngine.deriveDecision`, build `BatchAssessment` record with generated Batch ID
    - Show `LoadingIndicator` during inference
    - Show descriptive error + resubmit prompt on `InferenceError`
    - _Requirements: 4.1, 4.3, 4.6, 4.7, 8.1_

  - [ ] 8.2 Implement `src/components/ModuleC/BatchResultPanel.tsx`
    - Display Batch ID, Visual Condition summary, Deterioration Risk, Priority, Recommended Action
    - Mount `<PrototypeAIBadge />` when `result !== null`
    - Mount `<ExplainabilityPanel />` with context inputs used listed
    - Must not display accuracy percentage strings
    - _Requirements: 4.2, 4.8, 5.2, 8.2, 9.3_

  - [ ] 8.3 Write property test for `BatchResultPanel` — result completeness (Property 18)
    - **Property 18: Module C Result Completeness**
    - For any valid batch assessment result, the rendered panel must contain all five required fields: Batch ID, Visual Condition summary, Deterioration Risk, Priority, Recommended Action
    - **Validates: Requirements 4.2**

  - [ ] 8.4 Write property test for `BatchResultPanel` — risk severity CSS classes (Property 17)
    - **Property 17: Risk Level Visual Severity Differentiation**
    - The CSS class applied to the risk/priority element must differ across `HIGH`, `MODERATE`, and `LOW` — each level must have a visually distinct class
    - **Validates: Requirements 10.5**

- [ ] 9. Implement Module D — Decision Engine UI
  - [ ] 9.1 Implement `src/components/ModuleD/DecisionPanel.tsx`
    - Render Priority badge using severity-matched CSS classes (`priority--high`, `priority--medium`, `priority--low`)
    - Render Recommended Action text
    - Mount `<ExplainabilityPanel />` with visual signals list, context inputs list, risk basis
    - Include "CircuLens recommends. You decide." disclaimer
    - Mount `<PrototypeAIBadge />` unconditionally
    - Must not present output as scientifically validated
    - _Requirements: 5.1, 5.2, 5.3, 5.8, 9.1_

- [ ] 10. Checkpoint — Ensure all module tests pass
  - Ensure all module-level tests pass, ask the user if questions arise.

- [ ] 11. Responsive design and visual polish
  - [ ] 11.1 Apply Tailwind CSS responsive layout across all components
    - Ensure all components render correctly at 375px, 768px, and 1440px breakpoints
    - Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for layout adjustments
    - _Requirements: 10.2_

  - [ ] 11.2 Apply the color palette and typography hierarchy
    - Earthy greens for healthy/low risk, amber for moderate risk, deep red for high risk, off-white backgrounds
    - Risk level uses `text-2xl font-bold` with role-specific color classes
    - Recommended Action uses `text-lg font-medium`; Explainability rationale uses `text-sm text-muted`
    - _Requirements: 10.3, 10.5_

- [ ] 12. Wire all modules into the application router
  - [ ] 12.1 Configure client-side routing in `App.tsx`
    - Define routes for `/role-select`, `/module-a`, `/module-b`, `/module-c`, `/module-d`
    - Add a route guard: if `role === null`, redirect to `/role-select`; if route not in `allowedModules`, redirect to first allowed module
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ] 12.2 Connect `useObservations` and `useBatchAssessments` to Supabase via `StorageService`
    - Verify that saves in Module A/C appear correctly in Module B history and Module C history lists after retrieval
    - _Requirements: 3.1, 3.2, 4.5, 7.1, 7.2_

  - [ ] 12.3 Wire the `ModelLoader` startup sequence into `App.tsx`
    - On mount, call `modelLoader.load('A')` and `modelLoader.load('C')` in parallel
    - Surface `MODEL_NOT_LOADED` error banner if either load fails (do not silently fail)
    - _Requirements: 6.3, 6.4_

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; they implement property-based and unit tests from the design's Correctness Properties section.
- Each task references specific requirements for traceability.
- Checkpoints (tasks 3, 10, 13) ensure incremental validation between phases.
- Property tests validate the universal correctness properties defined in the design document.
- The `InferenceService` is intentionally a stub/mock during service-layer development; replace with a real ONNX.js session when model weights are available.
- Supabase tables required: `plant_observations`, `monitoring_sessions`, `batch_assessments` — each with a `user_id` foreign key and a `created_at` timestamp.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1"] },
    { "id": 2, "tasks": ["1.5", "2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "2.10"] },
    { "id": 4, "tasks": ["2.6", "2.7", "2.8", "2.9", "2.11", "2.12", "2.13", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 6, "tasks": ["5.1", "5.2"] },
    { "id": 7, "tasks": ["5.3", "6.1", "7.1", "8.1", "9.1"] },
    { "id": 8, "tasks": ["6.2", "7.2", "7.3", "8.2"] },
    { "id": 9, "tasks": ["6.3", "6.4", "6.5", "6.6", "7.4", "7.5", "8.3", "8.4"] },
    { "id": 10, "tasks": ["11.1", "11.2"] },
    { "id": 11, "tasks": ["12.1", "12.2", "12.3"] }
  ]
}
```
