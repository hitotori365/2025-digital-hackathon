// src/content/HoverPopup.tsx
import React, { useEffect } from "react";

async function querySelectorAllWithDelay(
  selector: string,
  delay = 1000,
  maxTimeout = 10000
): Promise<NodeListOf<Element>> {
  const startTime = Date.now();

  while (true) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      return elements;
    }

    const elapsed = Date.now() - startTime;
    if (elapsed > maxTimeout) {
      throw new Error(
        `Timeout: セレクタ "${selector}" の要素が ${maxTimeout}ms 内に見つかりませんでした。`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

const HoverPopup: React.FC = () => {
  useEffect(() => {
    let hideTimeouts: Map<string, NodeJS.Timeout> = new Map();

    const clearHideTimeout = (popupId: string) => {
      const timeout = hideTimeouts.get(popupId);
      if (timeout) {
        clearTimeout(timeout);
        hideTimeouts.delete(popupId);
      }
    };

    const scheduleHidePopup = (popupId: string) => {
      clearHideTimeout(popupId);
      hideTimeouts.set(popupId, setTimeout(() => {
        const popup = document.querySelector(`[data-popup-id="${popupId}"]`);
        if (popup && !popup.matches(':hover')) {
          popup.remove();
          // 子ポップアップも削除
          const childPopups = document.querySelectorAll('.hover-popup');
          childPopups.forEach(childPopup => {
            const childPopupElement = childPopup as HTMLElement;
            if (childPopupElement.dataset.popupId !== popupId) {
              const childRect = childPopupElement.getBoundingClientRect();
              const parentRect = popup.getBoundingClientRect();
              if (childRect.left > parentRect.left) {
                childPopup.remove();
              }
            }
          });
        }
      }, 1000));
    };

    const createPopup = (target: HTMLAnchorElement, parentPopupId?: string) => {
      const targetId = target.getAttribute('href')?.replace('#', '');
      if (!targetId) return;

      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      // 新しいポップアップのIDを生成
      const popupId = `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      clearHideTimeout(popupId);

      // 既存の子ポップアップを削除
      if (parentPopupId) {
        const parentPopup = document.querySelector(`[data-popup-id="${parentPopupId}"]`);
        const existingPopups = document.querySelectorAll('.hover-popup');
        existingPopups.forEach(popup => {
          const popupElement = popup as HTMLElement;
          if (popupElement.dataset.popupId !== parentPopupId) {
            const popupRect = popupElement.getBoundingClientRect();
            const parentRect = parentPopup?.getBoundingClientRect();
            if (parentRect && popupRect.left >= parentRect.left) {
              popup.remove();
            }
          }
        });
      }

      // ポップアップ作成
      const popup = document.createElement('div');
      popup.classList.add('hover-popup');
      popup.dataset.popupId = popupId;
      popup.style.position = 'absolute';
      popup.style.width = '256px';
      popup.style.height = '256px';
      popup.style.background = 'white';
      popup.style.border = '1px solid #ccc';
      popup.style.borderRadius = '4px';
      popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      popup.style.zIndex = '10000';
      popup.style.overflow = 'auto';
      popup.style.padding = '10px';

      // 条文の内容をコピー
      popup.innerHTML = targetElement.innerHTML;

      // ポップアップ内のリンクにイベントを設定
      const popupLinks = popup.querySelectorAll('a');
      popupLinks.forEach(link => {
        setupLinkEvents(link as HTMLAnchorElement, popupId);
      });

      // ポップアップの位置を設定
      const rect = target.getBoundingClientRect();
      const baseLeft = parentPopupId 
        ? rect.right + window.scrollX + 10
        : rect.left + window.scrollX;
      const popupLeft = baseLeft;
      const popupTop = rect.top + window.scrollY;

      // 画面端での位置調整
      if (popupLeft + 256 > window.innerWidth) {
        popup.style.left = `${rect.left + window.scrollX - 256 - 10}px`;
      } else {
        popup.style.left = `${popupLeft}px`;
      }

      popup.style.top = `${popupTop}px`;

      // ポップアップのホバーイベント
      popup.addEventListener('mouseenter', () => {
        clearHideTimeout(popupId);
        if (parentPopupId) {
          clearHideTimeout(parentPopupId);
        }
      });
    
      popup.addEventListener('mouseleave', (e: MouseEvent) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        
        // 子ポップアップに移動した場合は消さない
        const isMovingToChild = Array.from(document.querySelectorAll('.hover-popup')).some(p => {
          const pElement = p as HTMLElement;
          return pElement.dataset.popupId !== popupId && 
                 pElement.dataset.popupId !== parentPopupId && 
                 pElement.contains(relatedTarget);
        });
    
        if (!isMovingToChild) {
          scheduleHidePopup(popupId);
          if (parentPopupId) {
            scheduleHidePopup(parentPopupId);
          }
        }
      });
    
      document.body.appendChild(popup);
      return popupId;
    };

    const setupLinkEvents = (link: HTMLAnchorElement, parentPopupId?: string) => {
      link.addEventListener('mouseenter', () => {
        console.log("リンクへのホバーを検出:", link.href);
        const newPopupId = createPopup(link, parentPopupId);
        
        // 新しいポップアップが作成された場合、親のタイマーをクリア
        if (newPopupId && parentPopupId) {
          clearHideTimeout(parentPopupId);
        }
      });
    
      link.addEventListener('mouseleave', (e: MouseEvent) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        
        // 親ポップアップのIDがある場合（ポップアップ内のリンク）
        if (parentPopupId) {
          const parentPopup = document.querySelector(`[data-popup-id="${parentPopupId}"]`);
          // マウスが親ポップアップ内に留まっている場合は何もしない
          if (parentPopup?.contains(relatedTarget)) {
            return;
          }
          scheduleHidePopup(parentPopupId);
        }
    
        // 通常のリンクの場合
        const popup = document.querySelector('.hover-popup');
        if (popup && !popup.contains(relatedTarget)) {
          const popupId = (popup as HTMLElement).dataset.popupId;
          if (popupId) {
            scheduleHidePopup(popupId);
          }
        }
      });
    };
    

    async function setupHoverEvents() {
      try {
        console.log("ホバーイベントのセットアップを開始");
        
        const sentences = await querySelectorAllWithDelay("p.sentence");
        console.log("p.sentence要素数:", sentences.length);

        sentences.forEach((sentence) => {
          const links = sentence.querySelectorAll('a');
          console.log(`リンク数 (${sentence.textContent?.slice(0, 20)}...):`, links.length);

          links.forEach(link => {
            setupLinkEvents(link as HTMLAnchorElement);
          });
        });

      } catch (error) {
        console.error("ホバーイベントのセットアップに失敗:", error);
      }
    }

    setupHoverEvents();

    // クリーンアップ
    return () => {
      hideTimeouts.forEach(timeout => clearTimeout(timeout));
      hideTimeouts.clear();
      const popups = document.querySelectorAll('.hover-popup');
      popups.forEach(popup => popup.remove());
    };
  }, []);

  return null;
};

export default HoverPopup;