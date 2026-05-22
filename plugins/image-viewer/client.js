import './styles.css';

if (typeof window !== 'undefined') {
  const config = window.__IMAGE_VIEWER_CONFIG__ || {};
  const INITIAL_SCALE = parseFloat(config.scale) || 1.8;
  const ENABLE_WHEEL_ZOOM = config.enableWheelZoom !== false;
  const CONTAINER_SELECTOR = config.containerSelector || 'article';
  const MIN_SCALE = config.minScale ?? 0.5;
  const MAX_SCALE = config.maxScale ?? 5;
  const WHEEL_STEP = config.wheelStep ?? 0.25;

  // ---------- 全局变量 ----------
  let currentImageElement = null;
  let viewerContainer = null;
  let viewerImg = null;
  let closeButton = null;
  let scale = INITIAL_SCALE;
  let translateX = 0, translateY = 0;
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let startTranslateX = 0, startTranslateY = 0;
  let closeTimeout = null;
  let isAnimating = false;
  let isClosing = false;

  // 记录原始 body overflow 值，用于恢复
  let originalBodyOverflow = '';

  function parseScaleValue(val, defaultValue) {
    if (val === 'Infinity') return Infinity;
    if (val === '-Infinity') return -Infinity;
    const num = parseFloat(val);
    return isNaN(num) ? defaultValue : num;
  }

  // ---------- 动态添加类名 ----------
  function markZoomableImages() {
    const containers = document.querySelectorAll(CONTAINER_SELECTOR);
    containers.forEach(container => {
      container.querySelectorAll('img').forEach(img => {
        img.classList.add('image-viewer-zoomable');
      });
    });
  }

  let observer = null;
  function startObserving() {
    observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.matches?.(CONTAINER_SELECTOR)) {
              node.querySelectorAll('img').forEach(img => img.classList.add('image-viewer-zoomable'));
            }
            if (node.matches?.('img') && node.closest(CONTAINER_SELECTOR)) {
              node.classList.add('image-viewer-zoomable');
            }
            if (node.querySelectorAll) {
              const imgs = node.querySelectorAll('img');
              imgs.forEach(img => {
                if (img.closest(CONTAINER_SELECTOR)) {
                  img.classList.add('image-viewer-zoomable');
                }
              });
            }
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        markZoomableImages();
        startObserving();
      });
    } else {
      markZoomableImages();
      startObserving();
    }

    document.addEventListener('click', handleImageClick, false);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && viewerContainer && !isClosing) closeViewer();
      if (e.key === '0' && viewerContainer && !isAnimating && !isClosing) {
        resetToInitial();
      }
    });
  }

  function handleImageClick(e) {
    const img = e.target;
    if (img.tagName !== 'IMG') return;
    if (!img.classList.contains('image-viewer-zoomable') && !img.closest(CONTAINER_SELECTOR)) return;
    if (isAnimating || isClosing) return;

    e.preventDefault();
    currentImageElement = img;
    openViewer(img.src, img);
  }

  function getElementViewRect(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom
    };
  }

  function getFinalImageRect() {
    if (!viewerImg) return null;
    const originalTransform = viewerImg.style.transform;
    viewerImg.style.transform = 'none';
    const rect = viewerImg.getBoundingClientRect();
    viewerImg.style.transform = originalTransform;
    return rect;
  }

  function resetToInitial() {
    if (!viewerImg || isAnimating || isClosing) return;
    scale = INITIAL_SCALE;
    translateX = 0;
    translateY = 0;
    updateTransform();
  }

  function createCloseButton() {
    const btn = document.createElement('button');
    btn.innerHTML = '✕';
    btn.className = 'image-viewer-close';
    btn.setAttribute('aria-label', '关闭');
    btn.setAttribute('title', '关闭图片预览');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isAnimating && !isClosing) closeViewer();
    });
    return btn;
  }

  function openViewer(src, originalImg) {
    if (isAnimating || isClosing) return;

    // 立即禁止页面滚动
    if (document.body) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    const startRect = getElementViewRect(originalImg);

    viewerContainer = document.createElement('div');
    viewerContainer.className = 'image-viewer-overlay';
    viewerContainer.style.opacity = '0';

    viewerContainer.addEventListener('click', (e) => {
      if (e.target === viewerContainer && !isAnimating && !isClosing) closeViewer();
    });

    viewerImg = document.createElement('img');
    viewerImg.src = src;
    viewerImg.className = 'image-viewer-img';
    viewerImg.draggable = false;
    viewerImg.style.opacity = '0';
    viewerContainer.appendChild(viewerImg);

    // 创建关闭按钮并添加到 overlay
    closeButton = createCloseButton();
    viewerContainer.appendChild(closeButton);

    if (ENABLE_WHEEL_ZOOM) {
      viewerContainer.addEventListener('wheel', handleWheel, { passive: false });
    }

    viewerImg.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    document.body.appendChild(viewerContainer);

    const imgLoadPromise = new Promise((resolve) => {
      if (viewerImg.complete) {
        resolve();
      } else {
        viewerImg.onload = resolve;
        viewerImg.onerror = resolve;
      }
    });

    imgLoadPromise.then(() => {
      if (!viewerContainer || isClosing) return;

      const finalRect = getFinalImageRect();
      if (!finalRect) {
        showViewerImmediately();
        return;
      }

      const startCenterX = startRect.left + startRect.width / 2;
      const startCenterY = startRect.top + startRect.height / 2;
      const finalCenterX = finalRect.left + finalRect.width / 2;
      const finalCenterY = finalRect.top + finalRect.height / 2;
      const offsetX = startCenterX - finalCenterX;
      const offsetY = startCenterY - finalCenterY;
      const startScale = startRect.width / finalRect.width;

      scale = INITIAL_SCALE;
      translateX = 0;
      translateY = 0;

      viewerImg.style.transition = 'none';
      viewerImg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${startScale})`;
      viewerImg.style.opacity = '1';

      viewerImg.offsetHeight;

      isAnimating = true;

      viewerContainer.style.transition = 'opacity 0.3s ease';
      viewerContainer.style.opacity = '1';

      viewerImg.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), opacity 0.3s ease';
      viewerImg.style.transform = `translate(0, 0) scale(${INITIAL_SCALE})`;

      const onFinish = () => {
        if (!viewerContainer) return;
        viewerImg.style.transition = 'none';
        viewerImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        isAnimating = false;
        viewerImg.removeEventListener('transitionend', onFinish);
      };
      viewerImg.addEventListener('transitionend', onFinish, { once: true });

      setTimeout(() => {
        if (isAnimating) {
          if (viewerImg) viewerImg.style.transition = 'none';
          isAnimating = false;
        }
      }, 500);
    }).catch(() => {
      showViewerImmediately();
    });
  }

  function showViewerImmediately() {
    if (!viewerContainer) return;
    viewerContainer.style.opacity = '1';
    if (viewerImg) {
      viewerImg.style.opacity = '1';
      scale = INITIAL_SCALE;
      translateX = 0;
      translateY = 0;
      viewerImg.style.transition = 'none';
      viewerImg.style.transform = `translate(0, 0) scale(${scale})`;
    }
    isAnimating = false;
  }

  function closeViewer() {
    if (!viewerContainer || isClosing || isAnimating) return;
    isClosing = true;

    // 保持滚动禁止直到完全关闭（移除元素后再恢复）

    if (!currentImageElement || !currentImageElement.isConnected) {
      fadeOutAndRemove();
      return;
    }

    const targetRect = getElementViewRect(currentImageElement);
    const currentImgRect = viewerImg.getBoundingClientRect();

    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const currentCenterX = currentImgRect.left + currentImgRect.width / 2;
    const currentCenterY = currentImgRect.top + currentImgRect.height / 2;
    const targetScale = targetRect.width / currentImgRect.width;

    const offsetX = targetCenterX - currentCenterX;
    const offsetY = targetCenterY - currentCenterY;

    if (isDragging) {
      isDragging = false;
      if (viewerImg) viewerImg.style.cursor = '';
    }

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    viewerImg.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease';
    viewerImg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${targetScale})`;
    viewerImg.style.opacity = '0';

    if (viewerContainer) {
      viewerContainer.style.transition = 'opacity 0.3s ease';
      viewerContainer.style.opacity = '0';
    }

    const onCloseFinish = () => {
      removeViewerElements();
    };
    if (viewerImg) {
      viewerImg.addEventListener('transitionend', onCloseFinish, { once: true });
    }

    clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      if (viewerContainer) removeViewerElements();
    }, 400);
  }

  function fadeOutAndRemove() {
    if (!viewerContainer) return;
    if (viewerImg) {
      viewerImg.style.transition = 'opacity 0.25s ease';
      viewerImg.style.opacity = '0';
    }
    viewerContainer.style.transition = 'opacity 0.3s ease';
    viewerContainer.style.opacity = '0';

    const onRemove = () => {
      removeViewerElements();
    };
    viewerContainer.addEventListener('transitionend', onRemove, { once: true });
    setTimeout(() => {
      if (viewerContainer) removeViewerElements();
    }, 350);
  }

  function removeViewerElements() {
    if (!viewerContainer) return;
    if (ENABLE_WHEEL_ZOOM) {
      viewerContainer.removeEventListener('wheel', handleWheel);
    }
    viewerImg?.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    if (closeButton) {
      closeButton.removeEventListener('click', closeViewer);
      closeButton = null;
    }
    viewerContainer.remove();
    viewerContainer = null;
    viewerImg = null;
    currentImageElement = null;
    clearTimeout(closeTimeout);
    isAnimating = false;
    isClosing = false;
    scale = INITIAL_SCALE;
    translateX = 0;
    translateY = 0;

    // 恢复页面滚动
    if (document.body) {
      document.body.style.overflow = originalBodyOverflow;
      originalBodyOverflow = '';
    }
  }

  /**
   * 相对缩放 + 鼠标位置补偿
   * @param {number} mouseX - 鼠标在视口中的 X 坐标
   * @param {number} mouseY - 鼠标在视口中的 Y 坐标
   * @param {number} factor - 缩放因子（如 1.1 放大，0.9 缩小）
   */
  function zoomAt(mouseX, mouseY, factor) {
    if (!viewerImg || isAnimating || isClosing) return;

    const oldScale = scale;
    let newScale = oldScale * factor;

    // 钳制缩放范围
    if (MAX_SCALE !== Infinity && newScale > MAX_SCALE) newScale = MAX_SCALE;
    if (MIN_SCALE !== -Infinity && newScale < MIN_SCALE) newScale = MIN_SCALE;
    if (newScale === oldScale) return;

    // 获取图像当前在屏幕上的矩形区域（受 transform 影响）
    const rect = viewerImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 鼠标相对于图像中心的偏移量
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    // 缩放因子（实际生效的比值）
    const effectiveFactor = newScale / oldScale;

    // 补偿平移量，使鼠标下的图像点保持不变
    translateX += deltaX * (1 - effectiveFactor);
    translateY += deltaY * (1 - effectiveFactor);

    scale = newScale;
    updateTransform();
  }

  // 滚轮缩放（使用相对步长 + 鼠标位置补偿）
  function handleWheel(e) {
    if (!viewerImg || isAnimating || isClosing) return;
    e.preventDefault();

    // 确定缩放方向：向下滚动缩小（factor < 1），向上滚动放大（factor > 1）
    const factor = e.deltaY > 0 ? 1 - WHEEL_STEP : 1 + WHEEL_STEP;
    zoomAt(e.clientX, e.clientY, factor);
  }

  function updateTransform() {
    if (!viewerImg || isAnimating || isClosing) return;
    viewerImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function handleMouseDown(e) {
    if (!viewerImg || isAnimating || isClosing) return;
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startTranslateX = translateX;
    startTranslateY = translateY;
    viewerImg.style.cursor = 'grabbing';
  }

  function handleMouseMove(e) {
    if (!isDragging || !viewerImg || isAnimating || isClosing) return;
    translateX = startTranslateX + (e.clientX - dragStartX);
    translateY = startTranslateY + (e.clientY - dragStartY);
    updateTransform();
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    if (viewerImg) viewerImg.style.cursor = 'grab';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}