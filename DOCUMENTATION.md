# AgroCare AI — Technical Documentation

## 1. Project Overview
**AgroCare AI** is a professional-grade, tactile diagnostic platform designed for rural agriculture. It empowers farmers to manage crop health with the precision of a senior agronomist. By leveraging the **Google Gemini API** (Gemini 3 Pro and Gemini 2.5 Flash), the application provides instant disease identification, AI-driven weather impact analysis, and localized supply chain grounding.

**Primary Goal:** To provide a "Grounded Realism" interface that bridges the gap between high-end AI intelligence and the practical, physical needs of field workers.

---

## 2. Problem Statement
Rural agriculture often suffers from an "Expert Gap." In many regions, the ratio of agronomists to farmers is drastically unbalanced, leading to:
*   **Misdiagnosis:** Up to 30% of crop loss occurs due to late or incorrect identification of pests and diseases.
*   **Logistical Friction:** Even with a diagnosis, farmers struggle to find specific treatments in their immediate vicinity.
*   **Information Silos:** Local weather data is rarely integrated directly into treatment protocols.

AgroCare AI solves these by providing an end-to-end recovery loop: **Identify -> Predict -> Locate.**

---

## 3. System Architecture
The application is built on a modular, frontend-heavy architecture that prioritizes immediate feedback and grounded data.

*   **Inference Layer:** Uses Gemini 3 Pro for vision-based diagnostics and Gemini 2.5 Flash for geospatial grounding and weather impact reasoning.
*   **Grounded Mapping:** Integrates Leaflet GIS for spatial visualization.
*   **Geocoding Engine:** A custom Gemini-driven service that converts textual store descriptions into precise coordinates.
*   **Motion System:** A centralized physics engine (Framer Motion) that handles the tactile feel of the UI.
*   **Data Layer:** Real-time integration with Open-Meteo for hyper-local environmental telemetry.

---

## 4. Workflow
1.  **Input:** The user captures a high-resolution image of a diseased crop using the `VisionScanner`.
2.  **Analysis:** The image is sent to the `Pathology Engine` (Gemini 3 Pro) which returns a structured diagnostic report.
3.  **Contextualization:** The system fetches local weather data and asks Gemini to predict the disease progression based on the 5-day forecast.
4.  **Action:** The user triggers a "Regional Search," where Gemini finds stores (Google Maps Grounding) and the `Geocoding Service` places them accurately on the map.

---

## 5. User Flow
1.  **Dashboard:** View current weather and soil moisture trends.
2.  **Smart Scan:** Open the viewfinder, align the leaf, and capture.
3.  **Result Panel:** Review the disease name, confidence score, and treatment plan.
4.  **Supplier Map:** Switch to map view to see verified vs. estimated store locations.
5.  **Intelligence Chat:** Ask follow-up questions to the virtual agronomist.

---

## 6. Features & Functionality
*   **Tactile Vision Scanner:** A specialized viewfinder that uses a center-weighted crop for high-precision AI analysis.
*   **AI Pathologist:** Structured diagnostics including urgency levels and specific chemical/organic recommendations.
*   **Soil Moisture Predictor:** A Recharts-powered visualization that simulates moisture trends based on precipitation probability.
*   **Grounded Supplier Map:** Displays stores found via Google Search/Maps tools.
*   **Proximity Engine:** Automatically calculates distance (KM) from the user’s GPS coordinates.
*   **Interactive Chatbot:** A Gemini-powered assistant that retains context for deep-dive agricultural questions.

---

## 7. Tech Stack
*   **Framework:** React 19 (ES6 Modules)
*   **AI SDK:** `@google/genai` (Gemini 3 Pro Preview / Gemini 2.5 Flash)
*   **Animation:** Framer Motion (Spring Physics)
*   **Styling:** Tailwind CSS (Custom "Grounded Realism" shadows and glassmorphism)
*   **GIS:** Leaflet.js with CARTO Voyager tiles
*   **Charts:** Recharts
*   **Weather API:** Open-Meteo (Open Source)

---

## 8. Installation & Setup
### Prerequisites
*   Node.js (LTS recommended)
*   A valid **Google Gemini API Key**

### Setup
1.  Clone the project root.
2.  Ensure `process.env.API_KEY` is configured in your execution environment.
3.  Run the application using your preferred web server or development environment.

---

## 9. Configuration
*   **Model Selection:** 
    *   Diagnostics: `gemini-3-pro-preview`
    *   Grounding/Geocoding: `gemini-2.5-flash`
*   **Geospatial Radius:** Default radius for local search is 20km (Configurable in `localStoreService.ts`).
*   **Camera Resolution:** Viewfinder captures at 1024x1024 for optimal feature extraction.

---

## 10. Usage Guide
### Performing a Diagnosis
1. Click **Smart Scan**.
2. Allow camera and location permissions.
3. Place the affected leaf in the center focus area.
4. Press the capture button and wait for "Extracting Features..." to complete.

### Finding Treatments
1. Once a diagnosis is received, click **Locate Regional Suppliers**.
2. Toggle between **List** and **Map** views.
3. Look for the "Verified" icon for established partners.

---

## 11. Data Flow & Logic
1.  **Geo-Context:** `navigator.geolocation` -> `userPos` state.
2.  **Weather:** `userPos` -> `fetchWeatherForecast` -> `weather` state.
3.  **Diagnosis:** `base64Image` -> `analyzeCropHealth` (Gemini) -> `result` state.
4.  **Geocoding:** `Store Title` + `userPos` -> `geocodePlace` (Gemini) -> `Map Marker`.

---

## 12. Error Handling & Edge Cases
*   **Missing API Key:** The system will gracefully fail with a console error if `process.env.API_KEY` is undefined.
*   **Blurred Images:** The prompt specifically instructs Gemini to flag if it cannot parse features.
*   **Uncertain Geocoding:** If coordinates cannot be precisely found, the UI displays a "Location Estimated" badge on the store card.
*   **Offline Mode:** `localStoreService` provides fallback mock data based on real-time location offsets if the grounding tool fails.

---

## 13. Security Considerations
*   **API Key Protection:** The API key is handled server-side/environmentally to prevent exposure in client-side code bundles.
*   **Permission Scoping:** Camera and Location permissions are requested only when required for functional parity.

---

## 14. Future Enhancements
*   **Multilingual Support:** Localizing prompts and results into Hindi, Marathi, and other regional dialects.
*   **Edge Processing:** Exploring TensorFlow.js for initial on-device image preprocessing.
*   **Community Grounding:** Allowing farmers to verify stock levels manually (Crowdsourcing).
*   **PWA Offline Mode:** Full offline diagnostic support using Gemini Nano.

---

## 15. Conclusion
AgroCare AI represents the next step in agricultural technology—one where the complexity of generative AI is hidden behind a simple, tactile, and grounded user experience. By merging real-time environmental data with planetary-scale intelligence, we ensure that every farmer has access to world-class expertise in the palm of their hand.
