import { useEffect } from "react";
import { debounce, createProcessLock } from "../../utils/processControl";

import { fetchLawData } from "./fetcher";
import { renderLawFullText } from "./parser";
import { convertFragmentToElm } from "./converter";

import styles from "./ExternalLinkPopover.module.css";

/**
 * 指定されたリンクに対して、info アイコンとネイティブ popover を生成して連携するクラス
 */
class Popover {
  private popoverEl!: HTMLElement;
  private link: HTMLAnchorElement;
  private showTimeout: NodeJS.Timeout | null = null;

  constructor(link: HTMLAnchorElement) {
    this.link = link;
    this.createPopover();
    this.setupEventListeners();
  }

  static removeExistingPopovers(): void {
    document.querySelectorAll(`.${styles.lawPopup}`).forEach((p) => p.remove());
  }

  private createPopover(): void {
    this.popoverEl = document.createElement("div");
    this.popoverEl.setAttribute("popover", "auto");
    this.popoverEl.id = `law-popover-${Math.random().toString(36).substr(2, 9)}`;
    this.popoverEl.className = styles.lawPopup;
    this.popoverEl.textContent = "読込中...";
  }

  private setupEventListeners(): void {
    this.setupHoverEvents();
    this.setupToggleEvent();
  }

  private setupHoverEvents(): void {
    this.link.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
    this.link.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
  }

  private handleMouseEnter(): void {
    this.showTimeout = setTimeout(this.showPopover.bind(this), 300);
  }

  private handleMouseLeave(): void {
    if (!this.showTimeout) return;
    clearTimeout(this.showTimeout);
    this.showTimeout = null;
  }

  private showPopover(): void {
    Popover.removeExistingPopovers();
    if (document.getElementById(this.popoverEl.id)) return;
    
    document.body.appendChild(this.popoverEl);
    if (this.popoverEl.hasAttribute("popover")) {
      (this.popoverEl as any).showPopover?.();
    }
  }

  private setupToggleEvent(): void {
    this.popoverEl.addEventListener("toggle", async () => {
      if (!this.popoverEl.matches(":popover-open")) return;
      
      this.adjustPosition();
      this.popoverEl.textContent = "読込中...";
      await this.updateContent();
    });
  }

  private adjustPosition(): void {
    const rect = this.link.getBoundingClientRect();
    this.popoverEl.style.position = "absolute";
    this.popoverEl.style.top = `${rect.bottom + window.scrollY + 5}px`;
    this.popoverEl.style.left = `${rect.left + window.scrollX}px`;
  }

  private async updateContent(): Promise<void> {
    try {
      const href = this.link.getAttribute("href");
      if (!href) return;

      await this.updateContentByType(href);
    } catch (err) {
      this.popoverEl.textContent =
        "内容を取得できませんでした。廃止または移設された法令の可能性もあります。";
    }
  }

  private async updateContentByType(href: string): Promise<void> {
    if (href.startsWith("#")) {
      await this.updateInternalLink(href);
      return;
    }
    await this.updateExternalLink();
  }

  private async updateInternalLink(href: string): Promise<void> {
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      this.popoverEl.textContent = "参照先が見つかりません。";
      return;
    }

    const clone = targetElement.cloneNode(true) as HTMLElement;
    this.popoverEl.innerHTML = "";
    this.popoverEl.appendChild(clone);
  }

  private async updateExternalLink(): Promise<void> {
    const lawId = await this.getLawId();
    if (!lawId) {
      this.popoverEl.textContent = "取得に失敗しました。";
      return;
    }

    const elmParam = this.getElmParam();
    const res = await fetchLawData(lawId, elmParam || undefined);
    
    const fragment = document.createDocumentFragment();
    const formattedContent = renderLawFullText(res.law_full_text);
    fragment.appendChild(formattedContent);
    
    this.popoverEl.innerHTML = "";
    this.popoverEl.appendChild(fragment);
  }

  private async getLawId(): Promise<string | null> {
    if (this.link.dataset.lawId) return this.link.dataset.lawId;

    const url = new URL(this.link.getAttribute("href") || "", document.baseURI);
    const parts = url.pathname.split("/");
    
    if (parts.length < 3 || parts[1] !== "law") return null;
    
    const lawId = parts[2];
    this.link.dataset.lawId = lawId;
    return lawId;
  }

  private getElmParam(): string | null {
    const href = this.link.getAttribute("href");
    if (!href) return null;

    const url = new URL(href, window.location.origin);
    if (!url.hash) return null;

    return convertFragmentToElm(url.hash);
  }
}

/**
 * 対象となるリンクに対して Popover クラスを適用する
 */
function setupPopover(link: HTMLAnchorElement): void {
  if (link.dataset.popoverInitialized === "true") return;

  const href = link.getAttribute("href");
  if (!href) return;
  
  if (!href.startsWith("/law/") && !href.startsWith("#")) return;

  link.dataset.popoverInitialized = "true";
  new Popover(link);
}

/**
 * 対象となるリンクの追加・変更を監視する
 */
function setupLawPopoverObserver(): MutationObserver {
  const processLinks = (element: Element) => {
    const links = element.querySelectorAll("a[href^='/law/'], a[href^='#']");
    links.forEach(link => setupPopover(link as HTMLAnchorElement));
  };

  processLinks(document.body);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        processLinks(node);
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}

const ExternalLinkPopover = () => {
  useEffect(() => {
    const observer = setupLawPopoverObserver();
    return () => {
      Popover.removeExistingPopovers();
      observer.disconnect();
    };
  }, []);

  return null;
};

export default ExternalLinkPopover;
