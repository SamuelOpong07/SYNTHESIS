/* ==========================================================
   storage.js - saves and loads student data.
   Uses the browser's localStorage, which every modern browser
   on every device supports. Everything is wrapped in try/catch
   because storage can be blocked (private mode, full disk).
   If that happens the app still works, it just won't remember.
   ========================================================== */

const Store = (function () {
  const KEY = 'adaptiveQuiz.v1';

  // db is the whole saved state:
  // { students: { "ama": { name, created, topics, history } }, current: "ama" }
  let db = { students: {}, current: null };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.students === 'object') db = parsed;
      }
    } catch (err) {
      console.warn('Could not read saved data:', err);
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      return true;
    } catch (err) {
      console.warn('Could not save data:', err);
      return false;
    }
  }

  // The starting stats for one topic
  function blankTopicStats() {
    return {
      attempts: 0,      // how many questions answered in total
      correct: 0,       // how many of those were right
      level: 1,         // current difficulty, 1 to 3
      streak: 0,        // correct answers in a row at this level
      mastered: false,  // true once the student has proven mastery
      seen: [],         // ids of the last few questions, to avoid repeats
      results: []       // last 10 answers as 1 (right) or 0 (wrong)
    };
  }

  function newStudent(name) {
    const topics = {};
    TOPICS.forEach(t => { topics[t.id] = blankTopicStats(); });
    return { name: name, created: Date.now(), topics: topics, history: [] };
  }

  // Older saves might miss a topic added later, so top up any gaps
  function ensureTopics(student) {
    TOPICS.forEach(t => {
      if (!student.topics[t.id]) student.topics[t.id] = blankTopicStats();
    });
    if (!Array.isArray(student.history)) student.history = [];
  }

  function keyFor(name) { return name.trim().toLowerCase(); }

  function login(name) {
    const key = keyFor(name);
    if (!db.students[key]) db.students[key] = newStudent(name.trim());
    ensureTopics(db.students[key]);
    db.current = key;
    save();
    return db.students[key];
  }

  function current() {
    if (!db.current || !db.students[db.current]) return null;
    ensureTopics(db.students[db.current]);
    return db.students[db.current];
  }

  function logout() { db.current = null; save(); }

  function allStudents() {
    return Object.keys(db.students).map(k => {
      ensureTopics(db.students[k]);
      return db.students[k];
    });
  }

  function resetCurrent() {
    if (!db.current) return null;
    const name = db.students[db.current].name;
    db.students[db.current] = newStudent(name);
    save();
    return db.students[db.current];
  }

  function exportJSON() { return JSON.stringify(db, null, 2); }

  // Merges a backup file into the current data. Throws if the file is not valid.
  function importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed.students !== 'object') {
      throw new Error('This file is not an Adaptive Quiz backup.');
    }
    Object.keys(parsed.students).forEach(k => {
      const s = parsed.students[k];
      if (s && typeof s.name === 'string' && s.topics && Array.isArray(s.history)) {
        db.students[k] = s;
      }
    });
    save();
  }

  return { load, save, login, current, logout, allStudents, resetCurrent, exportJSON, importJSON };
})();
