ReviewScope

AI-Powered Review Integrity Analysis

Analyze batches of online reviews to detect coordination patterns and integrity signals using a multi-stage Gemini 3 pipeline. ReviewScope helps researchers, platforms, and businesses uncover trends and anomalies without labeling reviews as “fake” or “real.”


---

🚀 Features

Paste or batch-upload 30–50 reviews for analysis

Multi-stage Gemini 3 AI pipeline:

1. Pattern Discovery: Detect linguistic similarity, hyperbolic sentiment, and template phrases


2. Coordination Analysis: Examine timing patterns, rating-text mismatches, and suspicious bursts


3. Integrity Assessment: Generate manipulation likelihood bands (Low / Medium / High) with confidence scores and key signals



Real-time analysis progress visualization

Interactive dashboard with tabs for Overview, Patterns, Clusters, Timeline

Cluster visualization highlighting potential coordinated groups

Timeline charts showing suspicious posting bursts

Past analysis storage with full reconstruction of results

Ethical framing: probabilistic signals only, no “fake/real” labeling



---

🛠 Architecture

User Input --> Preprocessing --> Pattern Discovery --> Coordination Analysis --> Integrity Assessment --> Dashboard
       |             |                 |                        |                         |
       v             v                 v                        v                         v
Language Detection  Gemini 3 Call #1  Gemini 3 Call #2        Gemini 3 Call #3

Frontend: React app hosted on Lovable Cloud, dark analytics theme, teal/cyan accents

Backend / AI: Multi-stage Gemini 3 reasoning pipeline

Database: Lovable Cloud DB (Supabase-style) stores review batches and analysis results

Visualization: Clusters, timelines, key signals, and manipulation bands



---

⚙️ Installation

> ReviewScope is hosted on Lovable Cloud. For local development:



git clone https://github.com/BRANOPODCAST/ReviewScope.git

cd reviewscope

npm install

npm start

Requires Node.js >=16

Uses Lovable Cloud AI for Gemini 3 multi-stage analysis



---

💡 Usage

1. Open the app and paste 30–50 reviews into the input box.


2. Optionally, name your batch (e.g., “Product X Reviews – Jan 2026”).


3. Click Analyze Review Integrity.


4. Wait for the multi-stage pipeline to complete.


5. Explore results in the dashboard:

Overview: Manipulation likelihood band, confidence score

Patterns & Clusters: Highlighted review groups

Timeline: Density chart showing suspicious bursts

Key Signals: Textual signals detected by Gemini 3





---

⚠️ Limitations

Sample sizes <50 may yield less statistically robust results

Analysis does not identify reviews as “fake” or “real”

Temporal or metadata signals require additional data for full confidence

Multi-language detection may vary for low-resource languages

Research/demo tool only; intended for educational and analytical purposes



---

🛠 Built With

Languages & Frameworks: React, JavaScript, HTML, CSS

Platforms & Cloud: Lovable Cloud (frontend + backend + DB)

AI / APIs: Gemini 3 (multi-stage reasoning)

Design / Visualization: Dark analytics dashboard inspired by Splunk/Datadog, JetBrains Mono + clean sans-serif fonts



---

🔮 Future Plans

PDF / JSON export of analysis results

Real-time streaming of analysis stages with SSE

Integration with review platform APIs for direct analysis

Browser extension for on-page review analysis


---

📄 License

MIT License © 2026 Ilias Elabdi


---
