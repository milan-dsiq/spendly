// main.js — students will add JavaScript here as features are built

(function () {
    const modal = document.getElementById('videoModal');
    if (!modal) return;

    const video = document.getElementById('spendlyDemo');
    const openTriggers = document.querySelectorAll('[data-open-video]');
    const closeTriggers = modal.querySelectorAll('[data-close-video]');

    function openModal() {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    }

    openTriggers.forEach(btn => btn.addEventListener('click', openModal));
    closeTriggers.forEach(btn => btn.addEventListener('click', closeModal));

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
})();
