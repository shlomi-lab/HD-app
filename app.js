/* Helpdesk pocket toolkit: offline-first, single user, no network calls. */
(function () {
  'use strict';

  // ---------- constants ----------
  var CATS = [
    { key: 'AD', he: 'משתמשים ו-AD', en: 'Active Directory', icon: '🔐', color: '#60a5fa' },
    { key: 'Remote Access', he: 'גישה מרחוק', en: 'Remote Access', icon: '🖥️', color: '#a78bfa' },
    { key: 'DNS/DC', he: 'DNS ו-DC', en: 'DNS / Domain Controller', icon: '🌐', color: '#2dd4bf' },
    { key: 'GPO', he: 'מדיניות GPO', en: 'Group Policy', icon: '📜', color: '#fbbf24' },
    { key: 'Network', he: 'רשת', en: 'Network', icon: '📡', color: '#34d399' },
    { key: 'Printers', he: 'מדפסות', en: 'Printers', icon: '🖨️', color: '#fb923c' },
    { key: 'System', he: 'מערכת', en: 'System', icon: '⚙️', color: '#f472b6' },
    { key: 'Build', he: 'בניית דומיין', en: 'Build a domain (lab)', icon: '🏗️', color: '#a3e635' },
    { key: 'Win+R', he: 'קיצורי Win+R', en: 'Run commands', icon: '⌨️', color: '#94a3b8' }
  ];
  var CAT_BY_KEY = {};
  CATS.forEach(function (c) { CAT_BY_KEY[c.key] = c; });

  var CHECKLIST = [
    { id: 'c1', t: 'לשחזר את הבעיה', s: 'האם זה קורה שוב? מאיזו שעה, אצל מי, ומה ההודעה המדויקת. צלם מסך.' },
    { id: 'c2', t: 'מה השתנה לאחרונה?', s: 'עדכון, שינוי סיסמה, התקנה, GPO חדש, הזזת כבל או ציוד, הפסקת חשמל.' },
    { id: 'c3', t: 'מי מושפע?', s: 'משתמש אחד, כמה, או כולם. מחשב אחד או כמה. זה קובע אם הבעיה במשתמש, במחשב או בשרת/רשת.' },
    { id: 'c4', t: 'לבדוק לוגים וקוד שגיאה', s: 'Event Viewer (eventvwr.msc). חפש את קוד השגיאה המדויק ואת השעה.' },
    { id: 'c5', t: 'לבדוק בסיס', s: 'חיבור לרשת, DNS, שעון (עד 5 דקות הפרש), מקום פנוי בדיסק, שירותים חיוניים.' },
    { id: 'c6', t: 'לנסות את הפתרון הפשוט קודם', s: 'התנתקות והתחברות, הפעלה מחדש של האפליקציה או השירות, לפני הפעלה מחדש של שרת.' },
    { id: 'c7', t: 'לתעד', s: 'מה ניסית, מה עבד ומה לא. הוסף רשומה לאפליקציה כדי שלא תצטרך לגלות שוב.' }
  ];

  var state = {
    entries: [],
    byId: {},
    kv: {},
    memOnly: false,
    swStatus: 'לא נבדק',
    persisted: null,
    wiz: { who: '', where: '', change: '', text: '' },
    importReport: null,
    query: ''
  };

  // ---------- tiny DOM helper ----------
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === false || v === null || v === undefined) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style') el.setAttribute('style', v);
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'value') el.value = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, kid) {
    if (kid === null || kid === undefined || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { append(el, k); }); return; }
    el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  // ---------- storage (IndexedDB with in-memory fallback) ----------
  var db = null;
  var mem = { entries: {}, kv: {} };

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (typeof indexedDB === 'undefined') { reject(new Error('no indexedDB')); return; }
      var req;
      try { req = indexedDB.open('helpdesk-pocket', 1); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains('entries')) d.createObjectStore('entries', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv', { keyPath: 'key' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
      req.onblocked = function () { reject(new Error('blocked')); };
    });
  }
  function run(store, mode, fn) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(store, mode);
      var out;
      tx.oncomplete = function () { resolve(out); };
      tx.onerror = function () { reject(tx.error); };
      tx.onabort = function () { reject(tx.error || new Error('aborted')); };
      out = fn(tx.objectStore(store), function (v) { out = v; });
    });
  }
  function dbAllEntries() {
    if (state.memOnly) return Promise.resolve(Object.keys(mem.entries).map(function (k) { return mem.entries[k]; }));
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('entries', 'readonly');
      var r = tx.objectStore('entries').getAll();
      r.onsuccess = function () { resolve(r.result || []); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function dbPutMany(list) {
    if (state.memOnly) { list.forEach(function (e) { mem.entries[e.id] = e; }); return Promise.resolve(); }
    return run('entries', 'readwrite', function (st) { list.forEach(function (e) { st.put(e); }); });
  }
  function dbDelete(id) {
    if (state.memOnly) { delete mem.entries[id]; return Promise.resolve(); }
    return run('entries', 'readwrite', function (st) { st.delete(id); });
  }
  function kvAll() {
    if (state.memOnly) return Promise.resolve(Object.keys(mem.kv).map(function (k) { return { key: k, value: mem.kv[k] }; }));
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('kv', 'readonly');
      var r = tx.objectStore('kv').getAll();
      r.onsuccess = function () { resolve(r.result || []); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function kvSet(key, value) {
    state.kv[key] = value;
    if (state.memOnly) { mem.kv[key] = value; return Promise.resolve(); }
    return run('kv', 'readwrite', function (st) { st.put({ key: key, value: value }); }).catch(function () {});
  }

  function reindex() {
    state.byId = {};
    state.entries.forEach(function (e) { state.byId[e.id] = e; });
  }

  // ---------- validation ----------
  function str(v) { return typeof v === 'string' ? v : ''; }
  function normalizeEntry(raw) {
    // returns { entry } or { error }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'הרשומה אינה אובייקט' };
    var titleHe = str(raw.titleHe).trim();
    if (!titleHe) return { error: 'חסר titleHe (שם התקלה בעברית)' };
    var category = str(raw.category).trim();
    if (!CAT_BY_KEY[category]) return { error: 'קטגוריה לא מוכרת: "' + category + '"' };
    var commands = [];
    if (raw.commands !== undefined && raw.commands !== null) {
      if (!Array.isArray(raw.commands)) return { error: 'commands חייב להיות רשימה' };
      for (var i = 0; i < raw.commands.length; i++) {
        var c = raw.commands[i];
        if (!c || typeof c !== 'object' || typeof c.text !== 'string') return { error: 'פקודה ' + (i + 1) + ' בלי text' };
        commands.push({ label: str(c.label), text: c.text });
      }
    }
    var guiSteps = [];
    if (raw.guiSteps !== undefined && raw.guiSteps !== null) {
      if (!Array.isArray(raw.guiSteps)) return { error: 'guiSteps חייב להיות רשימה' };
      for (var j = 0; j < raw.guiSteps.length; j++) {
        if (typeof raw.guiSteps[j] !== 'string') return { error: 'שלב GUI ' + (j + 1) + ' אינו טקסט' };
        guiSteps.push(raw.guiSteps[j]);
      }
    }
    var tags = [];
    if (raw.tags !== undefined && raw.tags !== null) {
      if (!Array.isArray(raw.tags)) return { error: 'tags חייב להיות רשימה' };
      tags = raw.tags.filter(function (t) { return typeof t === 'string' && t.trim(); }).map(function (t) { return t.trim(); });
    }
    var now = Date.now();
    var id = str(raw.id).trim() || newId();
    var created = typeof raw.createdAt === 'number' ? raw.createdAt : now;
    var updated = typeof raw.updatedAt === 'number' ? raw.updatedAt : created;
    return {
      entry: {
        id: id, titleHe: titleHe, titleEn: str(raw.titleEn).trim(), category: category,
        symptom: str(raw.symptom), commands: commands, guiSteps: guiSteps,
        ifNotWorking: str(raw.ifNotWorking), notes: str(raw.notes), tags: tags,
        createdAt: created, updatedAt: updated
      }
    };
  }
  function newId() { return 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

  // ---------- search ----------
  function norm(s) { return String(s || '').toLowerCase(); }
  function haystack(e) {
    if (e._h) return e._h;
    var parts = [e.titleHe, e.titleEn, e.symptom, e.notes, e.ifNotWorking, e.tags.join(' '),
      e.commands.map(function (c) { return c.label + ' ' + c.text; }).join(' '),
      e.guiSteps.join(' '), (CAT_BY_KEY[e.category] || {}).he, e.category];
    var s = norm(parts.join(' \n '));
    Object.defineProperty(e, '_h', { value: s, enumerable: false, configurable: true });
    return s;
  }
  function score(e, tokens) {
    var total = 0;
    var hs = haystack(e);
    var title = norm(e.titleHe + ' ' + e.titleEn);
    var tags = norm(e.tags.join(' '));
    var symp = norm(e.symptom);
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (hs.indexOf(t) === -1) return 0;
      total += 1;
      if (title.indexOf(t) !== -1) total += 5;
      if (tags.indexOf(t) !== -1) total += 3;
      if (symp.indexOf(t) !== -1) total += 2;
    }
    return total;
  }
  function search(q) {
    var tokens = norm(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return state.entries.map(function (e) { return { e: e, s: score(e, tokens) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.e.titleHe.localeCompare(b.e.titleHe, 'he'); })
      .map(function (x) { return x.e; });
  }

  // ---------- routing ----------
  function go(hash) {
    if (location.hash === hash) render(); else location.hash = hash;
  }
  function back(fallback) {
    if (window.history.length > 1) window.history.back(); else go(fallback || '#/');
  }
  function route() {
    var hash = location.hash || '#/';
    var parts = hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    return { name: parts[0] || 'home', arg: parts.slice(1).join('/') };
  }

  var view = null;
  function render() {
    view = document.getElementById('view');
    var r = route();
    clear(view);
    view.className = '';
    var tabKey = 'home';
    if (r.name === 'home') renderHome();
    else if (r.name === 'cat') renderCategory(r.arg);
    else if (r.name === 'e') renderDetail(r.arg);
    else if (r.name === 'new') renderForm(null);
    else if (r.name === 'edit') renderForm(r.arg);
    else if (r.name === 'stuck') { tabKey = 'stuck'; renderStuck(); }
    else if (r.name === 'check') { tabKey = 'check'; renderChecklist(); }
    else if (r.name === 'settings') { tabKey = 'settings'; renderSettings(); }
    else renderHome();
    renderTabs(tabKey);
    window.scrollTo(0, 0);
    // re-trigger animation
    view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
  }

  function renderTabs(active) {
    var tabs = [
      { k: 'home', t: 'בית', i: '🏠', href: '#/' },
      { k: 'stuck', t: 'אני תקוע', i: '🧭', href: '#/stuck' },
      { k: 'check', t: 'צ\'קליסט', i: '✅', href: '#/check' },
      { k: 'settings', t: 'הגדרות', i: '⚙️', href: '#/settings' }
    ];
    var nav = document.getElementById('tabbar');
    clear(nav);
    tabs.forEach(function (t) {
      nav.appendChild(h('button', { class: 'tab' + (t.k === active ? ' on' : ''), 'aria-label': t.t, 'aria-current': t.k === active ? 'page' : false,
        onclick: function () { if (t.k === 'home') state.query = ''; go(t.href); } },
        h('span', { class: 'ti', text: t.i }), h('span', { text: t.t })));
    });
  }

  // ---------- shared pieces ----------
  function badge(cat) {
    var c = CAT_BY_KEY[cat] || { he: cat, color: '#94a3b8' };
    return h('span', { class: 'badge', style: 'color:' + c.color + ';background:' + c.color + '22;border-color:' + c.color + '55', text: c.he });
  }
  function entryCard(e) {
    return h('button', { class: 'card', onclick: function () { go('#/e/' + encodeURIComponent(e.id)); } },
      h('p', { class: 't', text: e.titleHe }),
      e.titleEn ? h('div', { class: 'en', text: e.titleEn }) : null,
      e.symptom ? h('p', { class: 's', text: e.symptom }) : null,
      badge(e.category));
  }
  function listOf(entries, emptyText) {
    if (!entries.length) return h('div', { class: 'empty', text: emptyText || 'לא נמצאו רשומות' });
    return h('div', { class: 'list' }, entries.map(entryCard));
  }
  function sortHe(a, b) { return a.titleHe.localeCompare(b.titleHe, 'he'); }

  // ---------- home ----------
  function renderHome() {
    var results = h('div');
    var tiles = h('div');
    var input = h('input', { type: 'search', placeholder: 'חפש תקלה, פקודה או תסמין', enterkeyhint: 'search', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'חיפוש', value: state.query,
      oninput: function () { state.query = input.value; paint(); } });

    function paint() {
      clear(results); clear(tiles);
      var q = state.query.trim();
      if (q) {
        var found = search(q);
        results.appendChild(h('h2', { text: found.length ? 'תוצאות (' + found.length + ')' : 'אין תוצאות' }));
        results.appendChild(listOf(found.slice(0, 60), 'נסה מילה אחרת, בעברית או באנגלית'));
        return;
      }
      var counts = {};
      state.entries.forEach(function (e) { counts[e.category] = (counts[e.category] || 0) + 1; });
      tiles.appendChild(h('div', { class: 'grid' }, CATS.map(function (c) {
        return h('button', { class: 'tile', onclick: function () { go('#/cat/' + encodeURIComponent(c.key)); } },
          h('div', { class: 'row' },
            h('span', { class: 'ico', style: 'background:' + c.color + '22;color:' + c.color, text: c.icon }),
            h('span', { class: 'count', text: (counts[c.key] || 0) + ' רשומות' })),
          h('div', null, h('div', { class: 'name', text: c.he }), h('div', { class: 'count ltr', text: c.en })));
      })));
      var recentIds = (state.kv.recent || []).filter(function (id) { return state.byId[id]; }).slice(0, 5);
      var recent = recentIds.map(function (id) { return state.byId[id]; });
      if (recent.length) {
        tiles.appendChild(h('h2', { text: 'נצפו לאחרונה' }));
        tiles.appendChild(listOf(recent));
      } else {
        var common = state.entries.filter(function (e) { return e.category !== 'Win+R'; }).sort(sortHe).slice(0, 5);
        tiles.appendChild(h('h2', { text: 'להתחלה' }));
        tiles.appendChild(listOf(common));
      }
    }

    view.appendChild(h('div', { class: 'topbar' },
      h('h1', { text: 'Helpdesk כיס' }),
      h('button', { class: 'icon-btn accent', 'aria-label': 'הוסף רשומה', onclick: function () { go('#/new'); }, text: '+' })));
    view.appendChild(h('p', { class: 'sub', text: state.entries.length + ' רשומות · עובד גם בלי קליטה' }));
    view.appendChild(h('div', { class: 'search' }, input, h('span', { class: 'glass', text: '🔍' })));
    view.appendChild(results);
    view.appendChild(tiles);
    paint();
  }

  // ---------- category ----------
  function renderCategory(key) {
    var cat = CAT_BY_KEY[key];
    if (!cat) { go('#/'); return; }
    var items = state.entries.filter(function (e) { return e.category === key; }).sort(sortHe);
    view.appendChild(h('button', { class: 'back', onclick: function () { back('#/'); }, text: '‹ חזרה' }));
    view.appendChild(h('h1', { text: cat.icon + ' ' + cat.he }));
    view.appendChild(h('p', { class: 'sub ltr', text: cat.en + ' · ' + items.length }));
    var filter = h('input', { type: 'search', placeholder: 'סנן בתוך הנושא', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    var box = h('div');
    function paint() {
      clear(box);
      var q = norm(filter.value).split(/\s+/).filter(Boolean);
      var shown = q.length ? items.filter(function (e) { return score(e, q) > 0; }) : items;
      box.appendChild(listOf(shown, 'אין רשומות בנושא הזה'));
    }
    filter.addEventListener('input', paint);
    view.appendChild(h('div', { class: 'search' }, filter, h('span', { class: 'glass', text: '🔍' })));
    view.appendChild(box);
    paint();
  }

  // ---------- detail ----------
  function termBlock(c) {
    return h('div', { class: 'term' },
      c.label ? h('div', { class: 'lab', text: c.label }) : null,
      h('pre', { text: c.text }));
  }
  function renderDetail(id) {
    var e = state.byId[id];
    if (!e) {
      view.appendChild(h('button', { class: 'back', onclick: function () { go('#/'); }, text: '‹ חזרה' }));
      view.appendChild(h('div', { class: 'empty', text: 'הרשומה לא נמצאה' }));
      return;
    }
    var recent = (state.kv.recent || []).filter(function (x) { return x !== id; });
    recent.unshift(id);
    kvSet('recent', recent.slice(0, 12));

    view.classList.add('detail');
    view.appendChild(h('button', { class: 'back', onclick: function () { back('#/'); }, text: '‹ חזרה' }));
    view.appendChild(badge(e.category));
    view.appendChild(h('h1', { text: e.titleHe }));
    if (e.titleEn) view.appendChild(h('div', { class: 'en', text: e.titleEn }));
    if (e.symptom) view.appendChild(h('div', { class: 'box' }, h('div', { class: 'label', text: 'תסמין' }), h('p', { text: e.symptom })));
    if (e.commands.length) {
      view.appendChild(h('h2', { text: 'פקודות' }));
      e.commands.forEach(function (c) { view.appendChild(termBlock(c)); });
    }
    if (e.guiSteps.length) {
      view.appendChild(h('h2', { text: 'תיקון דרך ה-GUI' }));
      view.appendChild(h('ol', { class: 'steps' }, e.guiSteps.map(function (s) { return h('li', { text: s }); })));
    }
    if (e.ifNotWorking) view.appendChild(h('div', { class: 'box warn' }, h('div', { class: 'label', text: 'אם זה לא עבד' }), h('p', { text: e.ifNotWorking })));
    if (e.notes) view.appendChild(h('div', { class: 'box' }, h('div', { class: 'label', text: 'הערות' }), h('p', { text: e.notes })));
    if (e.tags.length) view.appendChild(h('div', { class: 'tags' }, e.tags.map(function (t) { return h('span', { class: 'tag', text: t }); })));
    view.appendChild(h('div', { class: 'actions' },
      h('button', { class: 'btn', onclick: function () { go('#/edit/' + encodeURIComponent(e.id)); }, text: 'עריכה' }),
      h('button', { class: 'btn danger', onclick: function () { deleteEntry(e); }, text: 'מחיקה' })));
  }
  function deleteEntry(e) {
    if (!window.confirm('למחוק את "' + e.titleHe + '"?')) return;
    dbDelete(e.id).then(function () {
      state.entries = state.entries.filter(function (x) { return x.id !== e.id; });
      reindex();
      toast('נמחק');
      state.query = '';
      go('#/');
    }).catch(function () { toast('המחיקה נכשלה'); });
  }

  // ---------- form ----------
  function renderForm(id) {
    var existing = id ? state.byId[id] : null;
    if (id && !existing) { go('#/'); return; }
    var e = existing || { titleHe: '', titleEn: '', category: 'AD', symptom: '', commands: [], guiSteps: [], ifNotWorking: '', notes: '', tags: [] };

    var f = {
      titleHe: h('input', { type: 'text', value: e.titleHe, placeholder: 'למשל: חשבון נעול', autocomplete: 'off' }),
      titleEn: h('input', { type: 'text', value: e.titleEn, class: 'code', placeholder: 'Account lockout', autocomplete: 'off', autocapitalize: 'off' }),
      category: h('select', null, CATS.map(function (c) { var o = h('option', { value: c.key, text: c.he }); if (c.key === e.category) o.selected = true; return o; })),
      symptom: h('textarea', { value: e.symptom }),
      guiSteps: h('textarea', { value: e.guiSteps.join('\n'), placeholder: 'שלב אחד בכל שורה' }),
      ifNotWorking: h('textarea', { value: e.ifNotWorking }),
      notes: h('textarea', { value: e.notes }),
      tags: h('input', { type: 'text', value: e.tags.join(', '), placeholder: 'מופרד בפסיקים', autocomplete: 'off', autocapitalize: 'off' })
    };
    var cmdBox = h('div');
    var cmdRows = [];
    function addCmd(c) {
      var row = { label: h('input', { type: 'text', value: c.label || '', placeholder: 'תיאור הפקודה', autocomplete: 'off' }),
        text: h('textarea', { class: 'code', value: c.text || '', placeholder: 'Get-ADUser ...', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' }) };
      var wrap = h('div', { class: 'cmd-row' },
        h('label', { class: 'field' }, h('span', { text: 'תיאור' }), row.label),
        h('label', { class: 'field' }, h('span', { text: 'פקודה' }), row.text),
        h('button', { class: 'btn small danger', type: 'button', text: 'הסר פקודה', onclick: function () { cmdBox.removeChild(wrap); cmdRows.splice(cmdRows.indexOf(row), 1); } }));
      cmdRows.push(row);
      cmdBox.appendChild(wrap);
    }
    e.commands.forEach(addCmd);

    function field(label, el) { return h('label', { class: 'field' }, h('span', { text: label }), el); }

    function save() {
      var title = f.titleHe.value.trim();
      if (!title) { toast('חסר שם תקלה בעברית'); f.titleHe.focus(); return; }
      var now = Date.now();
      var entry = {
        id: existing ? existing.id : newId(),
        titleHe: title, titleEn: f.titleEn.value.trim(), category: f.category.value,
        symptom: f.symptom.value.trim(),
        commands: cmdRows.map(function (r) { return { label: r.label.value.trim(), text: r.text.value.replace(/\s+$/, '') }; }).filter(function (c) { return c.text; }),
        guiSteps: f.guiSteps.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean),
        ifNotWorking: f.ifNotWorking.value.trim(), notes: f.notes.value.trim(),
        tags: f.tags.value.split(/[,،]/).map(function (s) { return s.trim(); }).filter(Boolean),
        createdAt: existing ? existing.createdAt : now, updatedAt: now
      };
      dbPutMany([entry]).then(function () {
        state.entries = state.entries.filter(function (x) { return x.id !== entry.id; });
        state.entries.push(entry); reindex();
        toast('נשמר');
        go('#/e/' + encodeURIComponent(entry.id));
      }).catch(function () { toast('השמירה נכשלה'); });
    }

    view.appendChild(h('button', { class: 'back', onclick: function () { back('#/'); }, text: '‹ ביטול' }));
    view.appendChild(h('h1', { text: existing ? 'עריכת רשומה' : 'רשומה חדשה' }));
    view.appendChild(field('שם התקלה (עברית)', f.titleHe));
    view.appendChild(field('Title (English)', f.titleEn));
    view.appendChild(field('נושא', f.category));
    view.appendChild(field('תסמין', f.symptom));
    view.appendChild(h('h2', { text: 'פקודות' }));
    view.appendChild(cmdBox);
    view.appendChild(h('button', { class: 'btn small', type: 'button', text: '+ הוסף פקודה', onclick: function () { addCmd({}); } }));
    view.appendChild(field('תיקון דרך ה-GUI (שלב בכל שורה)', f.guiSteps));
    view.appendChild(field('אם זה לא עבד', f.ifNotWorking));
    view.appendChild(field('הערות', f.notes));
    view.appendChild(field('תגיות', f.tags));
    view.appendChild(h('div', { class: 'actions' },
      h('button', { class: 'btn primary', type: 'button', onclick: save, text: 'שמירה' })));
  }

  // ---------- stuck wizard ----------
  var WHERE_CATS = {
    account: ['AD', 'GPO'],
    workstation: ['System', 'Printers', 'Network', 'AD'],
    network: ['Network', 'DNS/DC'],
    server: ['Remote Access', 'DNS/DC', 'AD', 'System', 'GPO']
  };
  var CHANGE_WORDS = {
    password: ['password', 'סיסמה', 'lockout', 'נעילה', 'kerberos'],
    update: ['update', 'עדכון', 'kb', 'wsus', 'driver', 'דרייבר'],
    config: ['gpo', 'policy', 'dns', 'dhcp', 'firewall', 'חומת', 'join', 'trust'],
    unknown: []
  };
  function wizardResults() {
    var w = state.wiz;
    var typed = norm(w.text).split(/\s+/).filter(Boolean);
    var scored = state.entries.filter(function (e) { return e.category !== 'Win+R'; }).map(function (e) {
      var s = 0;
      var tags = norm(e.tags.join(' '));
      var hs = haystack(e);
      if (w.where && WHERE_CATS[w.where] && WHERE_CATS[w.where].indexOf(e.category) !== -1) s += 3;
      if (w.who === 'one' && tags.indexOf('single') !== -1) s += 2;
      if ((w.who === 'several' || w.who === 'all') && tags.indexOf('wide') !== -1) s += 3;
      if (w.who === 'all' && (e.category === 'DNS/DC' || e.category === 'Network')) s += 1;
      var words = CHANGE_WORDS[w.change] || [];
      words.forEach(function (x) { if (hs.indexOf(x) !== -1) s += 1; });
      typed.forEach(function (t) { if (hs.indexOf(t) !== -1) s += 4; });
      return { e: e, s: s };
    });
    return scored.filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.e.titleHe.localeCompare(b.e.titleHe, 'he'); })
      .slice(0, 8).map(function (x) { return x.e; });
  }
  function renderStuck() {
    var w = state.wiz;
    var out = h('div');
    function opts(key, items) {
      return h('div', { class: 'opts' }, items.map(function (it) {
        return h('button', { class: 'opt' + (w[key] === it[0] ? ' on' : ''), onclick: function () { w[key] = (w[key] === it[0] ? '' : it[0]); renderStuckBody(); }, text: it[1] });
      }));
    }
    var host = h('div');
    var txt = h('input', { type: 'text', value: w.text, placeholder: 'למשל: נעול, איטי, 0x11b', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      oninput: function () { w.text = txt.value; paintResults(); } });
    function paintResults() {
      clear(out);
      var res = (w.who || w.where || w.change || w.text.trim()) ? wizardResults() : [];
      if (!res.length) { out.appendChild(h('div', { class: 'empty', text: 'ענה על שאלה אחת או יותר כדי לראות מה כדאי לבדוק' })); return; }
      out.appendChild(h('h2', { text: 'כדאי להתחיל מכאן' }));
      out.appendChild(listOf(res));
    }
    function renderStuckBody() {
      clear(host);
      host.appendChild(h('div', { class: 'q', text: 'מי מושפע?' }));
      host.appendChild(opts('who', [['one', 'משתמש אחד'], ['several', 'כמה משתמשים'], ['all', 'כולם']]));
      host.appendChild(h('div', { class: 'q', text: 'איפה זה קורה?' }));
      host.appendChild(opts('where', [['account', 'חשבון / הרשאות / התחברות'], ['workstation', 'מחשב או תחנה'], ['network', 'רשת / DNS / אינטרנט'], ['server', 'שרת / Terminal Server / DC']]));
      host.appendChild(h('div', { class: 'q', text: 'מה השתנה לאחרונה?' }));
      host.appendChild(opts('change', [['password', 'סיסמה / נעילה'], ['update', 'עדכון או דרייבר'], ['config', 'הגדרה / GPO / רשת'], ['unknown', 'לא יודע']]));
      host.appendChild(h('div', { class: 'q', text: 'מילה מהתסמין (לא חובה)' }));
      host.appendChild(h('label', { class: 'field' }, txt));
      host.appendChild(h('div', { class: 'fab-row' }, h('button', { class: 'btn small', onclick: function () { state.wiz = { who: '', where: '', change: '', text: '' }; render(); }, text: 'נקה הכל' })));
      paintResults();
    }
    view.appendChild(h('h1', { text: 'אני תקוע' }));
    view.appendChild(h('p', { class: 'sub', text: 'כמה שאלות קצרות שמובילות לרשומה הנכונה' }));
    view.appendChild(host);
    view.appendChild(out);
    w = state.wiz;
    renderStuckBody();
  }

  // ---------- checklist ----------
  function renderChecklist() {
    var done = state.kv.checklist || {};
    var host = h('div');
    function paint() {
      clear(host);
      CHECKLIST.forEach(function (it, i) {
        var on = !!done[it.id];
        host.appendChild(h('button', { class: 'check' + (on ? ' done' : ''), 'aria-pressed': on ? 'true' : 'false',
          onclick: function () { done[it.id] = !done[it.id]; kvSet('checklist', done); paint(); } },
          h('span', { class: 'box-i', text: on ? '✓' : '' }),
          h('span', { class: 'txt' }, h('b', { text: (i + 1) + '. ' + it.t }), h('small', { text: it.s }))));
      });
    }
    view.appendChild(h('h1', { text: '5 הדקות הראשונות' }));
    view.appendChild(h('p', { class: 'sub', text: 'סדר קבוע לכל תקלה, כדי שלא נתקעים' }));
    view.appendChild(host);
    view.appendChild(h('div', { class: 'actions' },
      h('button', { class: 'btn', onclick: function () { done = {}; kvSet('checklist', done); paint(); }, text: 'אפס צ\'קליסט' })));
    paint();
  }

  // ---------- settings: export / import ----------
  function exportData() {
    var payload = { app: 'helpdesk-pocket', version: 1, exportedAt: new Date().toISOString(), entries: state.entries };
    var json = JSON.stringify(payload, null, 1);
    var name = 'helpdesk-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    var blob = new Blob([json], { type: 'application/json' });
    kvSet('lastExport', Date.now());
    try {
      var file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        navigator.share({ files: [file], title: name }).catch(function () {});
        return;
      }
    } catch (e) { /* fall through to download */ }
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: name });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast('הגיבוי נוצר');
  }

  function importText(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return { fatal: 'הקובץ אינו JSON תקין' }; }
    var list = Array.isArray(data) ? data : (data && Array.isArray(data.entries) ? data.entries : null);
    if (!list) return { fatal: 'לא נמצאה רשימת רשומות בקובץ (צפוי מערך או שדה entries)' };
    var report = { added: 0, updated: 0, unchanged: 0, invalid: [] };
    var toWrite = [];
    var seenInFile = {};
    list.forEach(function (raw, idx) {
      var r = normalizeEntry(raw);
      var label = (raw && raw.titleHe) ? raw.titleHe : '#' + (idx + 1);
      if (r.error) { report.invalid.push({ label: label, reason: r.error }); return; }
      var e = r.entry;
      if (seenInFile[e.id]) { report.invalid.push({ label: label, reason: 'מזהה (id) כפול בקובץ: ' + e.id }); return; }
      seenInFile[e.id] = true;
      var cur = state.byId[e.id];
      if (!cur) { report.added++; toWrite.push(e); }
      else if (e.updatedAt > cur.updatedAt) { report.updated++; toWrite.push(e); }
      else report.unchanged++;
    });
    return { report: report, toWrite: toWrite };
  }

  function applyImport(res) {
    return dbPutMany(res.toWrite).then(function () {
      res.toWrite.forEach(function (e) {
        state.entries = state.entries.filter(function (x) { return x.id !== e.id; });
        state.entries.push(e);
      });
      reindex();
    });
  }

  function restoreStarter() {
    var seed = (window.SEED_ENTRIES || []).filter(function (e) { return !state.byId[e.id]; });
    if (!seed.length) { toast('כל רשומות ההתחלה כבר קיימות'); return; }
    var norms = seed.map(function (s) { return normalizeEntry(s).entry; }).filter(Boolean);
    dbPutMany(norms).then(function () {
      norms.forEach(function (e) { state.entries.push(e); });
      reindex(); toast('נוספו ' + norms.length + ' רשומות'); render();
    });
  }

  function renderSettings() {
    var nowOnline = navigator.onLine !== false;
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    var last = state.kv.lastExport ? new Date(state.kv.lastExport).toLocaleString('he-IL') : 'עוד לא בוצע';
    var fileInput = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none',
      onchange: function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var res = importText(String(reader.result));
          if (res.fatal) { state.importReport = { fatal: res.fatal }; render(); return; }
          applyImport(res).then(function () { state.importReport = res.report; toast('הייבוא הסתיים'); render(); })
            .catch(function () { state.importReport = { fatal: 'הכתיבה למסד הנתונים נכשלה' }; render(); });
        };
        reader.onerror = function () { state.importReport = { fatal: 'קריאת הקובץ נכשלה' }; render(); };
        reader.readAsText(file);
        fileInput.value = '';
      } });

    view.appendChild(h('h1', { text: 'הגדרות וגיבוי' }));
    view.appendChild(h('p', { class: 'sub', text: 'הנתונים נשמרים בטלפון בלבד. גבה לקובץ מדי פעם.' }));

    view.appendChild(h('div', { class: 'box' },
      h('div', { class: 'kv' }, h('span', { text: 'מצב חיבור' }), h('span', { class: nowOnline ? 'ok' : 'bad', text: nowOnline ? 'מחובר' : 'אופליין' })),
      h('div', { class: 'kv' }, h('span', { text: 'אחסון קבוע' }), h('span', { class: state.persisted ? 'ok' : 'bad', text: state.persisted === null ? 'לא נתמך' : (state.persisted ? 'מוגן' : 'לא מוגן (גבה!)') })),
      h('div', { class: 'kv' }, h('span', { text: 'מסד נתונים' }), h('span', { class: state.memOnly ? 'bad' : 'ok', text: state.memOnly ? 'זמני בלבד!' : 'IndexedDB' })),
      h('div', { class: 'kv' }, h('span', { text: 'עבודה אופליין' }), h('span', { text: state.swStatus })),
      h('div', { class: 'kv' }, h('span', { text: 'מותקן כאפליקציה' }), h('span', { text: standalone ? 'כן' : 'לא (שתף ← הוסף למסך הבית)' })),
      h('div', { class: 'kv' }, h('span', { text: 'רשומות' }), h('span', { text: String(state.entries.length) })),
      h('div', { class: 'kv' }, h('span', { text: 'גיבוי אחרון' }), h('span', { class: state.kv.lastExport ? 'ltr' : '', text: last }))));

    view.appendChild(h('h2', { text: 'גיבוי ושחזור' }));
    view.appendChild(h('div', { class: 'actions' },
      h('button', { class: 'btn primary', onclick: exportData, text: 'ייצוא ל-JSON' }),
      h('button', { class: 'btn', onclick: function () { fileInput.click(); }, text: 'ייבוא מ-JSON' })));
    view.appendChild(fileInput);
    view.appendChild(h('div', { class: 'actions' },
      h('button', { class: 'btn', onclick: restoreStarter, text: 'החזר רשומות התחלה חסרות' })));

    var rep = state.importReport;
    if (rep) {
      if (rep.fatal) {
        view.appendChild(h('div', { class: 'box warn' }, h('div', { class: 'label', text: 'הייבוא נכשל' }), h('p', { text: rep.fatal })));
      } else {
        var box = h('div', { class: 'box' },
          h('div', { class: 'label', text: 'תוצאות ייבוא אחרון' }),
          h('p', { text: 'נוספו ' + rep.added + ' · עודכנו ' + rep.updated + ' · ללא שינוי ' + rep.unchanged + ' · לא תקינות ' + rep.invalid.length }));
        if (rep.invalid.length) {
          box.appendChild(h('div', { class: 'label', style: 'margin-top:10px', text: 'רשומות שנדחו' }));
          rep.invalid.slice(0, 50).forEach(function (x) { box.appendChild(h('p', { class: 'sub', text: x.label + ': ' + x.reason })); });
        }
        view.appendChild(box);
      }
    }
    view.appendChild(h('h2', { text: 'אבטחה' }));
    view.appendChild(h('p', { class: 'sub', text: 'אל תשמור כאן סיסמאות, מפתחות או פרטי שרתים רגישים. הנתונים לא מוצפנים.' }));
  }

  // ---------- online indicator & service worker ----------
  function updateOnline() {
    document.getElementById('offline-bar').hidden = navigator.onLine !== false;
    if (route().name === 'settings') render();
  }
  function registerSW() {
    if (!('serviceWorker' in navigator)) { state.swStatus = 'לא נתמך'; return; }
    var secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!secure) { state.swStatus = 'דורש HTTPS'; return; }
    navigator.serviceWorker.register('sw.js').then(function () {
      state.swStatus = 'נרשם';
      return navigator.serviceWorker.ready;
    }).then(function () {
      state.swStatus = 'מוכן, עובד אופליין';
      if (route().name === 'settings') render();
    }).catch(function () { state.swStatus = 'שגיאה ברישום'; });
  }

  // ---------- boot ----------
  function boot() {
    openDb().then(function (d) { db = d; }).catch(function () { state.memOnly = true; })
      .then(function () { return kvAll(); })
      .then(function (rows) { rows.forEach(function (r) { state.kv[r.key] = r.value; }); return dbAllEntries(); })
      .then(function (entries) {
        if (!state.kv.seeded) {
          var seeds = (window.SEED_ENTRIES || []).map(function (s) { return normalizeEntry(s).entry; }).filter(Boolean);
          return dbPutMany(seeds).then(function () { return kvSet('seeded', Date.now()); }).then(function () { return kvSet('seedVersion', window.SEED_VERSION || 1); }).then(function () { return seeds; });
        }
        var cur = window.SEED_VERSION || 1;
        var had = state.kv.seedVersion || (state.kv.buildSeeded ? 2 : 1);
        if (had < cur) {
          // top-up once per new seed version: add only entries introduced after the installed version (never resurrects deleted ones)
          var have = {};
          entries.forEach(function (e) { have[e.id] = true; });
          var wanted = {};
          Object.keys(window.SEED_ADDED || {}).forEach(function (v) {
            if (+v > had) (window.SEED_ADDED[v] || []).forEach(function (id) { wanted[id] = true; });
          });
          var add = (window.SEED_ENTRIES || []).filter(function (x) { return wanted[x.id] && !have[x.id]; })
            .map(function (x) { return normalizeEntry(x).entry; }).filter(Boolean);
          return dbPutMany(add).then(function () { return kvSet('seedVersion', cur); }).then(function () { return entries.concat(add); });
        }
        return entries;
      })
      .then(function (entries) {
        state.entries = entries.map(function (e) { var r = normalizeEntry(e); return r.entry; }).filter(Boolean);
        reindex();
      })
      .catch(function () { state.entries = []; })
      .then(function () {
        if (navigator.storage && navigator.storage.persist) {
          navigator.storage.persist().then(function (ok) { state.persisted = !!ok; }).catch(function () {});
          if (navigator.storage.persisted) navigator.storage.persisted().then(function (ok) { state.persisted = !!ok; }).catch(function () {});
        }
        window.addEventListener('hashchange', render);
        window.addEventListener('online', updateOnline);
        window.addEventListener('offline', updateOnline);
        updateOnline();
        render();
        registerSW();
        if (state.memOnly) toast('אחסון קבוע לא זמין. הנתונים זמניים!');
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // test hook
  window.__helpdesk = { state: state, search: search, importText: importText, normalizeEntry: normalizeEntry, wizardResults: wizardResults, CATS: CATS };
})();
