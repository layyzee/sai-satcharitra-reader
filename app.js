// ==========================================================================
// Sri Sai Satcharitra - Offline Application Engine (Enhanced)
// ==========================================================================

(function() {
  'use strict';

  // Application State
  const STATE_KEY = 'sai_satcharitra_state_v2';
  
  let state = {
    currentDailyChapter: 1, // 1 to 48
    activeReadingChapter: 1,
    completedChapters: [],  // list of completed chapter IDs
    streak: 1,
    lastReadDate: null,
    theme: 'sepia',
    fontSize: 'font-size-md',
    bookmarks: {}, // { chapterId: scrollPercent }
    soundEnabled: true
  };

  // 7-Day Saptah Parayan Traditional Schedule
  const SAPTAH_SCHEDULE = [
    { day: 1, name: "Day 1 (Thursday)",   startChap: 1,  endChap: 7,  title: "Advent, First Arrival & Early Leelas", desc: "Chapters 1 through 7" },
    { day: 2, name: "Day 2 (Friday)",     startChap: 8,  endChap: 15, title: "Begging Food, Mode of Life & Cures", desc: "Chapters 8 through 15" },
    { day: 3, name: "Day 3 (Saturday)",   startChap: 16, endChap: 22, title: "Brahma-Jnana, Upadesh & Serpents",   desc: "Chapters 16 through 22" },
    { day: 4, name: "Day 4 (Sunday)",     startChap: 23, endChap: 29, title: "Yoga & Onion, Chanak Leela & Bhajans", desc: "Chapters 23 through 29" },
    { day: 5, name: "Day 5 (Monday)",     startChap: 30, endChap: 35, title: "Drawn to Shirdi & Greatness of Udi", desc: "Chapters 30 through 35" },
    { day: 6, name: "Day 6 (Tuesday)",    startChap: 36, endChap: 42, title: "Chavadi, Handi, Gita & Foretelling", desc: "Chapters 36 through 42" },
    { day: 7, name: "Day 7 (Wednesday)",  startChap: 43, endChap: 48, title: "Maha-Samadhi, Reminiscences & Epilogue", desc: "Chapters 43 through 51" }
  ];

  // DOM Elements Cache
  const elements = {
    body: document.body,
    html: document.documentElement,
    navTabs: document.querySelectorAll('.nav-tab-btn'),
    viewPanels: document.querySelectorAll('.view-panel'),
    themeBtns: document.querySelectorAll('.theme-btn'),
    btnTempleBell: document.getElementById('btn-temple-bell'),
    btnShortcutsHelp: document.getElementById('btn-shortcuts-help'),
    btnFontDec: document.getElementById('btn-font-dec'),
    btnFontReset: document.getElementById('btn-font-reset'),
    btnFontInc: document.getElementById('btn-font-inc'),
    readingProgressFill: document.getElementById('reading-progress-fill'),
    toastNotification: document.getElementById('toast-notification'),
    toastMessage: document.getElementById('toast-message'),
    
    // Daily View
    currentDateBadge: document.getElementById('current-date-badge'),
    dailyDynamicSaying: document.getElementById('daily-dynamic-saying'),
    btnRefreshSaying: document.getElementById('btn-refresh-saying'),
    statCompletedCount: document.getElementById('stat-completed-count'),
    statStreakCount: document.getElementById('stat-streak-count'),
    statRemainingCount: document.getElementById('stat-remaining-count'),
    dailyChapBadge: document.getElementById('daily-chap-badge'),
    dailyReadTime: document.getElementById('daily-read-time'),
    dailyChapTitle: document.getElementById('daily-chap-title'),
    dailyChapTopics: document.getElementById('daily-chap-topics'),
    btnReadToday: document.getElementById('btn-read-today'),
    btnMarkTodayComplete: document.getElementById('btn-mark-today-complete'),
    progressText: document.getElementById('progress-text'),
    overallProgressFill: document.getElementById('overall-progress-fill'),
    btnResetParayan: document.getElementById('btn-reset-parayan'),
    btnBrandHome: document.getElementById('btn-brand-home'),

    // Reader View
    btnBackToDaily: document.getElementById('btn-back-to-daily'),
    readerChapterDropdown: document.getElementById('reader-chapter-dropdown'),
    btnToggleFind: document.getElementById('btn-toggle-find'),
    readerFindBar: document.getElementById('reader-find-bar'),
    readerFindInput: document.getElementById('reader-find-input'),
    readerFindCount: document.getElementById('reader-find-count'),
    btnCloseFind: document.getElementById('btn-close-find'),
    btnReaderMarkComplete: document.getElementById('btn-reader-mark-complete'),
    readerMetaChap: document.getElementById('reader-meta-chap'),
    readerMetaTime: document.getElementById('reader-meta-time'),
    readerTitle: document.getElementById('reader-title'),
    readerTopicsBox: document.getElementById('reader-topics-box'),
    readerBody: document.getElementById('reader-body'),
    btnPrevChapter: document.getElementById('btn-prev-chapter'),
    btnCompleteAndNext: document.getElementById('btn-complete-and-next'),

    // Chapters Directory
    chapterSearchInput: document.getElementById('chapter-search-input'),
    filterPills: document.querySelectorAll('.filter-pill'),
    chaptersGridContainer: document.getElementById('chapters-grid-container'),

    // Saptah View
    saptahDaysList: document.getElementById('saptah-days-list'),

    // Aartis View
    aartiTabBtns: document.querySelectorAll('.aarti-tab-btn'),
    aartiDisplayArea: document.getElementById('aarti-display-area'),

    // Sayings View
    sayingsGridContainer: document.getElementById('sayings-grid-container'),

    // Modal
    shortcutsModal: document.getElementById('shortcuts-modal'),
    btnCloseModal: document.getElementById('btn-close-modal')
  };

  const fontSizes = ['font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl'];

  // ==========================================================================
  // Temple Bell Sound Synthesizer (Zero Audio Files - Pure Web Audio API)
  // ==========================================================================

  let audioCtx = null;

  function playTempleBell() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      
      // Tibetan Singing Bowl / Temple Bell Harmonic Profile (528Hz Base)
      const frequencies = [528, 1056, 1584, 2112, 2640];
      const gains = [0.45, 0.25, 0.12, 0.06, 0.02];

      frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = (idx === 0) ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Exponential gentle decay
        gainNode.gain.setValueAtTime(gains[idx], now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 3.6);
      });
    } catch (e) {
      console.warn("Web Audio bell failed:", e);
    }
  }

  // ==========================================================================
  // Toast Popup
  // ==========================================================================

  let toastTimer = null;
  function showToast(message, icon = '🪔') {
    elements.toastMessage.textContent = message;
    const iconEl = elements.toastNotification.querySelector('.toast-icon');
    if (iconEl) iconEl.textContent = icon;

    elements.toastNotification.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toastNotification.classList.remove('show');
    }, 2800);
  }

  // ==========================================================================
  // Initialization & State
  // ==========================================================================

  function init() {
    loadState();
    setupDate();
    applyTheme(state.theme);
    applyFontSize(state.fontSize);
    
    bindEvents();
    populateReaderDropdown();
    renderDailyDashboard();
    renderChaptersDirectory();
    renderSaptahSchedule();
    renderAarti('kakad');
    renderSayings();
    setDynamicSaying();
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        state = Object.assign(state, JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load state:", e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save state:", e);
    }
  }

  function setupDate() {
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    elements.currentDateBadge.textContent = today.toLocaleDateString('en-US', options);
  }

  // ==========================================================================
  // Dynamic Saying Generator
  // ==========================================================================

  function setDynamicSaying(index = null) {
    const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
    if (sayings.length === 0) return;

    if (index === null) {
      // Pick based on day of year
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      index = dayOfYear % sayings.length;
    }

    const saying = sayings[index];
    elements.dailyDynamicSaying.style.opacity = '0';
    setTimeout(() => {
      elements.dailyDynamicSaying.textContent = `"${saying.text}"`;
      elements.dailyDynamicSaying.style.opacity = '1';
    }, 150);
  }

  // ==========================================================================
  // Navigation & View Switching
  // ==========================================================================

  function switchView(viewName) {
    elements.viewPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
    });

    elements.navTabs.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName !== 'reader') {
      elements.readingProgressFill.style.width = '0%';
      closeFindBar();
    }
  }

  // ==========================================================================
  // Theme & Font Sizing
  // ==========================================================================

  function applyTheme(themeName) {
    state.theme = themeName;
    elements.html.setAttribute('data-theme', themeName);
    elements.themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });
    saveState();
  }

  function cycleTheme() {
    const themes = ['sepia', 'light', 'dark'];
    const nextIdx = (themes.indexOf(state.theme) + 1) % themes.length;
    applyTheme(themes[nextIdx]);
    showToast(`Switched to ${themes[nextIdx].toUpperCase()} Theme`, '🎨');
  }

  function applyFontSize(sizeClass) {
    fontSizes.forEach(s => elements.body.classList.remove(s));
    elements.body.classList.add(sizeClass);
    state.fontSize = sizeClass;
    saveState();
  }

  // ==========================================================================
  // View 1: Daily Dashboard Logic
  // ==========================================================================

  function renderDailyDashboard() {
    const chapters = window.SAI_CHAPTERS || [];
    const totalChapters = chapters.length;
    const completedCount = state.completedChapters.length;
    const remainingCount = Math.max(0, totalChapters - completedCount);
    
    // Stats update
    elements.statCompletedCount.textContent = completedCount;
    elements.statStreakCount.textContent = state.streak;
    elements.statRemainingCount.textContent = remainingCount;

    // Progress Bar
    const percent = Math.round((completedCount / totalChapters) * 100);
    elements.progressText.textContent = `${completedCount} of ${totalChapters} chapters completed (${percent}%)`;
    elements.overallProgressFill.style.width = `${percent}%`;

    // Today's Assigned Chapter
    const currentChapter = chapters.find(c => c.id === state.currentDailyChapter) || chapters[0];
    if (currentChapter) {
      elements.dailyChapBadge.textContent = currentChapter.short_title;
      elements.dailyReadTime.textContent = `~${currentChapter.reading_time_mins} min read (${currentChapter.word_count.toLocaleString()} words)`;
      elements.dailyChapTitle.textContent = currentChapter.title.replace(/^Sai Satcharitra /i, '');

      // Topics
      elements.dailyChapTopics.innerHTML = '';
      if (currentChapter.topics && currentChapter.topics.length > 0) {
        currentChapter.topics.slice(0, 4).forEach(t => {
          const tag = document.createElement('span');
          tag.className = 'topic-tag';
          tag.textContent = t;
          elements.dailyChapTopics.appendChild(tag);
        });
      }

      // Completed state
      const isDone = state.completedChapters.includes(currentChapter.id);
      elements.btnMarkTodayComplete.classList.toggle('completed-state', isDone);
      elements.btnMarkTodayComplete.innerHTML = isDone 
        ? '<span class="btn-check">✓</span> Completed for Today' 
        : '<span class="btn-check">✓</span> Mark Chapter Completed';
    }
  }

  function markChapterComplete(chapterId) {
    if (!state.completedChapters.includes(chapterId)) {
      state.completedChapters.push(chapterId);
      
      // Update streak
      const todayStr = new Date().toDateString();
      if (state.lastReadDate !== todayStr) {
        state.streak = (state.lastReadDate) ? state.streak + 1 : 1;
        state.lastReadDate = todayStr;
      }

      // Auto advance to next chapter if marking today's current
      if (chapterId === state.currentDailyChapter) {
        if (state.currentDailyChapter < (window.SAI_CHAPTERS || []).length) {
          state.currentDailyChapter += 1;
        }
      }

      playTempleBell();
      showToast(`Chapter ${chapterId} Completed! May Sai Baba bless your day.`, '🔔');

      saveState();
      renderDailyDashboard();
      renderChaptersDirectory();
      renderSaptahSchedule();
      updateReaderCompletionButton(chapterId);
    }
  }

  // ==========================================================================
  // View 2: Immersive Chapter Reader
  // ==========================================================================

  function openChapter(chapterId) {
    const chapters = window.SAI_CHAPTERS || [];
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    state.activeReadingChapter = chapterId;
    saveState();

    // Set Meta
    elements.readerMetaChap.textContent = chapter.short_title;
    elements.readerMetaTime.textContent = `~${chapter.reading_time_mins} min read`;
    elements.readerTitle.textContent = chapter.title.replace(/^Sai Satcharitra /i, '');

    // Set Topics
    elements.readerTopicsBox.innerHTML = '';
    if (chapter.topics && chapter.topics.length > 0) {
      chapter.topics.forEach(t => {
        const tag = document.createElement('span');
        tag.className = 'topic-tag';
        tag.textContent = t;
        elements.readerTopicsBox.appendChild(tag);
      });
    }

    // Set Content
    elements.readerBody.innerHTML = chapter.content;

    // Dropdown selection sync
    elements.readerChapterDropdown.value = chapter.id;

    // Prev / Next button state
    elements.btnPrevChapter.style.visibility = (chapter.id > 1) ? 'visible' : 'hidden';
    elements.btnCompleteAndNext.innerHTML = (chapter.id === chapters.length)
      ? 'Complete Final Chapter <span>🎉</span>'
      : 'Complete & Next Chapter <span>→</span>';

    updateReaderCompletionButton(chapter.id);
    switchView('reader');

    // Restore scroll bookmark if exists
    const savedScroll = state.bookmarks[chapter.id];
    if (savedScroll && savedScroll > 0) {
      setTimeout(() => {
        const targetScroll = (document.documentElement.scrollHeight - window.innerHeight) * (savedScroll / 100);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }, 100);
    }
  }

  function updateReaderCompletionButton(chapterId) {
    const isDone = state.completedChapters.includes(chapterId);
    elements.btnReaderMarkComplete.classList.toggle('done', isDone);
    elements.btnReaderMarkComplete.innerHTML = isDone 
      ? '<span>✓</span> Completed' 
      : '<span>✓</span> Mark Done';
  }

  function populateReaderDropdown() {
    const chapters = window.SAI_CHAPTERS || [];
    elements.readerChapterDropdown.innerHTML = '';
    chapters.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.short_title} - ${c.title.replace(/^Sai Satcharitra /i, '').slice(0, 42)}...`;
      elements.readerChapterDropdown.appendChild(opt);
    });
  }

  // ==========================================================================
  // In-Reader Text Search / Find
  // ==========================================================================

  function toggleFindBar() {
    elements.readerFindBar.classList.toggle('hidden');
    if (!elements.readerFindBar.classList.contains('hidden')) {
      elements.readerFindInput.focus();
    } else {
      closeFindBar();
    }
  }

  function closeFindBar() {
    elements.readerFindBar.classList.add('hidden');
    elements.readerFindInput.value = '';
    elements.readerFindCount.textContent = '0 found';
    
    // Clear highlights
    const chapter = (window.SAI_CHAPTERS || []).find(c => c.id === state.activeReadingChapter);
    if (chapter) elements.readerBody.innerHTML = chapter.content;
  }

  function performInChapterSearch(query) {
    const clean = query.trim();
    const chapter = (window.SAI_CHAPTERS || []).find(c => c.id === state.activeReadingChapter);
    if (!chapter) return;

    if (!clean) {
      elements.readerBody.innerHTML = chapter.content;
      elements.readerFindCount.textContent = '0 found';
      return;
    }

    try {
      const regex = new RegExp(`(${clean.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
      const paragraphs = chapter.content.split('</p>');
      let matchCount = 0;

      const highlighted = paragraphs.map(p => {
        if (!p) return '';
        const matches = (p.match(regex) || []).length;
        matchCount += matches;
        return p.replace(regex, '<mark class="find-highlight">$1</mark>');
      }).join('</p>');

      elements.readerBody.innerHTML = highlighted;
      elements.readerFindCount.textContent = `${matchCount} found`;

      // Scroll to first match if any
      const firstMark = elements.readerBody.querySelector('mark.find-highlight');
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      console.warn("Search error:", e);
    }
  }

  // ==========================================================================
  // View 3: All Chapters Directory
  // ==========================================================================

  let currentDirectoryFilter = 'all';

  function renderChaptersDirectory(query = '') {
    const chapters = window.SAI_CHAPTERS || [];
    const container = elements.chaptersGridContainer;
    container.innerHTML = '';

    const cleanQuery = query.toLowerCase().trim();

    chapters.forEach(c => {
      const isCompleted = state.completedChapters.includes(c.id);
      const isToday = c.id === state.currentDailyChapter;

      // Filtering logic
      if (currentDirectoryFilter === 'completed' && !isCompleted) return;
      if (currentDirectoryFilter === 'unread' && isCompleted) return;

      // Search query filter
      if (cleanQuery) {
        const titleMatch = c.title.toLowerCase().includes(cleanQuery);
        const topicMatch = c.topics.some(t => t.toLowerCase().includes(cleanQuery));
        if (!titleMatch && !topicMatch) return;
      }

      const card = document.createElement('div');
      card.className = `chapter-card-item ${isToday ? 'is-today' : ''}`;
      
      const statusHtml = isCompleted 
        ? '<span class="card-status-badge done">✓ Completed</span>'
        : (isToday ? '<span class="card-status-badge" style="color:var(--primary); font-weight:700;">✦ Today</span>' : '');

      const topicsSnippet = c.topics.length > 0 
        ? c.topics.slice(0, 2).join(' • ') 
        : 'Spiritual discourse and divine leelas of Shirdi Sai Baba.';

      card.innerHTML = `
        <div>
          <div class="chap-card-top">
            <span class="card-number">${c.short_title}</span>
            ${statusHtml}
          </div>
          <h3 class="chap-card-title">${c.title.replace(/^Sai Satcharitra /i, '')}</h3>
          <p class="chap-card-topics">${topicsSnippet}</p>
        </div>
        <div class="chap-card-bottom">
          <span>~${c.reading_time_mins} min read</span>
          <span style="font-weight:600; color:var(--primary)">Read →</span>
        </div>
      `;

      card.addEventListener('click', () => openChapter(c.id));
      container.appendChild(card);
    });

    if (container.children.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        No chapters match your search.
      </div>`;
    }
  }

  // ==========================================================================
  // View 4: 7-Day Saptah Parayan Plan
  // ==========================================================================

  function renderSaptahSchedule() {
    const container = elements.saptahDaysList;
    container.innerHTML = '';

    SAPTAH_SCHEDULE.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'saptah-day-card';

      // Check how many chapters for this day are completed
      let dayCompleted = 0;
      const dayTotal = (plan.endChap - plan.startChap + 1);
      for (let ch = plan.startChap; ch <= plan.endChap; ch++) {
        if (state.completedChapters.includes(ch)) dayCompleted++;
      }
      const isDayAllDone = dayCompleted === dayTotal;

      card.innerHTML = `
        <div class="saptah-day-info">
          <div class="saptah-day-badge">Day ${plan.day}</div>
          <div>
            <h4 class="saptah-day-title">${plan.name}</h4>
            <p class="saptah-day-chapters">${plan.desc} — <em>${plan.title}</em></p>
          </div>
        </div>
        <div class="saptah-day-action">
          <button class="btn-start-day" data-chap="${plan.startChap}">
            ${isDayAllDone ? '✓ Completed' : `Read Day ${plan.day} (${dayCompleted}/${dayTotal})`}
          </button>
        </div>
      `;

      card.querySelector('.btn-start-day').addEventListener('click', () => {
        openChapter(plan.startChap);
      });

      container.appendChild(card);
    });
  }

  // ==========================================================================
  // View 5: Daily Aartis
  // ==========================================================================

  function renderAarti(aartiId) {
    const devotional = window.SAI_DEVOTIONAL || {};
    const aartis = devotional.aartis || [];
    const aarti = aartis.find(a => a.id === aartiId) || aartis[0];
    if (!aarti) return;

    elements.aartiTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-aarti') === aartiId);
    });

    const versesHtml = aarti.verses.map(v => `<p class="aarti-verse-item">${v}</p>`).join('');

    elements.aartiDisplayArea.innerHTML = `
      <div class="aarti-card-heading">
        <span class="aarti-time-pill">${aarti.time}</span>
        <h3 class="aarti-main-name">${aarti.name}</h3>
        <p class="aarti-sub-name">${aarti.subtitle}</p>
      </div>
      <div class="aarti-meaning-box">
        <strong>Spiritual Significance:</strong> ${aarti.meaning}
      </div>
      <div class="aarti-verses-box">
        ${versesHtml}
      </div>
    `;
  }

  // ==========================================================================
  // View 6: 11 Sayings of Sai Baba
  // ==========================================================================

  function renderSayings() {
    const devotional = window.SAI_DEVOTIONAL || {};
    const sayings = devotional.sayings || [];
    const container = elements.sayingsGridContainer;
    container.innerHTML = '';

    sayings.forEach(s => {
      const card = document.createElement('div');
      card.className = 'saying-card';
      card.innerHTML = `
        <div class="saying-num">${s.number}</div>
        <p class="saying-text">"${s.text}"</p>
      `;
      container.appendChild(card);
    });
  }

  // ==========================================================================
  // Event Bindings
  // ==========================================================================

  function bindEvents() {
    // Navigation Tabs
    elements.navTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
      });
    });

    // Brand logo returns to daily home
    elements.btnBrandHome.addEventListener('click', () => switchView('daily'));

    // Temple Bell Chime
    elements.btnTempleBell.addEventListener('click', () => {
      playTempleBell();
      showToast("Om Sai Ram", "🔔");
    });

    // Shortcuts Modal
    elements.btnShortcutsHelp.addEventListener('click', () => {
      elements.shortcutsModal.classList.remove('hidden');
    });
    elements.btnCloseModal.addEventListener('click', () => {
      elements.shortcutsModal.classList.add('hidden');
    });
    elements.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === elements.shortcutsModal) elements.shortcutsModal.classList.add('hidden');
    });

    // Dynamic Blessing Refresh
    elements.btnRefreshSaying.addEventListener('click', () => {
      const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
      const randomIdx = Math.floor(Math.random() * sayings.length);
      setDynamicSaying(randomIdx);
      showToast("Divine Blessing refreshed ✨", "✨");
    });

    // Theme Switches
    elements.themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(btn.getAttribute('data-theme'));
      });
    });

    // Font Sizing Controls
    elements.btnFontDec.addEventListener('click', () => {
      const idx = fontSizes.indexOf(state.fontSize);
      if (idx > 0) applyFontSize(fontSizes[idx - 1]);
    });

    elements.btnFontReset.addEventListener('click', () => {
      applyFontSize('font-size-md');
    });

    elements.btnFontInc.addEventListener('click', () => {
      const idx = fontSizes.indexOf(state.fontSize);
      if (idx < fontSizes.length - 1) applyFontSize(fontSizes[idx + 1]);
    });

    // Daily View Actions
    elements.btnReadToday.addEventListener('click', () => {
      openChapter(state.currentDailyChapter);
    });

    elements.btnMarkTodayComplete.addEventListener('click', () => {
      markChapterComplete(state.currentDailyChapter);
    });

    elements.btnResetParayan.addEventListener('click', () => {
      if (confirm("Would you like to reset your Parayan progress and start fresh from Chapter 1?")) {
        state.completedChapters = [];
        state.currentDailyChapter = 1;
        state.bookmarks = {};
        saveState();
        renderDailyDashboard();
        renderChaptersDirectory();
        renderSaptahSchedule();
        showToast("Parayan reset to Chapter 1", "🔄");
      }
    });

    // Reader View Actions
    elements.btnBackToDaily.addEventListener('click', () => switchView('daily'));

    elements.readerChapterDropdown.addEventListener('change', (e) => {
      openChapter(parseInt(e.target.value, 10));
    });

    elements.btnReaderMarkComplete.addEventListener('click', () => {
      markChapterComplete(state.activeReadingChapter);
    });

    elements.btnPrevChapter.addEventListener('click', () => {
      if (state.activeReadingChapter > 1) {
        openChapter(state.activeReadingChapter - 1);
      }
    });

    elements.btnCompleteAndNext.addEventListener('click', () => {
      markChapterComplete(state.activeReadingChapter);
      const chapters = window.SAI_CHAPTERS || [];
      if (state.activeReadingChapter < chapters.length) {
        openChapter(state.activeReadingChapter + 1);
      } else {
        alert("🎉 Congratulations! You have completed all 48 chapters of Sri Sai Satcharitra! May Sai Baba's divine grace and blessings be upon you and your family. Om Sai Ram!");
        switchView('daily');
      }
    });

    // Reader In-Page Find
    elements.btnToggleFind.addEventListener('click', toggleFindBar);
    elements.btnCloseFind.addEventListener('click', closeFindBar);
    elements.readerFindInput.addEventListener('input', (e) => {
      performInChapterSearch(e.target.value);
    });

    // Scroll Progress & Debounced Bookmark Tracking
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
      const viewReader = document.getElementById('view-reader');
      if (viewReader && viewReader.classList.contains('active')) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable > 0) {
          const percent = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
          elements.readingProgressFill.style.width = `${percent}%`;

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            state.bookmarks[state.activeReadingChapter] = Math.round(percent);
            saveState();
          }, 400);
        }
      }
    });

    // Directory Search Input
    elements.chapterSearchInput.addEventListener('input', (e) => {
      renderChaptersDirectory(e.target.value);
    });

    // Directory Filter Pills
    elements.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentDirectoryFilter = pill.getAttribute('data-filter');
        renderChaptersDirectory(elements.chapterSearchInput.value);
      });
    });

    // Aarti Tabs
    elements.aartiTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        renderAarti(btn.getAttribute('data-aarti'));
      });
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if typing in input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (e.key === 'Escape') closeFindBar();
        return;
      }

      if (e.key === '[') {
        if (state.activeReadingChapter > 1) openChapter(state.activeReadingChapter - 1);
      } else if (e.key === ']') {
        const chapters = window.SAI_CHAPTERS || [];
        if (state.activeReadingChapter < chapters.length) openChapter(state.activeReadingChapter + 1);
      } else if (e.key.toLowerCase() === 't') {
        cycleTheme();
      } else if (e.key === '+' || e.key === '=') {
        const idx = fontSizes.indexOf(state.fontSize);
        if (idx < fontSizes.length - 1) applyFontSize(fontSizes[idx + 1]);
      } else if (e.key === '-' || e.key === '_') {
        const idx = fontSizes.indexOf(state.fontSize);
        if (idx > 0) applyFontSize(fontSizes[idx - 1]);
      } else if (e.key.toLowerCase() === 'b') {
        playTempleBell();
        showToast("Om Sai Ram", "🔔");
      } else if (e.key === '?') {
        elements.shortcutsModal.classList.toggle('hidden');
      } else if (e.key === 'Escape') {
        elements.shortcutsModal.classList.add('hidden');
        closeFindBar();
        switchView('daily');
      }
    });
  }

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
