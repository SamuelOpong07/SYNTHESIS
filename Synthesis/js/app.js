/* ==========================================================
   app.js - connects the page (HTML) to the logic (Engine, Store).
   It handles clicks and form submits, and draws each screen.
   All text from data is inserted with textContent / createTextNode,
   never innerHTML, so code samples like <body> show as text and
   can never run as HTML.
   ========================================================== */

(function () {
  'use strict';

  /* ---------- tiny DOM helpers ---------- */

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  // h('div', { class: 'card', onclick: fn }, child1, child2)  ->  <div class="card">...</div>
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(key => {
      const value = attrs[key];
      if (value === false || value === null || value === undefined) return;
      if (key === 'class') el.className = value;
      else if (key === 'text') el.textContent = value;
      else if (key.indexOf('on') === 0) el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value === true ? '' : value);
    });
    children.flat().forEach(child => {
      if (child !== null && child !== undefined) el.append(child);
    });
    return el;
  }

  const pct = n => Math.round(n * 100) + '%';
  const formatDate = ts => new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  /* ---------- app state ---------- */

  const VIEWS = ['login', 'dashboard', 'quiz', 'results', 'progress', 'teacher'];
  let student = null;      // the logged-in student object
  let session = null;      // the quiz session in progress
  let question = null;     // the question currently on screen
  let answered = false;    // has the current question been checked?
  let lastMode = null;     // remembers how to start "Practise again"
  let lastTopicId = null;

  /* ---------- showing screens ---------- */

  function show(name) {
    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== name; });
    $$('#nav button').forEach(b => {
      b.setAttribute('aria-current', b.dataset.view === name ? 'page' : 'false');
    });
    $('#nav').hidden = !student;
    $('#userbar').hidden = !student;
    window.scrollTo(0, 0);

    // Move keyboard / screen reader focus to the new screen's heading
    const heading = $('#view-' + name + ' h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  let toastTimer;
  function notify(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
  }

  /* ---------- login ---------- */

  function renderUserList() {
    const students = Store.allStudents();
    $('#existingUsers').hidden = students.length === 0;
    const list = $('#userList');
    list.replaceChildren();
    students.forEach(s => {
      list.append(h('li', {}, h('button', {
        type: 'button', class: 'btn',
        text: s.name,
        onclick: () => signIn(s.name)
      })));
    });
  }

  function signIn(name) {
    student = Store.login(name);
    $('#userName').textContent = student.name;
    renderDashboard();
    show('dashboard');
  }

  $('#loginForm').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#nameInput').value.trim();
    const error = $('#loginError');
    if (!name) {
      error.textContent = 'Enter your name to continue.';
      error.hidden = false;
      $('#nameInput').focus();
      return;
    }
    error.hidden = true;
    $('#nameInput').value = '';
    signIn(name);
  });

  $('#btnSwitch').addEventListener('click', () => {
    Store.logout();
    student = null;
    session = null;
    renderUserList();
    show('login');
  });

  /* ---------- dashboard ---------- */

  function statCard(label, value) {
    return h('div', { class: 'stat' },
      h('span', { class: 'stat-value', text: value }),
      h('span', { class: 'stat-label', text: label }));
  }

  function heatCell(topic) {
    const stats = student.topics[topic.id];
    const acc = Engine.accuracy(stats);
    const status = Engine.status(stats);
    // Hue 0 = red, 60 = yellow, 120 = green, so accuracy maps straight to colour
    const background = acc === null ? 'hsl(215 15% 85%)' : 'hsl(' + Math.round(acc * 120) + ' 60% 78%)';
    const meta = acc === null ? 'Not started' : pct(acc) + ' correct, level ' + stats.level;
    return h('button', {
      type: 'button', class: 'heat-cell', style: 'background:' + background,
      'aria-label': topic.group + ' ' + topic.name + ': ' + status + '. Practise this topic.',
      onclick: () => startQuiz('topic', topic.id)
    },
      h('span', { class: 'heat-group', text: topic.group }),
      h('span', { class: 'heat-name', text: topic.name }),
      h('span', { class: 'heat-meta', text: meta }),
      h('span', { class: 'heat-status', text: status }));
  }

  function resourceItem(topic, note) {
    return h('li', {},
      h('strong', { text: topic.group + ': ' + topic.name }),
      note ? h('span', { text: ' (' + note + ')' }) : null,
      h('br'),
      h('a', { href: topic.resource.url, target: '_blank', rel: 'noopener noreferrer', text: topic.resource.title }));
  }

  function renderDashboard() {
    const totals = Engine.overall(student);
    $('#greeting').textContent = 'Hi, ' + student.name;

    $('#stats').replaceChildren(
      statCard('Questions answered', String(totals.attempts)),
      statCard('Overall accuracy', totals.accuracy === null ? 'None yet' : pct(totals.accuracy)),
      statCard('Topics mastered', totals.mastered + ' of ' + TOPICS.length),
      statCard('Sessions', String(totals.sessions)));

    $('#btnDiagnostic').textContent = totals.sessions === 0 ? 'Take the diagnostic quiz' : 'Retake the diagnostic quiz';

    $('#heatmap').replaceChildren(...TOPICS.map(heatCell));

    // Recommend resources for the weakest topics that have been attempted
    const weak = TOPICS
      .filter(t => {
        const acc = Engine.accuracy(student.topics[t.id]);
        return acc !== null && acc < 0.7 && !student.topics[t.id].mastered;
      })
      .sort((a, b) => Engine.accuracy(student.topics[a.id]) - Engine.accuracy(student.topics[b.id]))
      .slice(0, 4);

    const list = $('#recommend');
    list.replaceChildren();
    if (weak.length === 0) {
      list.append(h('li', { text: totals.attempts === 0
        ? 'Take the diagnostic quiz and your study links will appear here.'
        : 'No weak topics right now. Keep practising to reach mastery.' }));
    } else {
      weak.forEach(t => list.append(resourceItem(t, pct(Engine.accuracy(student.topics[t.id])) + ' recent accuracy')));
    }
  }

  $('#btnDiagnostic').addEventListener('click', () => startQuiz('diagnostic'));
  $('#btnPractice').addEventListener('click', () => startQuiz('practice'));

  /* ---------- quiz ---------- */

  function modeLabel() {
    if (session.mode === 'diagnostic') return 'Diagnostic quiz';
    if (session.mode === 'topic') {
      const t = Engine.topicById(session.topicId);
      return 'Practice: ' + t.name;
    }
    return 'Adaptive practice';
  }

  function startQuiz(mode, topicId) {
    lastMode = mode;
    lastTopicId = topicId || null;
    session = Engine.startSession(mode, topicId);
    loadQuestion();
  }

  function loadQuestion() {
    question = Engine.nextQuestion(student, session);
    answered = false;
    const topic = Engine.topicById(question.topic);

    $('#quizLabel').textContent = modeLabel();
    $('#quizProgress').max = session.total;
    $('#quizProgress').value = session.index;
    $('#progressText').textContent = 'Question ' + (session.index + 1) + ' of ' + session.total;
    $('#qMeta').textContent = topic.group + ': ' + topic.name + ', level ' + question.level;
    $('#qText').textContent = question.q;

    const codeBox = $('#qCode');
    if (question.code) {
      $('code', codeBox).textContent = question.code;
      codeBox.hidden = false;
    } else {
      codeBox.hidden = true;
    }

    const options = $('#options');
    options.replaceChildren();
    question.options.forEach((text, i) => {
      const id = 'option-' + i;
      const input = h('input', { type: 'radio', name: 'answer', id: id, value: String(i) });
      const label = h('label', { class: 'option', for: id }, input, h('span', { text: text }));
      input.addEventListener('change', () => {
        $$('.option', options).forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
      });
      options.append(label);
    });

    $('#feedback').hidden = true;
    $('#btnNext').hidden = true;
    $('#btnCheck').hidden = false;
    show('quiz');
  }

  function showFeedback(kind, title, ...extra) {
    const box = $('#feedback');
    box.className = 'feedback ' + kind;
    box.replaceChildren(h('strong', { text: title }), ...extra);
    box.hidden = false;
  }

  $('#answerForm').addEventListener('submit', event => {
    event.preventDefault();
    if (answered) return;

    const chosen = $('input[name="answer"]:checked');
    if (!chosen) {
      showFeedback('warn', 'Pick an answer first.');
      return;
    }

    answered = true;
    const chosenIndex = Number(chosen.value);
    const result = Engine.recordAnswer(student, session, question, chosenIndex);
    Store.save();

    // Lock the options and mark right / wrong
    $$('input[name="answer"]').forEach(input => { input.disabled = true; });
    $$('#options .option').forEach((label, i) => {
      label.classList.remove('selected');
      if (i === question.answer) label.classList.add('correct');
      else if (i === chosenIndex) label.classList.add('wrong');
    });

    const topic = Engine.topicById(question.topic);
    const notes = [h('p', { text: question.why })];

    if (result.newlyMastered) {
      notes.push(h('p', { text: 'You have mastered ' + topic.name + '.' }));
    } else if (result.levelAfter > result.levelBefore) {
      notes.push(h('p', { text: 'Level up. Questions on this topic will now be harder.' }));
    } else if (result.levelAfter < result.levelBefore) {
      notes.push(h('p', { text: 'Dropping back to level ' + result.levelAfter + ' to rebuild the basics.' }));
    }

    if (!result.correct) {
      notes.push(h('p', {}, h('a', {
        href: topic.resource.url, target: '_blank', rel: 'noopener noreferrer',
        text: 'Review: ' + topic.resource.title
      })));
    }

    showFeedback(result.correct ? 'good' : 'bad', result.correct ? 'Correct.' : 'Not quite.', ...notes);

    $('#quizProgress').value = session.index;
    $('#btnCheck').hidden = true;
    const next = $('#btnNext');
    next.textContent = session.index >= session.total ? 'See results' : 'Next question';
    next.hidden = false;
    next.focus();
  });

  $('#btnNext').addEventListener('click', () => {
    if (session.index >= session.total) finishQuiz();
    else loadQuestion();
  });

  $('#btnQuit').addEventListener('click', () => {
    if (session.answers.length === 0) {
      renderDashboard();
      show('dashboard');
      return;
    }
    if (confirm('End this session and see your results?')) finishQuiz();
  });

  /* ---------- results ---------- */

  function finishQuiz() {
    const entry = Engine.finishSession(student, session);
    Store.save();
    renderResults(entry);
    show('results');
  }

  function renderResults(entry) {
    $('#resultScore').textContent = entry.correct + ' of ' + entry.total + ' correct (' +
      (entry.total ? pct(entry.correct / entry.total) : '0%') + ')';

    // Group the answers by topic
    const byTopic = {};
    entry.answers.forEach(a => {
      byTopic[a.topic] = byTopic[a.topic] || { right: 0, total: 0 };
      byTopic[a.topic].total++;
      if (a.correct) byTopic[a.topic].right++;
    });

    const breakdown = $('#resultBreakdown');
    breakdown.replaceChildren();
    const resources = $('#resultResources');
    resources.replaceChildren();

    Object.keys(byTopic).forEach(id => {
      const topic = Engine.topicById(id);
      const r = byTopic[id];
      breakdown.append(h('li', {},
        h('span', { text: topic.group + ': ' + topic.name }),
        h('strong', { text: r.right + ' / ' + r.total })));
      if (r.right < r.total) resources.append(resourceItem(topic));
    });

    if (!resources.children.length) {
      resources.append(h('li', { text: 'No mistakes this time. Nothing to review.' }));
    }
  }

  $('#btnAgain').addEventListener('click', () => startQuiz(lastMode || 'practice', lastTopicId));
  $('#btnHome').addEventListener('click', () => { renderDashboard(); show('dashboard'); });

  /* ---------- progress ---------- */

  function modeName(entry) {
    if (entry.mode === 'diagnostic') return 'Diagnostic quiz';
    if (entry.mode === 'topic') {
      const t = Engine.topicById(entry.topicId);
      return 'Practice: ' + (t ? t.name : 'topic');
    }
    return 'Adaptive practice';
  }

  function renderProgress() {
    // Trend chart: one bar per session, last 12 sessions
    const recent = student.history.slice(-12);
    const trend = $('#trend');
    trend.replaceChildren();
    if (recent.length === 0) {
      trend.append(h('p', { class: 'hint', text: 'Finish a session to see your scores here.' }));
    } else {
      const scores = recent.map(e => (e.total ? Math.round((e.correct / e.total) * 100) : 0));
      trend.append(h('div', {
        class: 'trend', role: 'img',
        'aria-label': 'Scores of your last ' + recent.length + ' sessions, oldest first: ' + scores.join('%, ') + '%.'
      }, ...scores.map(s => h('div', {
        class: 'trend-bar', style: 'height:' + Math.max(s, 6) + '%', title: s + '%', text: s + ''
      }))));
    }

    // Topic table
    const rows = TOPICS.map(t => {
      const s = student.topics[t.id];
      const acc = Engine.accuracy(s);
      return h('tr', {},
        h('td', { text: t.group + ': ' + t.name }),
        h('td', { text: String(s.attempts) }),
        h('td', { text: acc === null ? 'n/a' : pct(acc) }),
        h('td', { text: String(s.level) }),
        h('td', { text: Engine.status(s) }));
    });
    $('#topicTable').replaceChildren(h('table', {},
      h('caption', { text: 'Accuracy uses your last 10 answers per topic.' }),
      h('thead', {}, h('tr', {}, ...['Topic', 'Answered', 'Recent accuracy', 'Level', 'Status'].map(t => h('th', { scope: 'col', text: t })))),
      h('tbody', {}, ...rows)));

    // Attempt history, newest first
    const list = $('#historyList');
    list.replaceChildren();
    if (student.history.length === 0) {
      list.append(h('li', { text: 'No attempts yet.' }));
    }
    student.history.slice().reverse().forEach(e => {
      list.append(h('li', {},
        h('span', { text: modeName(e) }),
        h('span', { text: e.correct + ' / ' + e.total }),
        h('span', { class: 'hint', text: formatDate(e.date) })));
    });
  }

  $('#btnExport').addEventListener('click', () => {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = h('a', { href: url, download: 'adaptive-quiz-backup.json' });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify('Backup downloaded.');
  });

  $('#fileImport').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        Store.importJSON(String(reader.result));
        student = Store.current() || student;
        renderProgress();
        notify('Backup imported.');
      } catch (err) {
        notify('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  });

  $('#btnReset').addEventListener('click', () => {
    if (confirm('Delete all of your progress? This cannot be undone.')) {
      student = Store.resetCurrent();
      renderProgress();
      notify('Progress reset.');
    }
  });

  /* ---------- class overview ---------- */

  function renderTeacher() {
    const students = Store.allStudents();

    // Combine all students' stats per topic
    const rows = TOPICS.map(t => {
      let right = 0, total = 0;
      students.forEach(s => {
        const results = s.topics[t.id].results;
        total += results.length;
        right += results.reduce((a, b) => a + b, 0);
      });
      return { topic: t, total: total, acc: total ? right / total : null };
    });

    // Weakest first; topics nobody has tried go last
    rows.sort((a, b) => (a.acc === null) - (b.acc === null) || (a.acc - b.acc));

    $('#classTopics').replaceChildren(h('div', { class: 'table-wrap' }, h('table', {},
      h('caption', { text: 'Recent accuracy across all students on this device.' }),
      h('thead', {}, h('tr', {}, ...['Topic', 'Answers', 'Accuracy', ''].map(t => h('th', { scope: 'col', text: t })))),
      h('tbody', {}, ...rows.map(r => h('tr', {},
        h('td', { text: r.topic.group + ': ' + r.topic.name }),
        h('td', { text: String(r.total) }),
        h('td', { text: r.acc === null ? 'n/a' : pct(r.acc) }),
        h('td', {}, h('div', { class: 'bar-track', 'aria-hidden': 'true' },
          h('div', { class: 'bar-fill', style: 'width:' + (r.acc === null ? 0 : Math.round(r.acc * 100)) + '%' })))))))));

    $('#classStudents').replaceChildren(h('table', {},
      h('thead', {}, h('tr', {}, ...['Student', 'Answered', 'Accuracy', 'Mastered', 'Sessions'].map(t => h('th', { scope: 'col', text: t })))),
      h('tbody', {}, ...students.map(s => {
        const o = Engine.overall(s);
        return h('tr', {},
          h('td', { text: s.name }),
          h('td', { text: String(o.attempts) }),
          h('td', { text: o.accuracy === null ? 'n/a' : pct(o.accuracy) }),
          h('td', { text: o.mastered + ' / ' + TOPICS.length }),
          h('td', { text: String(o.sessions) }));
      }))));
  }

  /* ---------- navigation ---------- */

  $$('#nav button').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view === 'dashboard') renderDashboard();
      if (view === 'progress') renderProgress();
      if (view === 'teacher') renderTeacher();
      show(view);
    });
  });

  /* ---------- start up ---------- */

  Store.load();
  const saved = Store.current();
  if (saved) {
    signIn(saved.name);
  } else {
    renderUserList();
    show('login');
  }
})();
