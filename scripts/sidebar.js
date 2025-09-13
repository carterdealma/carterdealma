const sidebar = document.querySelector('.sidebar');
const links = document.querySelectorAll('.sidebar-link');

const labelMap = {
  'bird-icon.png': 'Bird of the Day',
  'about-me-icon.png': 'About Me'
};

const typingIntervals = new Map();

let hasLeftSidebarOnce = false;
let hasEnteredSidebarFromOutside = false;
let firstMove = true;

const getMouseInsideSidebar = ({ clientX, clientY }) => {
  const rect = sidebar.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
};

// Detect if mouse started inside the sidebar
window.addEventListener('mousemove', (e) => {
  if (!firstMove) return;
  firstMove = false;
  hasEnteredSidebarFromOutside = !getMouseInsideSidebar(e);
});

// Animate label typing
const animateLabelTyping = (label, text, link) => {
  label.textContent = '';
  let i = 0;

  const interval = setInterval(() => {
    if (i < text.length) {
      label.textContent += text[i++];
    } else {
      clearInterval(interval);
      typingIntervals.delete(link);
    }
  }, 45);

  typingIntervals.set(link, interval);
};

// Expand sidebar
const expandSidebar = () => {
  if (!hasEnteredSidebarFromOutside && !hasLeftSidebarOnce) return;

  sidebar.classList.add('expanded');

  links.forEach(link => {
    const iconSrc = link.querySelector('.icon')?.src?.split('/').pop();
    const label = link.querySelector('.label');
    const labelText = labelMap[iconSrc] || '';

    animateLabelTyping(label, labelText, link);
  });
};

// Collapse sidebar and clear intervals
const collapseSidebar = () => {
  sidebar.classList.remove('expanded');
  hasLeftSidebarOnce = true;

  typingIntervals.forEach((interval, link) => {
    clearInterval(interval);
    const label = link.querySelector('.label');
    if (label) label.textContent = '';
  });

  typingIntervals.clear();
};

sidebar.addEventListener('mouseenter', expandSidebar);
sidebar.addEventListener('mouseleave', collapseSidebar);

// Highlight current page link
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  links.forEach(link => {
    const href = link.getAttribute('href');
    const isCurrent =
      currentPath.endsWith(href) ||
      (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/index.html')));

    if (isCurrent) {
      link.classList.add('current-page');
      link.addEventListener('click', e => e.preventDefault());
    }
  });
});
