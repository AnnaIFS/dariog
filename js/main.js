// ============================================================
//  NAVIGATION
// ============================================================

// Nav scroll
var nav = document.getElementById('nav');
window.addEventListener('scroll', function () {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile menu
var toggle = document.getElementById('navToggle');
var menu = document.getElementById('navMenu');

toggle.addEventListener('click', function () {
  var open = menu.classList.toggle('open');
  toggle.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close mobile menu when a real page link is clicked (not dropdown toggles)
menu.querySelectorAll('a').forEach(function (a) {
  a.addEventListener('click', function () {
    if (a.classList.contains('dropdown-toggle')) return;
    menu.classList.remove('open');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Mobile dropdown toggles
menu.querySelectorAll('.dropdown-toggle').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      btn.closest('.nav-dropdown').classList.toggle('open');
    }
  });
});

// Desktop dropdown close on outside click
document.addEventListener('click', function (e) {
  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  }
});


// ============================================================
//  SARAY ALBUM RELEASE  -  SINGLE SOURCE OF TRUTH
//  Everything below (top bar, footer block, SARAY page hero,
//  homepage SARAY section, listen/download modules) reads this
//  one config and flips automatically at the release moment.
//
//  >>> TO UPDATE THE ALBUM, EDIT ONLY THIS BLOCK <<<
// ============================================================
var SARAY = {

  // --- Release moment -------------------------------------------------
  // Midnight in Madrid on 21 June 2026. Madrid is on CEST (UTC+2) in June,
  // so local midnight = 22:00 UTC on 20 June. The whole site flips to
  // "out now" worldwide at this single instant.
  releaseUTC: Date.UTC(2026, 5, 20, 22, 0, 0),

  // --- Manual override ------------------------------------------------
  //   'auto'  -> flip automatically at releaseUTC  (normal)
  //   true    -> force OUT NOW  (go live early / if a platform is ready)
  //   false   -> force COUNTDOWN (hold the release back)
  RELEASED: 'auto',

  // --- Links  (paste the final URLs here when you have them) ----------
  // Leave '' for "not ready yet"; the button will simply point at the
  // SARAY page until you fill it in.
  links: {
    spotify:    'https://open.spotify.com/artist/04NyKBLcR0lMxypLLkN48W',  // artist page (swap to SARAY album URL once live)
    appleMusic: 'https://music.apple.com/us/artist/dario-hampi-pakari/1713076472',  // artist page (swap to SARAY album URL once live)
    youtube:    'https://www.youtube.com/@dario_hampi_pakari',  // channel (swap to SARAY album playlist once live)
    more:       'https://linktr.ee/dario_hampi_pakari',  // Linktree to all other platforms
    download:   '/saray#get-album',  // Download buttons open the on-page name+email form
    notify:     'https://mailchi.mp/76e358c5126d/6qa1zs7qne' // pre-release "join the listening"
  },

  // --- Free-download form ---------------------------------------------
  formAction:   'https://formspree.io/f/xeewgbad',  // Formspree endpoint for the download form
  downloadFile: 'https://samply.app/p/bkSVBE3VVRC43va9t8QP?si=NjqEcimx8sQAoaH15VgypnFFjMX2',  // Samply album link revealed after the form

  // --- Assets ---------------------------------------------------------
  cover: '/images/saray-cover.jpg',
  page:  '/saray',
  releaseLabel: '21 June' // shown before release
};


// ---- State -----------------------------------------------------------
function sarayIsReleased() {
  if (SARAY.RELEASED === true)  return true;
  if (SARAY.RELEASED === false) return false;
  return Date.now() >= SARAY.releaseUTC; // 'auto'
}

// Resolve a configured link; fall back to the SARAY page if not set yet.
function sarayLink(key) {
  return (SARAY.links && SARAY.links[key]) ? SARAY.links[key] : SARAY.page;
}

// Apply the current state to the whole document.
function sarayApplyState() {
  var out = sarayIsReleased();
  var root = document.documentElement;
  root.classList.toggle('saray-out', out);
  root.classList.toggle('saray-pre', !out);
  return out;
}

// Fill every [data-saray="key"] anchor with its real href.
function sarayWireLinks(scope) {
  (scope || document).querySelectorAll('[data-saray]').forEach(function (a) {
    var key = a.getAttribute('data-saray');
    if (!key) return;
    // Hide an optional "more platforms" link if it has no URL configured.
    if (key === 'more' && !(SARAY.links && SARAY.links.more)) {
      a.style.display = 'none';
      return;
    }
    // Download opens the name+email form. If the form is on this page, use a
    // pure same-page anchor (smooth-scrolls, no reload); otherwise link to the
    // SARAY page's form. Same-tab either way.
    if (key === 'download') {
      a.setAttribute('href', document.getElementById('get-album') ? '#get-album' : '/saray/#get-album');
      return;
    }
    a.setAttribute('href', sarayLink(key));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
}


// ---- Inline icons ----------------------------------------------------
var SARAY_ICON = {
  spotify: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15c3-1 6-1 9 1"/><path d="M7 12c4-1.5 8-1.5 12 1"/><path d="M6 9c5-2 10-2 14 1"/></svg>',
  apple:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="4"/><polygon points="10,8 16,12 10,16"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 11l5 4 5-4"/><path d="M5 21h14"/></svg>'
};


// ---- Reusable Listen & Download module -------------------------------
// Drop <div data-saray-listen></div> anywhere and this fills it.
function sarayListenHTML() {
  return '' +
    '<p class="album-cta-label">Listen now</p>' +
    '<div class="album-links">' +
      '<a class="album-link" data-saray="spotify">' + SARAY_ICON.spotify + '<span>Spotify</span></a>' +
      '<a class="album-link" data-saray="appleMusic">' + SARAY_ICON.apple + '<span>Apple Music</span></a>' +
      '<a class="album-link" data-saray="youtube">' + SARAY_ICON.youtube + '<span>YouTube</span></a>' +
    '</div>' +
    '<a class="album-more" data-saray="more">+ more platforms &rarr;</a>' +
    '<div class="album-or"><span>or keep it forever</span></div>' +
    '<a class="album-download" data-saray="download">' + SARAY_ICON.download + '<span>Download the album free</span></a>' +
    '<p class="album-download-note">Free for everyone. Leave your name &amp; email and we&rsquo;ll send you the download link.</p>';
}

function sarayBuildListenModules() {
  document.querySelectorAll('[data-saray-listen]').forEach(function (el) {
    if (el.getAttribute('data-saray-built')) return;
    el.innerHTML = sarayListenHTML();
    el.setAttribute('data-saray-built', '1');
  });
}


// ---- Top album bar (injected on every page) --------------------------
function sarayBuildBar() {
  if (document.getElementById('albumBar')) return;

  var bar = document.createElement('div');
  bar.className = 'album-bar';
  bar.id = 'albumBar';
  bar.innerHTML =
    '<a class="album-bar-brand" href="' + SARAY.page + '" aria-label="SARAY album">' +
      '<img class="album-bar-cover" src="' + SARAY.cover + '" alt="">' +
      '<span class="album-bar-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '<span class="album-bar-text saray-when-pre"><strong>SARAY</strong> &middot; new music album &middot; out ' + SARAY.releaseLabel + '</span>' +
      '<span class="album-bar-text saray-when-out"><strong>SARAY</strong> &middot; new album &middot; out now</span>' +
    '</a>' +
    '<div class="album-bar-actions saray-when-pre">' +
      '<a class="album-bar-btn" href="' + SARAY.links.notify + '" target="_blank" rel="noopener noreferrer">Join the listening &rarr;</a>' +
    '</div>' +
    '<div class="album-bar-actions saray-when-out">' +
      '<a class="album-bar-btn" href="' + SARAY.page + '">Listen &amp; download &rarr;</a>' +
    '</div>' +
    '<a class="album-bar-go saray-when-pre" href="' + SARAY.page + '">Details &rarr;</a>' +
    '<a class="album-bar-go saray-when-out" href="' + SARAY.page + '">Listen &rarr;</a>';

  document.body.insertBefore(bar, document.body.firstChild);
  document.body.classList.add('has-album-bar');
}


// ---- Footer album block (injected on every page) ---------------------
function sarayBuildFooter() {
  var footer = document.querySelector('.footer');
  if (!footer || footer.querySelector('.footer-album')) return;

  var block = document.createElement('div');
  block.className = 'footer-album';
  block.innerHTML =
    '<img class="footer-album-cover" src="' + SARAY.cover + '" alt="SARAY album cover">' +
    '<div class="footer-album-info">' +
      '<p class="footer-album-label">The Album</p>' +
      '<p class="footer-album-title">SARAY</p>' +
      '<p class="footer-album-meta saray-when-pre">Out ' + SARAY.releaseLabel + ' &middot; medicine music</p>' +
      '<p class="footer-album-meta saray-when-out">Out now &middot; medicine music</p>' +
    '</div>' +
    '<div class="footer-album-links saray-when-pre">' +
      '<a href="' + SARAY.links.notify + '" target="_blank" rel="noopener noreferrer">Join the listening</a>' +
    '</div>' +
    '<div class="footer-album-links saray-when-out">' +
      '<a data-saray="spotify">Spotify</a>' +
      '<a data-saray="appleMusic">Apple Music</a>' +
      '<a data-saray="youtube">YouTube</a>' +
      '<a data-saray="download">Download</a>' +
    '</div>';

  var inner = footer.querySelector('.footer-inner');
  if (inner) footer.insertBefore(block, inner);
  else footer.insertBefore(block, footer.firstChild);
}


// ---- Free-download form (SARAY page only) ----------------------------
// Posts name+email to Formspree (AJAX), then reveals the download link.
function sarayDownloadForm() {
  var form = document.getElementById('dlForm');
  if (!form) return;

  if (SARAY.formAction) form.setAttribute('action', SARAY.formAction);

  var success = document.getElementById('dlSuccess');
  var errEl = form.querySelector('.dl-form-error');
  var link = document.getElementById('dlLink');
  if (link && SARAY.downloadFile) link.setAttribute('href', SARAY.downloadFile);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errEl) errEl.hidden = true;

    if (!SARAY.formAction) {
      if (errEl) { errEl.textContent = 'Download form not configured yet.'; errEl.hidden = false; }
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    fetch(SARAY.formAction, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (res.ok) {
        form.hidden = true;
        if (success) success.hidden = false;
      } else {
        throw new Error('bad response');
      }
    }).catch(function () {
      if (errEl) { errEl.textContent = 'Something went wrong - please try again.'; errEl.hidden = false; }
      if (btn) { btn.disabled = false; btn.textContent = label; }
    });
  });
}


// ---- Hero countdown (SARAY page only) --------------------------------
function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function sarayTick() {
  var elDays = document.getElementById('countDays');
  if (elDays) {
    var s = Math.max(0, Math.floor((SARAY.releaseUTC - Date.now()) / 1000));
    document.getElementById('countDays').textContent    = Math.floor(s / 86400);
    document.getElementById('countHours').textContent   = pad2(Math.floor((s % 86400) / 3600));
    document.getElementById('countMinutes').textContent = pad2(Math.floor((s % 3600) / 60));
    document.getElementById('countSeconds').textContent = pad2(s % 60);
  }
  // Auto-flip the moment we cross the release (only in 'auto' mode)
  if (SARAY.RELEASED === 'auto' && Date.now() >= SARAY.releaseUTC &&
      !document.documentElement.classList.contains('saray-out')) {
    sarayApplyState();
  }
}


// ---- Preview override (for testing only) -----------------------------
// Add ?released=1 to any URL to preview the "out now" view, or
// ?released=0 to force the countdown. No effect without the param,
// so it is safe to leave in for the live site.
(function () {
  var qs = location.search || '';
  if (/[?&]released=1/.test(qs)) SARAY.RELEASED = true;
  else if (/[?&]released=0/.test(qs)) SARAY.RELEASED = false;
})();


// ---- Init ------------------------------------------------------------
sarayApplyState();
sarayBuildBar();
sarayBuildFooter();
sarayBuildListenModules();
sarayWireLinks();
sarayDownloadForm();
sarayTick();

// Keep the hero countdown ticking only while we are still pre-release.
if (!sarayIsReleased() && SARAY.RELEASED === 'auto') {
  var sarayTimer = setInterval(function () {
    sarayTick();
    if (sarayIsReleased()) clearInterval(sarayTimer);
  }, 1000);
}
