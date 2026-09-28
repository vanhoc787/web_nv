import { useEffect, useRef } from 'react';

/**
 * useKeyboardAdjust(containerRef)
 * - containerRef: ref tới DOM element (root page container) cần padding-bottom khi keyboard mở
 *
 * Cải tiến:
 * - dùng refs cho biến mutable (no stale closures)
 * - hỗ trợ window.visualViewport và fallback bằng innerHeight
 * - debounce resize/viewport events để tránh nhảy padding liên tục
 * - theo dõi thay đổi chiều cao layout bằng MutationObserver để cập nhật baseline
 * - khôi phục scroll an toàn khi keyboard đóng
 */
export default function useKeyboardAdjust(containerRef) {
  const originalPaddingRef = useRef(null);
  const lastInnerHeightRef = useRef(typeof window !== 'undefined' ? window.innerHeight : 0);
  const lastAutoScrollRef = useRef(null);
  const restoreTimeoutRef = useRef(null);
  const rafRef = useRef(null);
  const isMountedRef = useRef(false);
  const keyboardOpenedRef = useRef(false);

  // config
  const KEYBOARD_OPEN_THRESHOLD = 80; // px, heuristic
  const RESIZE_DEBOUNCE = 50; // ms

  useEffect(() => {
    const container = containerRef && containerRef.current;
    if (!container) return;
    isMountedRef.current = true;

    // save original inline padding-bottom
    originalPaddingRef.current = container.style.paddingBottom || '';

    // helpers
    const setPadding = (px) => {
      // use requestAnimationFrame to avoid layout thrash
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        if (px && px > 0) {
          container.style.paddingBottom = typeof px === 'number' ? `${px}px` : px;
        } else {
          container.style.paddingBottom = originalPaddingRef.current;
        }
      });
    };

    const computeKeyboardHeight = () => {
      const vv = window.visualViewport;
      if (vv && typeof vv.height === 'number') {
        // visualViewport.height is the visual layout area (shrinks when keyboard opens)
        // offsetTop may be > 0 on iOS when status bar / safe area shifts
        const keyboard = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
        return keyboard;
      }
      // fallback: difference snapshot between saved baseline innerHeight and current innerHeight
      return Math.max(0, lastInnerHeightRef.current - window.innerHeight);
    };

    // Debounced handler wrapper
    let resizeTimer = null;
    const scheduleHandle = (fn) => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        try { fn(); } catch { /* ignore */ }
      }, RESIZE_DEBOUNCE);
    };

    const handleViewportChange = () => {
      scheduleHandle(() => {
        const keyboardHeight = computeKeyboardHeight();
        const opened = keyboardHeight > KEYBOARD_OPEN_THRESHOLD;
        // update css variable --vh for apps that use it unless the app requested a locked vh
        // try {
        //   if (!window.__KB_LOCK_VH) {
        //     const vv = window.visualViewport;
        //     if (vv && vv.height) {
        //       document.documentElement.style.setProperty('--vh', `${vv.height * 0.01}px`);
        //     } else {
        //       document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        //     }
        //   }
        // } catch { /* ignore */ }

        if (opened) {
          // keyboard opened: cancel pending restore, apply padding
          if (restoreTimeoutRef.current) { clearTimeout(restoreTimeoutRef.current); restoreTimeoutRef.current = null; }
          keyboardOpenedRef.current = true;
          setPadding(keyboardHeight);
        } else {
          // keyboard closed: restore padding and schedule scroll restore
          keyboardOpenedRef.current = false;
          setPadding(0);
          // reset --vh to innerHeight unless locked
        //   try { if (!window.__KB_LOCK_VH) document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`); } catch { /* ignore */ }

          if (lastAutoScrollRef.current != null) {
            const saved = lastAutoScrollRef.current;
            // small delay to let layout stabilize
            restoreTimeoutRef.current = setTimeout(() => {
              try {
                if (saved.type === 'window') {
                  // only restore if still different
                  if (Math.abs(window.pageYOffset - (saved.top || 0)) > 2) {
                    window.scrollTo({ top: saved.top || 0, behavior: 'smooth' });
                  }
                } else if (saved.type === 'element' && saved.node) {
                  try {
                    if (Math.abs(saved.node.scrollTop - (saved.top || 0)) > 2) {
                      saved.node.scrollTo({ top: saved.top || 0, behavior: 'smooth' });
                    }
                  } catch { /* ignore */ }
                }
              } catch { /* ignore */ }
              lastAutoScrollRef.current = null;
              restoreTimeoutRef.current = null;
            }, 260);
          }
        }

        // update baseline for fallback logic
        lastInnerHeightRef.current = window.innerHeight;
      });
    };

    const handleResizeFallback = () => {
      // older browsers (no visualViewport) will use this
      scheduleHandle(() => {
        const ih = window.innerHeight;
        const diff = Math.max(0, lastInnerHeightRef.current - ih);
        if (diff > KEYBOARD_OPEN_THRESHOLD) {
          // keyboard likely opened
          if (restoreTimeoutRef.current) { clearTimeout(restoreTimeoutRef.current); restoreTimeoutRef.current = null; }
          keyboardOpenedRef.current = true;
          setPadding(diff);
        } else if (ih - lastInnerHeightRef.current > KEYBOARD_OPEN_THRESHOLD) {
          // keyboard likely closed
          keyboardOpenedRef.current = false;
          setPadding(0);

          if (lastAutoScrollRef.current != null) {
            const saved = lastAutoScrollRef.current;
            restoreTimeoutRef.current = setTimeout(() => {
              try {
                if (saved.type === 'window') {
                  if (Math.abs(window.pageYOffset - (saved.top || 0)) > 2) {
                    window.scrollTo({ top: saved.top || 0, behavior: 'smooth' });
                  }
                } else if (saved.type === 'element' && saved.node) {
                  try {
                    if (Math.abs(saved.node.scrollTop - (saved.top || 0)) > 2) {
                      saved.node.scrollTo({ top: saved.top || 0, behavior: 'smooth' });
                    }
                  } catch { /* ignore */ }
                }
              } catch { /* ignore */ }
              lastAutoScrollRef.current = null;
              restoreTimeoutRef.current = null;
            }, 260);
          }
        }
        lastInnerHeightRef.current = ih;
      });
    };

    const findScrollableAncestor = (el) => {
      let node = el.parentElement;
      while (node) {
        try {
          const style = window.getComputedStyle(node);
          const overflowY = style.overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') return node;
        } catch { /* ignore */ }
        node = node.parentElement;
      }
      return null;
    };

    const handleFocusIn = (e) => {
      const t = e.target;
      if (!t) return;
      const tag = t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) {
        // wait a bit for keyboard/viewport to settle then ensure element visible
        setTimeout(() => {
          try {
            const rect = t.getBoundingClientRect();
            const vv = window.visualViewport;
            const vvHeight = (vv && typeof vv.height === 'number') ? vv.height : window.innerHeight;
            const bottomPadding = parseFloat(getComputedStyle(container).paddingBottom || '0') || 0;
            // If bottom of element is beyond visible area (accounting padding)
            if (rect.bottom > (vvHeight - 20 - bottomPadding)) {
              // try browser scrollIntoView first
              try { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { /* ignore */ }

              // if that doesn't suffice, scroll nearest scrollable parent
              const sc = findScrollableAncestor(t);
              if (sc) {
                // save previous scroll to restore later
                try { lastAutoScrollRef.current = { type: 'element', node: sc, top: sc.scrollTop }; } catch { lastAutoScrollRef.current = null; }
                const offset = Math.max(0, rect.bottom - vvHeight + 12 + bottomPadding);
                try { sc.scrollBy({ top: offset, behavior: 'smooth' }); } catch { /* ignore */ }
              } else {
                // fallback to window scroll and save previous
                const pageTop = (vv && typeof vv.pageTop === 'number') ? vv.pageTop : window.pageYOffset;
                const absoluteTop = rect.top + pageTop;
                const desired = absoluteTop - (vvHeight / 2) + (rect.height / 2);
                try { lastAutoScrollRef.current = { type: 'window', top: window.pageYOffset }; } catch { lastAutoScrollRef.current = null; }
                try { window.scrollTo({ top: desired, behavior: 'smooth' }); } catch { /* ignore */ }
              }
            }
          } catch { /* ignore */ }
        }, 220);
      }
    };

    // If document layout changes (e.g., body height adjusted) update baseline innerHeight
    let mutationObserver = null;
    try {
      mutationObserver = new MutationObserver(() => {
        // take a new baseline after small delay
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          lastInnerHeightRef.current = window.innerHeight;
        }, RESIZE_DEBOUNCE);
      });
      mutationObserver.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    } catch { /* ignore */ }

    // Attach listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    } else {
      window.addEventListener('resize', handleResizeFallback);
    }
    window.addEventListener('orientationchange', handleViewportChange);
    container.addEventListener('focusin', handleFocusIn);

    // ensure baseline
    lastInnerHeightRef.current = window.innerHeight;

    // cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (window.visualViewport) {
        try {
          window.visualViewport.removeEventListener('resize', handleViewportChange);
          window.visualViewport.removeEventListener('scroll', handleViewportChange);
        } catch { /* ignore */ }
      } else {
        try { window.removeEventListener('resize', handleResizeFallback); } catch { /* ignore */ }
      }
      try { window.removeEventListener('orientationchange', handleViewportChange); } catch { /* ignore */ }
      try { container.removeEventListener('focusin', handleFocusIn); } catch { /* ignore */ }
      // restore padding
      try { container.style.paddingBottom = originalPaddingRef.current; } catch { /* ignore */ }
      // attempt immediate restore of scroll if needed
      try {
        const saved = lastAutoScrollRef.current;
        if (saved) {
          if (saved.type === 'window') {
            try { window.scrollTo({ top: saved.top || 0, behavior: 'smooth' }); } catch { /* ignore */ }
          } else if (saved.type === 'element' && saved.node) {
            try { saved.node.scrollTo({ top: saved.top || 0, behavior: 'smooth' }); } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }

      if (restoreTimeoutRef.current) { clearTimeout(restoreTimeoutRef.current); restoreTimeoutRef.current = null; }
      if (resizeTimer) { clearTimeout(resizeTimer); resizeTimer = null; }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mutationObserver) {
        try { mutationObserver.disconnect(); } catch { /* ignore */ }
      }
    };
  }, [containerRef]);
}
