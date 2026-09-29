/**
 * ============================================================================
 * HABITTRACK — DAILY HABIT & TASK TRACKER
 * Fully functional modern web app with LocalStorage persistence,
 * real-time statistics, streak calculation, and interactive task history.
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Storage Keys & Constants
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    HABITS: 'habittrack_habits',
    HISTORY: 'habittrack_history',
    THEME: 'habittrack_theme',
    DAILY_FOCUS: 'habittrack_daily_focus'
  };

  // Initial Sample Habits with daily routine guidelines:
  const INITIAL_HABITS = [
    {
      id: 'habit_sample_1',
      name: 'Wake up early',
      category: 'Routine',
      icon: '🌅',
      description: 'Wake up by 6:30 AM, drink a tall glass of water, and get 10 minutes of morning sunlight.',
      createdAt: '2026-09-25T06:00:00.000Z'
    },
    {
      id: 'habit_sample_2',
      name: 'Exercise / Gym',
      category: 'Health',
      icon: '💪',
      description: '30-45 minutes workout: stretching, bodyweight exercises, or gym session.',
      createdAt: '2026-09-25T07:00:00.000Z'
    },
    {
      id: 'habit_sample_3',
      name: 'Study Java',
      category: 'Coding',
      icon: '☕',
      description: 'Review OOP concepts, practice collections, and build sample code for 45 minutes.',
      createdAt: '2026-09-25T08:00:00.000Z'
    },
    {
      id: 'habit_sample_4',
      name: 'Practice HTML & CSS',
      category: 'Coding',
      icon: '💻',
      description: 'Build modern UI components, flexbox/grid layouts, and responsive designs.',
      createdAt: '2026-09-25T09:00:00.000Z'
    },
    {
      id: 'habit_sample_5',
      name: 'Practice SQL',
      category: 'Coding',
      icon: '🗄️',
      description: 'Write queries with joins, aggregations, and subqueries on sample databases.',
      createdAt: '2026-09-25T10:00:00.000Z'
    },
    {
      id: 'habit_sample_6',
      name: 'Read a book',
      category: 'Study',
      icon: '📚',
      description: 'Read at least 20 pages of a non-fiction or programming book before bed.',
      createdAt: '2026-09-25T11:00:00.000Z'
    },
    {
      id: 'habit_sample_7',
      name: 'Sleep on time',
      category: 'Routine',
      icon: '🌙',
      description: 'Turn off screens 30 minutes before 11:00 PM and get 7-8 hours of restful sleep.',
      createdAt: '2026-09-25T12:00:00.000Z'
    }
  ];

  // Category Icon Presets
  const CATEGORY_DEFAULT_ICONS = {
    Health: '🏃',
    Study: '📚',
    Coding: '💻',
    Mindfulness: '🧘',
    Routine: '⏰',
    Productivity: '⚡'
  };

  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  const state = {
    habits: [],
    history: {},
    currentDateStr: '',
    selectedHistoryDateStr: '',
    activeTab: 'dashboard',
    activeFilter: 'all', // 'all' | 'pending' | 'completed'
    theme: 'light',
    pendingDeleteHabitId: null,
    dailyFocus: 'Stay disciplined today. Break complex tasks into small steps, stay hydrated, eliminate phone distractions during study/practice, and show up consistently.'
  };

  // --------------------------------------------------------------------------
  // Date Utilities
  // --------------------------------------------------------------------------
  function formatLocalDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateFromYYYYMMDD(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function formatFullDate(dateStr) {
    const date = parseDateFromYYYYMMDD(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function formatMediumDate(dateStr) {
    const date = parseDateFromYYYYMMDD(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function getOffsetDateStr(baseDateStr, dayOffset) {
    const d = parseDateFromYYYYMMDD(baseDateStr);
    d.setDate(d.getDate() + dayOffset);
    return formatLocalDateToYYYYMMDD(d);
  }

  // --------------------------------------------------------------------------
  // LocalStorage Persistence Layer
  // --------------------------------------------------------------------------
  function loadFromStorage() {
    try {
      const storedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
      const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      const storedFocus = localStorage.getItem(STORAGE_KEYS.DAILY_FOCUS);

      if (storedTheme) {
        state.theme = storedTheme;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        state.theme = 'dark';
      }

      if (storedFocus) {
        state.dailyFocus = storedFocus;
      }

      if (storedHabits) {
        state.habits = JSON.parse(storedHabits);
        // Ensure description field exists for all habits
        state.habits.forEach(h => {
          if (h.description === undefined) {
            const sampleMatch = INITIAL_HABITS.find(ih => ih.name.toLowerCase() === h.name.toLowerCase());
            h.description = sampleMatch ? sampleMatch.description : '';
          }
        });
      } else {
        // Initialize default sample habits
        state.habits = [...INITIAL_HABITS];
        saveHabits();
      }

      if (storedHistory) {
        state.history = JSON.parse(storedHistory);
      } else {
        // Seed past days history for demonstration
        seedInitialHistory();
      }
    } catch (err) {
      console.error('Error loading state from localStorage:', err);
      state.habits = [...INITIAL_HABITS];
      state.history = {};
    }
  }

  function saveHabits() {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(state.habits));
    } catch (err) {
      console.error('Failed to save habits:', err);
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  }

  function saveDailyFocus(focusText) {
    try {
      state.dailyFocus = focusText;
      localStorage.setItem(STORAGE_KEYS.DAILY_FOCUS, focusText);
    } catch (err) {
      console.error('Failed to save daily focus:', err);
    }
  }

  function saveTheme() {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    } catch (err) {
      console.error('Failed to save theme:', err);
    }
  }

  // Seed sample previous days so history is immediately rich and demonstrates requirements
  function seedInitialHistory() {
    state.history = {};
    const today = new Date();
    const todayStr = formatLocalDateToYYYYMMDD(today);

    // Yesterday
    const yestDate = new Date(today);
    yestDate.setDate(today.getDate() - 1);
    const yestStr = formatLocalDateToYYYYMMDD(yestDate);

    // 2 Days ago
    const twoDaysDate = new Date(today);
    twoDaysDate.setDate(today.getDate() - 2);
    const twoDaysStr = formatLocalDateToYYYYMMDD(twoDaysDate);

    // 3 Days ago
    const threeDaysDate = new Date(today);
    threeDaysDate.setDate(today.getDate() - 3);
    const threeDaysStr = formatLocalDateToYYYYMMDD(threeDaysDate);

    // Populate 3 days ago (e.g., 6/7 completed)
    buildDayRecord(threeDaysStr, [
      'habit_sample_1',
      'habit_sample_2',
      'habit_sample_3',
      'habit_sample_4',
      'habit_sample_5',
      'habit_sample_6'
    ]);

    // Populate 2 days ago (e.g., 5/7 completed)
    buildDayRecord(twoDaysStr, [
      'habit_sample_1',
      'habit_sample_2',
      'habit_sample_3',
      'habit_sample_6',
      'habit_sample_7'
    ]);

    // Populate yesterday (e.g., 5/7 completed)
    buildDayRecord(yestStr, [
      'habit_sample_1',
      'habit_sample_2',
      'habit_sample_3',
      'habit_sample_4',
      'habit_sample_6'
    ]);

    // Populate today with 3 completed initially so progress is visible immediately (3/7 tasks)
    buildDayRecord(todayStr, [
      'habit_sample_1',
      'habit_sample_2',
      'habit_sample_3'
    ]);

    saveHistory();
  }

  function buildDayRecord(dateStr, completedIds = []) {
    const record = {
      date: dateStr,
      records: {},
      total: state.habits.length,
      completed: 0,
      percentage: 0
    };

    state.habits.forEach(habit => {
      const isCompleted = completedIds.includes(habit.id);
      record.records[habit.id] = {
        id: habit.id,
        name: habit.name,
        category: habit.category,
        icon: habit.icon,
        description: habit.description || '',
        completed: isCompleted
      };
      if (isCompleted) record.completed += 1;
    });

    record.total = state.habits.length;
    record.percentage = record.total > 0 ? Math.round((record.completed / record.total) * 100) : 0;
    state.history[dateStr] = record;
  }

  // Ensure current day has a history entry synced with habits
  function ensureDateRecord(dateStr) {
    if (!state.history[dateStr]) {
      state.history[dateStr] = {
        date: dateStr,
        records: {},
        total: state.habits.length,
        completed: 0,
        percentage: 0
      };
    }

    const dayEntry = state.history[dateStr];
    if (!dayEntry.records) dayEntry.records = {};

    // Synchronize habits with current habit list
    state.habits.forEach(habit => {
      if (!dayEntry.records[habit.id]) {
        dayEntry.records[habit.id] = {
          id: habit.id,
          name: habit.name,
          category: habit.category,
          icon: habit.icon,
          description: habit.description || '',
          completed: false
        };
      } else {
        // Keep updated name/category/icon/description
        dayEntry.records[habit.id].name = habit.name;
        dayEntry.records[habit.id].category = habit.category;
        dayEntry.records[habit.id].icon = habit.icon;
        dayEntry.records[habit.id].description = habit.description || '';
      }
    });

    recalculateDayStats(dateStr);
    saveHistory();
  }

  function recalculateDayStats(dateStr) {
    const dayEntry = state.history[dateStr];
    if (!dayEntry || !dayEntry.records) return;

    let total = 0;
    let completed = 0;

    Object.values(dayEntry.records).forEach(rec => {
      total += 1;
      if (rec.completed) completed += 1;
    });

    dayEntry.total = total;
    dayEntry.completed = completed;
    dayEntry.percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  // --------------------------------------------------------------------------
  // Core Habit Actions
  // --------------------------------------------------------------------------
  function toggleHabitToday(habitId) {
    ensureDateRecord(state.currentDateStr);
    const dayEntry = state.history[state.currentDateStr];
    const habitRecord = dayEntry.records[habitId];

    if (!habitRecord) return;

    habitRecord.completed = !habitRecord.completed;
    recalculateDayStats(state.currentDateStr);
    saveHistory();

    // Sound effect & feedback
    playCheckSound(habitRecord.completed);

    if (habitRecord.completed) {
      showToast(`Completed "${habitRecord.name}"! Great job!`, 'success');
      // If 100% completed today, trigger confetti!
      if (dayEntry.total > 0 && dayEntry.completed === dayEntry.total) {
        triggerConfetti();
        showToast('🎉 Outstanding! All habits completed today! You crushed it!', 'success', 4500);
      }
    } else {
      showToast(`Marked "${habitRecord.name}" as pending`, 'info');
    }

    renderApp();
  }

  function addNewHabit(name, category, customIcon, description) {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Please enter a habit name', 'danger');
      return false;
    }

    const icon = customIcon || CATEGORY_DEFAULT_ICONS[category] || '✨';
    const desc = (description || '').trim();
    const newHabit = {
      id: 'habit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      category: category || 'Routine',
      icon: icon,
      description: desc,
      createdAt: new Date().toISOString()
    };

    state.habits.push(newHabit);
    saveHabits();

    // Add to today's records
    ensureDateRecord(state.currentDateStr);
    state.history[state.currentDateStr].records[newHabit.id] = {
      id: newHabit.id,
      name: newHabit.name,
      category: newHabit.category,
      icon: newHabit.icon,
      description: newHabit.description,
      completed: false
    };
    recalculateDayStats(state.currentDateStr);
    saveHistory();

    showToast(`Added habit "${trimmed}"`, 'success');
    renderApp();
    return true;
  }

  function editHabit(habitId, newName, newCategory, newIcon, newDescription) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return false;

    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Habit name cannot be empty', 'danger');
      return false;
    }

    habit.name = trimmed;
    habit.category = newCategory;
    if (newIcon) habit.icon = newIcon;
    if (newDescription !== undefined) habit.description = (newDescription || '').trim();
    saveHabits();

    // Update in history entries
    if (state.history[state.currentDateStr] && state.history[state.currentDateStr].records[habitId]) {
      const rec = state.history[state.currentDateStr].records[habitId];
      rec.name = trimmed;
      rec.category = newCategory;
      if (newIcon) rec.icon = newIcon;
      if (newDescription !== undefined) rec.description = (newDescription || '').trim();
      saveHistory();
    }

    showToast(`Updated "${trimmed}"`, 'success');
    renderApp();
    return true;
  }

  function deleteHabit(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    const habitName = habit ? habit.name : 'Habit';

    // Remove from active habits
    state.habits = state.habits.filter(h => h.id !== habitId);
    saveHabits();

    // Remove from today's history
    if (state.history[state.currentDateStr] && state.history[state.currentDateStr].records[habitId]) {
      delete state.history[state.currentDateStr].records[habitId];
      recalculateDayStats(state.currentDateStr);
      saveHistory();
    }

    showToast(`Deleted "${habitName}"`, 'info');
    renderApp();
  }

  function resetToSampleData() {
    state.habits = [...INITIAL_HABITS];
    saveHabits();
    seedInitialHistory();
    state.selectedHistoryDateStr = state.currentDateStr;
    saveDailyFocus('Stay disciplined today. Break complex tasks into small steps, stay hydrated, eliminate phone distractions during study/practice, and show up consistently.');
    showToast('Reset habits & history to default sample data', 'info');
    renderApp();
  }

  // --------------------------------------------------------------------------
  // Streak & Consistency Calculation
  // --------------------------------------------------------------------------
  function calculateCurrentStreak() {
    let streak = 0;
    let checkDate = new Date();

    // Check today first: if any task completed today, streak includes today
    const todayStr = formatLocalDateToYYYYMMDD(checkDate);
    const todayEntry = state.history[todayStr];
    if (todayEntry && todayEntry.completed > 0) {
      streak += 1;
    }

    // Now look backwards from yesterday
    for (let i = 1; i <= 365; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - i);
      const pastStr = formatLocalDateToYYYYMMDD(pastDate);
      const pastEntry = state.history[pastStr];

      if (pastEntry && pastEntry.completed > 0) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }

  function calculateWeeklyAverage() {
    let totalPcts = 0;
    let daysWithRecords = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatLocalDateToYYYYMMDD(d);
      const entry = state.history[dStr];

      if (entry && entry.total > 0) {
        totalPcts += entry.percentage;
        daysWithRecords += 1;
      }
    }

    return daysWithRecords > 0 ? Math.round(totalPcts / daysWithRecords) : 0;
  }

  // --------------------------------------------------------------------------
  // UI Rendering: Navigation & View Switching
  // --------------------------------------------------------------------------
  function setActiveTab(tabName) {
    state.activeTab = tabName;

    // Update main nav buttons
    document.querySelectorAll('#main-nav .nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update mobile nav buttons
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Close mobile drawer if open
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.remove('open');

    // Update view visibility
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tabName}`);
    });

    // Re-render specific views if needed
    if (tabName === 'history') {
      renderHistoryView();
    } else if (tabName === 'daily') {
      renderDailyView();
    } else if (tabName === 'dashboard') {
      renderDashboardView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // UI Rendering: Dashboard View
  // --------------------------------------------------------------------------
  function renderDashboardView() {
    ensureDateRecord(state.currentDateStr);
    const dayEntry = state.history[state.currentDateStr];
    const total = dayEntry.total;
    const completed = dayEntry.completed;
    const remaining = Math.max(0, total - completed);
    const percentage = dayEntry.percentage;

    // Dates
    const fullDateText = formatFullDate(state.currentDateStr);
    const dateDisplay = document.getElementById('dashboard-date-display');
    if (dateDisplay) dateDisplay.textContent = fullDateText;

    // Dynamic greeting & motivational message
    const greetingEl = document.getElementById('dashboard-greeting');
    const motivationalEl = document.getElementById('dashboard-motivational');
    if (greetingEl && motivationalEl) {
      if (percentage === 100 && total > 0) {
        greetingEl.textContent = 'All Done for Today! 🎉';
        motivationalEl.textContent = 'Incredible job! You completed 100% of your daily habits. Keep this momentum going!';
      } else if (percentage >= 50) {
        greetingEl.textContent = 'Great Progress Today! 🚀';
        motivationalEl.textContent = `You're over halfway there with ${completed} of ${total} habits finished. Keep pushing!`;
      } else if (completed > 0) {
        greetingEl.textContent = 'Good Start to the Day! ✨';
        motivationalEl.textContent = 'Every completed habit builds consistency. Focus on your next task!';
      } else {
        greetingEl.textContent = 'Track Your Daily Habits';
        motivationalEl.textContent = 'Small steps every single day lead to remarkable long-term achievements.';
      }
    }

    // Top Metric Cards
    const statTotal = document.getElementById('stat-total-habits');
    const statCompleted = document.getElementById('stat-completed-habits');
    const statRemaining = document.getElementById('stat-remaining-habits');
    const statPct = document.getElementById('stat-percentage-habits');

    if (statTotal) statTotal.textContent = total;
    if (statCompleted) statCompleted.textContent = completed;
    if (statRemaining) statRemaining.textContent = remaining;
    if (statPct) statPct.textContent = `${percentage}%`;

    // Circular Chart on Hero
    const circleBar = document.getElementById('dashboard-circle-bar');
    const circleText = document.getElementById('dashboard-circle-text');
    if (circleBar && circleText) {
      circleBar.setAttribute('stroke-dasharray', `${percentage}, 100`);
      circleText.textContent = `${percentage}%`;
    }

    // Progress Banner
    const progressRatio = document.getElementById('dashboard-progress-ratio');
    const progressFill = document.getElementById('dashboard-progress-fill');
    const progressPctLabel = document.getElementById('dashboard-progress-pct-label');

    if (progressRatio) progressRatio.textContent = `${completed} / ${total} tasks completed`;
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressPctLabel) progressPctLabel.textContent = `${percentage}%`;

    // Today's Quick Checklist Preview
    renderDashboardHabitsPreview(dayEntry);

    // Consistency & Streak Stats
    renderDashboardConsistency();
  }

  function renderDashboardHabitsPreview(dayEntry) {
    const listEl = document.getElementById('dashboard-habits-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const records = Object.values(dayEntry.records || {});

    if (records.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.875rem;">
          No habits added yet. Click "New Habit" to start!
        </div>
      `;
      return;
    }

    // Show preview habits (up to 5 or all)
    records.forEach(rec => {
      const row = document.createElement('div');
      row.className = `dash-habit-row ${rec.completed ? 'completed' : ''}`;
      row.innerHTML = `
        <div class="dash-habit-left">
          <div class="custom-checkbox-wrap">
            <input type="checkbox" class="custom-checkbox-input dash-toggle" data-id="${rec.id}" ${rec.completed ? 'checked' : ''} aria-label="Toggle ${escapeHtml(rec.name)}">
            <div class="custom-checkbox-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <span style="font-size: 1.15rem;">${rec.icon || '✨'}</span>
          <span class="dash-habit-name">${escapeHtml(rec.name)}</span>
        </div>
        <span class="category-badge ${rec.category ? rec.category.toLowerCase() : 'routine'}">${rec.category || 'Routine'}</span>
      `;

      row.querySelector('.dash-toggle').addEventListener('change', () => {
        toggleHabitToday(rec.id);
      });

      listEl.appendChild(row);
    });
  }

  function renderDashboardConsistency() {
    const streakEl = document.getElementById('streak-counter');
    const bestRateEl = document.getElementById('best-rate');
    const stripEl = document.getElementById('weekly-streak-strip');

    const streak = calculateCurrentStreak();
    const weeklyAvg = calculateWeeklyAverage();

    if (streakEl) streakEl.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
    if (bestRateEl) bestRateEl.textContent = `${weeklyAvg}%`;

    if (stripEl) {
      stripEl.innerHTML = '';
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // Render 7 past days from 6 days ago up to today
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = formatLocalDateToYYYYMMDD(d);
        const dayName = dayNames[d.getDay()];
        const dayNumber = d.getDate();
        const entry = state.history[dStr];

        const isToday = i === 0;
        let statusClass = '';
        let displaySymbol = dayNumber;

        if (entry && entry.total > 0) {
          if (entry.completed === entry.total) {
            statusClass = 'completed';
            displaySymbol = '✓';
          } else if (entry.completed > 0) {
            statusClass = 'partial';
            displaySymbol = `${entry.completed}`;
          }
        }

        const dayItem = document.createElement('div');
        dayItem.className = `streak-day-item ${statusClass} ${isToday ? 'today' : ''}`;
        dayItem.title = `${formatMediumDate(dStr)}: ${entry ? entry.completed + '/' + entry.total + ' completed' : 'No data'}`;
        dayItem.innerHTML = `
          <span class="streak-day-lbl">${dayName}</span>
          <div class="streak-day-circle">${displaySymbol}</div>
        `;

        dayItem.addEventListener('click', () => {
          state.selectedHistoryDateStr = dStr;
          setActiveTab('history');
        });

        stripEl.appendChild(dayItem);
      }
    }
  }

  // --------------------------------------------------------------------------
  // UI Rendering: Daily Tasks View
  // --------------------------------------------------------------------------
  function renderDailyView() {
    ensureDateRecord(state.currentDateStr);
    const dayEntry = state.history[state.currentDateStr];
    const total = dayEntry.total;
    const completed = dayEntry.completed;
    const remaining = Math.max(0, total - completed);
    const percentage = dayEntry.percentage;

    // Header date badge
    const dailyDateBadge = document.getElementById('daily-current-date-badge');
    if (dailyDateBadge) dailyDateBadge.textContent = formatFullDate(state.currentDateStr);

    // Header nav badge count (pending tasks)
    const navBadge = document.getElementById('daily-badge-count');
    if (navBadge) navBadge.textContent = remaining;

    // Daily Focus display
    const focusDisplay = document.getElementById('daily-focus-display');
    const focusInput = document.getElementById('daily-focus-input');
    if (focusDisplay) focusDisplay.textContent = state.dailyFocus;
    if (focusInput && !focusInput.value) focusInput.value = state.dailyFocus;

    // Daily progress card
    const dailyCount = document.getElementById('daily-completion-count');
    const dailyPct = document.getElementById('daily-completion-pct');
    const dailyFill = document.getElementById('daily-progress-fill');

    if (dailyCount) dailyCount.textContent = `${completed} / ${total} tasks completed`;
    if (dailyPct) dailyPct.textContent = `${percentage}%`;
    if (dailyFill) dailyFill.style.width = `${percentage}%`;

    // Filter pill count badges
    const allCountEl = document.getElementById('pill-count-all');
    const pendingCountEl = document.getElementById('pill-count-pending');
    const completedCountEl = document.getElementById('pill-count-completed');

    if (allCountEl) allCountEl.textContent = total;
    if (pendingCountEl) pendingCountEl.textContent = remaining;
    if (completedCountEl) completedCountEl.textContent = completed;

    // Habits List
    renderDailyHabitCards(dayEntry);
  }

  function renderDailyHabitCards(dayEntry) {
    const container = document.getElementById('daily-habits-list');
    const emptyState = document.getElementById('habits-empty-state');
    const summaryText = document.getElementById('tasks-summary-text');
    if (!container) return;

    container.innerHTML = '';
    const allRecords = Object.values(dayEntry.records || {});

    // Filter according to activeFilter
    let filtered = allRecords;
    if (state.activeFilter === 'pending') {
      filtered = allRecords.filter(r => !r.completed);
    } else if (state.activeFilter === 'completed') {
      filtered = allRecords.filter(r => r.completed);
    }

    if (summaryText) {
      if (state.activeFilter === 'pending') {
        summaryText.textContent = `Showing ${filtered.length} pending habits`;
      } else if (state.activeFilter === 'completed') {
        summaryText.textContent = `Showing ${filtered.length} completed habits`;
      } else {
        summaryText.textContent = `Showing all ${filtered.length} habits`;
      }
    }

    if (filtered.length === 0) {
      if (emptyState) {
        emptyState.classList.remove('hidden');
        if (state.activeFilter === 'completed') {
          emptyState.querySelector('.empty-title').textContent = 'No completed habits yet';
          emptyState.querySelector('.empty-desc').textContent = 'Check off your tasks as you complete them throughout the day!';
        } else if (state.activeFilter === 'pending') {
          emptyState.querySelector('.empty-title').textContent = 'All caught up! 🎉';
          emptyState.querySelector('.empty-desc').textContent = 'You have completed all your pending habits for today. Awesome!';
        } else {
          emptyState.querySelector('.empty-title').textContent = 'No habits found';
          emptyState.querySelector('.empty-desc').textContent = 'Add your first habit above to begin building consistency.';
        }
      }
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    filtered.forEach(rec => {
      const card = document.createElement('div');
      card.className = `habit-card ${rec.completed ? 'completed' : ''}`;
      card.id = `habit-card-${rec.id}`;

      card.innerHTML = `
        <div class="habit-left">
          <div class="custom-checkbox-wrap">
            <input 
              type="checkbox" 
              class="custom-checkbox-input habit-checkbox" 
              data-id="${rec.id}" 
              ${rec.completed ? 'checked' : ''} 
              aria-label="Mark ${escapeHtml(rec.name)} as completed"
            >
            <div class="custom-checkbox-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div class="habit-details">
            <div class="habit-title-row">
              <span class="habit-icon">${rec.icon || '✨'}</span>
              <span class="habit-name">${escapeHtml(rec.name)}</span>
              <span class="completed-check-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Done
              </span>
            </div>
            ${rec.description ? `
              <div class="habit-description">
                <span class="habit-description-icon">📝</span>
                <span>${escapeHtml(rec.description)}</span>
              </div>
            ` : ''}
            <div class="habit-meta-row">
              <span class="category-badge ${rec.category ? rec.category.toLowerCase() : 'routine'}">
                ${rec.category || 'Routine'}
              </span>
            </div>
          </div>
        </div>
        <div class="habit-actions">
          <button class="action-btn edit-btn" data-id="${rec.id}" title="Edit habit name, category, and routine guide" aria-label="Edit habit ${escapeHtml(rec.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn delete-btn" data-id="${rec.id}" title="Delete habit" aria-label="Delete habit ${escapeHtml(rec.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      `;

      // Event listener: Checkbox toggle
      const checkbox = card.querySelector('.habit-checkbox');
      checkbox.addEventListener('change', () => {
        toggleHabitToday(rec.id);
      });

      // Event listener: Edit button
      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        openEditHabitModal(rec.id);
      });

      // Event listener: Delete button
      const deleteBtn = card.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        openDeleteModal(rec.id);
      });

      container.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // UI Rendering: Task History View
  // --------------------------------------------------------------------------
  function renderHistoryView() {
    if (!state.selectedHistoryDateStr) {
      state.selectedHistoryDateStr = state.currentDateStr;
    }

    const selectedDateStr = state.selectedHistoryDateStr;
    const datePicker = document.getElementById('history-date-picker');
    if (datePicker) {
      datePicker.value = selectedDateStr;
      datePicker.max = state.currentDateStr; // Cannot select future dates
    }

    // Update Quick Jump Pills
    updateQuickDatePills();

    // Check if record exists for this date
    let dayEntry = state.history[selectedDateStr];

    // If viewing today, ensure it is initialized with today's state
    if (selectedDateStr === state.currentDateStr) {
      ensureDateRecord(state.currentDateStr);
      dayEntry = state.history[state.currentDateStr];
    }

    const formattedDate = formatFullDate(selectedDateStr);
    const dateHeading = document.getElementById('history-formatted-date');
    if (dateHeading) dateHeading.textContent = formattedDate;

    // Status badge
    const statusBadge = document.getElementById('history-status-badge');
    if (statusBadge) {
      if (selectedDateStr === state.currentDateStr) {
        statusBadge.textContent = 'Today\'s Live Log';
      } else {
        statusBadge.textContent = 'Historical Record';
      }
    }

    // Stats
    const total = dayEntry ? dayEntry.total : 0;
    const completed = dayEntry ? dayEntry.completed : 0;
    const incomplete = Math.max(0, total - completed);
    const percentage = dayEntry ? dayEntry.percentage : 0;

    // Display exact requirement format: Progress: 3/4 — 75%
    const progressLabel = document.getElementById('history-progress-label');
    if (progressLabel) {
      progressLabel.textContent = `Progress: ${completed}/${total} — ${percentage}%`;
    }

    // Stat badges
    const statTot = document.getElementById('history-stat-total');
    const statComp = document.getElementById('history-stat-completed');
    const statIncomp = document.getElementById('history-stat-incomplete');
    const statPct = document.getElementById('history-stat-percentage');
    const progressFill = document.getElementById('history-progress-fill');

    if (statTot) statTot.textContent = total;
    if (statComp) statComp.textContent = completed;
    if (statIncomp) statIncomp.textContent = incomplete;
    if (statPct) statPct.textContent = `${percentage}%`;
    if (progressFill) progressFill.style.width = `${percentage}%`;

    // Breakdown lists
    const completedCountBadge = document.getElementById('history-completed-count');
    const incompleteCountBadge = document.getElementById('history-incomplete-count');
    const completedList = document.getElementById('history-completed-list');
    const incompleteList = document.getElementById('history-incomplete-list');

    if (completedCountBadge) completedCountBadge.textContent = completed;
    if (incompleteCountBadge) incompleteCountBadge.textContent = incomplete;

    if (completedList && incompleteList) {
      completedList.innerHTML = '';
      incompleteList.innerHTML = '';

      if (!dayEntry || total === 0) {
        completedList.innerHTML = '<div class="history-empty-col">No data recorded for this date.</div>';
        incompleteList.innerHTML = '<div class="history-empty-col">No data recorded for this date.</div>';
      } else {
        const records = Object.values(dayEntry.records || {});

        const completedItems = records.filter(r => r.completed);
        const incompleteItems = records.filter(r => !r.completed);

        if (completedItems.length === 0) {
          completedList.innerHTML = '<div class="history-empty-col">No completed habits on this date.</div>';
        } else {
          completedItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item-row';
            li.innerHTML = `
              <div class="history-item-left">
                <span style="font-size: 1.15rem;">${item.icon || '✨'}</span>
                <div class="history-item-details">
                  <span class="history-item-title">${escapeHtml(item.name)}</span>
                  ${item.description ? `<span class="history-item-desc">${escapeHtml(item.description)}</span>` : ''}
                </div>
              </div>
              <span class="status-symbol">✅</span>
            `;
            completedList.appendChild(li);
          });
        }

        if (incompleteItems.length === 0) {
          incompleteList.innerHTML = '<div class="history-empty-col">All habits were completed on this date! 🎉</div>';
        } else {
          incompleteItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item-row';
            li.innerHTML = `
              <div class="history-item-left">
                <span style="font-size: 1.15rem;">${item.icon || '✨'}</span>
                <div class="history-item-details">
                  <span class="history-item-title">${escapeHtml(item.name)}</span>
                  ${item.description ? `<span class="history-item-desc">${escapeHtml(item.description)}</span>` : ''}
                </div>
              </div>
              <span class="status-symbol">❌</span>
            `;
            incompleteList.appendChild(li);
          });
        }
      }
    }

    // Render Past Days Grid
    renderPastDaysGrid();
  }

  function updateQuickDatePills() {
    const today = state.currentDateStr;
    const yest = getOffsetDateStr(today, -1);
    const twoDays = getOffsetDateStr(today, -2);
    const threeDays = getOffsetDateStr(today, -3);

    const sel = state.selectedHistoryDateStr;

    const btnToday = document.getElementById('quick-date-today');
    const btnYest = document.getElementById('quick-date-yesterday');
    const btn2Days = document.getElementById('quick-date-2days');
    const btn3Days = document.getElementById('quick-date-3days');

    if (btnToday) btnToday.classList.toggle('active', sel === today);
    if (btnYest) btnYest.classList.toggle('active', sel === yest);
    if (btn2Days) btn2Days.classList.toggle('active', sel === twoDays);
    if (btn3Days) btn3Days.classList.toggle('active', sel === threeDays);
  }

  function renderPastDaysGrid() {
    const grid = document.getElementById('past-days-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Get sorted unique history dates descending
    const dateKeys = Object.keys(state.history).sort((a, b) => b.localeCompare(a));

    if (dateKeys.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-muted); font-size: 0.875rem;">No historical days logged yet.</div>';
      return;
    }

    dateKeys.slice(0, 8).forEach(dateStr => {
      const entry = state.history[dateStr];
      const isSelected = dateStr === state.selectedHistoryDateStr;
      const isToday = dateStr === state.currentDateStr;

      let pctClass = 'mid';
      if (entry.percentage >= 80) pctClass = 'high';
      else if (entry.percentage < 40) pctClass = 'low';

      const card = document.createElement('div');
      card.className = `past-day-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="past-day-top">
          <span class="past-day-date">${isToday ? 'Today' : formatMediumDate(dateStr)}</span>
          <span class="past-day-pct ${pctClass}">${entry.percentage}%</span>
        </div>
        <div class="past-day-ratio">
          ${entry.completed} of ${entry.total} habits completed
        </div>
        <div class="progress-bar-container" style="height: 6px;">
          <div class="progress-bar-fill" style="width: ${entry.percentage}%;"></div>
        </div>
      `;

      card.addEventListener('click', () => {
        state.selectedHistoryDateStr = dateStr;
        renderHistoryView();
        window.scrollTo({ top: 120, behavior: 'smooth' });
      });

      grid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // Modals & Forms
  // --------------------------------------------------------------------------
  function openAddHabitModal() {
    const modal = document.getElementById('habit-modal');
    const title = document.getElementById('habit-modal-title');
    const idInput = document.getElementById('modal-habit-id');
    const nameInput = document.getElementById('modal-habit-name');
    const catSelect = document.getElementById('modal-habit-category');
    const descInput = document.getElementById('modal-habit-desc');
    const emojiInput = document.getElementById('modal-habit-emoji');

    if (!modal) return;

    title.textContent = 'Add New Habit';
    idInput.value = '';
    nameInput.value = '';
    catSelect.value = 'Routine';
    if (descInput) descInput.value = '';
    emojiInput.value = '🌅';

    // Highlight emoji button
    document.querySelectorAll('#emoji-picker-row .emoji-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.emoji === '🌅');
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => nameInput.focus(), 100);
  }

  function openEditHabitModal(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const modal = document.getElementById('habit-modal');
    const title = document.getElementById('habit-modal-title');
    const idInput = document.getElementById('modal-habit-id');
    const nameInput = document.getElementById('modal-habit-name');
    const catSelect = document.getElementById('modal-habit-category');
    const descInput = document.getElementById('modal-habit-desc');
    const emojiInput = document.getElementById('modal-habit-emoji');

    if (!modal) return;

    title.textContent = 'Edit Habit';
    idInput.value = habit.id;
    nameInput.value = habit.name;
    catSelect.value = habit.category || 'Routine';
    if (descInput) descInput.value = habit.description || '';
    emojiInput.value = habit.icon || '🌅';

    // Highlight active emoji
    document.querySelectorAll('#emoji-picker-row .emoji-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.emoji === habit.icon);
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => nameInput.focus(), 100);
  }

  function closeHabitModal() {
    const modal = document.getElementById('habit-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function openDeleteModal(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    state.pendingDeleteHabitId = habitId;
    const nameEl = document.getElementById('delete-habit-name');
    if (nameEl) nameEl.textContent = `"${habit.name}"`;

    const modal = document.getElementById('delete-modal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeDeleteModal() {
    state.pendingDeleteHabitId = null;
    const modal = document.getElementById('delete-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // --------------------------------------------------------------------------
  // Toast Notifications
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '⚠️';

    toast.innerHTML = `
      <span>${icon}</span>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  // --------------------------------------------------------------------------
  // Audio Synthesis for Feedback (Web Audio API - completely offline)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playCheckSound(isCompleting) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (isCompleting) {
        // Cheerful ascending note
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Soft uncheck tap
        osc.frequency.setValueAtTime(329.63, now); // E4
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio autoplay policy fallback - silent
    }
  }

  // --------------------------------------------------------------------------
  // Confetti Particle Effect (Pure Canvas - 0 dependencies)
  // --------------------------------------------------------------------------
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.9) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    let animationFrame;
    function renderFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animationFrame = requestAnimationFrame(renderFrame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    renderFrame();
  }

  // --------------------------------------------------------------------------
  // Security / Utility: HTML Escape
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --------------------------------------------------------------------------
  // General App Re-render
  // --------------------------------------------------------------------------
  function renderApp() {
    renderDashboardView();
    renderDailyView();
    renderHistoryView();
  }

  // --------------------------------------------------------------------------
  // Event Listeners & Initialization
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('#main-nav .nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveTab(btn.dataset.tab);
      });
    });

    // Mobile Drawer Navigation
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    if (mobileMenuToggle && mobileDrawer) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileDrawer.classList.toggle('open');
      });
    }

    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveTab(btn.dataset.tab);
      });
    });

    // Dashboard Jump Buttons
    const jumpToDailyBtn = document.getElementById('jump-to-daily-btn');
    const viewAllDailyBtn = document.getElementById('view-all-daily-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');

    if (jumpToDailyBtn) jumpToDailyBtn.addEventListener('click', () => setActiveTab('daily'));
    if (viewAllDailyBtn) viewAllDailyBtn.addEventListener('click', () => setActiveTab('daily'));
    if (viewHistoryBtn) viewHistoryBtn.addEventListener('click', () => setActiveTab('history'));

    // Theme Switcher
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        saveTheme();
        showToast(`Switched to ${state.theme} mode`, 'info', 2000);
      });
    }

    // Quick Add Habit Header Button
    const quickAddBtn = document.getElementById('quick-add-habit-btn');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => {
        openAddHabitModal();
      });
    }

    // Inline Add Habit Form (Daily Tasks view)
    const inlineForm = document.getElementById('inline-add-habit-form');
    if (inlineForm) {
      inlineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('new-habit-name-input');
        const catSelect = document.getElementById('new-habit-category');
        const descInput = document.getElementById('new-habit-desc-input');
        if (nameInput) {
          const success = addNewHabit(
            nameInput.value, 
            catSelect ? catSelect.value : 'Routine', 
            null, 
            descInput ? descInput.value : ''
          );
          if (success) {
            nameInput.value = '';
            if (descInput) descInput.value = '';
          }
        }
      });
    }

    // Daily Focus edit/save controls
    const editFocusBtn = document.getElementById('edit-daily-focus-btn');
    const saveFocusBtn = document.getElementById('save-daily-focus-btn');
    const cancelFocusBtn = document.getElementById('cancel-daily-focus-btn');
    const focusEditWrap = document.getElementById('daily-focus-edit-wrap');
    const focusDisplay = document.getElementById('daily-focus-display');
    const focusInput = document.getElementById('daily-focus-input');

    if (editFocusBtn && focusEditWrap) {
      editFocusBtn.addEventListener('click', () => {
        focusEditWrap.classList.remove('hidden');
        if (focusDisplay) focusDisplay.style.display = 'none';
        if (focusInput) {
          focusInput.value = state.dailyFocus;
          focusInput.focus();
        }
      });
    }

    if (saveFocusBtn && focusEditWrap) {
      saveFocusBtn.addEventListener('click', () => {
        if (focusInput) {
          const val = focusInput.value.trim();
          if (val) {
            saveDailyFocus(val);
            if (focusDisplay) focusDisplay.textContent = val;
            showToast('Saved daily routine guide & focus', 'success');
          }
        }
        focusEditWrap.classList.add('hidden');
        if (focusDisplay) focusDisplay.style.display = 'block';
      });
    }

    if (cancelFocusBtn && focusEditWrap) {
      cancelFocusBtn.addEventListener('click', () => {
        focusEditWrap.classList.add('hidden');
        if (focusDisplay) focusDisplay.style.display = 'block';
      });
    }

    // Daily rule tags click
    document.querySelectorAll('.rule-tag').forEach(tag => {
      tag.style.cursor = 'pointer';
      tag.title = 'Click to add to your daily guide';
      tag.addEventListener('click', () => {
        if (focusInput && focusEditWrap && !focusEditWrap.classList.contains('hidden')) {
          focusInput.value = (focusInput.value + ' ' + tag.textContent).trim();
        } else {
          showToast(`Rule: ${tag.textContent}`, 'info', 2000);
        }
      });
    });

    // Filter Pills
    document.querySelectorAll('#task-filter-pills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#task-filter-pills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeFilter = pill.dataset.filter;
        renderDailyView();
      });
    });

    // History: Date Picker
    const historyDatePicker = document.getElementById('history-date-picker');
    if (historyDatePicker) {
      historyDatePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          state.selectedHistoryDateStr = e.target.value;
          renderHistoryView();
        }
      });
    }

    // History: Prev / Next Day Buttons
    const prevDayBtn = document.getElementById('history-prev-day-btn');
    const nextDayBtn = document.getElementById('history-next-day-btn');

    if (prevDayBtn) {
      prevDayBtn.addEventListener('click', () => {
        state.selectedHistoryDateStr = getOffsetDateStr(state.selectedHistoryDateStr, -1);
        renderHistoryView();
      });
    }

    if (nextDayBtn) {
      nextDayBtn.addEventListener('click', () => {
        const nextDate = getOffsetDateStr(state.selectedHistoryDateStr, 1);
        if (nextDate <= state.currentDateStr) {
          state.selectedHistoryDateStr = nextDate;
          renderHistoryView();
        } else {
          showToast('Cannot navigate into future dates', 'info', 2000);
        }
      });
    }

    // History: Quick jump shortcuts
    const btnToday = document.getElementById('quick-date-today');
    const btnYest = document.getElementById('quick-date-yesterday');
    const btn2Days = document.getElementById('quick-date-2days');
    const btn3Days = document.getElementById('quick-date-3days');

    if (btnToday) {
      btnToday.addEventListener('click', () => {
        state.selectedHistoryDateStr = state.currentDateStr;
        renderHistoryView();
      });
    }

    if (btnYest) {
      btnYest.addEventListener('click', () => {
        state.selectedHistoryDateStr = getOffsetDateStr(state.currentDateStr, -1);
        renderHistoryView();
      });
    }

    if (btn2Days) {
      btn2Days.addEventListener('click', () => {
        state.selectedHistoryDateStr = getOffsetDateStr(state.currentDateStr, -2);
        renderHistoryView();
      });
    }

    if (btn3Days) {
      btn3Days.addEventListener('click', () => {
        state.selectedHistoryDateStr = getOffsetDateStr(state.currentDateStr, -3);
        renderHistoryView();
      });
    }

    // Emoji Picker in Modal
    document.querySelectorAll('#emoji-picker-row .emoji-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('#emoji-picker-row .emoji-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const emojiInput = document.getElementById('modal-habit-emoji');
        if (emojiInput) emojiInput.value = opt.dataset.emoji;
      });
    });

    // Habit Modal Submit Form
    const habitModalForm = document.getElementById('habit-modal-form');
    if (habitModalForm) {
      habitModalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idInput = document.getElementById('modal-habit-id');
        const nameInput = document.getElementById('modal-habit-name');
        const catSelect = document.getElementById('modal-habit-category');
        const descInput = document.getElementById('modal-habit-desc');
        const emojiInput = document.getElementById('modal-habit-emoji');

        const habitId = idInput ? idInput.value : '';
        const name = nameInput ? nameInput.value : '';
        const category = catSelect ? catSelect.value : 'Routine';
        const desc = descInput ? descInput.value : '';
        const icon = emojiInput ? emojiInput.value : '🌅';

        if (habitId) {
          // Editing existing
          editHabit(habitId, name, category, icon, desc);
        } else {
          // Adding new
          addNewHabit(name, category, icon, desc);
        }

        closeHabitModal();
      });
    }

    // Modal Close Buttons
    const habitModalClose = document.getElementById('habit-modal-close');
    const habitModalCancel = document.getElementById('habit-modal-cancel');
    if (habitModalClose) habitModalClose.addEventListener('click', closeHabitModal);
    if (habitModalCancel) habitModalCancel.addEventListener('click', closeHabitModal);

    // Delete Modal Confirmation
    const deleteModalClose = document.getElementById('delete-modal-close');
    const deleteModalCancel = document.getElementById('delete-modal-cancel');
    const deleteModalConfirm = document.getElementById('delete-modal-confirm');

    if (deleteModalClose) deleteModalClose.addEventListener('click', closeDeleteModal);
    if (deleteModalCancel) deleteModalCancel.addEventListener('click', closeDeleteModal);
    if (deleteModalConfirm) {
      deleteModalConfirm.addEventListener('click', () => {
        if (state.pendingDeleteHabitId) {
          deleteHabit(state.pendingDeleteHabitId);
        }
        closeDeleteModal();
      });
    }

    // Close modals on backdrop click or ESC
    window.addEventListener('click', (e) => {
      const habitModal = document.getElementById('habit-modal');
      const deleteModal = document.getElementById('delete-modal');
      if (e.target === habitModal) closeHabitModal();
      if (e.target === deleteModal) closeDeleteModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeHabitModal();
        closeDeleteModal();
      }
    });

    // Reset Data in Footer
    const resetBtn = document.getElementById('footer-reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all habits and history back to default sample data?')) {
          resetToSampleData();
        }
      });
    }

    // Window Resize event for canvas
    window.addEventListener('resize', () => {
      const canvas = document.getElementById('confetti-canvas');
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }

  // --------------------------------------------------------------------------
  // Application Bootstrapper
  // --------------------------------------------------------------------------
  function init() {
    // Current Local Date
    state.currentDateStr = formatLocalDateToYYYYMMDD(new Date());
    state.selectedHistoryDateStr = state.currentDateStr;

    // Load Data
    loadFromStorage();

    // Ensure Today's Record is in place
    ensureDateRecord(state.currentDateStr);

    // Set Theme
    document.documentElement.setAttribute('data-theme', state.theme);

    // Setup Listeners
    setupEventListeners();

    // Render Initial View
    renderApp();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
