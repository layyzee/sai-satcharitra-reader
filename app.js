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
    reflections: {},
    saptahStartDate: null // e.g. "2026-11-22"
  };

  // 8 Curated Spiritual Guidance Themes (Find Leelas by Emotion & Need)
  const SPIRITUAL_THEMES = [
    {
      id: 'faith_saburi',
      icon: '🕊️',
      title: 'Faith & Patience (Shraddha & Saburi)',
      summary: 'Trusting Baba\'s divine timing, remaining steadfast through trials, and surrendering all anxious doubts.',
      chapters: [6, 19, 45, 49],
      keyQuote: '"Have faith and patience; whoever steps on Shirdi soil will have their afflictions ended."'
    },
    {
      id: 'anxiety_peace',
      icon: '🪔',
      title: 'Calming Anxiety, Fear & Finding Peace',
      summary: 'Overcoming mental worry, fear of the future, restlessness, and finding refuge under Baba\'s protection.',
      chapters: [12, 13, 23],
      keyQuote: '"Why fear when I am here? Cast all your burdens on Me and I will bear them."'
    },
    {
      id: 'healing_udi',
      icon: '🌿',
      title: 'Health, Healing & The Sacred Udi',
      summary: 'Divine relief from illness, bodily suffering, scorpion stings, fevers, and miraculous cures through Udi.',
      chapters: [33, 34, 35],
      keyQuote: '"Udi is the universal medicine. It bestows spiritual discernment and destroys all bodily pains."'
    },
    {
      id: 'protection_danger',
      icon: '🐍',
      title: 'Protection from Dangers & Calamities',
      summary: 'Miraculous rescues from deadly serpents, scorpions, stormy rains, thieves, and mortal crises.',
      chapters: [21, 22, 30],
      keyQuote: '"Even if the devotee is thousands of miles away, I will draw him to Me as a sparrow tied to a string."'
    },
    {
      id: 'greed_ego',
      icon: '⚖️',
      title: 'Overcoming Greed, Ego & Pride',
      summary: 'Detachment from excessive wealth, overcoming arrogance, cultivating humility and willing charity.',
      chapters: [16, 17, 36, 47],
      keyQuote: '"Unless a man unfastens the knots of avarice in his pocket, how can he attain Brahma-Jnana?"'
    },
    {
      id: 'guru_bhakti',
      icon: '🌺',
      title: 'Surrender, Guru Grace & 9 Forms of Bhakti',
      summary: 'Devotion to the Sadguru, Navavidha Bhakti, and total self-surrender (Prapatti).',
      chapters: [18, 19, 32, 43],
      keyQuote: '"Look to Me, and I will look to you. My tomb shall speak and move with those who make Me their refuge."'
    },
    {
      id: 'compassion_beings',
      icon: '🐾',
      title: 'Compassion to Animals & All Beings',
      summary: 'Seeing God in dogs, horses, birds, and the hungry stranger. The oneness of all living creation.',
      chapters: [9, 20, 42],
      keyQuote: '"He who feeds the hungry really feeds Me. Never kick or shun any creature, for I dwell within them all."'
    },
    {
      id: 'self_realization',
      icon: '💡',
      title: 'Spiritual Wisdom & Self-Realization',
      summary: 'The mystery of the inner Atman, Ishavasya Upanishad, the grinding of wheat, and liberation.',
      chapters: [1, 20, 50],
      keyQuote: '"Know thyself. The Guru will lead you across the ocean of worldly existence."'
    }
  ];

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

  // 8 Authentic Historical Photographs of Shirdi Sai Baba (1890–1918)
  const DARSHAN_PHOTOS = [
    {
      id: 'darshan-1',
      file: 'assets/darshan/01_seated_stone.jpg',
      title: 'The Divine Seated Posture (The Sacred Stone)',
      period: 'Circa 1910',
      location: 'Dwarakamai / Lendi Baug, Shirdi',
      description: 'The world-famous, immortal posture of Baba seated on the sacred stone with His right foot placed over the left knee. Devotees would sit in silent reverence around Him in the mosque.',
      chapterId: 4,
      chapterTitle: 'Chapter 4 & 5: First Arrival & Abode in Dwarakamai'
    },
    {
      id: 'darshan-2',
      file: 'assets/darshan/02_satka_baton.jpg',
      title: 'Baba with the Sacred Satka (Wooden Baton)',
      period: 'Circa 1912',
      location: 'Dwarakamai, Shirdi',
      description: 'Authentic portrait of Baba holding His short wooden stick (Satka), which He always carried along with His tin tumbler (Tumrel). Baba used this Satka to tap the ground and dispel unseen obstacles.',
      chapterId: 10,
      chapterTitle: "Chapter 10: Baba's Mode of Life & His Sacred Satka"
    },
    {
      id: 'darshan-3',
      file: 'assets/darshan/03_seen_from_back.jpg',
      title: 'Walking to Lendi Baug (Seen from Behind)',
      period: 'Circa 1915',
      location: 'Pilgrim Pathway to Lendi Baug',
      description: 'An exceedingly rare and candid photograph captured by a devotee from behind, showing Baba in His simple white kafni walking quietly toward the Lendi Garden to tend the earthenware oil lamps (Nanda-deep).',
      chapterId: 5,
      chapterTitle: 'Chapter 5: Baba at the Lendi Garden & Tending the Deepams'
    },
    {
      id: 'darshan-4',
      file: 'assets/darshan/04_chavadi_procession.jpg',
      title: 'The Magnificent Chavadi Procession',
      period: 'Circa 1915',
      location: 'Pathway between Dwarakamai and Chavadi',
      description: 'Every alternate night, Baba was escorted from the mosque to the Chavadi in a grand royal procession with palanquins, torches (mashaals), singing bhajan mandalis, and devotees holding the ceremonial chhatra (umbrella).',
      chapterId: 37,
      chapterTitle: 'Chapter 37: The Ceremonial Chavadi Procession'
    },
    {
      id: 'darshan-5',
      file: 'assets/darshan/05_chavadi_crown.jpg',
      title: 'Baba in Chavadi with Devotees\' Crown & Garlands',
      period: 'Circa 1916',
      location: 'Chavadi, Shirdi',
      description: 'Baba seated in state inside the Chavadi adorned with floral garlands and a silver-plated crown placed upon His holy head by loving devotees during Thursday night aarti.',
      chapterId: 37,
      chapterTitle: 'Chapter 37: Night Aarti and Worship in the Chavadi'
    },
    {
      id: 'darshan-6',
      file: 'assets/darshan/06_with_buti_dixit.jpg',
      title: 'With Shrimant Gopalrao Buti & Kakasaheb Dixit',
      period: 'Circa 1916',
      location: 'Dwarakamai, Shirdi',
      description: 'Historical gathering in Dwarakamai. Beside Baba sits Shrimant Gopalrao Mukund Buti, the wealthy Nagpur devotee whom Baba instructed to build the stone Wada that would eventually become the Samadhi Mandir.',
      chapterId: 43,
      chapterTitle: 'Chapter 43: The Building of Buti Wada (Samadhi Mandir)'
    },
    {
      id: 'darshan-7',
      file: 'assets/darshan/07_face_prominent.jpg',
      title: 'The Holy Countenance & Merciful Eyes',
      period: 'Circa 1917',
      location: 'Dwarakamai, Shirdi',
      description: 'A close-up photographic study of Baba\'s radiant countenance, showing the authentic texture of His kafni, white headwrap, and His penetrating, compassionate gaze that promised: "Look to Me, and I will look to you."',
      chapterId: 18,
      chapterTitle: 'Chapter 18 & 19: The Glance of the Sadguru'
    },
    {
      id: 'darshan-8',
      file: 'assets/darshan/08_final_years_1918.jpg',
      title: 'Final Physical Days at Shirdi (Maha-Samadhi Year)',
      period: '1918',
      location: 'Dwarakamai, Shirdi',
      description: 'An authentic archival photograph taken in 1918, the year Baba attained Maha-Samadhi on Vijayadashami (October 15, 1918). Baba remained fully alert, bestowing blessings and charan-sparsh until His last breath.',
      chapterId: 42,
      chapterTitle: 'Chapter 42 & 43: Baba\'s Maha-Samadhi and Eternal Life'
    }
  ];

  // Helper to decode HTML entities (e.g. &#8217;, &nbsp;) and clean whitespace
  function decodeHtml(str) {
    if (!str) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value.replace(/\u00a0/g, ' ').trim();
  }

  // Pre-sanitize all chapter titles and topics in memory on startup
  if (window.SAI_CHAPTERS && Array.isArray(window.SAI_CHAPTERS)) {
    window.SAI_CHAPTERS.forEach(c => {
      if (c.title) c.title = decodeHtml(c.title);
      if (c.short_title) c.short_title = decodeHtml(c.short_title);
      if (c.topics && Array.isArray(c.topics)) {
        c.topics = c.topics.map(t => decodeHtml(t));
      }
    });
  }

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
    dailyChapEssenceBox: document.getElementById('daily-chap-essence-box'),
    dailyChapQuote: document.getElementById('daily-chap-quote'),
    dailyChapMeaning: document.getElementById('daily-chap-meaning'),
    btnReadToday: document.getElementById('btn-read-today'),
    btnMarkTodayComplete: document.getElementById('btn-mark-today-complete'),
    progressText: document.getElementById('progress-text'),
    overallProgressFill: document.getElementById('overall-progress-fill'),
    btnResetParayan: document.getElementById('btn-reset-parayan'),
    btnBrandHome: document.getElementById('btn-brand-home'),
    btnOpenLifeGuide: document.getElementById('btn-open-life-guide'),
    btnOpenJournal: document.getElementById('btn-open-journal'),
    btnOpenDarshan: document.getElementById('btn-open-darshan'),
    dailyJournalCount: document.getElementById('daily-journal-count'),
    btnCreateBlessingCard: document.getElementById('btn-create-blessing-card'),

    // Reader View
    btnBackToDaily: document.getElementById('btn-back-to-daily'),
    readerSilkRibbon: document.getElementById('reader-silk-ribbon'),
    btnChapterKeepsake: document.getElementById('btn-chapter-keepsake'),
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
    btnCopyReflection: document.getElementById('btn-copy-reflection'),
    btnViewAllReflections: document.getElementById('btn-view-all-reflections'),
    promptChips: document.querySelectorAll('.btn-prompt-chip'),

    // Chapters Directory
    chapterSearchInput: document.getElementById('chapter-search-input'),
    filterPills: document.querySelectorAll('.filter-pills-row .filter-pill'),
    chaptersGridContainer: document.getElementById('chapters-grid-container'),
    spiritualGuideContainer: document.getElementById('spiritual-guide-container'),

    // Saptah View & Custom Planner
    saptahDaysList: document.getElementById('saptah-days-list'),
    btnToggleSaptahPlanner: document.getElementById('btn-toggle-saptah-planner'),
    saptahStatusBanner: document.getElementById('saptah-status-banner'),
    saptahDatesRange: document.getElementById('saptah-dates-range'),
    saptahCompletionRatio: document.getElementById('saptah-completion-ratio'),
    saptahProgressFill: document.getElementById('saptah-progress-fill'),
    saptahPlannerDrawer: document.getElementById('saptah-planner-drawer'),
    saptahPresetBtns: document.querySelectorAll('.btn-saptah-preset'),
    saptahStartDateInput: document.getElementById('saptah-start-date-input'),
    btnApplySaptahDate: document.getElementById('btn-apply-saptah-date'),
    btnResetSaptahDate: document.getElementById('btn-reset-saptah-date'),

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
    cloudStatusDot: document.getElementById('cloud-status-dot'),
    cloudStatusText: document.getElementById('cloud-status-text'),
    cloudLastSynced: document.getElementById('cloud-last-synced'),
    cloudGistId: document.getElementById('cloud-gist-id'),
    cloudGistToken: document.getElementById('cloud-gist-token'),
    btnCloudPull: document.getElementById('btn-cloud-pull'),
    btnCloudPush: document.getElementById('btn-cloud-push'),
    btnSaveCloudToken: document.getElementById('btn-save-cloud-token'),
    btnCopySyncLink: document.getElementById('btn-copy-sync-link'),
    btnWhatsappSync: document.getElementById('btn-whatsapp-sync'),
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
    btnSettingsBell: document.getElementById('btn-settings-bell'),

    // Hallmark Keepsake Card Elements
    keepsakeModal: document.getElementById('keepsake-modal'),
    keepsakeCanvas: document.getElementById('keepsake-canvas'),
    btnCloseKeepsake: document.getElementById('btn-close-keepsake'),
    btnDownloadKeepsake: document.getElementById('btn-download-keepsake'),
    btnCopyKeepsake: document.getElementById('btn-copy-keepsake'),
    btnShareKeepsake: document.getElementById('btn-share-keepsake'),

    // Spiritual Journal Modal Elements
    btnJournalModal: document.getElementById('btn-journal-modal'),
    journalCountBadge: document.getElementById('journal-count-badge'),
    journalModal: document.getElementById('journal-modal'),
    btnCloseJournalModal: document.getElementById('btn-close-journal-modal'),
    journalSearchInput: document.getElementById('journal-search-input'),
    btnCopyAllJournal: document.getElementById('btn-copy-all-journal'),
    btnExportJournal: document.getElementById('btn-export-journal'),
    journalEntriesList: document.getElementById('journal-entries-list'),

    // Sacred Darshan Gallery & Lightbox Elements
    darshanGridContainer: document.getElementById('darshan-grid-container'),
    darshanLightboxModal: document.getElementById('darshan-lightbox-modal'),
    btnCloseLightbox: document.getElementById('btn-close-lightbox'),
    btnPrevDarshan: document.getElementById('btn-prev-darshan'),
    btnNextDarshan: document.getElementById('btn-next-darshan'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxPeriod: document.getElementById('lightbox-period'),
    lightboxLocation: document.getElementById('lightbox-location'),
    lightboxTitle: document.getElementById('lightbox-title'),
    lightboxDesc: document.getElementById('lightbox-desc'),
    btnLightboxReadChapter: document.getElementById('btn-lightbox-read-chapter')
  };

  const fontSizes = ['font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl'];
  let currentDirectoryFilter = 'all';
  let currentSayingsCategory = 'all';
  let currentSayingsSearch = '';
  let currentDarshanIndex = 0;
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
  // Hallmark Devotional Keepsake Card Generator (Canvas Engine)
  // ==========================================================================

  let currentKeepsakeData = null;

  function updateRibbonState(chapterId) {
    if (!elements.readerSilkRibbon) return;
    const isBookmarked = state.lastReadChapter === chapterId;
    elements.readerSilkRibbon.classList.toggle('bookmarked', isBookmarked);
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y);
    return y + lineHeight;
  }

  function drawKeepsakeCard({ title, quote, context, dateStr }) {
    const canvas = elements.keepsakeCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;  // 800
    const h = canvas.height; // 1000

    // 1. Holy Parchment Canvas Background with Soft Radiant Shading
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, 540);
    bgGrad.addColorStop(0, '#fdfbf7');
    bgGrad.addColorStop(0.5, '#f7efe1');
    bgGrad.addColorStop(1, '#ebdcc5');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Ornate Double Gold Hallmark Filigree Border
    ctx.save();
    ctx.strokeStyle = '#c58a2e';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, w - 64, h - 64);

    ctx.strokeStyle = '#e2b868';
    ctx.lineWidth = 1;
    ctx.strokeRect(44, 44, w - 88, h - 88);

    // Corner Ornaments
    const corners = [
      [44, 44],
      [w - 44, 44],
      [44, h - 44],
      [w - 44, h - 44]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#c58a2e';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();

    // 3. Top Sacred Crest: OM SAI RAM
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('॥ ॐ श्री साईं नाथाय नमः ॥', w / 2, 95);

    ctx.fillStyle = '#7c634b';
    ctx.font = '600 12px -apple-system, sans-serif';
    ctx.fillText('SRI SAI SATCHARITRA • SACRED DEVOTION', w / 2, 122);

    // 4. Central Emblem: Diya
    ctx.font = '36px serif';
    ctx.fillText('🪔', w / 2, 175);

    // 5. Divider Line with Diamond
    ctx.strokeStyle = '#c58a2e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 120, 205);
    ctx.lineTo(w / 2 + 120, 205);
    ctx.stroke();
    ctx.fillStyle = '#b45309';
    ctx.font = '14px serif';
    ctx.fillText('✦', w / 2, 210);

    // 6. Large Elegant Golden Quotation Mark
    ctx.fillStyle = '#e2b868';
    ctx.font = 'italic 76px Georgia, serif';
    ctx.fillText('“', w / 2, 280);

    // 7. Divine Quote (Dynamic wrapping)
    ctx.fillStyle = '#261b11';
    ctx.font = 'italic 27px Georgia, serif';
    const cleanQuote = (quote || '').replace(/^"|"$/g, '');
    const quoteY = wrapCanvasText(ctx, `"${cleanQuote}"`, w / 2, 335, 620, 44);

    // 8. Chapter Context / Source Pill
    const contextY = Math.max(quoteY + 25, 590);
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillText(context || 'Spiritual Wisdom of Shirdi Sai Baba', w / 2, contextY);

    if (title && title !== context) {
      ctx.fillStyle = '#6e563d';
      ctx.font = 'italic 15px Georgia, serif';
      ctx.fillText(title, w / 2, contextY + 28);
    }

    // 9. Lower Divider
    const lowerDividerY = Math.max(contextY + 70, 730);
    ctx.strokeStyle = '#c58a2e';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 140, lowerDividerY);
    ctx.lineTo(w / 2 + 140, lowerDividerY);
    ctx.stroke();
    ctx.fillText('❧ 🪔 ❧', w / 2, lowerDividerY - 4);

    // 10. Hallmark Devotional Blessing Seal & Date
    ctx.fillStyle = '#8c735a';
    ctx.font = '13.5px -apple-system, sans-serif';
    ctx.fillText(dateStr || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), w / 2, lowerDividerY + 45);

    ctx.fillStyle = '#2b2118';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText('Shraddha & Saburi (Faith & Patience)', w / 2, lowerDividerY + 75);

    ctx.fillStyle = '#8c735a';
    ctx.font = 'italic 13px Georgia, serif';
    ctx.fillText('May Bhagavan Shri Sai Baba bless you with peace, health, and contentment.', w / 2, lowerDividerY + 102);

    ctx.fillStyle = '#c58a2e';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText('SHIRDI SANSTHAN • DAILY PARAYAN KEEPSAKE', w / 2, h - 55);
  }

  function openKeepsakeModal({ title, quote, context }) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    currentKeepsakeData = { title, quote, context, dateStr: today };
    drawKeepsakeCard(currentKeepsakeData);
    if (elements.keepsakeModal) {
      elements.keepsakeModal.classList.remove('hidden');
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
      updateJournalBadges();
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
      reflections: state.reflections || {},
      saptahStartDate: state.saptahStartDate || null
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
      saptahStartDate: preferRemote ? (remote.saptahStartDate || local.saptahStartDate) : (local.saptahStartDate || remote.saptahStartDate),
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

    const capHttp = window.Capacitor?.Plugins?.CapacitorHttp;
    // When running in a standard web browser on HTTPS, plain HTTP fetches are blocked as mixed content
    if (!capHttp && window.location.protocol === 'https:' && serverBase.startsWith('http://') && !serverBase.includes('localhost') && !serverBase.includes('127.0.0.1')) {
      if (!silent) {
        showToast("Web browsers block local IP sync over HTTPS. Please use ☁️ Cloud Sync or 🔑 Sync Key.", "ℹ️");
      }
      updateSyncStatus("Use Cloud Sync on HTTPS web", "normal");
      return;
    }

    updateSyncStatus("Contacting Mac server...", "syncing");
    try {
      let remoteData = {};
      const capHttp = window.Capacitor?.Plugins?.CapacitorHttp;

      if (capHttp) {
        const res = await capHttp.get({
          url: `${serverBase}/api/sync`,
          headers: { 'Accept': 'application/json' }
        });
        remoteData = (typeof res.data === 'string') ? JSON.parse(res.data) : (res.data || {});
      } else {
        const getRes = await fetch(`${serverBase}/api/sync`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-cache'
        });
        if (getRes.ok) {
          remoteData = await getRes.json();
        }
      }

      // Merge remote with local
      const merged = mergeSyncStates(state, remoteData);
      state = merged;
      saveState();
      saveFavorites();
      saveReflections();

      // Send merged state back to server
      const payload = getSyncPayload();
      if (capHttp) {
        await capHttp.post({
          url: `${serverBase}/api/sync`,
          headers: { 'Content-Type': 'application/json' },
          data: payload
        });
      } else {
        await fetch(`${serverBase}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

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

  function updateCloudStatus(text, type = "normal") {
    if (elements.cloudStatusText) elements.cloudStatusText.textContent = text;
    if (elements.cloudStatusDot) {
      elements.cloudStatusDot.style.backgroundColor = (type === "success") ? "var(--success)" : (type === "syncing" ? "var(--accent-saffron)" : (type === "error" ? "#dc2626" : "var(--primary)"));
    }
  }

  async function pullFromCloud(silent = false) {
    const gistId = (elements.cloudGistId ? elements.cloudGistId.value.trim() : '') || '96b05796b4e3181da4c7c94023006c41';
    updateCloudStatus("Connecting to Cloud...", "syncing");
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        cache: 'no-cache'
      });
      if (!res.ok) throw new Error(`Cloud response code: ${res.status}`);
      const data = await res.json();
      const fileData = data.files && (data.files['sync_store.json'] || Object.values(data.files)[0]);
      if (!fileData || !fileData.content) throw new Error("No sync data found in cloud");
      
      const remote = JSON.parse(fileData.content);
      state = mergeSyncStates(state, remote);
      saveState();
      saveFavorites();
      saveReflections();

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('sai_last_cloud_sync', nowTime);
      if (elements.cloudLastSynced) {
        elements.cloudLastSynced.textContent = `Last synced: Today at ${nowTime}`;
      }
      updateCloudStatus("Cloud Synced ✓", "success");

      updateDashboardUI();
      updateBookmarkUI();
      applyTheme(state.theme);
      applyFontSize(state.fontSize);
      renderChaptersDirectory();
      renderSaptahSchedule();

      showToast(`Progress restored! Chapter ${state.activeReadingChapter} (Streak: ${state.streak} days)`, "🌟");
    } catch (err) {
      console.error(err);
      updateCloudStatus("Sync Failed", "error");
      if (!silent) showToast(`Cloud sync error: ${err.message}`, "⚠️");
    }
  }

  async function pushToCloud() {
    const gistId = (elements.cloudGistId ? elements.cloudGistId.value.trim() : '') || '96b05796b4e3181da4c7c94023006c41';
    let token = elements.cloudGistToken ? elements.cloudGistToken.value.trim() : '';
    if (!token) token = localStorage.getItem('sai_gist_token') || '';

    const payload = getSyncPayload();
    updateCloudStatus("Saving to Cloud...", "syncing");

    try {
      if (token) {
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: "Sai Satcharitra Devotional Sync Store",
            files: {
              "sync_store.json": {
                content: JSON.stringify(payload, null, 2)
              }
            }
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else if (window.location.protocol === 'http:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const res = await fetch(`http://127.0.0.1:8080/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Could not reach local sync server on port 8080.");
      } else {
        throw new Error("To push to GitHub Cloud from web, enter your GitHub Token below (or tap '🔑 Sync Key' for 1-tap transfer).");
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (elements.cloudLastSynced) {
        elements.cloudLastSynced.textContent = `Last pushed: Today at ${nowTime}`;
      }
      updateCloudStatus("Saved to Cloud ✓", "success");
      showToast("Progress saved to Cloud! ✓", "🌟");
    } catch (err) {
      console.error(err);
      updateCloudStatus("Save Failed", "error");
      showToast(err.message, "⚠️");
    }
  }

  function copySyncLink() {
    try {
      const payload = getSyncPayload();
      const jsonStr = JSON.stringify(payload);
      const b64Key = btoa(unescape(encodeURIComponent(jsonStr)));
      const syncUrl = `https://layyzee.github.io/sai-satcharitra-reader/#sync=${b64Key}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(syncUrl).then(() => {
          showToast("Sync Link copied to clipboard! 🔗", "✓");
        }).catch(() => {
          prompt("Copy your Sync Link:", syncUrl);
        });
      } else {
        prompt("Copy your Sync Link:", syncUrl);
      }
    } catch (e) {
      showToast("Error generating sync link", "⚠️");
    }
  }

  function shareWhatsApp() {
    try {
      const payload = getSyncPayload();
      const jsonStr = JSON.stringify(payload);
      const b64Key = btoa(unescape(encodeURIComponent(jsonStr)));
      const syncUrl = `https://layyzee.github.io/sai-satcharitra-reader/#sync=${b64Key}`;
      const msg = encodeURIComponent(`🕉️ My Sai Satcharitra Reading Progress:\nChapter: ${payload.activeReadingChapter || 20}\nStreak: ${payload.streak || 4} Days\n\nTap this link on your device to sync immediately:\n${syncUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
    } catch (e) {
      showToast("Error opening WhatsApp share", "⚠️");
    }
  }

  function checkUrlSyncParam() {
    if (window.location.hash && window.location.hash.startsWith('#sync=')) {
      const key = window.location.hash.replace('#sync=', '').trim();
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
        showToast(`Progress restored! Chapter ${state.activeReadingChapter} (Streak: ${state.streak} days)`, "🌟");
        try {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) {}
      } catch (err) {
        console.error("Invalid URL sync payload", err);
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
    const themes = ['sepia', 'dusk', 'dark', 'light'];
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
      elements.dailyChapTitle.textContent = decodeHtml(dailyChap.title.replace(/^Sai Satcharitra /i, ''));

      // Topics
      elements.dailyChapTopics.innerHTML = '';
      if (dailyChap.topics && dailyChap.topics.length > 0) {
        dailyChap.topics.forEach(t => {
          const tag = document.createElement('span');
          tag.className = 'topic-tag';
          tag.textContent = decodeHtml(t);
          elements.dailyChapTopics.appendChild(tag);
        });
      }

      // Sacred Leela Essence & Teaching
      if (elements.dailyChapEssenceBox && elements.dailyChapQuote) {
        const numMatch = (dailyChap.short_title || '').match(/\d+/);
        const chapNum = numMatch ? numMatch[0] : dailyChap.id;
        const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
        const matched = sayings.find(s => s.context && (
          s.context.includes(`Chapter ${chapNum}`) ||
          s.context.includes(`Chapters ${chapNum}`)
        ));

        if (matched) {
          elements.dailyChapQuote.textContent = `"${matched.quote}"`;
          if (elements.dailyChapMeaning) {
            elements.dailyChapMeaning.textContent = `${matched.meaning}`;
          }
        } else {
          const topicSummary = dailyChap.topics && dailyChap.topics.length ? dailyChap.topics.slice(0, 2).join(' & ') : 'Devotion & Surrender';
          elements.dailyChapQuote.textContent = `"Contemplate these sacred leelas with shraddha and saburi; reflecting on Baba's stories dissolves anxieties and bestows peace."`;
          if (elements.dailyChapMeaning) {
            elements.dailyChapMeaning.textContent = `Key focus: ${topicSummary}.`;
          }
        }
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
    updateRibbonState(chapterId);

    // Set Meta
    elements.readerMetaChap.textContent = decodeHtml(chapter.short_title);
    elements.readerMetaTime.textContent = `~${chapter.reading_time_mins} min read`;
    elements.readerTitle.textContent = decodeHtml(chapter.title.replace(/^Sai Satcharitra /i, ''));

    // Set Topics
    elements.readerTopicsBox.innerHTML = '';
    if (chapter.topics && chapter.topics.length > 0) {
      chapter.topics.forEach(t => {
        const tag = document.createElement('span');
        tag.className = 'topic-tag';
        tag.textContent = decodeHtml(t);
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

    // Restore scroll bookmark if exists (and not already completed/at the end)
    const savedScroll = state.bookmarks[chapter.id];
    if (savedScroll && savedScroll > 0 && savedScroll < 92) {
      setTimeout(() => {
        const targetScroll = (document.documentElement.scrollHeight - window.innerHeight) * (savedScroll / 100);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
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
  // View 3: All Chapters Directory & Spiritual Life Guide (Feature 2)
  // ==========================================================================

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSpiritualThemes(query = '') {
    const container = elements.spiritualGuideContainer;
    if (!container) return;
    container.innerHTML = '';

    const cleanQuery = query.toLowerCase().trim();
    const chaptersMap = {};
    (window.SAI_CHAPTERS || []).forEach(c => { chaptersMap[c.id] = c; });

    SPIRITUAL_THEMES.forEach(theme => {
      if (cleanQuery) {
        const matchesTitle = theme.title.toLowerCase().includes(cleanQuery);
        const matchesSummary = theme.summary.toLowerCase().includes(cleanQuery);
        const matchesQuote = theme.keyQuote.toLowerCase().includes(cleanQuery);
        if (!matchesTitle && !matchesSummary && !matchesQuote) return;
      }

      const card = document.createElement('div');
      card.className = 'guide-theme-card';

      let chapterChipsHtml = '';
      theme.chapters.forEach(chapId => {
        const chap = chaptersMap[chapId];
        const isDone = state.completedChapters.includes(chapId);
        const titleSnippet = chap ? chap.title.replace(/^Sai Satcharitra /i, '').substring(0, 36) + '...' : `Chapter ${chapId}`;
        chapterChipsHtml += `
          <button class="guide-chap-chip" data-chap="${chapId}" title="${chap ? chap.title : ''}">
            ${isDone ? '✓ ' : ''}Ch ${chapId}: ${titleSnippet}
          </button>
        `;
      });

      card.innerHTML = `
        <div>
          <div class="guide-theme-header">
            <span class="guide-theme-icon">${theme.icon}</span>
            <div>
              <h3 class="guide-theme-title">${theme.title}</h3>
              <p class="guide-theme-summary">${theme.summary}</p>
            </div>
          </div>
          <blockquote class="guide-theme-quote">${theme.keyQuote}</blockquote>
          <div class="guide-chapters-section">
            <span class="guide-chapters-label">Sacred Leelas to Read:</span>
            <div class="guide-chapters-list">
              ${chapterChipsHtml}
            </div>
          </div>
        </div>
      `;

      card.querySelectorAll('.guide-chap-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = parseInt(btn.getAttribute('data-chap'), 10);
          openChapter(cid);
        });
      });

      container.appendChild(card);
    });

    if (container.children.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        No spiritual life guidance themes match "${escapeHtml(query)}".
      </div>`;
    }
  }

  function renderChaptersDirectory(query = '') {
    if (currentDirectoryFilter === 'guide') {
      if (elements.chaptersGridContainer) elements.chaptersGridContainer.classList.add('hidden');
      if (elements.spiritualGuideContainer) {
        elements.spiritualGuideContainer.classList.remove('hidden');
        renderSpiritualThemes(query);
      }
      return;
    }

    if (elements.spiritualGuideContainer) elements.spiritualGuideContainer.classList.add('hidden');
    if (elements.chaptersGridContainer) elements.chaptersGridContainer.classList.remove('hidden');

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
        ? c.topics.slice(0, 2).map(t => decodeHtml(t)).join(' • ') 
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
  // View 4: 7-Day Saptah Parayan Plan & Custom Festival Planner (Feature 5)
  // ==========================================================================

  function getSaptahBaseDate() {
    if (state.saptahStartDate) {
      const parsed = new Date(state.saptahStartDate + 'T00:00:00');
      if (!isNaN(parsed.getTime())) return parsed;
    }
    // Default: find current or most recent Thursday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 4 is Thursday
    const diff = (dayOfWeek >= 4) ? (dayOfWeek - 4) : (dayOfWeek + 3);
    const thurs = new Date(today);
    thurs.setDate(today.getDate() - diff);
    thurs.setHours(0, 0, 0, 0);
    return thurs;
  }

  function renderSaptahSchedule() {
    const container = elements.saptahDaysList;
    if (!container) return;
    container.innerHTML = '';

    const baseDate = getSaptahBaseDate();
    const endDate = new Date(baseDate);
    endDate.setDate(baseDate.getDate() + 6);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayStr = now.toISOString().split('T')[0];

    // Update Active Saptah Status Banner
    const startFmt = baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFmt = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (elements.saptahDatesRange) {
      elements.saptahDatesRange.textContent = `${startFmt} – ${endFmt}`;
    }

    let totalDaysCompleted = 0;

    SAPTAH_SCHEDULE.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'saptah-day-card';

      // Calculate calendar date for this plan day
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + (plan.day - 1));
      const dayDateStr = dayDate.toISOString().split('T')[0];
      const isDayToday = (dayDateStr === todayStr);

      const dayDateLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      // Check how many chapters for this day are completed
      let dayCompleted = 0;
      const dayTotal = (plan.endChap - plan.startChap + 1);
      for (let ch = plan.startChap; ch <= plan.endChap; ch++) {
        if (state.completedChapters.includes(ch)) dayCompleted++;
      }
      const isDayAllDone = dayCompleted === dayTotal;
      if (isDayAllDone) totalDaysCompleted++;

      if (isDayToday) {
        card.classList.add('saptah-day-today');
      }

      const todayPill = isDayToday ? '<span class="saptah-today-target-pill">TODAY</span>' : '';

      card.innerHTML = `
        <div class="saptah-day-info">
          <div class="saptah-day-badge">Day ${plan.day}</div>
          <div>
            <h4 class="saptah-day-title">${dayDateLabel} ${todayPill}</h4>
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

    // Update completion ratio & progress bar
    if (elements.saptahCompletionRatio) {
      elements.saptahCompletionRatio.textContent = `${totalDaysCompleted} of 7 Days Done (${Math.round((totalDaysCompleted / 7) * 100)}%)`;
    }
    if (elements.saptahProgressFill) {
      elements.saptahProgressFill.style.width = `${(totalDaysCompleted / 7) * 100}%`;
    }
  }

  // ==========================================================================
  // Feature 3: Personal Spiritual Journal & Reflections Engine
  // ==========================================================================

  function updateJournalBadges() {
    const notesCount = Object.keys(state.reflections || {}).filter(k => (state.reflections[k] && state.reflections[k].trim().length > 0)).length;
    if (elements.journalCountBadge) {
      elements.journalCountBadge.textContent = notesCount;
      elements.journalCountBadge.classList.toggle('zero', notesCount === 0);
    }
    if (elements.dailyJournalCount) {
      elements.dailyJournalCount.textContent = notesCount;
    }
  }

  function openJournalModal() {
    if (elements.journalModal) {
      elements.journalModal.classList.remove('hidden');
      if (elements.journalSearchInput) elements.journalSearchInput.value = '';
      renderJournalModal('');
      if (elements.journalSearchInput) elements.journalSearchInput.focus();
    }
  }

  function closeJournalModal() {
    if (elements.journalModal) {
      elements.journalModal.classList.add('hidden');
    }
  }

  function toggleJournalModal() {
    if (elements.journalModal) {
      if (elements.journalModal.classList.contains('hidden')) {
        openJournalModal();
      } else {
        closeJournalModal();
      }
    }
  }

  function renderJournalModal(query = '') {
    const container = elements.journalEntriesList;
    if (!container) return;
    container.innerHTML = '';

    const reflections = state.reflections || {};
    const chaptersMap = {};
    (window.SAI_CHAPTERS || []).forEach(c => { chaptersMap[c.id] = c; });

    const activeEntries = Object.keys(reflections)
      .map(k => parseInt(k, 10))
      .filter(cid => reflections[cid] && reflections[cid].trim().length > 0)
      .sort((a, b) => a - b);

    const cleanQuery = query.toLowerCase().trim();

    const filtered = activeEntries.filter(cid => {
      const text = reflections[cid].toLowerCase();
      const chap = chaptersMap[cid];
      const chapTitle = chap ? chap.title.toLowerCase() : '';
      if (!cleanQuery) return true;
      return text.includes(cleanQuery) || chapTitle.includes(cleanQuery) || `chapter ${cid}`.includes(cleanQuery);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="journal-empty-box">
          <div class="journal-empty-icon">✍️</div>
          <h4 style="font-size:15px; font-weight:700; margin-bottom:6px;">No reflections written yet</h4>
          <p class="journal-empty-text">
            While reading any chapter, scroll to the bottom to write your private prayers, realizations, or life lessons. They will all be gathered here and auto-synced to the cloud.
          </p>
        </div>
      `;
      return;
    }

    filtered.forEach(cid => {
      const chap = chaptersMap[cid];
      const text = reflections[cid];
      const card = document.createElement('div');
      card.className = 'journal-entry-card';
      
      const chapTitle = chap ? chap.title.replace(/^Sai Satcharitra /i, '') : `Chapter ${cid}`;

      card.innerHTML = `
        <div class="journal-entry-header">
          <span class="journal-entry-chap">Chapter ${cid}: ${chapTitle}</span>
          <span class="journal-entry-date">Recorded in your reader ✓</span>
        </div>
        <p class="journal-entry-text">${escapeHtml(text)}</p>
        <div class="journal-entry-footer">
          <button class="btn-journal-jump" data-chap="${cid}">
            Read Chapter ${cid} ➔
          </button>
        </div>
      `;

      card.querySelector('.btn-journal-jump').addEventListener('click', () => {
        closeJournalModal();
        openChapter(cid);
      });

      container.appendChild(card);
    });
  }

  function copyAllJournalNotes() {
    const reflections = state.reflections || {};
    const chaptersMap = {};
    (window.SAI_CHAPTERS || []).forEach(c => { chaptersMap[c.id] = c; });

    const activeEntries = Object.keys(reflections)
      .map(k => parseInt(k, 10))
      .filter(cid => reflections[cid] && reflections[cid].trim().length > 0)
      .sort((a, b) => a - b);

    if (activeEntries.length === 0) {
      showToast("No reflections written yet to copy", "✍️");
      return;
    }

    let textOut = `ॐ SRI SAI SATCHARITRA — MY SPIRITUAL JOURNAL & REFLECTIONS\n`;
    textOut += `Saved on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    textOut += `Total Entries: ${activeEntries.length}\n`;
    textOut += `------------------------------------------------------------\n\n`;

    activeEntries.forEach(cid => {
      const chap = chaptersMap[cid];
      const title = chap ? chap.title.replace(/^Sai Satcharitra /i, '') : `Chapter ${cid}`;
      textOut += `📖 CHAPTER ${cid}: ${title}\n`;
      textOut += `${reflections[cid]}\n\n`;
      textOut += `------------------------------------------------------------\n\n`;
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textOut).then(() => {
        showToast("All reflections copied to clipboard! 📋", "✓");
      }).catch(() => {
        prompt("Copy your reflections:", textOut);
      });
    } else {
      prompt("Copy your reflections:", textOut);
    }
  }

  function exportJournalToFile() {
    const reflections = state.reflections || {};
    const chaptersMap = {};
    (window.SAI_CHAPTERS || []).forEach(c => { chaptersMap[c.id] = c; });

    const activeEntries = Object.keys(reflections)
      .map(k => parseInt(k, 10))
      .filter(cid => reflections[cid] && reflections[cid].trim().length > 0)
      .sort((a, b) => a - b);

    if (activeEntries.length === 0) {
      showToast("No reflections written yet to export", "✍️");
      return;
    }

    let textOut = `ॐ SRI SAI SATCHARITRA — MY SPIRITUAL JOURNAL & REFLECTIONS\n`;
    textOut += `Saved on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    textOut += `Total Entries: ${activeEntries.length}\n\n`;

    activeEntries.forEach(cid => {
      const chap = chaptersMap[cid];
      const title = chap ? chap.title.replace(/^Sai Satcharitra /i, '') : `Chapter ${cid}`;
      textOut += `============================================================\n`;
      textOut += `CHAPTER ${cid}: ${title}\n`;
      textOut += `============================================================\n`;
      textOut += `${reflections[cid]}\n\n`;
    });

    const blob = new Blob([textOut], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sai_Satcharitra_Spiritual_Journal_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Journal exported to file! 💾", "✓");
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
  // View 7: Sacred Darshan (Rare Real Historical Photographs 1890–1918)
  // ==========================================================================

  function renderDarshanGallery() {
    const container = elements.darshanGridContainer;
    if (!container) return;
    container.innerHTML = '';

    DARSHAN_PHOTOS.forEach((photo, idx) => {
      const card = document.createElement('div');
      card.className = 'darshan-card';

      card.innerHTML = `
        <div class="darshan-img-wrap">
          <img src="${photo.file}" alt="${escapeHtml(photo.title)}" class="darshan-thumb" loading="lazy">
          <span class="darshan-period-tag">${photo.period}</span>
        </div>
        <div class="darshan-info">
          <div>
            <h3 class="darshan-card-title">${photo.title}</h3>
            <span class="darshan-card-location">📍 ${photo.location}</span>
            <p class="darshan-card-desc">${photo.description.substring(0, 105)}...</p>
          </div>
          <div class="darshan-card-action">
            <span>📷 View Full Photograph</span>
            <span>➔</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openDarshanLightbox(idx);
      });

      container.appendChild(card);
    });
  }

  function openDarshanLightbox(idx) {
    if (idx < 0 || idx >= DARSHAN_PHOTOS.length || !elements.darshanLightboxModal) return;
    currentDarshanIndex = idx;
    const photo = DARSHAN_PHOTOS[idx];

    if (elements.lightboxImg) {
      elements.lightboxImg.src = photo.file;
      elements.lightboxImg.alt = photo.title;
    }
    if (elements.lightboxPeriod) elements.lightboxPeriod.textContent = photo.period;
    if (elements.lightboxLocation) elements.lightboxLocation.textContent = `📍 ${photo.location}`;
    if (elements.lightboxTitle) elements.lightboxTitle.textContent = photo.title;
    if (elements.lightboxDesc) elements.lightboxDesc.textContent = photo.description;

    if (elements.btnLightboxReadChapter) {
      elements.btnLightboxReadChapter.textContent = `📖 Read ${photo.chapterTitle} ➔`;
      elements.btnLightboxReadChapter.onclick = () => {
        closeDarshanLightbox();
        openChapter(photo.chapterId);
      };
    }

    elements.darshanLightboxModal.classList.remove('hidden');
  }

  function closeDarshanLightbox() {
    if (elements.darshanLightboxModal) {
      elements.darshanLightboxModal.classList.add('hidden');
    }
  }

  function navigateDarshanLightbox(direction) {
    const total = DARSHAN_PHOTOS.length;
    const nextIdx = (currentDarshanIndex + direction + total) % total;
    openDarshanLightbox(nextIdx);
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
    if (elements.btnBrandHome) {
      elements.btnBrandHome.addEventListener('click', () => switchView('daily'));
    }

    // Temple Bell Chime
    if (elements.btnTempleBell) {
      elements.btnTempleBell.addEventListener('click', () => {
        playTempleBell();
        showToast("Om Sai Ram", "🔔");
      });
    }

    // Shortcuts Modal (Mac Desktop)
    if (elements.btnShortcutsHelp && elements.shortcutsModal) {
      elements.btnShortcutsHelp.addEventListener('click', () => {
        elements.shortcutsModal.classList.remove('hidden');
      });
    }
    if (elements.btnCloseModal && elements.shortcutsModal) {
      elements.btnCloseModal.addEventListener('click', () => {
        elements.shortcutsModal.classList.add('hidden');
      });
    }
    if (elements.shortcutsModal) {
      elements.shortcutsModal.addEventListener('click', (e) => {
        if (e.target === elements.shortcutsModal) elements.shortcutsModal.classList.add('hidden');
      });
    }

    // Dynamic Blessing Refresh on Home
    if (elements.btnRefreshSaying) {
      elements.btnRefreshSaying.addEventListener('click', () => {
        const sayings = (window.SAI_DEVOTIONAL && window.SAI_DEVOTIONAL.sayings) || [];
        const randomIdx = Math.floor(Math.random() * sayings.length);
        setDynamicSaying(randomIdx);
        playTempleBell();
        showToast("Divine Blessing refreshed ✨", "✨");
      });
    }

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
    if (elements.btnCloudPull) {
      elements.btnCloudPull.addEventListener('click', () => pullFromCloud(false));
    }
    if (elements.btnCloudPush) {
      elements.btnCloudPush.addEventListener('click', pushToCloud);
    }
    if (elements.btnSaveCloudToken) {
      elements.btnSaveCloudToken.addEventListener('click', () => {
        const token = elements.cloudGistToken ? elements.cloudGistToken.value.trim() : '';
        if (token) {
          localStorage.setItem('sai_gist_token', token);
          showToast("Cloud push token saved! ✓", "✓");
        } else {
          localStorage.removeItem('sai_gist_token');
          showToast("Token cleared", "ℹ️");
        }
      });
    }
    if (elements.btnCopySyncLink) {
      elements.btnCopySyncLink.addEventListener('click', copySyncLink);
    }
    if (elements.btnWhatsappSync) {
      elements.btnWhatsappSync.addEventListener('click', shareWhatsApp);
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
      } else if (e.key.toLowerCase() === 'j') {
        toggleJournalModal();
      } else if (e.key === '?') {
        elements.shortcutsModal.classList.toggle('hidden');
      } else if (e.key === 'Escape') {
        if (elements.shortcutsModal) elements.shortcutsModal.classList.add('hidden');
        if (elements.syncModal) elements.syncModal.classList.add('hidden');
        if (elements.settingsModal) elements.settingsModal.classList.add('hidden');
        if (elements.journalModal) elements.journalModal.classList.add('hidden');
        if (elements.darshanLightboxModal) elements.darshanLightboxModal.classList.add('hidden');
        closeFindBar();
        switchView('daily');
      }

      // Sacred Darshan Lightbox arrow navigation
      if (elements.darshanLightboxModal && !elements.darshanLightboxModal.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') { navigateDarshanLightbox(-1); return; }
        if (e.key === 'ArrowRight') { navigateDarshanLightbox(1); return; }
      }
    });

    // Feature 2: Spiritual Life Guide Navigation
    if (elements.btnOpenLifeGuide) {
      elements.btnOpenLifeGuide.addEventListener('click', () => {
        switchView('chapters');
        currentDirectoryFilter = 'guide';
        elements.filterPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-filter') === 'guide'));
        renderChaptersDirectory('');
      });
    }

    // Feature 3: Spiritual Journal Modal & Actions
    if (elements.btnOpenJournal) {
      elements.btnOpenJournal.addEventListener('click', openJournalModal);
    }
    if (elements.btnJournalModal) {
      elements.btnJournalModal.addEventListener('click', openJournalModal);
    }
    if (elements.btnCloseJournalModal) {
      elements.btnCloseJournalModal.addEventListener('click', closeJournalModal);
    }
    if (elements.journalModal) {
      elements.journalModal.addEventListener('click', (e) => {
        if (e.target === elements.journalModal) closeJournalModal();
      });
    }
    if (elements.journalSearchInput) {
      elements.journalSearchInput.addEventListener('input', (e) => {
        renderJournalModal(e.target.value);
      });
    }
    if (elements.btnCopyAllJournal) {
      elements.btnCopyAllJournal.addEventListener('click', copyAllJournalNotes);
    }
    if (elements.btnExportJournal) {
      elements.btnExportJournal.addEventListener('click', exportJournalToFile);
    }
    if (elements.btnCopyReflection) {
      elements.btnCopyReflection.addEventListener('click', () => {
        const text = elements.chapterReflectionInput ? elements.chapterReflectionInput.value.trim() : '';
        if (!text) {
          showToast("No reflection written for this chapter yet", "✍️");
          return;
        }
        const cid = state.activeReadingChapter;
        copyToClipboard(`ॐ Chapter ${cid} Reflection:\n${text}`, "Chapter reflection copied! 📋");
      });
    }
    if (elements.btnViewAllReflections) {
      elements.btnViewAllReflections.addEventListener('click', openJournalModal);
    }
    if (elements.promptChips) {
      elements.promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const prompt = chip.getAttribute('data-prompt');
          if (elements.chapterReflectionInput) {
            const cur = elements.chapterReflectionInput.value.trim();
            elements.chapterReflectionInput.value = cur ? `${cur}\n${prompt}` : prompt;
            elements.chapterReflectionInput.focus();
            elements.chapterReflectionInput.dispatchEvent(new Event('input'));
          }
        });
      });
    }

    // Feature 5: Custom Saptah Planner Controls
    if (elements.btnToggleSaptahPlanner) {
      elements.btnToggleSaptahPlanner.addEventListener('click', () => {
        if (elements.saptahPlannerDrawer) {
          elements.saptahPlannerDrawer.classList.toggle('hidden');
        }
      });
    }
    if (elements.saptahPresetBtns) {
      elements.saptahPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const preset = btn.getAttribute('data-preset');
          const now = new Date();
          const y = now.getFullYear();

          if (preset === 'today') {
            state.saptahStartDate = now.toISOString().split('T')[0];
          } else if (preset === 'thursday') {
            state.saptahStartDate = null;
          } else if (preset === 'ramnavami') {
            state.saptahStartDate = `${y}-04-10`;
          } else if (preset === 'gurupurnima') {
            state.saptahStartDate = `${y}-07-15`;
          } else if (preset === 'dussehra') {
            state.saptahStartDate = `${y}-10-14`;
          }

          saveState();
          renderSaptahSchedule();
          showToast("Saptah start date updated ✓", "🗓️");
        });
      });
    }
    if (elements.btnApplySaptahDate && elements.saptahStartDateInput) {
      elements.btnApplySaptahDate.addEventListener('click', () => {
        const val = elements.saptahStartDateInput.value;
        if (val) {
          state.saptahStartDate = val;
          saveState();
          renderSaptahSchedule();
          showToast(`Saptah scheduled starting ${val} ✓`, "🗓️");
        }
      });
    }
    if (elements.btnResetSaptahDate) {
      elements.btnResetSaptahDate.addEventListener('click', () => {
        state.saptahStartDate = null;
        if (elements.saptahStartDateInput) elements.saptahStartDateInput.value = '';
        saveState();
        renderSaptahSchedule();
        showToast("Reset to traditional Thursday cycle ✓", "🗓️");
      });
    }

    // Sacred Darshan Gallery & Lightbox Actions
    if (elements.btnOpenDarshan) {
      elements.btnOpenDarshan.addEventListener('click', () => switchView('darshan'));
    }
    if (elements.btnCloseLightbox) {
      elements.btnCloseLightbox.addEventListener('click', closeDarshanLightbox);
    }
    if (elements.btnPrevDarshan) {
      elements.btnPrevDarshan.addEventListener('click', () => navigateDarshanLightbox(-1));
    }
    if (elements.btnNextDarshan) {
      elements.btnNextDarshan.addEventListener('click', () => navigateDarshanLightbox(1));
    }
    if (elements.darshanLightboxModal) {
      elements.darshanLightboxModal.addEventListener('click', (e) => {
        if (e.target === elements.darshanLightboxModal) closeDarshanLightbox();
      });
    }

    // Silk Bookmark Ribbon Interaction (Apple-Grade Tactile Feedback)
    if (elements.readerSilkRibbon) {
      elements.readerSilkRibbon.addEventListener('click', () => {
        const curId = state.activeReadingChapter || 1;
        state.lastReadChapter = curId;
        saveState();
        updateRibbonState(curId);
        updateBookmarkUI();
        playTempleBell();
        showToast(`Chapter ${curId} Bookmarked with Sacred Ribbon! ★`, "★");
      });
    }

    // Hallmark Keepsake Triggers
    if (elements.btnCreateBlessingCard) {
      elements.btnCreateBlessingCard.addEventListener('click', () => {
        const quoteText = elements.dailyDynamicSaying ? elements.dailyDynamicSaying.textContent.replace(/^"|"$/g, '').trim() : '';
        openKeepsakeModal({
          title: 'Daily Divine Blessing',
          quote: quoteText || "Whoever puts their feet on Shirdi soil, their sufferings will come to an end.",
          context: 'Shirdi Sai Baba Holy Assurance'
        });
      });
    }

    if (elements.btnChapterKeepsake) {
      elements.btnChapterKeepsake.addEventListener('click', () => {
        const chapters = window.SAI_CHAPTERS || [];
        const chap = chapters.find(c => c.id === state.activeReadingChapter) || chapters[0];
        const quoteText = elements.dailyChapQuote ? elements.dailyChapQuote.textContent.replace(/^"|"$/g, '').trim() : '';
        openKeepsakeModal({
          title: chap.title.replace(/^Sai Satcharitra /i, ''),
          quote: quoteText || "Surrender your ego and pride at the feet of the Sadguru; only pure love and wisdom remain.",
          context: `Chapter ${chap.id}: ${chap.short_title}`
        });
      });
    }

    // Hallmark Keepsake Modal Actions
    if (elements.btnCloseKeepsake && elements.keepsakeModal) {
      elements.btnCloseKeepsake.addEventListener('click', () => {
        elements.keepsakeModal.classList.add('hidden');
      });
    }
    if (elements.keepsakeModal) {
      elements.keepsakeModal.addEventListener('click', (e) => {
        if (e.target === elements.keepsakeModal) elements.keepsakeModal.classList.add('hidden');
      });
    }
    if (elements.btnDownloadKeepsake && elements.keepsakeCanvas) {
      elements.btnDownloadKeepsake.addEventListener('click', () => {
        const dataUrl = elements.keepsakeCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `Sai_Baba_Keepsake_${new Date().toISOString().slice(0, 10)}.png`;
        a.href = dataUrl;
        a.click();
        showToast("Sacred Keepsake Saved! 📥", "🪔");
      });
    }
    if (elements.btnCopyKeepsake && elements.keepsakeCanvas) {
      elements.btnCopyKeepsake.addEventListener('click', () => {
        elements.keepsakeCanvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            showToast("Keepsake Copied to Clipboard! 📋", "🪔");
          } catch (err) {
            console.warn("Clipboard copy image failed:", err);
            elements.btnDownloadKeepsake.click();
          }
        });
      });
    }
    if (elements.btnShareKeepsake && elements.keepsakeCanvas) {
      elements.btnShareKeepsake.addEventListener('click', () => {
        elements.keepsakeCanvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            const file = new File([blob], 'Sai_Baba_Blessing.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'Sri Sai Baba Divine Blessing',
                text: currentKeepsakeData ? `"${currentKeepsakeData.quote}" — Om Sai Ram` : 'Om Sai Ram',
                files: [file]
              });
            } else {
              elements.btnDownloadKeepsake.click();
            }
          } catch (err) {
            console.warn("Share failed:", err);
            elements.btnDownloadKeepsake.click();
          }
        });
      });
    }

    // Tactile Apple/Linear Cursor Spotlight Follower
    document.addEventListener('mousemove', (e) => {
      document.querySelectorAll('.spotlight-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        if (
          e.clientX >= rect.left - 60 &&
          e.clientX <= rect.right + 60 &&
          e.clientY >= rect.top - 60 &&
          e.clientY <= rect.bottom + 60
        ) {
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
      });
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
    updateJournalBadges();
    setDynamicSaying();
    populateReaderDropdown();
    renderChaptersDirectory();
    renderSaptahSchedule();
    renderDarshanGallery();
    renderAarti('kakad');
    renderSayings('all', '');

    // Check for previous sync time
    const lastSync = localStorage.getItem('sai_last_synced_time');
    if (lastSync && elements.wifiLastSynced) {
      elements.wifiLastSynced.textContent = `Last synced: Today at ${lastSync}`;
    }
    const lastCloudSync = localStorage.getItem('sai_last_cloud_sync');
    if (lastCloudSync && elements.cloudLastSynced) {
      elements.cloudLastSynced.textContent = `Last synced: Today at ${lastCloudSync}`;
    }
    if (elements.cloudGistToken) {
      elements.cloudGistToken.value = localStorage.getItem('sai_gist_token') || '';
    }

    // Check if app was opened with a direct sync URL hash (#sync=...)
    checkUrlSyncParam();

    // Hide Install button if running in native Capacitor APK or standalone PWA
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.Capacitor !== undefined || window.navigator.standalone;
    const installBtn = document.getElementById('btn-pwa-install');
    if (isStandalone && installBtn) {
      installBtn.style.display = 'none';
      installBtn.classList.add('hidden');
    }

    // Attempt silent Wi-Fi auto-sync on launch only if on local network/Capacitor
    setTimeout(() => {
      if (elements.syncAutoLaunch && elements.syncAutoLaunch.checked) {
        const isCapacitor = window.Capacitor !== undefined;
        const isLocalHost = window.location.protocol === 'http:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isCapacitor || isLocalHost) {
          performWifiSync(true);
        }
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
