import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const STYLES = `
.toc-mobile-btn {
  position: fixed;
  right: -18px;
  bottom: 140px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 20px 0 0 20px;
  background: var(--ifm-color-primary);
  color: white;
  border: none;
  box-shadow: -2px 2px 8px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 6px;
  cursor: pointer;
  transition: right 0.3s ease, opacity 0.3s;
  touch-action: none;
}
.toc-mobile-btn.show {
  right: 0;
}
.toc-mobile-btn svg {
  width: 20px;
  height: 20px;
  fill: white;
}

.toc-mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.toc-mobile-backdrop.active {
  opacity: 1;
  pointer-events: auto;
}

.toc-mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 60vw;
  max-width: 340px;
  height: 90vh;
  background-color: #ffffff;
  color: var(--ifm-font-color-base);
  opacity: 1;
  z-index: 2001;
  box-shadow: -4px 0 24px rgba(0,0,0,0.3);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
[data-theme='dark'] .toc-mobile-drawer {
  background-color: #1b1b1d;
}
.toc-mobile-drawer.open {
  transform: translateX(0);
  border-radius:10px 0 0 10px;
}

.toc-mobile-drawer-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--ifm-color-emphasis-600);
  padding: 4px;
  z-index: 10;
}

.toc-mobile-drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  margin-top: 40px;
}
.toc-mobile-drawer-content .table-of-contents__link {
  display: block;
  padding: 6px 0;
  font-size: 0.9rem;
}
`;

const LIST_ICON = `
<svg viewBox="0 0 24 24">
  <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>
</svg>`;

let button = null;
let backdrop = null;
let drawer = null;
let scrollTimer = null;
let mediaQuery = null;
let isHovering = false;
let observer = null;
let dragging = false;
let hasMoved = false;
let startY = 0;
let startBottom = 0;

function injectStylesOnce() {
  if (!document.getElementById('toc-mobile-styles')) {
    const style = document.createElement('style');
    style.id = 'toc-mobile-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }
}

function startHideTimer(delay = 500) {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    if (!isHovering && button) {
      button.classList.remove('show');
    }
  }, delay);
}

function showButtonTemporarily() {
  if (!button) return;
  button.classList.add('show');
  if (dragging) return;
  if (!isHovering) {
    startHideTimer(1500);
  } else {
    clearTimeout(scrollTimer);
  }
}

function setupScrollListener() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        showButtonTemporarily();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function createButton() {
  if (button) return;
  // 有目录或有折叠按钮都视为目录存在
  const tocEl = document.querySelector('.table-of-contents');
  const collapsibleBtn = document.querySelector('button.clean-btn.tocCollapsibleButton_TO0P');
  if (!tocEl && !collapsibleBtn) return;

  button = document.createElement('button');
  button.className = 'toc-mobile-btn';
  button.setAttribute('aria-label', '目录');
  button.setAttribute('title', '显示目录');
  button.innerHTML = LIST_ICON;
  button.addEventListener('click', () => {
    isHovering = false;
    clearTimeout(scrollTimer);
    if (button) button.classList.remove('show');
    openDrawer();
  });

  button.addEventListener('mouseenter', () => {
    isHovering = true;
    button.classList.add('show');
    clearTimeout(scrollTimer);
  });
  button.addEventListener('mouseleave', () => {
    if (dragging) return;
    isHovering = false;
    if (!drawer) {
      startHideTimer(500);
    }
  });

  const onDragStart = (e) => {
    if (e.type === 'mousedown') {
      e.preventDefault();
    }
    dragging = true;
    hasMoved = false;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startY = clientY;
    startBottom = parseInt(window.getComputedStyle(button).bottom, 10) || 140;

    button.style.transition = 'none';
    isHovering = false;
    clearTimeout(scrollTimer);

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('touchcancel', onDragEnd);
  };

  const onDragMove = (e) => {
    if (!dragging) return;
    e.preventDefault();

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - clientY;
    let newBottom = startBottom + deltaY;

    const maxBottom = window.innerHeight - button.offsetHeight - 20;
    const minBottom = 60;
    newBottom = Math.min(Math.max(newBottom, minBottom), maxBottom);

    if (Math.abs(newBottom - startBottom) > 3) {
      hasMoved = true;
    }

    button.style.bottom = newBottom + 'px';
  };

  const onDragEnd = (e) => {
    if (!dragging) return;
    dragging = false;

    button.style.transition = '';

    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchmove', onDragMove);
    window.removeEventListener('touchend', onDragEnd);
    window.removeEventListener('touchcancel', onDragEnd);

    if (hasMoved) {
      const preventClick = (evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        button.removeEventListener('click', preventClick, true);
      };
      button.addEventListener('click', preventClick, true);
      setTimeout(() => {
        button.removeEventListener('click', preventClick, true);
      }, 0);
    }

    isHovering = false;
    clearTimeout(scrollTimer);
    startHideTimer(500);
  };

  button.addEventListener('mousedown', onDragStart);
  button.addEventListener('touchstart', onDragStart, { passive: false });

  document.body.appendChild(button);

  const clampButtonPosition = () => {
    if (!button) return;
    const currentBottom = parseInt(button.style.bottom, 10);
    const actualBottom = Number.isNaN(currentBottom)
      ? parseInt(window.getComputedStyle(button).bottom, 10) || 140
      : currentBottom;

    const maxBottom = window.innerHeight - button.offsetHeight - 20;
    const minBottom = 60;
    const clampedBottom = Math.min(Math.max(actualBottom, minBottom), maxBottom);

    button.style.bottom = `${clampedBottom}px`;
  };

  clampButtonPosition();

  window.addEventListener('resize', clampButtonPosition);

  const originalRemoveButton = removeButton;
  removeButton = () => {
    window.removeEventListener('resize', clampButtonPosition);
    originalRemoveButton();
  };

  setupScrollListener();
  showButtonTemporarily();
}

