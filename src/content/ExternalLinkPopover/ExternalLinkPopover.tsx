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

  constructor(link: HTMLAnchorElement) {
    console.log("Creating popover for:", link.href);
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
    // リンクへのホバーイベント
    this.link.addEventListener("mouseenter", () => {
      console.log("Link hovered");
      Popover.removeExistingPopovers();
      if (!document.getElementById(this.popoverEl.id)) {
        document.body.appendChild(this.popoverEl);
        if (this.popoverEl.hasAttribute("popover")) {
          (this.popoverEl as any).showPopover?.();
        }
      }
    });

    // ポップオーバーのtoggleイベント
    this.popoverEl.addEventListener("toggle", async () => {
      console.log("Popover toggled");
      if (this.popoverEl.matches(":popover-open")) {
        this.adjustPosition();
        this.popoverEl.textContent = "読込中...";
        await this.updateContent();
      }
    });
  }

  private adjustPosition(): void {
    // トリガー要素の代わりにリンク要素の位置を基準にする
    const rect = this.link.getBoundingClientRect();
    this.popoverEl.style.position = "absolute";
    this.popoverEl.style.top = `${rect.bottom + window.scrollY + 5}px`;
    this.popoverEl.style.left = `${rect.left + window.scrollX}px`;
  }

  // 法令データの取得と内容更新
  private async updateContent(): Promise<void> {
    try {
      this.popoverEl.textContent = "読込中...";
      
      const href = this.link.getAttribute("href");
      if (!href) return;

      // ページ内リンクの場合
      if (href.startsWith("#")) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const clone = targetElement.cloneNode(true) as HTMLElement;
          this.popoverEl.innerHTML = "";
          this.popoverEl.appendChild(clone);
        } else {
          this.popoverEl.textContent = "参照先が見つかりません。";
        }
        return;
      }

      // 法令への外部リンクの場合（既存のコード）
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
    } catch (err) {
      console.error("ポップオーバーの更新に失敗:", err);
      this.popoverEl.textContent =
        "内容を取得できませんでした。廃止または移設された法令の可能性もあります。";
    }
  }

  private async getLawId(): Promise<string | null> {
    let lawId = this.link.dataset.lawId;
    if (!lawId) {
      const url = new URL(
        this.link.getAttribute("href") || "",
        document.baseURI
      );
      const parts = url.pathname.split("/");
      if (parts.length >= 3 && parts[1] === "law") {
        lawId = parts[2];
        this.link.dataset.lawId = lawId;
      }
    }
    return lawId || null;
  }

  private getElmParam(): string | null {
    const href = this.link.getAttribute("href");
    if (!href) return null;
    const url = new URL(href, window.location.origin);
    const pathParts = url.pathname.split("/");
    let lawIdOrNumOrRevisionId = "";
    if (pathParts.length >= 3 && pathParts[1] === "law") {
      lawIdOrNumOrRevisionId = pathParts[2];
    }

    let elmParam: string | null = null;
    if (url.hash) {
      elmParam = convertFragmentToElm(url.hash);
    }
    return elmParam;
  }
}

/**
 * 対象となるリンクに対して Popover クラスを適用する
 */
function setupPopover(link: HTMLAnchorElement) {
  // 無限ループに陥るため、すでに適用済みならスキップする
  if (link.dataset.popoverInitialized === "true") return;

  // 有効なリンクかチェック
  const href = link.getAttribute("href");
  if (!href) return;
  
  // 法令への外部リンクまたはページ内リンクの場合
  if (href.startsWith("/law/") || href.startsWith("#")) {
    link.dataset.popoverInitialized = "true";
    new Popover(link);
  }
}

/**
 * 対象となるリンクの追加・変更を監視する
 */
function setupLawPopoverObserver() {
  // まず直接実行して動作確認
  const links = document.querySelectorAll("a[href^='/law/'], a[href^='#']");
  console.log("Found links:", links.length);
  links.forEach((link) => setupPopover(link as HTMLAnchorElement));

  // その後MutationObserverを設定
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          const links = node.querySelectorAll("a[href^='/law/'], a[href^='#']");
          links.forEach((link) => setupPopover(link as HTMLAnchorElement));
        }
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
    console.log("ExternalLinkPopover mounted"); // デバッグログ追加
    const observer = setupLawPopoverObserver();
    
    return () => {
      Popover.removeExistingPopovers();
      observer.disconnect();
    };
  }, []);

  return null;
};

export default ExternalLinkPopover;
