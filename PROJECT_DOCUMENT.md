# AgroCare AI: Grounded Intelligence for the Last-Mile Farmer

**Tagline:** Bridging the agricultural expertise gap through tactile AI diagnostics and localized supply chain grounding.  
**Focus Area:** Agriculture & Food Security  
**Technology Stack:** React 19, Google Gemini API (3 Pro & 2.5 Flash), Framer Motion (Physics Engine), Google Maps Grounding.

---

## 1. Problem Statement: The Expert Gap
In rural agricultural hubs, particularly across India, the ratio of agricultural experts to farmers is approximately **1:3,000**. This scarcity results in:
*   **Preventable Crop Loss:** Up to 20% of annual yields are lost to misdiagnosed pests and diseases.
*   **Resource Mismanagement:** Incorrect application of fertilizers/pesticides due to "guesswork" diagnostics, leading to soil degradation.
*   **Economic Fragility:** Smallholder farmers lose significant seasonal income due to delayed treatment, often missing the critical 48-hour window for infection control.

---

## 2. Solution Overview
**AgroCare AI** is a professional-grade diagnostic tool designed with **Grounded Realism**. It transforms a standard smartphone into a "Smart Sensor" that guides farmers through a 3-step recovery loop:

1.  **Calibrated Vision Scanning:** A tactile viewfinder ensures high-quality leaf samples are captured, reducing "noise" for the AI.
2.  **Generative Diagnostics:** Utilizing **Gemini 3 Pro**, the app provides a confidence-scored pathology report and a multi-step treatment plan.
3.  **Hybrid Resource Mapping:** Using **Gemini 2.5 Flash with Google Maps Grounding**, the app connects the farmer to the nearest verified supplier who has the specific treatment in stock.

---

## 3. Technical Architecture
### AI Inference Layer
*   **Pathology Engine:** Uses `gemini-3-pro-preview` for high-precision visual feature extraction. The model is prompted as a "Senior Plant Pathologist" to provide actionable, structured JSON data.
*   **Geospatial Grounding:** Employs `gemini-2.5-flash` with the `googleMaps` tool. This allows real-world verification of store locations, ensuring farmers aren't directed to defunct or irrelevant businesses.
*   **Contextual Chat:** A dedicated `gemini-3-pro` chat session maintains history, allowing farmers to ask follow-up questions about safety and application protocols.

### UI/UX: The "Material Illusion"
Unlike standard "flat" web apps, AgroCare AI uses a **Tactile Motion System**:
*   **Physics-Aware Transitions:** Every button uses a spring-physics model (`stiffness: 400, damping: 20`) to simulate the feel of heavy-duty field equipment.
*   **Grounded Realism:** High-refraction plastic textures (Material Matte) and soft-lit shadows provide visual cues that aid users with lower digital literacy by mimicking physical objects.

---

## 4. Prototype Walkthrough & Features
*   **VisionScanner:** Implements real-time camera feed with a "Leaf Alignment" overlay.
*   **Telemetry Dashboard:** Displays simulated environmental data (Soil Moisture, Humidity) to provide context to the AI diagnostics.
*   **Tactile Action Bar:** Verified suppliers include a "Call Store" action directly in the result card, minimizing the steps between diagnosis and action.
*   **Offline-First Readiness:** The store locator uses a Haversine-based local search (`localStoreService.ts`) to provide immediate results even in low-connectivity areas.

---

## 5. Impact & Scalability
### Social & Economic Impact
*   **Yield Preservation:** Targeted diagnostics can save an average of ₹5,000–₹12,000 per acre by preventing total crop failure.
*   **Expert Access:** Provides a 24/7 "virtual agronomist," effectively bringing the expert ratio to 1:1.

### Scalability Roadmap
1.  **Phase 1 (MVP):** Diagnostic for 10 core regional crops (Rice, Wheat, Cotton, etc.) using Gemini 3 Pro.
2.  **Phase 2 (Growth):** Integration with the **ICAR (Indian Council of Agricultural Research)** datasets for deeper localized pest trends.
3.  **Phase 3 (Production):** Deployment as a **PWA (Progressive Web App)** with edge-cached AI models for true 100% offline diagnostics in remote zones.

---

## 6. Conclusion
AgroCare AI is not just an app; it is a **digital extension of the farm**. By combining the reasoning power of Gemini with a UI that respects the tactile nature of farming, we bridge the gap between advanced technology and the hands that feed the world.

**Submission for:** Microsoft Imagine Cup 2025  
**Developer:** Sujan  
**GitHub Repository:** [Link to your repo]  
**Demo Video:** [Link to your video]