function removeButton() {
  if (button) {
    button.remove();
    button = null;
  }
  closeDrawer();
  isHovering = false;
  clearTimeout(scrollTimer);
}

async function openDrawer() {
  if (drawer) return;

  // 检测是否存在折叠目录按钮，先展开以获取完整内容
  const collapsibleBtn = document.querySelector('button.clean-btn.tocCollapsibleButton_TO0P');
  if (collapsibleBtn) {
    collapsibleBtn.click();
    // 等待 React 渲染出目录
    await new Promise(resolve => {
      const check = () => {
        if (document.querySelector('.table-of-contents')) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      setTimeout(resolve, 1000);
    });
  }

  const tocEl = document.querySelector('.table-of-contents');
  if (!tocEl) {
    // 如果仍然没有目录，恢复折叠状态
    if (collapsibleBtn) collapsibleBtn.click();
    return;
  }

  backdrop = document.createElement('div');
  backdrop.className = 'toc-mobile-backdrop';
  backdrop.addEventListener('click', closeDrawer);
  backdrop.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.body.appendChild(backdrop);

  drawer = document.createElement('div');
  drawer.className = 'toc-mobile-drawer';
  drawer.innerHTML = `
    <button class="toc-mobile-drawer-close" aria-label="关闭" title="关闭">&times;</button>
    <div class="toc-mobile-drawer-content"></div>
  `;
  drawer.querySelector('.toc-mobile-drawer-close').addEventListener('click', closeDrawer);
  drawer.querySelector('.toc-mobile-drawer-content').appendChild(tocEl.cloneNode(true));
  document.body.appendChild(drawer);

  // 克隆完目录后恢复折叠
  if (collapsibleBtn) {
    collapsibleBtn.click();
  }

  void drawer.offsetHeight;
  void backdrop.offsetHeight;

  document.body.style.overflow = 'hidden';

  backdrop.classList.add('active');
  drawer.classList.add('open');

  const drawerContent = drawer.querySelector('.toc-mobile-drawer-content');
  const handleWheel = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = drawerContent;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
  };
  drawerContent.addEventListener('wheel', handleWheel, { passive: false });

  const handleTouchMove = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = drawerContent;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if ((isAtTop && e.touches[0].clientY > (drawer._lastTouchY || 0)) ||
        (isAtBottom && e.touches[0].clientY < (drawer._lastTouchY || 0))) {
      e.preventDefault();
    }
    drawer._lastTouchY = e.touches[0].clientY;
  };
  drawerContent.addEventListener('touchstart', (e) => {
    drawer._lastTouchY = e.touches[0].clientY;
  }, { passive: true });
  drawerContent.addEventListener('touchmove', handleTouchMove, { passive: false });

  drawer._handleWheel = handleWheel;
  drawer._handleTouchMove = handleTouchMove;

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setTimeout(closeDrawer, 100));
  });
}

function closeDrawer() {
  if (!drawer && !backdrop) return;

  if (backdrop) backdrop.classList.remove('active');
  if (drawer) drawer.classList.remove('open');

  const cleanup = () => {
    document.body.style.overflow = '';
    if (drawer) {
      drawer.removeEventListener('transitionend', cleanup);
      if (drawer._handleWheel) {
        const content = drawer.querySelector('.toc-mobile-drawer-content');
        if (content) content.removeEventListener('wheel', drawer._handleWheel);
      }
      if (drawer._handleTouchMove) {
        const content = drawer.querySelector('.toc-mobile-drawer-content');
        if (content) content.removeEventListener('touchmove', drawer._handleTouchMove);
      }
      drawer.remove();
      drawer = null;
    }
    if (backdrop) {
      backdrop.remove();
      backdrop = null;
    }
  };

  if (drawer) {
    drawer.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(() => {
      if (drawer || backdrop) cleanup();
    }, 500);
  } else {
    cleanup();
  }
}

function refresh() {
  if (!mediaQuery) return;
  const hasToc = !!document.querySelector('.table-of-contents')
    || !!document.querySelector('button.clean-btn.tocCollapsibleButton_TO0P');
  if (mediaQuery.matches && hasToc) {
    createButton();
  } else {
    removeButton();
  }
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    let tocAdded = false;
    let tocRemoved = false;

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          // 检测目录容器或折叠按钮的出现
          if (
            node.matches?.('.table-of-contents') ||
            node.querySelector?.('.table-of-contents') ||
            node.matches?.('button.clean-btn.tocCollapsibleButton_TO0P') ||
            node.querySelector?.('button.clean-btn.tocCollapsibleButton_TO0P')
          ) {
            tocAdded = true;
            break;
          }
        }
      }
      if (tocAdded) break;

      for (const node of mutation.removedNodes) {
        if (node.nodeType === 1) {
          if (
            node.matches?.('.table-of-contents') ||
            node.querySelector?.('.table-of-contents') ||
            node.matches?.('button.clean-btn.tocCollapsibleButton_TO0P') ||
            node.querySelector?.('button.clean-btn.tocCollapsibleButton_TO0P')
          ) {
            tocRemoved = true;
            break;
          }
        }
      }
      if (tocRemoved) break;
    }

    if (tocAdded || tocRemoved) {
      refresh();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export function onRouteUpdate() {
  if (!ExecutionEnvironment.canUseDOM) return;
  injectStylesOnce();

  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(max-width: 996px)');
    mediaQuery.addEventListener('change', refresh);
  }

  startObserver();
  refresh();
}