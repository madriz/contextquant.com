// ContextQuant site: mobile menu and working-paper download form (Formspree, same endpoint as the April 2026 site).
(function () {
  var burger = document.getElementById('burger'), links = document.getElementById('navlinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var PAPERS = {
    academic: { title: 'Academic working paper', file: 'papers/ContextQuant_Academic_WorkingPaper_DRAFT_2026-11.pdf' },
    practitioner: { title: 'Practitioner paper', file: 'papers/ContextQuant_Managerial_Paper_DRAFT_2026-11.pdf' }
  };
  var buttons = document.querySelectorAll('[data-paper]');
  if (!buttons.length) return;

  var wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  wrap.innerHTML =
    '<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="mTitle">' +
    '<button class="modal-close" type="button" aria-label="Close">&times;</button>' +
    '<div id="mForm"><div class="modal-title" id="mTitle">Download</div>' +
    '<p class="modal-sub">Please share your details for immediate access.</p>' +
    '<div class="modal-row"><label>First name<input id="mFirst" autocomplete="given-name"></label><label>Last name<input id="mLast" autocomplete="family-name"></label></div>' +
    '<label>Institution<input id="mInst" autocomplete="organization"></label>' +
    '<label>Work email<input id="mEmail" type="email" autocomplete="email"></label>' +
    '<button class="modal-submit" id="mSubmit" type="button">Get the paper</button>' +
    '<p class="modal-note" id="mNote">Details are not shared with third parties.</p></div>' +
    '<div id="mDone" class="modal-done"><div class="modal-title">Thank you</div><p>Your download is ready.</p>' +
    '<a class="modal-submit" id="mLink" href="#" download>Download PDF</a></div></div>';
  document.body.appendChild(wrap);
  var current = null;
  function q(id) { return document.getElementById(id); }
  function close() { wrap.classList.remove('open'); }
  wrap.querySelector('.modal-close').addEventListener('click', close);
  wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  buttons.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      current = PAPERS[b.getAttribute('data-paper')];
      q('mTitle').textContent = 'Download: ' + current.title;
      q('mForm').style.display = 'block'; q('mDone').style.display = 'none';
      q('mNote').textContent = 'Details are not shared with third parties.';
      wrap.classList.add('open'); q('mFirst').focus();
    });
  });
  q('mSubmit').addEventListener('click', function () {
    var first = q('mFirst').value.trim(), last = q('mLast').value.trim(), inst = q('mInst').value.trim(), email = q('mEmail').value.trim();
    if (!first || !last || !inst || !email) { q('mNote').textContent = 'Please complete all fields.'; return; }
    if (!/\S+@\S+\.\S+/.test(email)) { q('mNote').textContent = 'Please enter a valid email address.'; return; }
    var btn = q('mSubmit'); btn.disabled = true; btn.textContent = 'Sending...';
    fetch('https://formspree.io/f/mlgprrpv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ first_name: first, last_name: last, institution: inst, email: email, paper: current.title, _subject: 'ContextQuant paper download: ' + current.title })
    }).then(function (r) {
      btn.disabled = false; btn.textContent = 'Get the paper';
      if (r.ok) { q('mForm').style.display = 'none'; q('mLink').href = current.file; q('mDone').style.display = 'block'; }
      else { q('mNote').textContent = 'Something went wrong. Please try again or email info@contextquant.com.'; }
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Get the paper';
      q('mNote').textContent = 'Network error. Please email info@contextquant.com.';
    });
  });
})();
