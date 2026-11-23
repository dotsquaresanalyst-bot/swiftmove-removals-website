/* SwiftMove Removals — front-end interactions (demo only, no backend) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Header: sticky shadow, mobile nav, dropdown ---------- */
  var header = $('.site-header');
  var nav = $('#main-nav');
  var toggle = $('.nav-toggle');
  var backdrop = $('.nav-backdrop');

  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  function setNav(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    backdrop.addEventListener('click', function () { setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  }
  $$('.dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.parentElement;
      var open = !li.classList.contains('open');
      li.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Footer year & date minimums ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $$('input[type="date"]').forEach(function (el) { el.min = iso; });

  /* ---------- Validation ---------- */
  var rules = {
    postcode: { re: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, msg: 'Please enter a valid UK postcode, e.g. SW1A 1AA.' },
    email: { re: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg: 'Please enter a valid email address.' },
    phone: { test: function (v) { return /^(?:\+44|0)\d{9,10}$/.test(v.replace(/[\s()-]/g, '')); }, msg: 'Please enter a valid UK phone number.' },
    date: { test: function (v) { return new Date(v + 'T00:00:00') >= today; }, msg: 'Please choose a date from today onwards.' }
  };

  function setError(field, msg) {
    var wrap = field.closest('.field');
    if (!wrap) return;
    var err = $('.error', wrap);
    wrap.classList.toggle('invalid', !!msg);
    if (err) err.textContent = msg || '';
    if (field.setAttribute) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validateField(field) {
    var msg = '';
    if (field.type === 'radio') {
      var group = $$('input[name="' + field.name + '"]', field.form);
      if (field.required && !group.some(function (r) { return r.checked; })) msg = 'Please select an option.';
      setError(field, msg);
      return !msg;
    }
    var v = field.value.trim();
    var kind = field.getAttribute('data-validate');
    if (field.required && !v) {
      msg = field.getAttribute('data-required-msg') || 'This field is required.';
    } else if (v && kind && rules[kind]) {
      var r = rules[kind];
      var ok = r.re ? r.re.test(v) : r.test(v);
      if (!ok) msg = r.msg;
    }
    setError(field, msg);
    return !msg;
  }

  function validateScope(scope) {
    var seen = {};
    var firstBad = null;
    $$('input, select, textarea', scope).forEach(function (f) {
      if (f.type === 'radio') { if (seen[f.name]) return; seen[f.name] = true; }
      if (f.type === 'checkbox') return;
      if (!validateField(f) && !firstBad) firstBad = f;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  $$('form[data-validate-form]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    $$('input, select, textarea', form).forEach(function (f) {
      f.addEventListener('blur', function () { if (f.type !== 'radio' && f.type !== 'checkbox') validateField(f); });
      // Clear errors as the user corrects them, so the layout is stable before they click a button
      ['input', 'change'].forEach(function (ev) {
        f.addEventListener(ev, function () { if (f.closest('.field.invalid')) validateField(f); });
      });
    });
  });

  /* ---------- Hero quick quote → passes details to the quote page ---------- */
  var quick = $('#quick-quote');
  if (quick) {
    quick.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateScope(quick)) return;
      var q = new URLSearchParams(new FormData(quick)).toString();
      window.location.href = 'quote.html?' + q;
    });
  }

  /* ---------- Multi-step quote form ---------- */
  var qf = $('#quote-form');
  if (qf) {
    var steps = $$('.form-step', qf);
    var prog = $$('.progress li');
    var current = 0;

    // Prefill from hero form
    var params = new URLSearchParams(window.location.search);
    ['from', 'to', 'date'].forEach(function (k) {
      if (params.get(k) && qf.elements[k]) qf.elements[k].value = params.get(k);
    });
    var size = params.get('size');
    if (size && qf.elements.bedrooms) {
      $$('option', qf.elements.bedrooms).forEach(function (o) { if (o.value === size) qf.elements.bedrooms.value = size; });
    }

    var show = function (i) {
      current = i;
      steps.forEach(function (s, n) { s.classList.toggle('active', n === i); });
      prog.forEach(function (p, n) {
        p.classList.toggle('active', n === i);
        p.classList.toggle('done', n < i);
        if (n === i) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current');
      });
      var h = $('h2', steps[i]);
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      $('.panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    $$('[data-next]', qf).forEach(function (b) {
      b.addEventListener('click', function () { if (validateScope(steps[current])) show(current + 1); });
    });
    $$('[data-back]', qf).forEach(function (b) {
      b.addEventListener('click', function () { show(current - 1); });
    });

    qf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateScope(steps[current])) return;
      var d = qf.elements;
      var set = function (id, v) { var el = $('#' + id); if (el) el.textContent = v; };
      var dateStr = d.date.value ? new Date(d.date.value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
      set('sum-ref', 'SM-' + Math.floor(100000 + Math.random() * 900000));
      set('sum-route', d.from.value.toUpperCase() + ' → ' + d.to.value.toUpperCase());
      set('sum-date', dateStr);
      set('sum-property', d.property.value + ', ' + d.bedrooms.value);
      set('sum-name', d.name.value.trim().split(' ')[0]);
      set('sum-email', d.email.value);
      qf.style.display = 'none';
      $('.progress').style.display = 'none';
      var c = $('#quote-confirm');
      c.classList.add('show');
      c.focus();
      $('.panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- Contact form (demo) ---------- */
  var cf = $('#contact-form');
  if (cf) {
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateScope(cf)) return;
      cf.reset();
      var ok = $('#contact-success');
      ok.classList.add('show');
      ok.focus();
    });
  }
})();
