# Requirements Document

## Introduction

CircuLens is an AI-powered decision-support system for chili lifecycle intelligence. The system uses browser-local computer vision inference and contextual data to monitor chili condition from plant growth through post-harvest handling, estimate deterioration risk, and surface actionable recommendations before chili loses significant economic value.

CircuLens is structured around four core modules: Plant Monitoring (Module A), Growth and Harvest Monitoring (Module B), Post-Harvest Chili Assessment (Module C), and a Decision Engine (Module D). All AI inference runs locally in the browser using ONNX.js or OpenVINO JS (WebAssembly); no Python backend is used. Data persistence is handled by Supabase or Firebase for cross-device access. The application targets three user roles — Farmer, Collector/Aggregator, and Distributor — each with a role-aware workflow.

CircuLens is a competition prototype. Every AI recommendation includes an explainable rationale. The system explicitly does not claim scientific precision, exact harvest dates, or accuracy percentages without evidence.

---

## Glossary

- **CircuLens**: The full application system described in this document.
- **Module A**: The Plant Monitoring module. Analyzes images of chili plants for visual health indicators.
- **Module B**: The Growth and Harvest Monitoring module. Tracks plant observations over time and indicates maturity progression.
- **Module C**: The Post-Harvest Chili Assessment module. Analyzes images of harvested chili batches for condition and deterioration risk.
- **Module D**: The Decision Engine module. Translates condition assessments into risk levels, priorities, and recommended actions.
- **Inference Engine**: The browser-local AI runtime (ONNX.js, OpenVINO JS, or WebAssembly) used for image analysis.
- **Batch**: A discrete unit of harvested chili submitted for assessment in Module C.
- **Batch ID**: A unique identifier assigned to each post-harvest chili batch.
- **Visual Health Status**: A qualitative summary of a chili plant's visible condition produced by Module A.
- **Visible Risk Indicator**: A flag or score indicating the degree of visible concern on a plant or batch.
- **Deterioration Risk**: A three-level classification (LOW / MODERATE / HIGH) of how likely a batch is to lose value or quality imminently.
- **Priority**: An ordered urgency classification derived from Deterioration Risk, used to sequence recommended actions.
- **Recommended Action**: A human-readable directive produced by the Decision Engine, always accompanied by a "Why?" explanation.
- **Monitoring Trend**: A directional summary (improving, stable, declining) derived from sequential Module A observations.
- **Maturity Progression**: A time-ordered record of growth stage observations tracked in Module B.
- **Harvest Readiness Indicator**: A qualitative signal (e.g., "Not Ready", "Approaching", "Ready") indicating whether plants appear ready for harvest, without specifying an exact date.
- **Context Data**: Supplementary non-image inputs (time since harvest, storage duration, temperature, batch metadata) combined with visual analysis.
- **Role Selector**: The entry-point UI component allowing a user to select Farmer, Collector/Aggregator, or Distributor before accessing the application.
- **Farmer**: A user role focused on plant health monitoring, maturity tracking, and harvest readiness.
- **Collector/Aggregator**: A user role focused on batch condition assessment, identifying risky batches, and prioritizing distribution.
- **Distributor**: A user role focused on batch prioritization, deterioration risk review, and distribution decision-making.
- **Prototype AI**: The current browser-local inference system used in the competition prototype.
- **Explainability Panel**: A UI component displaying the "Why?" rationale for any AI-generated recommendation.

---

## Requirements

### Requirement 1 — Role Selection and Role-Aware Access

**User Story:** As a user, I want to select my role at app entry, so that I see a workflow and UI tailored to my responsibilities.

#### Acceptance Criteria

1. THE Role Selector SHALL present three selectable roles — Farmer, Collector/Aggregator, and Distributor — before granting access to the main application.
2. WHEN a user selects a role, THE CircuLens application SHALL display only the modules, navigation items, and workflows relevant to that role.
3. WHEN a Farmer role is selected, THE CircuLens application SHALL provide access to Module A (Plant Monitoring) and Module B (Growth and Harvest Monitoring).
4. WHEN a Collector/Aggregator role is selected, THE CircuLens application SHALL provide access to Module C (Post-Harvest Chili Assessment) and Module D (Decision Engine) views focused on batch risk and distribution prioritization.
5. WHEN a Distributor role is selected, THE CircuLens application SHALL provide access to Module C batch results and Module D views focused on deterioration risk and distribution decisions.
6. THE Role Selector SHALL allow the user to change their selected role without losing persisted observation and batch data.

---

### Requirement 2 — Module A: Plant Monitoring via Image Analysis

**User Story:** As a Farmer, I want to capture or upload an image of my chili plants, so that I receive an AI-generated visual health assessment with risk indicators.

#### Acceptance Criteria

