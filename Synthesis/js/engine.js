/* ==========================================================
   engine.js - the "brain" of the adaptive system.
   It never touches the page (no document.* calls) and never
   saves anything. It only decides:
     1. which topic to ask about next      (weakest first)
     2. which question to pick             (right level, not repeated)
     3. how a right/wrong answer changes   (level, streak, mastery)
   ========================================================== */

const Engine = (function () {
  const MAX_LEVEL = 3;
  const LEVEL_UP_STREAK = 2;   // right answers in a row to move up a level
  const MASTERY_STREAK = 3;    // right answers in a row at level 3 to master a topic
  const PRACTICE_LENGTH = 10;

  /* ---------- small helpers ---------- */

  function topicById(id) { return TOPICS.find(t => t.id === id); }

  function shuffle(list) {              // Fisher-Yates shuffle, returns a copy
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randomFrom(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* ---------- measuring performance ---------- */

  // Recent accuracy (last 10 answers) or null if never attempted.
  // Using recent answers means improvement shows up quickly on the heatmap.
  function accuracy(stats) {
    if (!stats.results.length) return null;
    const right = stats.results.reduce((sum, r) => sum + r, 0);
    return right / stats.results.length;
  }

  function status(stats) {
    if (stats.mastered) return 'Mastered';
    const acc = accuracy(stats);
    if (acc === null) return 'Not started';
    if (acc >= 0.8) return 'Strong';
    if (acc >= 0.5) return 'Getting there';
    return 'Needs work';
  }

  function overall(student) {
    let attempts = 0, correct = 0, mastered = 0;
    TOPICS.forEach(t => {
      const s = student.topics[t.id];
      attempts += s.attempts;
      correct += s.correct;
      if (s.mastered) mastered++;
    });
    return {
      attempts: attempts,
      correct: correct,
      accuracy: attempts ? correct / attempts : null,
      mastered: mastered,
      sessions: student.history.length
    };
  }

  /* ---------- choosing the next topic ---------- */

  // Higher number = more urgent to practise.
  function priority(stats) {
    if (stats.mastered) return 0.05;            // rarely revisit
    const acc = accuracy(stats);
    if (acc === null) return 0.6;               // unknown topics get a medium priority
    return 0.1 + (1 - acc) * 0.9;               // weaker topics get a higher priority
  }

  // Weighted random choice: weak topics are likely, but not certain,
  // so the student still sees some variety.
  function pickTopic(student, lastTopic) {
    const weights = TOPICS.map(t => {
      let w = priority(student.topics[t.id]);
      if (t.id === lastTopic) w *= 0.2;         // avoid asking the same topic twice in a row
      return w;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < TOPICS.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return TOPICS[i].id;
    }
    return TOPICS[TOPICS.length - 1].id;
  }

  /* ---------- choosing the next question ---------- */

  function pickQuestion(student, topicId, usedIds) {
    const stats = student.topics[topicId];
    const level = stats.level;

    const generators = GENERATORS.filter(g => g.topic === topicId && g.level === level);
    const atLevel = QUESTIONS.filter(q => q.topic === topicId && q.level === level && !usedIds.has(q.id));
    const fresh = atLevel.filter(q => !stats.seen.includes(q.id));

    // Use a generated question when the bank is used up, or 40% of the time to add variety
    if (generators.length && (fresh.length === 0 || Math.random() < 0.4)) {
      return randomFrom(generators).make();
    }
    if (fresh.length) return randomFrom(fresh);
    if (atLevel.length) return randomFrom(atLevel);

    // Fallbacks so we never return nothing
    const anyUnused = QUESTIONS.filter(q => q.topic === topicId && !usedIds.has(q.id));
    return randomFrom(anyUnused.length ? anyUnused : QUESTIONS.filter(q => q.topic === topicId));
  }

  // Shuffles the options and updates the index of the correct answer
  function prepare(question) {
    const correctText = question.options[question.answer];
    const options = shuffle(question.options);
    return Object.assign({}, question, { options: options, answer: options.indexOf(correctText) });
  }

  /* ---------- sessions ---------- */

  // mode: 'diagnostic' (one question per topic), 'practice' (adaptive mix),
  //       or 'topic' (only one topic, chosen from the heatmap)
  function startSession(mode, topicId) {
    return {
      mode: mode,
      topicId: topicId || null,
      total: mode === 'diagnostic' ? TOPICS.length : PRACTICE_LENGTH,
      index: 0,
      usedIds: new Set(),
      lastTopic: null,
      queue: mode === 'diagnostic' ? shuffle(TOPICS.map(t => t.id)) : null,
      answers: [],
      startedAt: Date.now()
    };
  }

  function nextQuestion(student, session) {
    let topicId;
    if (session.mode === 'diagnostic') topicId = session.queue[session.index];
    else if (session.mode === 'topic') topicId = session.topicId;
    else topicId = pickTopic(student, session.lastTopic);

    const question = prepare(pickQuestion(student, topicId, session.usedIds));
    session.usedIds.add(question.id);
    session.lastTopic = topicId;
    return question;
  }

  // Applies one answer to the student's stats. This is the adaptive rule.
  function recordAnswer(student, session, question, chosenIndex) {
    const correct = chosenIndex === question.answer;
    const stats = student.topics[question.topic];
    const levelBefore = stats.level;
    const wasMastered = stats.mastered;

    stats.attempts++;
    if (correct) stats.correct++;
    stats.results.push(correct ? 1 : 0);
    if (stats.results.length > 10) stats.results.shift();
    stats.seen.push(question.id);
    if (stats.seen.length > 8) stats.seen.shift();

    if (correct) {
      stats.streak++;
      if (stats.streak >= LEVEL_UP_STREAK && stats.level < MAX_LEVEL) {
        stats.level++;
        stats.streak = 0;
      }
      if (stats.level === MAX_LEVEL && stats.streak >= MASTERY_STREAK) {
        stats.mastered = true;
      }
    } else {
      stats.streak = 0;
      stats.mastered = false;
      stats.level = Math.max(1, stats.level - 1);
    }

    session.answers.push({ qid: question.id, topic: question.topic, level: question.level, correct: correct });
    session.index++;

    return {
      correct: correct,
      levelBefore: levelBefore,
      levelAfter: stats.level,
      newlyMastered: stats.mastered && !wasMastered
    };
  }

  // Turns a finished session into a history entry (the "version history" of attempts)
  function finishSession(student, session) {
    const entry = {
      id: Date.now(),
      date: Date.now(),
      mode: session.mode,
      topicId: session.topicId,
      total: session.answers.length,
      correct: session.answers.filter(a => a.correct).length,
      answers: session.answers.map(a => ({ topic: a.topic, level: a.level, correct: a.correct }))
    };
    student.history.push(entry);
    return entry;
  }

  return {
    topicById, accuracy, status, overall,
    startSession, nextQuestion, recordAnswer, finishSession
  };
})();
