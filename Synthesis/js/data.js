/* ==========================================================
   data.js - the content of the course.
   TOPICS: what a student can be strong or weak at.
   QUESTIONS: every question is tagged with a topic and a level
               (1 = easy, 2 = medium, 3 = hard). This tag is the
               "topic mapping" feature from the proposal.
   GENERATORS: functions that build brand-new questions with
               random numbers, so practice never runs dry.
   In every QUESTIONS entry the correct option is written first
   (answer: 0). The engine shuffles the options before showing them.
   ========================================================== */

const TOPICS = [
  {
    id: 'html-structure', name: 'Structure & Semantics', group: 'HTML',
    resource: { title: 'MDN: Document and website structure', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure' }
  },
  {
    id: 'html-forms', name: 'Forms & Inputs', group: 'HTML',
    resource: { title: 'MDN: Your first form', url: 'https://developer.mozilla.org/en-US/docs/Learn/Forms/Your_first_form' }
  },
  {
    id: 'html-media', name: 'Links, Images & Lists', group: 'HTML',
    resource: { title: 'MDN: Images in HTML', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML' }
  },
  {
    id: 'css-selectors', name: 'Selectors & Specificity', group: 'CSS',
    resource: { title: 'MDN: CSS selectors', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors' }
  },
  {
    id: 'css-box', name: 'The Box Model', group: 'CSS',
    resource: { title: 'MDN: Introduction to the CSS box model', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model' }
  },
  {
    id: 'css-layout', name: 'Flexbox & Responsive Design', group: 'CSS',
    resource: { title: 'MDN: Flexbox', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox' }
  },
  {
    id: 'js-basics', name: 'Variables & Types', group: 'JavaScript',
    resource: { title: 'MDN: Grammar and types', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types' }
  },
  {
    id: 'js-functions', name: 'Functions & Scope', group: 'JavaScript',
    resource: { title: 'MDN: Functions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' }
  },
  {
    id: 'js-dom', name: 'DOM & Events', group: 'JavaScript',
    resource: { title: 'MDN: Introduction to the DOM', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction' }
  },
  {
    id: 'js-arrays', name: 'Arrays & Array Methods', group: 'JavaScript',
    resource: { title: 'MDN: Array', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array' }
  }
];

const QUESTIONS = [
  /* ---------- HTML: Structure & Semantics ---------- */
  {
    id: 'hs1', topic: 'html-structure', level: 1,
    q: 'Which element contains all of the content that is visible on the page?',
    options: ['<body>', '<head>', '<title>', '<meta>'], answer: 0,
    why: 'The <body> holds everything the user sees. The <head> holds information about the page, such as its title and character set.'
  },
  {
    id: 'hs2', topic: 'html-structure', level: 2,
    q: 'Which element is the best choice for the main block of navigation links?',
    options: ['<nav>', '<div class="nav">', '<span>', '<section>'], answer: 0,
    why: '<nav> is a semantic element. It tells browsers, search engines and screen readers that the links inside are navigation, which a plain <div> cannot do.'
  },
  {
    id: 'hs3', topic: 'html-structure', level: 3,
    q: 'What does this tag do?',
    code: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    options: [
      'Makes the layout width match the device screen so pages scale properly on phones',
      'Makes the page load faster on mobile networks',
      'Stops users from zooming the page',
      'Increases the font size of all headings'
    ], answer: 0,
    why: 'Without it, mobile browsers pretend the screen is about 980px wide and shrink the page. This tag is what makes responsive CSS work on phones.'
  },

  /* ---------- HTML: Forms & Inputs ---------- */
  {
    id: 'hf1', topic: 'html-forms', level: 1,
    q: 'Which attribute connects a <label> to its <input>?',
    options: ['for (matching the input\'s id)', 'name', 'href', 'target'], answer: 0,
    why: 'The label\'s for attribute must equal the input\'s id. Clicking the label then focuses the input, and screen readers announce them together.'
  },
  {
    id: 'hf2', topic: 'html-forms', level: 2,
    q: 'Which input type makes the browser check that the value looks like an email address?',
    options: ['type="email"', 'type="text"', 'type="mail"', 'type="address"'], answer: 0,
    why: 'type="email" gives built-in validation and shows an email keyboard on phones. "mail" and "address" are not valid input types.'
  },
  {
    id: 'hf3', topic: 'html-forms', level: 3,
    q: 'A <button> inside a <form> has no type attribute. What happens when it is clicked?',
    options: [
      'It submits the form, because the default type is "submit"',
      'Nothing happens until you add an onclick handler',
      'It resets every field in the form',
      'It opens the form action in a new tab'
    ], answer: 0,
    why: 'The default type of a button is submit. Use type="button" when you want a button that does not submit the form.'
  },

  /* ---------- HTML: Links, Images & Lists ---------- */
  {
    id: 'hm1', topic: 'html-media', level: 1,
    q: 'Which element creates a bulleted (unordered) list?',
    options: ['<ul>', '<ol>', '<li>', '<dl>'], answer: 0,
    why: '<ul> is an unordered list and <ol> is ordered (numbered). <li> is each item inside either of them.'
  },
  {
    id: 'hm2', topic: 'html-media', level: 2,
    q: 'Which attribute gives an image a text alternative for screen readers and for when the image fails to load?',
    options: ['alt', 'title', 'src', 'caption'], answer: 0,
    why: 'The alt attribute is required for accessible images. src is the file location, and title only adds a tooltip.'
  },
  {
    id: 'hm3', topic: 'html-media', level: 3,
    q: 'Why add rel="noopener" to a link that has target="_blank"?',
    options: [
      'It stops the new page from controlling the original tab through window.opener',
      'It makes the new tab open faster',
      'It hides the link from search engines',
      'It forces the link to open in the same tab'
    ], answer: 0,
    why: 'Without it (in older browsers) the opened page could redirect your original page. Modern browsers add it automatically, but writing it is still good practice.'
  },

  /* ---------- CSS: Selectors & Specificity ---------- */
  {
    id: 'cs1', topic: 'css-selectors', level: 1,
    q: 'Which selector targets the element with id="main"?',
    options: ['#main', '.main', 'main', '*main'], answer: 0,
    why: '# selects by id, . selects by class, and a bare word selects by tag name.'
  },
  {
    id: 'cs2', topic: 'css-selectors', level: 2,
    q: 'Which selector has the highest specificity?',
    options: ['#box', 'p.box', '.box', 'p'], answer: 0,
    why: 'An id selector outweighs any number of classes or tags. Roughly: id = 100, class = 10, tag = 1. So #box = 100, p.box = 11, .box = 10, p = 1.'
  },
  {
    id: 'cs3', topic: 'css-selectors', level: 3,
    q: 'What does this selector match?',
    code: 'ul > li',
    options: [
      'Only <li> elements that are direct children of a <ul>',
      'Every <li> anywhere inside a <ul>, at any depth',
      'Every <ul> that is directly followed by an <li>',
      'Both <ul> and <li> elements'
    ], answer: 0,
    why: 'The > symbol is the child combinator, so it only matches direct children. A space (ul li) is the descendant combinator and matches at any depth.'
  },

  /* ---------- CSS: The Box Model ---------- */
  {
    id: 'cb1', topic: 'css-box', level: 1,
    q: 'From the inside out, what is the order of the layers of the CSS box model?',
    options: ['Content, padding, border, margin', 'Content, margin, border, padding', 'Content, border, padding, margin', 'Padding, content, border, margin'], answer: 0,
    why: 'Content sits in the middle, padding surrounds it, then the border, and margin is the space outside the border.'
  },
  {
    id: 'cb2', topic: 'css-box', level: 2,
    q: 'With box-sizing: border-box, what total width does this element take up (excluding margin)?',
    code: '.card {\n  box-sizing: border-box;\n  width: 200px;\n  padding: 20px;\n  border: 5px solid;\n}',
    options: ['200px', '250px', '240px', '225px'], answer: 0,
    why: 'border-box means the width you set already includes padding and border, so the element is exactly 200px wide. With the default content-box it would be 200 + 40 + 10 = 250px.'
  },
  {
    id: 'cb3', topic: 'css-box', level: 3,
    q: 'Two stacked block elements: the top one has margin-bottom: 20px and the bottom one has margin-top: 30px. How big is the gap between them?',
    options: ['30px', '50px', '20px', '10px'], answer: 0,
    why: 'Adjacent vertical margins collapse. The gap equals the larger of the two margins, not their sum.'
  },

  /* ---------- CSS: Flexbox & Responsive Design ---------- */
  {
    id: 'cl1', topic: 'css-layout', level: 1,
    q: 'Which declaration turns an element into a flex container?',
    options: ['display: flex;', 'flex: container;', 'position: flex;', 'layout: flexbox;'], answer: 0,
    why: 'display: flex on the parent makes its direct children flex items.'
  },
  {
    id: 'cl2', topic: 'css-layout', level: 2,
    q: 'In a flex container with the default direction, which property spreads items along the main (horizontal) axis?',
    options: ['justify-content', 'align-items', 'flex-wrap', 'align-content'], answer: 0,
    why: 'justify-content works on the main axis. align-items works on the cross axis (vertical by default).'
  },
  {
    id: 'cl3', topic: 'css-layout', level: 3,
    q: 'When do the styles inside this media query apply?',
    code: '@media (max-width: 600px) {\n  .menu { display: none; }\n}',
    options: [
      'When the viewport is 600px wide or narrower',
      'When the viewport is 600px wide or wider',
      'Only when the viewport is exactly 600px wide',
      'Only on printers'
    ], answer: 0,
    why: 'max-width means "up to and including this width". It is how you write styles that only apply on small screens.'
  },

  /* ---------- JavaScript: Variables & Types ---------- */
  {
    id: 'jb1', topic: 'js-basics', level: 1,
    q: 'Which keyword declares a variable that cannot be reassigned?',
    options: ['const', 'let', 'var', 'static'], answer: 0,
    why: 'const prevents reassignment of the variable. let allows reassignment, and var is the older function-scoped keyword.'
  },
  {
    id: 'jb2', topic: 'js-basics', level: 2,
    q: 'What does this print?',
    code: 'console.log(typeof null);',
    options: ['"object"', '"null"', '"undefined"', '"number"'], answer: 0,
    why: 'This is a famous quirk from the first version of JavaScript. typeof null is "object", so use value === null to test for null.'
  },
  {
    id: 'jb3', topic: 'js-basics', level: 3,
    q: 'What do these two lines print, in order?',
    code: 'console.log("5" + 3);\nconsole.log("5" - 3);',
    options: ['"53" then 2', '8 then 2', '"53" then "53"', '8 then "2"'], answer: 0,
    why: 'The + operator joins strings when one side is a string, so "5" + 3 gives "53". The - operator only works on numbers, so "5" is converted to 5 and the result is 2.'
  },

  /* ---------- JavaScript: Functions & Scope ---------- */
  {
    id: 'jf1', topic: 'js-functions', level: 1,
    q: 'Which of these is a valid function declaration?',
    options: ['function add(a, b) { return a + b; }', 'func add(a, b) { return a + b; }', 'def add(a, b): return a + b', 'function = add(a, b) { return a + b; }'], answer: 0,
    why: 'JavaScript functions start with the function keyword followed by a name, parameters in parentheses, and a body in braces.'
  },
  {
    id: 'jf2', topic: 'js-functions', level: 2,
    q: 'What does this print?',
    code: 'function greet(name) {\n  const msg = "Hi " + name;\n}\nconsole.log(greet("Ama"));',
    options: ['undefined', '"Hi Ama"', '"Hi"', 'An error'], answer: 0,
    why: 'greet never uses return, so calling it gives back undefined. The msg variable only exists inside the function.'
  },
  {
    id: 'jf3', topic: 'js-functions', level: 3,
    q: 'What does this print?',
    code: 'function counter() {\n  let c = 0;\n  return () => ++c;\n}\nconst a = counter();\na();\nconsole.log(a());',
    options: ['2', '1', '0', 'undefined'], answer: 0,
    why: 'This is a closure. The returned function remembers c even after counter() has finished. The first call makes c 1, the second makes it 2.'
  },

  /* ---------- JavaScript: DOM & Events ---------- */
  {
    id: 'jd1', topic: 'js-dom', level: 1,
    q: 'Which method finds an element by its id?',
    options: ['document.getElementById("x")', 'document.findId("x")', 'document.id("x")', 'window.element("x")'], answer: 0,
    why: 'getElementById returns the one element with that id, or null if none exists. querySelector("#x") does the same job.'
  },
  {
    id: 'jd2', topic: 'js-dom', level: 2,
    q: 'Which line correctly runs a function when a button is clicked?',
    options: ['btn.addEventListener("click", doIt);', 'btn.onClick = doIt();', 'btn.listen("click", doIt);', 'btn.click = doIt;'], answer: 0,
    why: 'addEventListener takes the event name and a function. Passing doIt (not doIt()) hands over the function itself, instead of calling it immediately.'
  },
  {
    id: 'jd3', topic: 'js-dom', level: 3,
    q: 'What is the main benefit of event delegation (one listener on a parent element)?',
    options: [
      'One listener handles clicks on many children, including children added later',
      'It makes events fire twice as fast',
      'It stops events from bubbling',
      'It lets you avoid using event.target'
    ], answer: 0,
    why: 'Events bubble up from the clicked child to its parent. A single parent listener can check event.target, which saves memory and works for dynamically added elements.'
  },

  /* ---------- JavaScript: Arrays & Array Methods ---------- */
  {
    id: 'ja1', topic: 'js-arrays', level: 1,
    q: 'Which method adds an item to the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'], answer: 0,
    why: 'push adds to the end and pop removes from the end. unshift adds to the start and shift removes from the start.'
  },
  {
    id: 'ja2', topic: 'js-arrays', level: 2,
    q: 'What does this print?',
    code: 'console.log([1, 2, 3, 4].filter(n => n % 2 === 0));',
    options: ['[2, 4]', '[1, 3]', '[true, false, true, false]', '2'], answer: 0,
    why: 'filter keeps only the items for which the function returns true. Here those are the even numbers, 2 and 4.'
  },
  {
    id: 'ja3', topic: 'js-arrays', level: 3,
    q: 'What does this print?',
    code: 'console.log([10, 9, 1].sort());',
    options: ['[1, 10, 9]', '[1, 9, 10]', '[10, 9, 1]', '[9, 10, 1]'], answer: 0,
    why: 'By default sort() compares items as strings, so "1" < "10" < "9". To sort numbers properly use sort((a, b) => a - b).'
  }
];

/* ----------------------------------------------------------
   Question generators: each make() builds a fresh question
   with random numbers. They share the same shape as QUESTIONS.
   ---------------------------------------------------------- */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  return list[randInt(0, list.length - 1)];
}

// Returns [correct, ...three different wrong answers] as strings.
// candidates are plausible wrong answers; padding guarantees we always get three.
function buildOptions(correct, candidates, suffix) {
  const wrong = [];
  candidates.forEach(c => {
    if (c !== correct && !wrong.includes(c) && c >= 0) wrong.push(c);
  });
  let pad = 1;
  while (wrong.length < 3) {
    if (correct + pad !== correct && !wrong.includes(correct + pad)) wrong.push(correct + pad);
    pad++;
  }
  return [correct].concat(wrong.slice(0, 3)).map(n => n + (suffix || ''));
}

let generatedCounter = 0;

const GENERATORS = [
  {
    topic: 'css-box', level: 2,
    make() {
      const w = pickRandom([100, 150, 200, 250, 300]);
      const p = pickRandom([10, 15, 20]);
      const b = pickRandom([2, 4, 5]);
      const total = w + 2 * p + 2 * b;
      return {
        id: 'gen-box-' + (++generatedCounter), topic: 'css-box', level: 2, generated: true,
        q: 'This box uses the default box-sizing (content-box). What total width does it take up, excluding margin?',
        code: `.box {\n  width: ${w}px;\n  padding: ${p}px;\n  border: ${b}px solid;\n}`,
        options: buildOptions(total, [w, w + 2 * p, w + 2 * b, w + p + b, w + p], 'px'),
        answer: 0,
        why: `With content-box, padding and border are added on both sides: ${w} + 2x${p} + 2x${b} = ${total}px.`
      };
    }
  },
  {
    topic: 'js-functions', level: 1,
    make() {
      const x = randInt(2, 6), y = randInt(3, 7), c = randInt(1, 9);
      const result = x * y + c;
      return {
        id: 'gen-fn-' + (++generatedCounter), topic: 'js-functions', level: 1, generated: true,
        q: 'What does this print?',
        code: `const f = (a, b) => a * b + ${c};\nconsole.log(f(${x}, ${y}));`,
        options: buildOptions(result, [x * y, x * (y + c), x + y + c, x * y - c]),
        answer: 0,
        why: `Multiplication happens before addition: ${x} * ${y} = ${x * y}, then + ${c} gives ${result}.`
      };
    }
  },
  {
    topic: 'js-arrays', level: 2,
    make() {
      const nums = [];
      while (nums.length < 5) {
        const n = randInt(1, 9);
        if (!nums.includes(n)) nums.push(n);
      }
      const t = randInt(3, 6);
      const count = nums.filter(n => n > t).length;
      return {
        id: 'gen-arr-' + (++generatedCounter), topic: 'js-arrays', level: 2, generated: true,
        q: 'What does this print?',
        code: `const nums = [${nums.join(', ')}];\nconsole.log(nums.filter(n => n > ${t}).length);`,
        options: buildOptions(count, [0, 1, 2, 3, 4, 5]),
        answer: 0,
        why: `filter keeps the numbers greater than ${t}, and .length counts them. The answer is ${count}.`
      };
    }
  }
];