1. WHEN a Farmer submits an image in Module A, THE Inference Engine SHALL analyze the image for leaf appearance, discoloration, abnormalities, fruit presence, and fruit development stage entirely within the browser.
2. WHEN image analysis is complete, THE CircuLens application SHALL display a Visual Health Status, a Visible Risk Indicator, a Possible Abnormality field, an inference Confidence indicator, and a Monitoring Trend for the observation session.
3. THE CircuLens application SHALL clearly label all Module A AI outputs as "Prototype AI" to distinguish them from production-grade agricultural analysis.
4. IF the Inference Engine cannot process the submitted image (e.g., image is too dark, resolution is insufficient, or no chili plant is detected), THEN THE CircuLens application SHALL display a descriptive error message and prompt the user to submit a different image.
5. THE Inference Engine SHALL complete Module A image analysis within 30 seconds on a modern consumer device.
6. THE CircuLens application SHALL NOT claim specific percentage accuracy values for Module A outputs without empirical evidence.

---

### Requirement 3 — Module B: Growth and Harvest Monitoring Over Time

**User Story:** As a Farmer, I want my plant observations stored and visualized over time, so that I can track condition trends and gauge harvest readiness.

#### Acceptance Criteria

1. WHEN a Module A observation is saved, THE CircuLens application SHALL persist the observation record — including timestamp, Visual Health Status, Visible Risk Indicator, and Confidence — to cloud storage via Supabase or Firebase.
2. THE CircuLens application SHALL display a chronological history of all saved plant observations for a given monitoring session in Module B.
3. THE CircuLens application SHALL derive and display a Monitoring Trend (improving, stable, or declining) based on the sequence of Visual Health Status values across stored observations.
4. THE CircuLens application SHALL display a Maturity Progression timeline reflecting growth stage observations in sequential order.
5. THE CircuLens application SHALL display a Harvest Readiness Indicator using qualitative terms (such as "Not Ready", "Approaching Readiness", or "Visually Ready") and SHALL NOT display a specific predicted harvest date.
6. THE CircuLens application SHALL clearly label all Module B trend and readiness outputs as "Prototype AI" to distinguish them from production-grade agricultural analysis.

---

### Requirement 4 — Module C: Post-Harvest Chili Batch Assessment

**User Story:** As a Collector/Aggregator or Distributor, I want to scan or upload an image of a harvested chili batch along with contextual data, so that I receive an objective condition assessment and deterioration risk classification.

#### Acceptance Criteria

1. WHEN a user submits a batch image in Module C, THE Inference Engine SHALL analyze the image for color uniformity, visible damage, surface discoloration, surface abnormalities, apparent deterioration, and apparent freshness entirely within the browser.
2. WHEN Module C analysis is complete, THE CircuLens application SHALL generate and display a Batch ID, a Visual Condition summary, a Deterioration Risk level, a Priority classification, and a Recommended Action.
3. THE CircuLens application SHALL accept Context Data — including time since harvest, storage duration in hours or days, estimated storage temperature, and user-provided batch metadata — as optional inputs to be fused with the visual analysis result when producing Deterioration Risk and Priority.
4. THE Deterioration Risk level SHALL be classified as one of three values: LOW, MODERATE, or HIGH.
5. THE CircuLens application SHALL persist each completed batch assessment record to cloud storage, linked to the assigned Batch ID.
6. IF the Inference Engine cannot process the submitted batch image, THEN THE CircuLens application SHALL display a descriptive error message and prompt the user to resubmit.
7. THE Inference Engine SHALL complete Module C image analysis within 30 seconds on a modern consumer device.
8. THE CircuLens application SHALL clearly label all Module C AI outputs as "Prototype AI".

---

### Requirement 5 — Module D: Decision Engine — Risk, Priority, and Explainable Actions

**User Story:** As any user, I want every AI recommendation to come with a plain-language "Why?" explanation, so that I can make informed decisions rather than blindly following AI output.

#### Acceptance Criteria

1. THE Decision Engine SHALL translate every Visual Condition and Deterioration Risk assessment into a Priority classification and a Recommended Action following the pipeline: Condition → Risk → Priority → Action.
2. WHEN the Decision Engine produces a Recommended Action, THE CircuLens application SHALL display an Explainability Panel containing a "Why?" rationale that references the specific visual signals and context data inputs used to derive that recommendation.
3. THE CircuLens application SHALL present Recommended Actions as advisory outputs and SHALL include a visible disclaimer stating that the AI recommends while the human decides.
4. THE Decision Engine SHALL produce distinct Recommended Actions appropriate to the selected user role — Farmer actions for plant-level decisions, and Collector/Aggregator or Distributor actions for batch-level decisions.
5. WHEN Deterioration Risk is HIGH, THE Decision Engine SHALL assign the highest Priority level and SHALL include an urgency rationale in the Explainability Panel.
6. WHEN Deterioration Risk is MODERATE, THE Decision Engine SHALL assign a medium Priority level and SHALL recommend a monitoring or mitigation action in the Explainability Panel.
7. WHEN Deterioration Risk is LOW, THE Decision Engine SHALL assign the lowest Priority level and SHALL confirm the basis for the low-risk classification in the Explainability Panel.
8. THE CircuLens application SHALL NOT present any Decision Engine output as a scientifically validated or production-certified determination.

