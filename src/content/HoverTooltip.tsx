// src/content/HoverTooltip.tsx
import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../utils/utils";

const HoverTooltip: React.FC = () => {
  useEffect(() => {
    let hideTimeouts: Map<string, NodeJS.Timeout> = new Map();

    const clearHideTimeout = (tooltipId: string) => {
      const timeout = hideTimeouts.get(tooltipId);
      if (timeout) {
        clearTimeout(timeout);
        hideTimeouts.delete(tooltipId);
      }
    };

    const scheduleHideTooltip = (tooltipId: string) => {
      clearHideTimeout(tooltipId);
      
      hideTimeouts.set(tooltipId, setTimeout(() => {
        const tooltip = document.querySelector(`[data-tooltip-id="${tooltipId}"]`);
        
        // ポップアップが存在しないか、ホバー中なら何もしない
        if (!tooltip || tooltip.matches(':hover')) return;

        tooltip.remove();
        const parentRect = tooltip.getBoundingClientRect();
        const childTooltips = document.querySelectorAll('.hover-tooltip');
        
        childTooltips.forEach(childTooltip => {
          const childTooltipElement = childTooltip as HTMLElement;
          
          // 自分自身なら無視
          if (childTooltipElement.dataset.tooltipId === tooltipId) return;
    
          const childRect = childTooltipElement.getBoundingClientRect();
          
          // 親の右側にある要素のみ削除
          if (childRect.left > parentRect.left) {
            childTooltip.remove();
          }
        });
      }, 1000));
    };

    const createTooltip = (target: HTMLAnchorElement, parentTooltipId?: string) => {
      const targetId = target.getAttribute('href')?.replace('#', '');
      if (!targetId) return;

      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      // 新しいポップアップのIDを生成
      const tooltipId = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      clearHideTimeout(tooltipId);

      // 既存の子ポップアップを削除
      if (parentTooltipId) {
        const parentTooltip = document.querySelector(`[data-tooltip-id="${parentTooltipId}"]`);
        const existingTooltips = document.querySelectorAll('.hover-tooltip');
        existingTooltips.forEach(tooltip => {
          const tooltipElement = tooltip as HTMLElement;
          if (tooltipElement.dataset.tooltipId !== parentTooltipId) {
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const parentRect = parentTooltip?.getBoundingClientRect();
            if (parentRect && tooltipRect.left >= parentRect.left) {
              tooltip.remove();
            }
          }
        });
      }

      // ポップアップ作成
      const tooltip = document.createElement('div');
      tooltip.classList.add('hover-tooltip');
      tooltip.dataset.tooltipId = tooltipId;
      tooltip.style.position = 'absolute';
      tooltip.style.width = '256px';
      tooltip.style.height = '256px';
      tooltip.style.background = 'white';
      tooltip.style.border = '1px solid #ccc';
      tooltip.style.borderRadius = '4px';
      tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      tooltip.style.zIndex = '10000';
      tooltip.style.overflow = 'auto';
      tooltip.style.padding = '10px';

      // 条文の内容をコピー
      tooltip.innerHTML = targetElement.innerHTML;

      // ポップアップ内のリンクにイベントを設定
      const tooltipLinks = tooltip.querySelectorAll('a');
      tooltipLinks.forEach(link => {
        setupLinkEvents(link as HTMLAnchorElement, tooltipId);
      });

      // ポップアップの位置を設定
      const rect = target.getBoundingClientRect();
      const baseLeft = parentTooltipId
        ? rect.right + window.scrollX + 10
        : rect.left + window.scrollX;
      const tooltipLeft = baseLeft;
      const tooltipTop = parentTooltipId
        ? rect.top + window.scrollY         // 親ポップアップがある場合は同じ高さ
        : rect.bottom + window.scrollY + 16; // 通常のリンクの場合は16px下に表示


      // 画面端での位置調整
      if (tooltipLeft + 256 > window.innerWidth) {
        tooltip.style.left = `${rect.left + window.scrollX - 256 - 10}px`;
      } else {
        tooltip.style.left = `${tooltipLeft}px`;
      }

      tooltip.style.top = `${tooltipTop}px`;

      // ポップアップのホバーイベント
      tooltip.addEventListener('mouseenter', () => {
        clearHideTimeout(tooltipId);
        if (parentTooltipId) {
          clearHideTimeout(parentTooltipId);
        }
      });

      tooltip.addEventListener('mouseleave', (e: MouseEvent) => {
        const relatedTarget = e.relatedTarget as HTMLElement;

        // 子ポップアップに移動した場合は消さない
        const isMovingToChild = Array.from(document.querySelectorAll('.hover-tooltip')).some(p => {
          const pElement = p as HTMLElement;
          return pElement.dataset.tooltipId !== tooltipId &&
            pElement.dataset.tooltipId !== parentTooltipId &&
            pElement.contains(relatedTarget);
        });

        if (!isMovingToChild) {
          scheduleHideTooltip(tooltipId);
          if (parentTooltipId) {
            scheduleHideTooltip(parentTooltipId);
          }
        }
      });

      document.body.appendChild(tooltip);
      return tooltipId;
    };

    const setupLinkEvents = (link: HTMLAnchorElement, parentTooltipId?: string) => {
      link.addEventListener('mouseenter', () => {
        const newTooltipId = createTooltip(link, parentTooltipId);

        // 新しいポップアップが作成された場合、親のタイマーをクリア
        if (newTooltipId && parentTooltipId) {
          clearHideTimeout(parentTooltipId);
        }
      });

      link.addEventListener('mouseleave', (e: MouseEvent) => {
        const relatedTarget = e.relatedTarget as HTMLElement;

        // 親ポップアップのIDがある場合（ポップアップ内のリンク）
        if (parentTooltipId) {
          const parentTooltip = document.querySelector(`[data-tooltip-id="${parentTooltipId}"]`);
          // マウスが親ポップアップ内に留まっている場合は何もしない
          if (parentTooltip?.contains(relatedTarget)) {
            return;
          }
          scheduleHideTooltip(parentTooltipId);
        }

        // 通常のリンクの場合
        const tooltip = document.querySelector('.hover-tooltip');
        if (tooltip && !tooltip.contains(relatedTarget)) {
          const tooltipId = (tooltip as HTMLElement).dataset.tooltipId;
          if (tooltipId) {
            scheduleHideTooltip(tooltipId);
          }
        }
      });
    };

    async function setupHoverEvents() {
      try {
        const sentences = await querySelectorAllWithDelay("p.sentence");
        sentences.forEach((sentence) => {
          const links = sentence.querySelectorAll('a');
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
      const tooltips = document.querySelectorAll('.hover-tooltip');
      tooltips.forEach(tooltip => tooltip.remove());
    };
  }, []);

  return null;
};

export default HoverTooltip;