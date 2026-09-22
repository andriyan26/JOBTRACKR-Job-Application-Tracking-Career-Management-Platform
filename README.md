# JOBTRACKR — Job Application Tracking & Career Management Platform

> **Track Every Application. Build Your Career.**

JOBTRACKR is a modern personal job application command center designed to help fresh graduates, job seekers, and career switchers track, organize, and manage every stage of their job hunting journey in one unified interface.

---

## ✨ Features

- **🖥️ Operations Dashboard Layout (Image 1 Inspired)**:
  - Clean top navbar with active season status pill, alert notifications counter, theme toggle, and profile settings.
  - Collapsible left sidebar with live count badges for active submissions.
  - 5 core statistics cards: Total Applied, In Interview, Approved (Offers), Rejected, and No Response.
  - **Needs Your Attention** priority alert system recommending follow-ups after 7 days without response.
  - Visual **Application Pipeline** tracking progress from submission to offer.
  - Activity over time chart with interactive period filters (7D, 30D, 3M, 6M, 1Y).
- **📋 Applications Hub (Table & Card Views)**:
  - Centralized location for searching, filtering, and adding new applications.
  - Full 10-column data table and modern card grid view.
  - Smart dynamic relative dates (*Today*, *1 day ago*, *7 days ago*) with full date tooltips on hover.
  - Multi-criteria filtering by Status, Source (LinkedIn, JobStreet, Glints, etc.), and Date ranges.
- **🕒 Chronological Timeline & Status History**:
  - Detailed application view logging milestones (Application Created, Viewed, Interview Invitation, Technical Interview, Offer).
  - Status transitions automatically log previous status, new status, change timestamp, and transition notes into history.
- **📅 Schedule & Calendar**:
  - Monthly view of upcoming interviews, assessments, follow-ups, and reminders.
- **📊 Metrics & Analytics**:
  - Exact KPI formulas: Application Success Rate, Interview Conversion Rate, and Employer Response Rate.
  - Applications by platform source, status donut distribution, and geographic breakdown.
  - Data-driven career intelligence tips based on live submission metrics.
- **⚙️ Top-Bar System Settings**:
  - Isolated top-level settings modal for personal career info, target salary, Dark/Light mode preference, JSON data export backup, and demo reset tools.
- **🎥 Atmospheric Video-Background Landing Page & Auth (Image 2 Inspired)**:
  - Looping ambient video background (`public/VIDEO.mp4`) positioned behind the hero text and auth modal.
  - Dual-panel floating glassmorphic card with smooth transitions between Login and Signup.

---

## 🛠️ Technology Stack

- **Frontend**: React 18
- **Bundler & Dev Server**: Vite 5
- **Design System**: Vanilla CSS with modern tokens, glassmorphism, responsive grid, and dark/light themes
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/andriyan26/JOBTRACKR-Job-Application-Tracking-Career-Management-Platform.git

# 2. Navigate into project directory
cd JOBTRACKR-Job-Application-Tracking-Career-Management-Platform

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

The application will be running at `http://localhost:5173/`.

---

## 📂 Project Structure

```
├── public/
│   ├── VIDEO.mp4           # Looping background video
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── applications/   # Table view, card view, add/edit modal, details timeline
│   │   ├── auth/           # Image 2 inspired video-background auth modal
│   │   ├── calendar/       # Monthly interview schedule & calendar view
│   │   ├── dashboard/      # Stat cards, pipeline, attention alerts, activity chart
│   │   ├── landing/        # Hero landing page with video background
│   │   ├── layout/         # Top navbar, collapsible sidebar, mobile bottom nav
│   │   ├── reminders/      # Follow-up reminder scheduler
│   │   └── settings/       # Top-bar system settings modal
│   ├── context/            # AuthContext, JobContext, ThemeContext
│   ├── services/           # Storage service, dummy data, date utility functions
│   ├── styles/             # Modular CSS stylesheets
│   ├── App.jsx             # Main router and state manager
│   ├── index.css           # Global design tokens and dark/light variables
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 📄 License

This project is licensed under the MIT License.
