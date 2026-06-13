let currentExp = 0;

function setExp(idx) {
    currentExp = parseInt(idx, 10);
    document.querySelectorAll('.exp-tab').forEach(b => b.classList.toggle('active', +b.dataset.exp === currentExp));
    document.querySelectorAll('.exp-pane').forEach(p => p.classList.toggle('active', +p.dataset.pane === currentExp));

    // keep the active item visible in the mobile horizontal rail (no-op on desktop)
    const activeTab = document.querySelector('.exp-tab.active');
    if (activeTab && window.matchMedia('(max-width: 767.98px)').matches) {
        activeTab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
}

// Step to an adjacent role, clamped to the ends
function navExp(dir) {
    const count = document.querySelectorAll('.exp-pane').length;
    const next = Math.min(count - 1, Math.max(0, currentExp + dir));
    if (next !== currentExp) setExp(String(next));
}

function updateActiveNav(sectionId) {
    document.querySelectorAll('.navbar-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeLink = document.querySelector(`.navbar-nav .nav-link[href="#${sectionId}"]`);
    if (activeLink) activeLink.closest('.nav-item').classList.add('active');
}

function syncNavToScroll() {
    const sections = ['intro', 'about', 'portfolio'].map(id => document.getElementById(id));
    const scrollMid = window.scrollY + window.innerHeight / 3;
    let activeId = 'intro';
    sections.forEach(el => { if (el && el.offsetTop <= scrollMid) activeId = el.id; });
    updateActiveNav(activeId);
}

// Lock the viewport height to a fixed px value so full-height sections don't resize as the
// iOS address bar shows/hides (that resize is what made the scroll jump). Only re-measure on
// a width change (orientation flip / desktop resize) — never on address-bar height changes.
let lastViewportWidth = window.innerWidth;
function lockViewportHeight() {
    document.documentElement.style.setProperty('--vph', window.innerHeight + 'px');
}

document.addEventListener('DOMContentLoaded', function () {
    lockViewportHeight();
    window.addEventListener('resize', function () {
        if (window.innerWidth !== lastViewportWidth) {
            lastViewportWidth = window.innerWidth;
            lockViewportHeight();
        }
    });

    document.documentElement.style.scrollPaddingTop =
        document.getElementById('mainNav').offsetHeight + 'px';

    window.addEventListener('scroll', syncNavToScroll, { passive: true });
    syncNavToScroll();

    document.querySelectorAll('.exp-tab').forEach(btn => {
        btn.addEventListener('click', () => setExp(btn.dataset.exp));
    });

    // Horizontal scroll / swipe on the detail pane steps through roles.
    // Clicking a rail entry still works (handled above); this just adds gestures.
    const expDetail = document.querySelector('.exp-detail');
    if (expDetail) {
        // Trackpad horizontal scroll (mouse wheels are vertical-only, so they're ignored)
        let wheelLock = false;
        expDetail.addEventListener('wheel', function (e) {
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 20) return;
            e.preventDefault();
            if (wheelLock) return;
            wheelLock = true;
            navExp(e.deltaX > 0 ? 1 : -1);
            setTimeout(function () { wheelLock = false; }, 500);
        }, { passive: false });

        // Touch swipe (vertical page scroll stays intact since we never preventDefault)
        let touchX = null, touchY = null;
        expDetail.addEventListener('touchstart', function (e) {
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
        }, { passive: true });
        expDetail.addEventListener('touchend', function (e) {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            const dy = e.changedTouches[0].clientY - touchY;
            touchX = null;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                navExp(dx < 0 ? 1 : -1);
            }
        }, { passive: true });
    }

    document.querySelectorAll('.closeOnClick').forEach(link => {
        link.addEventListener('click', function () {
            const nav = document.getElementById('mainNavBar');
            if (nav && nav.classList.contains('show')) {
                document.querySelector('.navbar-toggler').click();
            }
        });
    });
});
