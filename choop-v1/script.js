const menu = document.querySelector('.menu');
const nav = document.querySelector('.header nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open menu'); }
});
const carousel = document.querySelector('#offer-scroll');
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => carousel.scrollBy({left: Number(button.dataset.scroll) * (carousel.querySelector('article').offsetWidth + 18), behavior: 'smooth'})));
let toastTimer;
function notify(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}
document.querySelectorAll('.claim').forEach(button => button.addEventListener('click', () => notify('This is a concept offer. Claiming is not available yet.')));
document.querySelector('#newsletter')?.addEventListener('submit', event => { event.preventDefault(); notify('Newsletter signup is a preview and is not connected yet.'); });