---

### Requirement 6 — Browser-Local AI Inference

**User Story:** As a user in any connectivity environment, I want AI analysis to run in my browser without sending images to a remote server, so that my data stays local and latency is minimized.

#### Acceptance Criteria

1. THE Inference Engine SHALL execute all image analysis computations within the user's browser using ONNX.js, OpenVINO JS, or a WebAssembly-compiled model.
2. THE CircuLens application SHALL NOT transmit raw image data to any remote server or third-party API during inference.
3. WHEN inference model assets are loaded, THE CircuLens application SHALL cache model weights in the browser to avoid redundant network downloads on subsequent sessions.
4. IF model assets fail to load (e.g., due to network unavailability or corrupted cache), THEN THE CircuLens application SHALL display a descriptive error message indicating that AI analysis is unavailable and SHALL NOT silently fail.

---

### Requirement 7 — Cloud-Backed Data Persistence and Cross-Device Access

**User Story:** As a user, I want my observations and batch records to be saved to the cloud, so that I can access them from any device.

#### Acceptance Criteria

1. THE CircuLens application SHALL persist all Module A observations, Module B monitoring sessions, and Module C batch assessments to a Supabase or Firebase cloud data store.
2. WHEN a user accesses CircuLens from a different device using the same account, THE CircuLens application SHALL retrieve and display all previously stored observations and batch records for that account.
3. IF a cloud write operation fails, THEN THE CircuLens application SHALL notify the user that the record was not saved and SHALL offer a retry option.
4. THE CircuLens application SHALL associate all stored records with the user's account identifier to prevent cross-user data access.

---

### Requirement 8 — Temporal Intelligence and Context Fusion

**User Story:** As any user, I want the system to combine visual analysis with time-based and environmental context, so that risk estimates reflect real-world conditions beyond what the image alone reveals.

#### Acceptance Criteria

1. WHEN producing a Deterioration Risk assessment, THE Decision Engine SHALL incorporate available Context Data — time since harvest, storage duration, and storage temperature — alongside visual analysis outputs.
2. THE CircuLens application SHALL display which Context Data inputs were used in the Explainability Panel for any assessment that includes context fusion.
3. WHEN no Context Data is provided, THE Decision Engine SHALL derive risk assessment from visual analysis alone and SHALL note the absence of context inputs in the Explainability Panel.
4. THE CircuLens application SHALL record the timestamp of each observation and batch assessment for use in Monitoring Trend computation and temporal display in Module B.

---

### Requirement 9 — Prototype Transparency and Responsible AI Labeling

**User Story:** As a user or evaluator, I want clear labeling that distinguishes prototype AI outputs from production agricultural science, so that I do not misinterpret the system's outputs as certified or clinically accurate.

#### Acceptance Criteria

1. THE CircuLens application SHALL display a persistent "Prototype AI" label or badge on every screen that presents an AI-generated assessment, trend, or recommendation.
2. THE CircuLens application SHALL display a one-time onboarding disclaimer at first launch stating that CircuLens is a decision-support prototype and that all AI outputs should be verified by agricultural domain expertise before acting on them.
3. THE CircuLens application SHALL NOT display specific accuracy percentages, sensitivity rates, or precision rates for any AI model unless those values have been derived from documented empirical evaluation.
4. THE CircuLens application SHALL NOT claim that Harvest Readiness Indicator or Deterioration Risk values are scientifically calibrated predictions.

---

### Requirement 10 — Frontend and UI Standards

**User Story:** As a user, I want a modern, clean, and responsive interface that reflects agricultural professionalism, so that I can navigate the system efficiently on both desktop and mobile devices.

#### Acceptance Criteria

1. THE CircuLens application SHALL be implemented using React and TypeScript.
2. THE CircuLens application SHALL render correctly and remain fully usable on viewport widths from 375px (mobile) through 1440px (desktop).
3. THE CircuLens application SHALL apply a consistent visual design language described as modern, clean, agricultural, and professional throughout all modules.
4. WHEN an AI inference operation is in progress, THE CircuLens application SHALL display a visible loading indicator to communicate that processing is underway.
5. THE CircuLens application SHALL display all user-facing AI result fields — Visual Health Status, Deterioration Risk, Priority, and Recommended Action — using clear typographic hierarchy that distinguishes result severity levels visually.
