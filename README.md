🚨 NexGen Orion — Emergency Response & Disaster Management Platform
> **A centralized emergency response platform designed to help citizens report incidents and help response teams monitor, verify, prioritize, and coordinate emergency operations.**
![Project](https://img.shields.io/badge/Project-Disaster%20Management-1d4ed8)
![Frontend](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=nodedotjs&logoColor=white)
![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2)
![Build](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
---
📌 Problem Statement
During emergencies and disasters, delays in communication and coordination can increase the risk to people and property. Information may arrive from different sources, responders may not have a clear view of incident priorities, and emergency teams can struggle to coordinate their actions.
Common challenges include:
Fragmented incident reporting: Emergency information may be shared through calls, messages, or other channels, making it difficult to maintain one consistent incident record.
Delayed response coordination: Dispatchers need to understand an incident's location, severity, and resource requirements before assigning an appropriate response team.
Unverified or misleading reports: False alarms, prank submissions, incomplete details, and inconsistent information can consume valuable response resources.
Limited operational visibility: Without a centralized dashboard, administrators may find it difficult to track active incidents, team assignments, and resolution progress.
NexGen Orion aims to address these challenges through a centralized emergency management interface that brings incident reporting, suspicious-report analysis, operational monitoring, and response coordination into one platform.
---
🎯 Project Objective
The objective of NexGen Orion is to support a more organized emergency response workflow by:
Providing a structured way to submit emergency incident reports.
Presenting incident information in a centralized command dashboard.
Helping administrators review incident severity and suspicious-report indicators.
Supporting location-aware incident monitoring and response-team coordination.
Improving visibility into assigned, active, and resolved incidents.
Providing analytical information that can support operational decisions.
---
🚀 Key Features
Feature	Description	Purpose
Emergency Incident Reporting	Collects incident details such as title, category, description, location, and people affected.	Creates a structured incident record for review.
Centralized Incident Dashboard	Provides an operational view of emergency reports and their status.	Helps administrators monitor incoming and ongoing incidents.
AI-Assisted Suspicious Report Analysis	Uses Google Gemini when configured to assess possible spam, prank reports, inconsistent details, and suspicious indicators.	Helps dispatchers decide which reports need additional verification.
Heuristic Fallback Analysis	Uses a local rule-based analyzer when the Gemini API key is unavailable or an AI request fails.	Keeps basic suspicious-report assessment available without the AI service.
Risk Classification	Returns categories such as Normal, Needs Verification, Suspicious, and Escalated to Police.	Makes review priorities easier to understand.
Location-Aware Response Workflow	Supports the use of reported location information during incident review and coordination.	Helps teams understand where assistance is required.
Response-Team Coordination	Project workflow is intended to support assigning teams and monitoring incident progress.	Improves coordination between command staff and responders.
Incident Analytics	Supports the project goal of presenting incident trends and critical operational information.	Helps administrators review emergency activity.
> **Important:** AI-generated risk assessments are decision-support information. A suspicious score must not automatically reject an emergency report or prevent life-saving assistance. Human verification and dispatcher judgment remain essential.
---
🧠 AI-Assisted Suspicious Report Detection
NexGen Orion includes a server endpoint for analyzing suspicious emergency reports:
`POST /api/gemini/analyze-suspicious`
The analysis considers report information such as:
Incident title and category
Description of the emergency
Reported location
Number of people affected
Available coordinates
Caller or citizen name, when supplied
The analyzer returns a structured assessment containing:
Output	Meaning
`suspiciousRiskScore`	Risk score from 0 to 100.
`riskClassification`	Normal, Needs Verification, Suspicious, or Escalated to Police.
`suspiciousIndicators`	Reasons that may require further review.
`duplicateReportMatch`	Duplicate-report indicator returned by the analyzer.
`informationConsistency`	Summary of how consistent the submitted details appear.
`verificationRecommendation`	Suggested next step for the dispatcher.
`explanation`	Brief explanation of the assessment.
`isAiGenerated`	Indicates whether the result came from Gemini or the fallback analyzer.
Analysis flow
The client submits an incident report to the analysis endpoint.
The server checks whether `GEMINI_API_KEY` is configured.
If configured, the server requests a structured assessment from Google Gemini.
If Gemini is unavailable or returns an error, the server uses the local heuristic analyzer.
The server returns the assessment to the client for review.
The fallback analyzer checks for simple indicators such as prank-related keywords, very short descriptions, unusually high casualty claims without supporting context, and missing or underspecified location details.
Safety principle: A suspicious classification is a prompt for human review, not proof that a report is false. Genuine emergency response should not be withheld solely because an automated system raises a flag.
---
🏗️ Technology Stack
Frontend
Technology	Role
React 19	Component-based user interface.
TypeScript	Type-safe application development.
Vite	Development server and frontend build tooling.
Tailwind CSS 4	Utility-first styling and responsive layouts.
Recharts	Data visualization and chart components.
Leaflet	Interactive map functionality.
Lucide React	Interface icons.
Motion	UI animations and transitions.
Backend & AI
Technology	Role
Node.js	JavaScript runtime for the application server.
Express 4	HTTP server and API routing.
TypeScript	Server-side type support.
Google GenAI SDK	Gemini integration for suspicious-report analysis.
dotenv	Loads environment variables from `.env`.
tsx	Executes the TypeScript server during development.
Build & Development Tools
Technology	Role
Bun / npm	JavaScript package management and scripts.
Vite	Frontend bundling and development middleware.
TypeScript Compiler	Type checking through the lint script.
---
🔄 System Workflow
```text
                CITIZEN / REPORTING USER
                          |
                          v
                Submit Emergency Report
                          |
                          v
              Incident Details & Location
                          |
                          v
                CENTRAL COMMAND SYSTEM
                          |
             +------------+-------------+
             |                          |
             v                          v
       Incident Review          Suspicious Report
                                Analysis Endpoint
                                      |
                            +---------+---------+
                            |                   |
                            v                   v
                       Google Gemini      Local Heuristic
                         (if key set)      (fallback)
                            |                   |
                            +---------+---------+
                                      |
                                      v
                           Risk Assessment Result
                                      |
                                      v
                         Dispatcher / Admin Review
                                      |
                                      v
                         Response Coordination
                                      |
                                      v
                        Track Incident Progress
                                      |
                                      v
                           Resolution & Review
```
---
📂 Project Structure
The repository currently contains the following top-level structure:
```text
NexGen-Orion/
├── src/                 # Frontend application source
├── .env.example         # Example environment configuration
├── bun.lock             # Bun dependency lockfile
├── index.html           # Vite application entry HTML
├── metadata.json        # Project metadata
├── package.json         # Dependencies and scripts
├── server.ts            # Express server and Gemini analysis endpoint
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```
---
⚙️ Installation & Setup
Prerequisites
Make sure the following tools are installed:
Node.js — compatible with the installed project dependencies
Bun or npm — package manager
Git — for cloning the repository
Google Gemini API key — optional; required for Gemini-powered report analysis
Step 1: Clone the Repository
```bash
git clone https://github.com/nexa1208-lgtm/NexGen-Orion.git
cd NexGen-Orion
```
Step 2: Install Dependencies
Using Bun:
```bash
bun install
```
Or using npm:
```bash
npm install
```
Step 3: Configure Environment Variables
Create a `.env` file in the project root. Use `.env.example` as the starting reference:
```bash
# macOS / Linux
cp .env.example .env
```
PowerShell:
```powershell
Copy-Item .env.example .env
```
Add your Gemini API key if you want to enable AI-assisted suspicious-report analysis:
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```
Keep your real API key private. Do not commit `.env` or expose the key in frontend code.
If `GEMINI_API_KEY` is not configured, the server uses its local heuristic fallback for suspicious-report analysis.
Step 4: Start the Development Server
```bash
bun run dev
```
Or:
```bash
npm run dev
```
The development server starts the Express application with Vite middleware.
Open:
```text
http://localhost:3000
```
Step 5: Create a Production Build
```bash
bun run build
```
Or:
```bash
npm run build
```
The production frontend build is generated in the `dist/` directory.
Step 6: Run the Production Server
After building:
```bash
bun run start
```
Or:
```bash
npm run start
```
The server uses the production build from `dist/` and listens on the configured `PORT` (default: `3000`).
---
🔌 API Reference
Analyze a Suspicious Emergency Report
Endpoint
```http
POST /api/gemini/analyze-suspicious
Content-Type: application/json
```
Example request
```json
{
  "id": "INC-2026-001",
  "title": "Road accident near bus stand",
  "category": "Accident",
  "description": "A collision involving two vehicles. Two people may be injured.",
  "location": "Near the central bus stand",
  "peopleAffected": 2,
  "coordinates": {
    "latitude": 9.9252,
    "longitude": 78.1198
  },
  "citizenName": "Example Reporter"
}
```
Example response shape
```json
{
  "incidentId": "INC-2026-001",
  "suspiciousRiskScore": 5,
  "riskClassification": "Normal",
  "suspiciousIndicators": [
    "Clean submission, clear landmark provided"
  ],
  "duplicateReportMatch": false,
  "informationConsistency": "High - consistent situational reporting",
  "verificationRecommendation": "Dispatch nearest available unit standard priority.",
  "explanation": "Report shows coherent description and a valid landmark.",
  "isAiGenerated": false
}
```
The values above are illustrative. Actual results depend on the submitted report and whether Gemini or the fallback analyzer handles the request.
---
🛡️ Safety, Privacy & Responsible Use
Emergency management systems handle sensitive information and may influence time-critical decisions. NexGen Orion should be used with the following safeguards:
Human oversight: Dispatchers and authorized personnel must review critical decisions.
No automatic rejection: A suspicious score must not be treated as proof of a false report.
Privacy protection: Personal details and location information should only be accessible to authorized users and handled according to applicable privacy requirements.
Secure API credentials: Store API keys in environment variables and never publish them in source code.
Responsible location use: Location information should support emergency coordination and should not be used for unauthorized tracking.
Verification before escalation: Police escalation and other high-impact actions require appropriate human and operational procedures.
Operational readiness: This project is a software prototype and should not be treated as a certified emergency dispatch or public-safety system without extensive validation, security review, and integration with authorized emergency services.
---
🌱 Future Enhancements
The following are potential extensions to strengthen the platform:
Advanced geospatial dispatch: Recommend the nearest suitable available response team using verified location and availability data.
Team management: Create response teams, assign team members, and monitor assignment and resolution status.
Live incident map: Display verified incident locations and response-unit positions with appropriate access controls.
Advanced analytics dashboard: Show incident categories, severity distribution, response activity, and resolution trends.
Duplicate incident correlation: Identify potentially related reports using location, time, and incident details.
Identity verification: Add privacy-preserving, consent-based identity verification where legally permitted.
Notifications: Provide status updates to reporters and authorized response personnel.
Audit trail: Record important administrative actions and incident status changes.
These items should be considered planned enhancements unless they are implemented and tested in the current codebase.
---
🧪 Testing & Validation
Before presenting or deploying the project, test the main workflow:
Submit a sample emergency report and verify that the application accepts the required details.
Check that missing or invalid fields are handled clearly.
Test the suspicious-report analysis endpoint with both normal and suspicious sample reports.
Verify the Gemini path with a valid API key.
Verify the fallback path without a Gemini API key.
Confirm that an AI warning does not automatically block a genuine emergency report.
Test the application at desktop and mobile screen sizes.
Confirm that environment secrets are not exposed in the client bundle or committed to Git.
---
💡 Project Impact
NexGen Orion is designed to support:
More structured emergency information collection.
Better visibility of reported incidents.
Faster review of incident details and potential risk indicators.
More organized coordination between administrators and response teams.
Data-informed monitoring of emergency operations.
By bringing reporting, analysis, and response coordination together, the platform aims to help emergency personnel make more informed decisions during critical situations.
---
🏆 Project Information
Detail	Information
Project Name	NexGen Orion
Domain	Emergency Response & Disaster Management
Repository	NexGen-Orion on GitHub
Primary Focus	Incident reporting, suspicious-report analysis, and response coordination
Development Context	Inter-college hackathon project
---
📜 License
No license file was visible in the repository at the time this README was prepared. Add a `LICENSE` file and update this section once the project license has been selected.
---
👥 Team
NexGen Orion Development Team
Add your team members' names, roles, and contribution details here.
---
<p align="center">
  <strong>NexGen Orion — Coordinating Response. Supporting Communities. Saving Time.</strong>
</p>
