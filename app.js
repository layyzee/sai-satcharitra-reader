// ==========================================================================
// Sri Sai Satcharitra - Offline Application Engine (Enhanced)
// ==========================================================================

(function() {
  'use strict';

  // Application State
  const STATE_KEY = 'sai_satcharitra_state_v2';
  const FAVORITES_KEY = 'sai_favorites_v1';
  const REFLECTIONS_KEY = 'sai_reflections_v1';
  
  let state = {
    currentDailyChapter: 1, // 1 to 48
    activeReadingChapter: 1,
    completedChapters: [],  // list of completed chapter IDs
    streak: 1,
    lastReadDate: null,
    theme: 'sepia',
    fontSize: 'font-size-md',
    bookmarks: {}, // { chapterId: scrollPercent }
    soundEnabled: true,
    favorites: [],
    reflections: {}
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
    btnAmbientTanpura: document.getElementById('btn-ambient-tanpura'),
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
    resumeReadingContainer: document.getElementById('resume-reading-container'),
    resumeChapterName: document.getElementById('resume-chapter-name'),
    btnResumeBookmark: document.getElementById('btn-resume-bookmark'),
    btnToggleNotification: document.getElementById('btn-toggle-notification'),
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
    chapterReflectionInput: document.getElementById('chapter-reflection-input'),
    reflectionStatusLabel: document.getElementById('reflection-status-label'),

    // Chapters Directory
    chapterSearchInput: document.getElementById('chapter-search-input'),
    filterPills: document.querySelectorAll('.filter-pills-row .filter-pill'),
    chaptersGridContainer: document.getElementById('chapters-grid-container'),

    // Saptah View
    saptahDaysList: document.getElementById('saptah-days-list'),

    // Aartis View
    aartiTabBtns: document.querySelectorAll('.aarti-tab-btn'),
    aartiDisplayArea: document.getElementById('aarti-display-area'),

    // Sayings & Oracle View
    sayingsGridContainer: document.getElementById('sayings-grid-container'),
    btnDrawOracle: document.getElementById('btn-draw-oracle'),
    oracleGuidanceCard: document.getElementById('oracle-guidance-card'),
    btnCloseOracle: document.getElementById('btn-close-oracle'),
    btnAnotherOracle: document.getElementById('btn-another-oracle'),
    btnCopyOracle: document.getElementById('btn-copy-oracle'),
    oracleQuote: document.getElementById('oracle-quote'),
    oracleMeta: document.getElementById('oracle-meta'),
    oracleMeaning: document.getElementById('oracle-meaning'),
    sayingsSearchInput: document.getElementById('sayings-search-input'),
    sayingsFilterPills: document.querySelectorAll('#sayings-filter-container .filter-pill'),
    favCountBadge: document.getElementById('fav-count'),

    // Modal
    shortcutsModal: document.getElementById('shortcuts-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),

    // Mobile Bottom Navigation Bar
    mobileNavBtns: document.querySelectorAll('.mobile-nav-btn'),

    // Reader Floating Pill
    readerFloatingPill: document.getElementById('reader-floating-pill'),
    btnPillPrev: document.getElementById('btn-pill-prev'),
    btnPillNext: document.getElementById('btn-pill-next'),
    btnPillComplete: document.getElementById('btn-pill-complete'),
    btnPillTheme: document.getElementById('btn-pill-theme'),
    btnPillFontInc: document.getElementById('btn-pill-font-inc'),
    btnPillFontDec: document.getElementById('btn-pill-font-dec'),

    // Cross-Device Sync Modal Elements
    btnSyncModal: document.getElementById('btn-sync-modal'),
    syncModal: document.getElementById('sync-modal'),
    btnCloseSyncModal: document.getElementById('btn-close-sync-modal'),
    syncTabBtns: document.querySelectorAll('.sync-tab-btn'),
    syncTabPanels: document.querySelectorAll('.sync-tab-panel'),
    wifiStatusDot: document.getElementById('wifi-status-dot'),
    wifiStatusText: document.getElementById('wifi-status-text'),
    wifiLastSynced: document.getElementById('wifi-last-synced'),
    syncServerInput: document.getElementById('sync-server-input'),
    btnDoWifiSync: document.getElementById('btn-do-wifi-sync'),
    syncAutoLaunch: document.getElementById('sync-auto-launch'),
    btnCopySyncKey: document.getElementById('btn-copy-sync-key'),
    syncKeyInput: document.getElementById('sync-key-input'),
    btnApplySyncKey: document.getElementById('btn-apply-sync-key'),
    btnDownloadBackup: document.getElementById('btn-download-backup'),
    backupFileInput: document.getElementById('backup-file-input'),

    // Settings Modal Elements
    btnSettingsModal: document.getElementById('btn-settings-modal'),
    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettingsModal: document.getElementById('btn-close-settings-modal'),
    themeCardOptions: document.querySelectorAll('.theme-card-option'),
    fontScaleBtns: document.querySelectorAll('.font-scale-btn'),
    btnSettingsTanpura: document.getElementById('btn-settings-tanpura'),
    btnSettingsBell: document.getElementById('btn-settings-bell')
  };

  const fontSizes = ['font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl'];
  let currentDirectoryFilter = 'all';
  let currentSayingsCategory = 'all';
  let currentSayingsSearch = '';
  let audioCtx = null;

  // ==========================================================================
  // Web Audio Synthesizer: 528Hz Solfeggio Sacred Temple Bell
  // ==========================================================================

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTempleBell() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Solfeggio 528Hz transformation frequency harmonics
      const partials = [
        { freq: 528, gain: 0.55, decay: 3.2 },
        { freq: 1056, gain: 0.28, decay: 2.2 },
        { freq: 1584, gain: 0.16, decay: 1.5 },
        { freq: 2112, gain: 0.09, decay: 1.0 },
        { freq: 2640, gain: 0.04, decay: 0.7 }
      ];

      partials.forEach(p => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, now);

        gain.gain.setValueAtTime(p.gain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + p.decay);
      });
    } catch (err) {
      console.warn("Web Audio not available:", err);
    }
  }

  // ==========================================================================
  // Web Audio Synthesizer: Ambient Tanpura Meditation Drone
  // ==========================================================================

  let isTanpuraPlaying = false;
  let tanpuraTimer = null;
  let tanpuraGainNode = null;
  let tanpuraStringIndex = 0;

  // Traditional 4-string Tanpura tuning (Pa, Sa, Sa, Kharja Sa)
  const TANPURA_STRINGS = [
    { name: "Pa", freq: 196.00, gain: 0.35, decay: 4.5 },
    { name: "Sa", freq: 261.63, gain: 0.38, decay: 4.0 },
    { name: "Sa", freq: 261.63, gain: 0.38, decay: 4.0 },
    { name: "Kharja Sa", freq: 130.81, gain: 0.50, decay: 5.5 }
  ];

  function pluckTanpuraString(ctx, stringData) {
    if (!isTanpuraPlaying) return;
    const now = ctx.currentTime;
    
    // Resonant oscillator + harmonic overtone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const stringGain = ctx.createGain();

    // Jawari / thread buzzing overtone simulation
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3.0, now);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(stringData.freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(stringData.freq * 2, now);

    stringGain.gain.setValueAtTime(0.0001, now);
    stringGain.gain.linearRampToValueAtTime(stringData.gain, now + 0.04);
    stringGain.gain.exponentialRampToValueAtTime(0.0001, now + stringData.decay);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(stringGain);
    stringGain.connect(tanpuraGainNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + stringData.decay);
    osc2.stop(now + stringData.decay);
  }

  function toggleAmbientDrone() {
    try {
      const ctx = getAudioContext();
      if (!isTanpuraPlaying) {
        isTanpuraPlaying = true;
        if (!tanpuraGainNode) {
          tanpuraGainNode = ctx.createGain();
          tanpuraGainNode.gain.setValueAtTime(0.4, ctx.currentTime);
          tanpuraGainNode.connect(ctx.destination);
        }
        if (elements.btnAmbientTanpura) {
          elements.btnAmbientTanpura.classList.add('playing');
          elements.btnAmbientTanpura.title = "Pause Ambient Tanpura Drone (M)";
        }
        showToast("Tanpura Meditation Drone Active 🪕", "🪕");

        tanpuraStringIndex = 0;
        pluckTanpuraString(ctx, TANPURA_STRINGS[tanpuraStringIndex]);
        tanpuraStringIndex = (tanpuraStringIndex + 1) % TANPURA_STRINGS.length;

        tanpuraTimer = setInterval(() => {
          if (!isTanpuraPlaying) return;
          pluckTanpuraString(ctx, TANPURA_STRINGS[tanpuraStringIndex]);
          tanpuraStringIndex = (tanpuraStringIndex + 1) % TANPURA_STRINGS.length;
        }, 1350);
      } else {
        isTanpuraPlaying = false;
        clearInterval(tanpuraTimer);
        tanpuraTimer = null;
        if (elements.btnAmbientTanpura) {
          elements.btnAmbientTanpura.classList.remove('playing');
          elements.btnAmbientTanpura.title = "Play Ambient Tanpura Drone (M)";
        }
        showToast("Meditation Drone Paused", "🪕");
      }
    } catch (err) {
      console.warn("Could not start ambient drone:", err);
    }
  }

  // ==========================================================================
  // Bookmark UI & Desktop Wisdom Notifications
  // ==========================================================================

  function updateBookmarkUI() {
    if (!elements.resumeReadingContainer) return;
    const lastChap = state.lastReadChapter || state.activeReadingChapter;
    if (lastChap) {
      const chapters = window.SAI_CHAPTERS || [];
      const chapObj = chapters.find(c => c.id === lastChap) || chapters[0];
      if (chapObj && elements.resumeChapterName) {
        elements.resumeChapterName.textContent = `Chapter ${chapObj.id}: ${chapObj.title}`;
        elements.resumeReadingContainer.style.display = 'flex';
      }
    }
  }

  function initNotificationSystem() {
    if (!elements.btnToggleNotification) return;
    if (!('Notification' in window)) {
      elements.btnToggleNotification.style.display = 'none';
      return;
    }
    if (Notification.permission === 'granted') {
      elements.btnToggleNotification.classList.add('active');
      elements.btnToggleNotification.innerHTML = '✓ Daily Morning Wisdom Enabled';
      checkDailyNotification();
    } else {
      elements.btnToggleNotification.classList.remove('active');
      elements.btnToggleNotification.innerHTML = '🔔 Enable Daily Morning Wisdom';
    }
  }

  function checkDailyNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const todayStr = new Date().toISOString().split('T')[0];
    const lastNotified = localStorage.getItem('sai_last_notified_date');
    if (lastNotified !== todayStr) {
      sendDailyNotification();
      localStorage.setItem('sai_last_notified_date', todayStr);
    }
  }

  function sendDailyNotification(force = false) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
    const saying = sayings.length > 0 
      ? sayings[Math.floor(Math.random() * sayings.length)] 
      : { text: "Why fear when I am here? Surrender all worries at My feet.", title: "Divine Assurance" };

    try {
      const notif = new Notification("Om Sai Ram 🪔 - Daily Wisdom", {
        body: `"${saying.text}"\n— Sri Sai Baba`,
        icon: "assets/saibaba.jpg"
      });
      notif.onclick = () => {
        window.focus();
        switchView('daily');
      };
      if (force) showToast("Desktop Wisdom notification sent! 🔔", "🔔");
    } catch (e) {
      console.warn("Notification error:", e);
    }
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================

  let toastTimeout = null;
  function showToast(message, icon = "🪔") {
    if (!elements.toastNotification) return;
    elements.toastMessage.textContent = message;
    const iconSpan = elements.toastNotification.querySelector('.toast-icon');
    if (iconSpan) iconSpan.textContent = icon;

    elements.toastNotification.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      elements.toastNotification.classList.remove('visible');
    }, 2800);
  }

  function copyToClipboard(text, successToast = "Blessing copied to clipboard 📋") {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successToast, "📋");
      }).catch(() => {
        showToast("Copied to clipboard!", "📋");
      });
    } else {
      showToast("Copied!", "📋");
    }
  }

  // ==========================================================================
  // State Persistence
  // ==========================================================================

  function loadState() {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        state = { ...state, ...JSON.parse(saved) };
      }
      const savedFavs = localStorage.getItem(FAVORITES_KEY);
      if (savedFavs) {
        state.favorites = JSON.parse(savedFavs);
      }
      const savedNotes = localStorage.getItem(REFLECTIONS_KEY);
      if (savedNotes) {
        state.reflections = JSON.parse(savedNotes);
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

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
      updateFavoriteCount();
    } catch (e) {
      console.warn("Could not save favorites:", e);
    }
  }

  function saveReflections() {
    try {
      localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(state.reflections));
    } catch (e) {
      console.warn("Could not save reflections:", e);
    }
  }

  // ==========================================================================
  // Cross-Device Story & Save Sync Engine (Local Wi-Fi + Portable Key + JSON)
  // ==========================================================================

  function getSyncPayload() {
    return {
      version: 2,
      updatedAt: new Date().toISOString(),
      currentDailyChapter: state.currentDailyChapter,
      activeReadingChapter: state.activeReadingChapter,
      completedChapters: state.completedChapters || [],
      streak: state.streak || 1,
      lastReadDate: state.lastReadDate,
      lastReadChapter: state.lastReadChapter || state.activeReadingChapter,
      theme: state.theme,
      fontSize: state.fontSize,
      bookmarks: state.bookmarks || {},
      favorites: state.favorites || [],
      reflections: state.reflections || {}
    };
  }

  function mergeSyncStates(local, remote) {
    if (!remote || remote.empty) return local;

    // Union of completed chapters
    const completedSet = new Set([
      ...(local.completedChapters || []),
      ...(remote.completedChapters || [])
    ]);

    // Union of favorites
    const favSet = new Set([
      ...(local.favorites || []),
      ...(remote.favorites || [])
    ]);

    // Merge bookmarks
    const mergedBookmarks = { ...(local.bookmarks || {}), ...(remote.bookmarks || {}) };

    // Merge reflections
    const mergedReflections = { ...(local.reflections || {}) };
    if (remote.reflections) {
      Object.keys(remote.reflections).forEach(k => {
        if (!mergedReflections[k] || (remote.reflections[k].length > mergedReflections[k].length)) {
          mergedReflections[k] = remote.reflections[k];
        }
      });
    }

    // Determine latest reading position based on timestamps or chapter progress
    const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
    const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
    const preferRemote = remoteTime > localTime;

    return {
      ...local,
      completedChapters: Array.from(completedSet).sort((a,b) => a - b),
      favorites: Array.from(favSet),
      bookmarks: mergedBookmarks,
      reflections: mergedReflections,
      streak: Math.max(local.streak || 1, remote.streak || 1),
      activeReadingChapter: preferRemote ? (remote.activeReadingChapter || local.activeReadingChapter) : local.activeReadingChapter,
      lastReadChapter: preferRemote ? (remote.lastReadChapter || local.lastReadChapter) : (local.lastReadChapter || remote.lastReadChapter),
      lastReadDate: preferRemote ? (remote.lastReadDate || local.lastReadDate) : local.lastReadDate,
      theme: preferRemote ? (remote.theme || local.theme) : local.theme,
      fontSize: preferRemote ? (remote.fontSize || local.fontSize) : local.fontSize,
      updatedAt: new Date().toISOString()
    };
  }

  function updateSyncStatus(text, type = "normal") {
    if (elements.wifiStatusText) elements.wifiStatusText.textContent = text;
    if (elements.wifiStatusDot) {
      elements.wifiStatusDot.style.backgroundColor = (type === "success") ? "var(--success)" : (type === "syncing" ? "var(--accent-saffron)" : (type === "error" ? "#dc2626" : "var(--primary)"));
    }
  }

  async function performWifiSync(silent = false) {
    let serverBase = (elements.syncServerInput ? elements.syncServerInput.value.trim() : '') || 'http://192.168.68.102:8080';
    if (window.location.port === '8080') {
      serverBase = window.location.origin;
    }
    serverBase = serverBase.replace(/\/+$/, '');

    updateSyncStatus("Contacting Mac server...", "syncing");
    try {
      const getRes = await fetch(`${serverBase}/api/sync`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      let remoteData = {};
      if (getRes.ok) {
        remoteData = await getRes.json();
      }

      // Merge remote with local
      const merged = mergeSyncStates(state, remoteData);
      state = merged;
      saveState();
      saveFavorites();
      saveReflections();

      // Send merged state back to server
      const payload = getSyncPayload();
      await fetch(`${serverBase}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('sai_last_synced_time', nowTime);
      if (elements.wifiLastSynced) {
        elements.wifiLastSynced.textContent = `Last synced: Today at ${nowTime}`;
      }
      updateSyncStatus("Synced with Mac ✓", "success");

      // Refresh UI to display merged chapters and reflections
      updateDashboardUI();
      updateBookmarkUI();
      applyTheme(state.theme);
      applyFontSize(state.fontSize);
      renderChaptersDirectory();
      renderSaptahSchedule();

      if (!silent) {
        showToast("Stories & Reading Progress Synced with Mac ✓", "🔄");
      }
    } catch (err) {
      console.warn("Wi-Fi Sync warning:", err);
      updateSyncStatus("Could not reach Mac server", "error");
      if (!silent) {
        showToast("Could not reach Mac server on Wi-Fi. Check address.", "⚠️");
      }
    }
  }

  function exportSyncKey() {
    try {
      const payload = getSyncPayload();
      const jsonStr = JSON.stringify(payload);
      const b64Key = btoa(unescape(encodeURIComponent(jsonStr)));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(b64Key).then(() => {
          showToast("Sync Key copied to clipboard! 📋", "✓");
        }).catch(() => {
          prompt("Copy your Sync Key:", b64Key);
        });
      } else {
        prompt("Copy your Sync Key:", b64Key);
      }
    } catch (err) {
      showToast("Error generating sync key", "⚠️");
    }
  }

  function importSyncKey() {
    const key = elements.syncKeyInput ? elements.syncKeyInput.value.trim() : '';
    if (!key) {
      showToast("Please paste a Sync Key first", "⚠️");
      return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(key)));
      const parsed = JSON.parse(decoded);
      state = mergeSyncStates(state, parsed);
      saveState();
      saveFavorites();
      saveReflections();
      updateDashboardUI();
      updateBookmarkUI();
      applyTheme(state.theme);
      applyFontSize(state.fontSize);
      renderChaptersDirectory();
      renderSaptahSchedule();
      showToast("Progress successfully restored from Sync Key! ✓", "🌟");
      if (elements.syncKeyInput) elements.syncKeyInput.value = '';
      if (elements.syncModal) elements.syncModal.classList.add('hidden');
    } catch (err) {
      showToast("Invalid Sync Key format", "⚠️");
    }
  }

  function downloadBackupFile() {
    const payload = getSyncPayload();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `sai-satcharitra-backup-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast("Backup file downloaded! 💾", "✓");
  }

  function restoreBackupFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        state = mergeSyncStates(state, parsed);
        saveState();
        saveFavorites();
        saveReflections();
        updateDashboardUI();
        updateBookmarkUI();
        applyTheme(state.theme);
        applyFontSize(state.fontSize);
        renderChaptersDirectory();
        renderSaptahSchedule();
        showToast("Backup restored successfully! ✓", "🌟");
        if (elements.syncModal) elements.syncModal.classList.add('hidden');
      } catch (err) {
        showToast("Failed to parse backup file", "⚠️");
      }
    };
    reader.readAsText(file);
  }

  function setupDate() {
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    if (elements.currentDateBadge) {
      elements.currentDateBadge.textContent = today.toLocaleDateString('en-US', options);
    }
  }

  // ==========================================================================
  // Dynamic Saying Generator
  // ==========================================================================

  function setDynamicSaying(index = null) {
    const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
    if (sayings.length === 0 || !elements.dailyDynamicSaying) return;

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
      elements.dailyDynamicSaying.textContent = `"${saying.quote}"`;
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

    // Sync Desktop Nav Tabs
    elements.navTabs.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Sync Mobile Bottom Nav Buttons
    if (elements.mobileNavBtns) {
      elements.mobileNavBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
      });
    }

    // Show floating thumb toolbar only during active reading mode
    if (elements.readerFloatingPill) {
      elements.readerFloatingPill.style.display = (viewName === 'reader') ? 'inline-flex' : 'none';
    }

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
    if (elements.themeCardOptions) {
      elements.themeCardOptions.forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-theme') === themeName);
      });
    }
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
    if (elements.fontScaleBtns) {
      elements.fontScaleBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-size') === sizeClass);
      });
    }
    saveState();
  }

  // ==========================================================================
  // Streak & Daily Calculation
  // ==========================================================================

  function computeDailyChapter() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const chaptersCount = (window.SAI_CHAPTERS || []).length || 48;
    return (dayOfYear % chaptersCount) + 1;
  }

  function checkAndUpdateStreak() {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!state.lastReadDate) {
      state.streak = 1;
    } else {
      const last = new Date(state.lastReadDate);
      const today = new Date(todayStr);
      const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
      } else if (diffDays > 1) {
        state.streak = 1; // reset streak if missed
      }
    }
    saveState();
  }

  function updateDashboardUI() {
    const chapters = window.SAI_CHAPTERS || [];
    const totalCount = chapters.length || 48;
    const completedCount = state.completedChapters.length;
    const remainingCount = Math.max(0, totalCount - completedCount);
    const percent = Math.round((completedCount / totalCount) * 100);

    // Stats
    elements.statCompletedCount.textContent = completedCount;
    elements.statStreakCount.textContent = state.streak;
    elements.statRemainingCount.textContent = remainingCount;

    // Progress Bar
    elements.overallProgressFill.style.width = `${percent}%`;
    elements.progressText.textContent = `${completedCount} of ${totalCount} Chapters Completed (${percent}%)`;

    // Today Chapter Focus Card
    const dailyChap = chapters.find(c => c.id === state.currentDailyChapter) || chapters[0];
    if (dailyChap) {
      elements.dailyChapBadge.textContent = dailyChap.short_title;
      elements.dailyReadTime.textContent = `~${dailyChap.reading_time_mins} min read`;
      elements.dailyChapTitle.textContent = dailyChap.title.replace(/^Sai Satcharitra /i, '');

      // Topics
      elements.dailyChapTopics.innerHTML = '';
      if (dailyChap.topics && dailyChap.topics.length > 0) {
        dailyChap.topics.forEach(t => {
          const tag = document.createElement('span');
          tag.className = 'topic-tag';
          tag.textContent = t;
          elements.dailyChapTopics.appendChild(tag);
        });
      }

      // Mark Today Complete Button State
      const isTodayDone = state.completedChapters.includes(dailyChap.id);
      elements.btnMarkTodayComplete.classList.toggle('done', isTodayDone);
      elements.btnMarkTodayComplete.innerHTML = isTodayDone 
        ? '<span>✓</span> Completed Today' 
        : '<span>✓</span> Mark Completed';
    }
  }

  function markChapterComplete(chapterId) {
    if (!state.completedChapters.includes(chapterId)) {
      state.completedChapters.push(chapterId);
      
      const todayStr = new Date().toISOString().slice(0, 10);
      if (state.lastReadDate !== todayStr) {
        state.streak = (state.streak || 0) + 1;
        state.lastReadDate = todayStr;
      }

      saveState();
      playTempleBell();
      showToast(`Chapter ${chapterId} Completed! May Sai Baba bless you 🙏`, '🌸');
      updateDashboardUI();
      renderChaptersDirectory();
      renderSaptahSchedule();
    }
  }

  function toggleChapterComplete(chapterId) {
    const idx = state.completedChapters.indexOf(chapterId);
    if (idx > -1) {
      state.completedChapters.splice(idx, 1);
      showToast(`Marked Chapter ${chapterId} as unread`, '📖');
    } else {
      markChapterComplete(chapterId);
    }
    saveState();
    updateDashboardUI();
    updateReaderCompletionButton(chapterId);
    renderChaptersDirectory();
    renderSaptahSchedule();
  }

  // ==========================================================================
  // Reader View Logic
  // ==========================================================================

  function openChapter(chapterId) {
    const chapters = window.SAI_CHAPTERS || [];
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    state.activeReadingChapter = chapterId;
    state.lastReadChapter = chapterId;
    saveState();
    updateBookmarkUI();

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

    // Reflection Journal
    if (elements.chapterReflectionInput) {
      elements.chapterReflectionInput.value = state.reflections[chapter.id] || '';
      elements.reflectionStatusLabel.textContent = state.reflections[chapter.id] 
        ? 'Saved offline ✓' 
        : 'Auto-saves offline';
    }

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
      const regex = new RegExp(`(${clean})`, 'gi');
      let count = 0;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = chapter.content;

      function highlightText(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const match = node.nodeValue.match(regex);
          if (match) {
            count += match.length;
            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(regex, '<mark class="find-highlight">$1</mark>');
            node.parentNode.replaceChild(span, node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'MARK') {
          Array.from(node.childNodes).forEach(highlightText);
        }
      }

      Array.from(tempDiv.childNodes).forEach(highlightText);
      elements.readerBody.innerHTML = tempDiv.innerHTML;
      elements.readerFindCount.textContent = `${count} found`;

      const firstMatch = elements.readerBody.querySelector('mark.find-highlight');
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      console.warn("Search regex error:", e);
    }
  }

  // ==========================================================================
  // View 3: All Chapters Directory
  // ==========================================================================

  function renderChaptersDirectory(query = '') {
    const chapters = window.SAI_CHAPTERS || [];
    const container = elements.chaptersGridContainer;
    if (!container) return;
    container.innerHTML = '';

    const cleanQuery = query.toLowerCase().trim();

    chapters.forEach(c => {
      const isCompleted = state.completedChapters.includes(c.id);
      const isToday = c.id === state.currentDailyChapter;
      const hasNote = !!(state.reflections && state.reflections[c.id]);

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

      const noteHtml = hasNote
        ? '<span class="chapter-has-note-badge" title="You wrote personal reflections for this chapter">✍️ Note</span>'
        : '';

      const topicsSnippet = c.topics.length > 0 
        ? c.topics.slice(0, 2).join(' • ') 
        : 'Spiritual discourse and divine leelas of Shirdi Sai Baba.';

      card.innerHTML = `
        <div>
          <div class="chap-card-top">
            <span class="card-number">${c.short_title}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              ${noteHtml}
              ${statusHtml}
            </div>
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
    if (!container) return;
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
  // View 5: Daily Aartis of Shirdi
  // ==========================================================================

  function renderAarti(aartiId = 'kakad') {
    elements.aartiTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-aarti') === aartiId);
    });

    const aartis = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.aartis) || [];
    const aarti = aartis.find(a => a.id === aartiId) || aartis[0];
    if (!aarti || !elements.aartiDisplayArea) return;

    elements.aartiDisplayArea.innerHTML = `
      <div class="aarti-card-heading">
        <span class="aarti-time-pill">${aarti.time}</span>
        <h3 class="aarti-main-name">${aarti.name}</h3>
        <p class="aarti-sub-name">${aarti.subtitle}</p>
      </div>

      <div class="aarti-meaning-box">
        <strong>Spiritual Significance:</strong> ${aarti.meaning}
      </div>

      <div class="aarti-verses-list">
        ${aarti.verses.map(v => `<p class="aarti-verse-item">${v}</p>`).join('')}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <button id="btn-aarti-bell" class="btn-primary-read" style="font-size: 13.5px; padding: 8px 18px;">
          🔔 Chime Aarti Bell
        </button>
      </div>
    `;

    const aartiBellBtn = document.getElementById('btn-aarti-bell');
    if (aartiBellBtn) {
      aartiBellBtn.addEventListener('click', () => {
        playTempleBell();
        showToast(`Offering Aarti Prayers: ${aarti.name}`, '🪔');
      });
    }
  }

  // ==========================================================================
  // View 6: Divine Sayings & Oracle Guidance (52 Authentic Pearls)
  // ==========================================================================

  function updateFavoriteCount() {
    if (elements.favCountBadge) {
      elements.favCountBadge.textContent = state.favorites.length;
    }
  }

  function renderSayings(category = currentSayingsCategory, query = currentSayingsSearch) {
    currentSayingsCategory = category;
    currentSayingsSearch = query;

    const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
    const container = elements.sayingsGridContainer;
    if (!container) return;
    container.innerHTML = '';

    const cleanQuery = query.toLowerCase().trim();

    const filtered = sayings.filter(s => {
      // Category filter
      if (category === 'favorites') {
        if (!state.favorites.includes(s.id)) return false;
      } else if (category !== 'all') {
        if (s.category !== category) return false;
      }

      // Search query filter
      if (cleanQuery) {
        const qMatch = (s.quote || '').toLowerCase().includes(cleanQuery);
        const mMatch = (s.meaning || '').toLowerCase().includes(cleanQuery);
        const cMatch = (s.context || '').toLowerCase().includes(cleanQuery);
        const lMatch = (s.categoryLabel || '').toLowerCase().includes(cleanQuery);
        if (!qMatch && !mMatch && !cMatch && !lMatch) return false;
      }

      return true;
    });

    filtered.forEach(s => {
      const isFav = state.favorites.includes(s.id);
      const card = document.createElement('div');
      card.className = 'saying-card';
      card.innerHTML = `
        <div>
          <div class="saying-card-top">
            <span class="saying-badge">${s.categoryLabel || 'Divine Assurance'}</span>
            <span class="saying-num">#${s.number}</span>
          </div>
          <blockquote class="saying-quote">"${s.quote}"</blockquote>
          <div class="saying-meaning-box">
            <strong>Reflection:</strong> ${s.meaning}
          </div>
        </div>
        <div class="saying-card-footer">
          <span class="saying-context" title="${s.context}">${s.context}</span>
          <div class="saying-card-actions">
            <button class="btn-card-action btn-fav-saying ${isFav ? 'starred' : ''}" data-id="${s.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ${isFav ? '★' : '☆'}
            </button>
            <button class="btn-card-action btn-copy-saying" title="Copy Blessing">
              📋
            </button>
          </div>
        </div>
      `;

      // Star / Favorite toggle
      card.querySelector('.btn-fav-saying').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(s.id);
      });

      // Copy blessing quote
      card.querySelector('.btn-copy-saying').addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(`"${s.quote}" — Sri Sai Baba (${s.context})`);
      });

      container.appendChild(card);
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
        <p style="font-size: 32px; margin-bottom: 10px;">🪔</p>
        <p style="font-size: 16px; font-weight: 600;">No divine sayings found for your search.</p>
        <p style="font-size: 13px; margin-top: 4px;">Try searching another keyword (e.g. fear, saburi, dog, sparrow) or clear filters.</p>
      </div>`;
    }

    updateFavoriteCount();
  }

  function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
      showToast("Removed from favorites", "☆");
    } else {
      state.favorites.push(id);
      showToast("Saved to your Starred Favorites ⭐", "⭐");
    }
    saveFavorites();
    renderSayings();
  }

  function drawOracleGuidance() {
    const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
    if (sayings.length === 0 || !elements.oracleGuidanceCard) return;

    playTempleBell();

    const randomIdx = Math.floor(Math.random() * sayings.length);
    const selected = sayings[randomIdx];

    elements.oracleQuote.textContent = `"${selected.quote}"`;
    elements.oracleMeta.textContent = `— ${selected.context} • ${selected.categoryLabel}`;
    elements.oracleMeaning.innerHTML = `<strong>Baba's Guidance for You:</strong> ${selected.meaning}`;

    elements.oracleGuidanceCard.classList.remove('hidden');
    elements.oracleGuidanceCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    showToast("Baba has spoken to your heart 🪔", "🪔");
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

    // Dynamic Blessing Refresh on Home
    elements.btnRefreshSaying.addEventListener('click', () => {
      const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
      const randomIdx = Math.floor(Math.random() * sayings.length);
      setDynamicSaying(randomIdx);
      playTempleBell();
      showToast("Divine Blessing refreshed ✨", "✨");
    });

    // Theme Switches
    elements.themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(btn.getAttribute('data-theme'));
      });
    });

    // Font Sizing Controls (Header & Settings)
    if (elements.btnFontDec) {
      elements.btnFontDec.addEventListener('click', () => {
        const idx = fontSizes.indexOf(state.fontSize);
        if (idx > 0) applyFontSize(fontSizes[idx - 1]);
      });
    }

    if (elements.btnFontReset) {
      elements.btnFontReset.addEventListener('click', () => {
        applyFontSize('font-size-md');
      });
    }

    if (elements.btnFontInc) {
      elements.btnFontInc.addEventListener('click', () => {
        const idx = fontSizes.indexOf(state.fontSize);
        if (idx < fontSizes.length - 1) applyFontSize(fontSizes[idx + 1]);
      });
    }

    // Mobile Bottom Navigation Tabs
    if (elements.mobileNavBtns) {
      elements.mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const view = btn.getAttribute('data-view');
          if (view) switchView(view);
        });
      });
    }

    // Reader Floating Thumb Toolbar
    if (elements.btnPillPrev) {
      elements.btnPillPrev.addEventListener('click', () => {
        if (state.activeReadingChapter > 1) openChapter(state.activeReadingChapter - 1);
      });
    }
    if (elements.btnPillNext) {
      elements.btnPillNext.addEventListener('click', () => {
        const chapters = window.SAI_CHAPTERS || [];
        if (state.activeReadingChapter < chapters.length) openChapter(state.activeReadingChapter + 1);
      });
    }
    if (elements.btnPillComplete) {
      elements.btnPillComplete.addEventListener('click', () => {
        markChapterComplete(state.activeReadingChapter);
        const chapters = window.SAI_CHAPTERS || [];
        if (state.activeReadingChapter < chapters.length) {
          openChapter(state.activeReadingChapter + 1);
        } else {
          alert("🎉 Congratulations! You have completed all 48 chapters of Sri Sai Satcharitra! May Sai Baba's grace be upon you. Om Sai Ram!");
          switchView('daily');
        }
      });
    }
    if (elements.btnPillTheme) {
      elements.btnPillTheme.addEventListener('click', cycleTheme);
    }
    if (elements.btnPillFontInc) {
      elements.btnPillFontInc.addEventListener('click', () => {
        const idx = fontSizes.indexOf(state.fontSize);
        if (idx < fontSizes.length - 1) applyFontSize(fontSizes[idx + 1]);
      });
    }
    if (elements.btnPillFontDec) {
      elements.btnPillFontDec.addEventListener('click', () => {
        const idx = fontSizes.indexOf(state.fontSize);
        if (idx > 0) applyFontSize(fontSizes[idx - 1]);
      });
    }

    // Sync Modal Open / Close & Actions
    if (elements.btnSyncModal && elements.syncModal) {
      elements.btnSyncModal.addEventListener('click', () => {
        elements.syncModal.classList.remove('hidden');
      });
    }
    if (elements.btnCloseSyncModal && elements.syncModal) {
      elements.btnCloseSyncModal.addEventListener('click', () => {
        elements.syncModal.classList.add('hidden');
      });
    }
    if (elements.syncModal) {
      elements.syncModal.addEventListener('click', (e) => {
        if (e.target === elements.syncModal) elements.syncModal.classList.add('hidden');
      });
    }
    if (elements.syncTabBtns) {
      elements.syncTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          elements.syncTabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tabKey = btn.getAttribute('data-tab');
          if (elements.syncTabPanels) {
            elements.syncTabPanels.forEach(panel => {
              panel.classList.toggle('active', panel.id === `sync-panel-${tabKey}`);
            });
          }
        });
      });
    }
    if (elements.btnDoWifiSync) {
      elements.btnDoWifiSync.addEventListener('click', () => performWifiSync(false));
    }
    if (elements.btnCopySyncKey) {
      elements.btnCopySyncKey.addEventListener('click', exportSyncKey);
    }
    if (elements.btnApplySyncKey) {
      elements.btnApplySyncKey.addEventListener('click', importSyncKey);
    }
    if (elements.btnDownloadBackup) {
      elements.btnDownloadBackup.addEventListener('click', downloadBackupFile);
    }
    if (elements.backupFileInput) {
      elements.backupFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) restoreBackupFile(e.target.files[0]);
      });
    }

    // Settings Modal Open / Close & Controls
    if (elements.btnSettingsModal && elements.settingsModal) {
      elements.btnSettingsModal.addEventListener('click', () => {
        elements.settingsModal.classList.remove('hidden');
      });
    }
    if (elements.btnCloseSettingsModal && elements.settingsModal) {
      elements.btnCloseSettingsModal.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
      });
    }
    if (elements.settingsModal) {
      elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) elements.settingsModal.classList.add('hidden');
      });
    }
    if (elements.themeCardOptions) {
      elements.themeCardOptions.forEach(card => {
        card.addEventListener('click', () => {
          applyTheme(card.getAttribute('data-theme'));
        });
      });
    }
    if (elements.fontScaleBtns) {
      elements.fontScaleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          applyFontSize(btn.getAttribute('data-size'));
        });
      });
    }
    if (elements.btnSettingsTanpura) {
      elements.btnSettingsTanpura.addEventListener('click', toggleAmbientDrone);
    }
    if (elements.btnSettingsBell) {
      elements.btnSettingsBell.addEventListener('click', () => {
        playTempleBell();
        showToast("Om Sai Ram", "🔔");
      });
    }

    // Daily View Actions
    elements.btnReadToday.addEventListener('click', () => {
      openChapter(state.currentDailyChapter);
    });

    elements.btnMarkTodayComplete.addEventListener('click', () => {
      toggleChapterComplete(state.currentDailyChapter);
    });

    elements.btnResetParayan.addEventListener('click', () => {
      if (confirm("Reset reading progress and start a fresh Parayan cycle?")) {
        state.completedChapters = [];
        state.bookmarks = {};
        saveState();
        updateDashboardUI();
        renderChaptersDirectory();
        renderSaptahSchedule();
        showToast("Parayan reset for a fresh blessed cycle 🙏", "🪔");
      }
    });

    // Reader Actions
    elements.btnBackToDaily.addEventListener('click', () => switchView('daily'));

    elements.readerChapterDropdown.addEventListener('change', (e) => {
      openChapter(parseInt(e.target.value, 10));
    });

    elements.btnReaderMarkComplete.addEventListener('click', () => {
      toggleChapterComplete(state.activeReadingChapter);
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

    // Reader Reflection Journal Input (Debounced Auto-save)
    if (elements.chapterReflectionInput) {
      let reflectionTimeout = null;
      elements.chapterReflectionInput.addEventListener('input', () => {
        elements.reflectionStatusLabel.textContent = 'Saving...';
        clearTimeout(reflectionTimeout);
        reflectionTimeout = setTimeout(() => {
          state.reflections[state.activeReadingChapter] = elements.chapterReflectionInput.value.trim();
          saveReflections();
          elements.reflectionStatusLabel.textContent = 'Saved offline ✓';
          renderChaptersDirectory();
        }, 400);
      });
    }

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

    // Sayings View: Oracle Guidance Trigger
    if (elements.btnDrawOracle) {
      elements.btnDrawOracle.addEventListener('click', drawOracleGuidance);
    }
    if (elements.btnCloseOracle) {
      elements.btnCloseOracle.addEventListener('click', () => {
        elements.oracleGuidanceCard.classList.add('hidden');
      });
    }
    if (elements.btnAnotherOracle) {
      elements.btnAnotherOracle.addEventListener('click', drawOracleGuidance);
    }
    if (elements.btnCopyOracle) {
      elements.btnCopyOracle.addEventListener('click', () => {
        const quote = elements.oracleQuote.textContent;
        const meta = elements.oracleMeta.textContent;
        copyToClipboard(`${quote} ${meta}`, "Divine Guidance copied 📋");
      });
    }

    // Sayings Search Input
    if (elements.sayingsSearchInput) {
      elements.sayingsSearchInput.addEventListener('input', (e) => {
        renderSayings(currentSayingsCategory, e.target.value);
      });
    }

    // Sayings Category Filter Pills
    elements.sayingsFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.sayingsFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-category');
        renderSayings(cat, elements.sayingsSearchInput ? elements.sayingsSearchInput.value : '');
      });
    });

    // Ambient Tanpura Meditation Drone Button
    if (elements.btnAmbientTanpura) {
      elements.btnAmbientTanpura.addEventListener('click', toggleAmbientDrone);
    }

    // Resume Bookmark Action
    if (elements.btnResumeBookmark) {
      elements.btnResumeBookmark.addEventListener('click', () => {
        openChapter(state.lastReadChapter || state.currentDailyChapter || 1);
      });
    }

    // Daily Wisdom Notifications Toggle
    if (elements.btnToggleNotification) {
      elements.btnToggleNotification.addEventListener('click', () => {
        if (!('Notification' in window)) {
          showToast("Notifications not supported in browser", "⚠️");
          return;
        }
        if (Notification.permission === 'granted') {
          sendDailyNotification(true);
        } else {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              elements.btnToggleNotification.classList.add('active');
              elements.btnToggleNotification.innerHTML = '✓ Daily Morning Wisdom Enabled';
              sendDailyNotification(true);
            } else {
              showToast("Notifications permission not granted", "⚠️");
            }
          });
        }
      });
    }

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
      } else if (e.key.toLowerCase() === 'm') {
        toggleAmbientDrone();
      } else if (e.key === '?') {
        elements.shortcutsModal.classList.toggle('hidden');
      } else if (e.key === 'Escape') {
        if (elements.shortcutsModal) elements.shortcutsModal.classList.add('hidden');
        if (elements.syncModal) elements.syncModal.classList.add('hidden');
        if (elements.settingsModal) elements.settingsModal.classList.add('hidden');
        closeFindBar();
        switchView('daily');
      }
    });
  }

  // ==========================================================================
  // App Initialization
  // ==========================================================================

  function init() {
    loadState();
    setupDate();

    // Check if daily chapter needs update
    state.currentDailyChapter = computeDailyChapter();
    checkAndUpdateStreak();

    // Apply saved preferences
    applyTheme(state.theme || 'sepia');
    applyFontSize(state.fontSize || 'font-size-md');

    // Populate Views
    updateDashboardUI();
    updateBookmarkUI();
    setDynamicSaying();
    populateReaderDropdown();
    renderChaptersDirectory();
    renderSaptahSchedule();
    renderAarti('kakad');
    renderSayings('all', '');

    // Check for previous sync time
    const lastSync = localStorage.getItem('sai_last_synced_time');
    if (lastSync && elements.wifiLastSynced) {
      elements.wifiLastSynced.textContent = `Last synced: Today at ${lastSync}`;
    }

    // Hide Install button if running in native Capacitor APK or standalone PWA
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.Capacitor !== undefined || window.navigator.standalone;
    const installBtn = document.getElementById('btn-pwa-install');
    if (isStandalone && installBtn) {
      installBtn.style.display = 'none';
      installBtn.classList.add('hidden');
    }

    // Attempt silent Wi-Fi auto-sync on launch
    setTimeout(() => {
      if (elements.syncAutoLaunch && elements.syncAutoLaunch.checked) {
        performWifiSync(true);
      }
    }, 600);

    // Initialize notifications
    initNotificationSystem();

    // Bind all events
    bindEvents();
  }

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
