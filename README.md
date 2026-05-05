# ⚡ Code-Break Arena

Code-Break Arena is a robust, full-stack web application designed for algorithmic combat and community-driven coding challenges. It serves as a platform where developers can author complex programming puzzles, test their logic against hidden test cases, and compete on global leaderboards for the fastest execution times.

**Author:** Bibesh Sedhain  
**Course:** CSCI 375 Software Engineering  

---

## 🏗️ System Architecture & Tech Stack

This project implements a decoupled frontend and backend architecture, connected via a secure RESTful API, with automated CI/CD pipelines protecting production deployments.

* **Frontend:** React 18, Vite, TypeScript, React Router DOM
* **UI/UX:** Material UI (MUI) featuring a custom responsive, dark-themed glassmorphic design
* **Backend:** Python, Django, Django REST Framework (DRF)
* **Database:** Relational Database via Django ORM (SQLite/PostgreSQL)
* **Authentication:** Firebase Authentication (Google OAuth, Email/Password, Anonymous Guest)
* **Execution Engine:** JDoodle Compiler API (via custom Python service wrapper)
* **Testing:** Vitest + React Testing Library (Frontend), Pytest + Django DB Marker (Backend)
* **Hosting / CI-CD:** Vercel (Frontend), Render (Backend)

---

## 🎯 CSCI 375 Requirements Mapping

This project was engineered to meet and exceed all core and stretch requirements outlined in the CSCI 375 Software Engineering Project rubric.

### Core Functionality (Completed)
* **Create a challenge with multiple questions and correct answers:** Implemented via the *Maker Workshop*, allowing users to define challenge descriptions, difficulty levels, and hidden I/O test cases.
* **See all created challenges:** Implemented via the *Maker Portfolio* within the user Profile dashboard.
* **Delete created challenges:** Implemented with secure ownership-checking API endpoints.
* **Complete challenges made by other users:** Implemented via the *Arena*, featuring an integrated Monaco Editor for syntax highlighting and live code execution.
* **Reveal answers to another user's challenge:** Implemented with an **Ethical UX Guardrail**. Users cannot freely view solutions; the API explicitly blocks the `/reveal/` endpoint until the user has registered at least 3 failed execution attempts in the database.
* **Login / Authentication:** Fully implemented Firebase Authentication handling Google OAuth, standard Email/Password, and a fallback Anonymous Guest tier.
* **Basic Unit Testing:** Implemented decoupled testing suites using Vitest (Frontend UI state and mock APIs) and Pytest (Backend models, security views, and external API mocking).

### Additional "Stretch" Features
To achieve the highest technical grading tier, this project implements the following advanced features requiring expertise beyond standard coursework:

1.  **API Integration (Live Execution Engine):** Rather than hardcoding answers, the backend integrates the **JDoodle Compiler API**. User-submitted code is securely wrapped with hidden test cases, sent over the network to a sandbox container, compiled, executed, and evaluated dynamically based on standard output (`stdout`).
2.  **Leadership Boards & Advanced Metrics:** A custom `UserMetrics` relational model tracks aggregated attempt counts, completion status, and high-precision execution times. The leaderboard dynamically filters uncompleted runs and sorts by the fastest algorithm.
3.  **Mobile Design & Responsive Architecture:** The UI utilizes Material UI's Grid system and conditional rendering to ensure the complex side-by-side IDE layout of the Arena gracefully degrades into a stacked, mobile-friendly interface on smaller screens.
4.  **Relational Database Integration:** To satisfy the Exemplary tier for Database architecture, this project bypassed standard Firebase Firestore in favor of a full Django Relational Database, allowing for complex metric aggregation, foreign key relationships between Users and Challenges, and precise data integrity checks.

---

## 🛡️ CI/CD & Automated Testing

The project utilizes automated Continuous Integration and Continuous Deployment to protect the live environments on Vercel and Render.


