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
    let hideTimeout: NodeJS.Timeout | null = null;

    const clearHideTimeout = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    };

    const scheduleHidePopup = () => {
      clearHideTimeout();
      hideTimeout = setTimeout(() => {
        const popup = document.querySelector('.hover-popup');
        if (popup && !popup.matches(':hover')) {
          popup.remove();
        }
      }, 2000);
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
            link.addEventListener('mouseenter', (e: Event) => {
              const target = e.target as HTMLAnchorElement;
              console.log("リンクへのホバーを検出:", target.href);
              
              clearHideTimeout(); // タイムアウトをクリア

              // 既存のポップアップを削除
              const existingPopup = document.querySelector('.hover-popup');
              if (existingPopup) {
                existingPopup.remove();
              }

              // リンク先のIDを取得
              const targetId = target.getAttribute('href')?.replace('#', '');
              if (!targetId) return;

              // 対象の条文を取得
              const targetElement = document.getElementById(targetId);
              if (!targetElement) return;

              // ポップアップ作成
              const popup = document.createElement('div');
              popup.classList.add('hover-popup');
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

              // ポップアップの位置を設定
              const rect = target.getBoundingClientRect();
              const popupLeft = rect.left + window.scrollX;
              const popupTop = rect.bottom + window.scrollY + 5;

              // 画面端での位置調整
              if (popupLeft + 256 > window.innerWidth) {
                popup.style.left = `${window.innerWidth - 256 - 10}px`;
              } else {
                popup.style.left = `${popupLeft}px`;
              }

              if (popupTop + 256 > window.innerHeight + window.scrollY) {
                popup.style.top = `${rect.top + window.scrollY - 256 - 5}px`;
              } else {
                popup.style.top = `${popupTop}px`;
              }

              // ポップアップのホバーイベント
              popup.addEventListener('mouseenter', () => {
                clearHideTimeout();
              });

              popup.addEventListener('mouseleave', () => {
                scheduleHidePopup();
              });

              document.body.appendChild(popup);
            });

            link.addEventListener('mouseleave', () => {
              scheduleHidePopup();
            });
          });
        });

      } catch (error) {
        console.error("ホバーイベントのセットアップに失敗:", error);
      }
    }

    setupHoverEvents();

    // クリーンアップ
    return () => {
      clearHideTimeout();
      const sentences = document.querySelectorAll("p.sentence");
      sentences.forEach((sentence) => {
        const links = sentence.querySelectorAll('a');
        links.forEach(link => {
          link.removeEventListener('mouseenter', () => {});
          link.removeEventListener('mouseleave', () => {});
        });
      });
      const popup = document.querySelector('.hover-popup');
      if (popup) {
        popup.remove();
      }
    };
  }, []);

  return null;
};

export default HoverPopup;