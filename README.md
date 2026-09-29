# HabitTrack — Modern Responsive Habit Tracker Web Application

A clean, responsive, and feature-rich **Habit Tracker** web application designed to help users establish and maintain daily routines with consistency.

---

## 🌟 Key Features

### 1. Dashboard
- **Live System Date**: Displays today's full formatted date (e.g. *Monday, September 28, 2026*).
- **Hero Progress Ring**: Visual SVG circular chart showing today's completion percentage with adaptive motivational messages.
- **Top Metrics Grid**:
  - 📋 **Total Habits**: Count of active habits.
  - 🎯 **Completed Today**: Number of tasks finished today.
  - ⏳ **Remaining**: Number of tasks pending today.
  - 📈 **Completion Rate**: Real-time percentage indicator.
- **Quick Habits Checklist**: Check off habits directly from the dashboard.
- **Consistency & Streak**: Active consecutive day streak counter and weekly completion rate.

### 2. Daily Tasks
- **Habit Routine Descriptions & Daily Guidelines**:
  - Each habit features an actionable routine description/guide to follow every day (e.g., *"Wake up by 6:30 AM, drink a tall glass of water, and get 10 minutes of morning sunlight"*).
  - Clean `📝` routine badges displayed directly under each task title.
  - Editable via both the inline form and the Edit Habit modal.
- **Daily Focus & Routine Guide Card**:
  - A prominent banner at the top of the Daily Tasks view displaying your personal daily mantra, rules, and intentions to follow.
  - Interactive **Edit Guide** button allowing you to personalize your daily rules with instant localStorage auto-saving.
  - Quick clickable habit tags (`💧 Stay Hydrated`, `📵 Deep Focus Time`, `🏃 30m Active Movement`, `⚡ 1% Better Every Day`).
- **Habit Cards**: Clean card design with custom animated checkboxes, category badge pills, emoji icons, and task titles.
- **Completed Visual Indicators**: Instant strikethrough animation, subtle dimming, green check badge, and optional celebratory sound effect.
- **Progress Bar**: Real-time `X / Y tasks completed` ratio and animated gradient progress bar.
- **Add New Habit**:
  - Quick inline form with both habit name and optional routine guide input.
  - Modal form accessible from the top navigation bar with category, routine description, & emoji pickers.
- **Edit & Delete Habits**:
  - **Edit**: Edit habit name, category, routine description, and custom emoji icon.
  - **Delete**: Custom non-blocking modal confirmation that safely removes the habit while preserving historical archives.
- **Filters**: Quickly filter by **All**, **Pending**, or **Completed** habits with real-time count badges.
- **Celebration Mode**: Automatic confetti explosion when reaching 100% completion for today!

### 3. Task History & Archives
- **Interactive Date Picker**: Jump to any past date via the date picker or convenient shortcut pills (*Today*, *Yesterday*, *2 Days Ago*, *3 Days Ago*).
- **Stepping Controls**: Previous Day (`<`) and Next Day (`>`) buttons to step through historical logs.
- **Selected Day Overview**:
  - Formatted date heading (e.g., `September 28, 2026`).
  - Progress summary: `Progress: 3/4 — 75%`.
  - Metrics row: Total tasks, Completed, Incomplete, and Completion Rate.
  - Historical progress bar.
- **Completed vs. Incomplete Task Lists**:
  - Completed habits marked with `✅`.
  - Incomplete habits marked with `❌`.
- **Previous Days Feed**: Visual cards showing recent days with mini progress bars for fast browsing.

### 4. UI / UX Design
- **Light & Dark Mode**: Persistent theme switcher with smooth transition effects and zero screen-flash on load.
- **Responsive Layout**: Designed for mobile phones, tablets, and desktop displays with an adaptive navigation drawer on mobile screens.
- **Offline & Zero Dependencies**: 100% vanilla HTML5, CSS3, and JavaScript. No external build steps, CDNs, or frameworks required.
- **Audio Feedback**: Synthesized subtle chime sounds via Web Audio API on task completion (runs entirely offline without external audio files).

---

## 💾 Data Persistence (localStorage)

All state is saved locally in the browser:
- `habittrack_habits`: Active list of habits.
- `habittrack_history`: Date-indexed history objects (`YYYY-MM-DD`) containing individual habit statuses for each day.
- `habittrack_theme`: Selected theme (`light` or `dark`).

### Pre-loaded Sample Habits
On first load, the app automatically initializes with the 7 suggested habits:
1. 🌅 **Wake up early** *(Daily Routine)*
2. 💪 **Exercise / Gym** *(Health & Fitness)*
3. ☕ **Study Java** *(Coding & Tech)*
4. 💻 **Practice HTML & CSS** *(Coding & Tech)*
5. 🗄️ **Practice SQL** *(Coding & Tech)*
6. 📚 **Read a book** *(Study & Learning)*
7. 🌙 **Sleep on time** *(Daily Routine)*

*(A "Reset Sample Habits" button is also provided in the footer to restore default sample habits and historical records at any time).*

---

## 🚀 How to Run

Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari):

```bash
# Double-click index.html or run in PowerShell / Command Prompt:
Start-Process index.html
```

---

## 📁 File Structure

```
habbit/
│
├── index.html       # Semantic HTML5 layout (Dashboard, Daily Tasks, History, Modals)
├── css/
│   └── style.css    # CSS3 design tokens, responsive grid, light/dark mode themes
├── js/
│   └── app.js       # Application logic, localStorage manager, UI renderer, confetti & audio
└── README.md        # Documentation and feature guide
```
