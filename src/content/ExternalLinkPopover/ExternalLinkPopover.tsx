import { useEffect } from "react";

import { fetchLawData } from "./fetcher";
import { renderLawFullText } from "./parser";
import { convertFragmentToElm } from "./converter";

import styles from "./ExternalLinkPopover.module.css";

/**
 * 指定されたリンクに対して、info アイコンとネイティブ popover を生成して連携するクラス
 */
class Popover {
  private popoverEl!: HTMLElement;
  private triggerEl!: HTMLButtonElement;
  private link: HTMLAnchorElement;

  constructor(link: HTMLAnchorElement) {
    this.link = link;
    this.createPopover();
    this.createTriggert();
    this.insertTrigger();
    this.setupEventListeners();
  }

  static removeExistingPopovers(): void {
    document.querySelectorAll(`.${styles.lawPopup}`).forEach((p) => p.remove());
  }

  private createPopover(): void {
    this.popoverEl = document.createElement("div");
    this.popoverEl.setAttribute("popover", "auto");
    // 一意な ID を付与（popovertarget で参照するため）
    this.popoverEl.id = `law-popover-${Math.random().toString(36).substr(2, 9)}`;
    this.popoverEl.className = styles.lawPopup;
    this.popoverEl.textContent = "読込中...";
  }

  private createTriggert(): void {
    this.triggerEl = document.createElement("button");
    this.triggerEl.textContent = "ⓘ";
    this.triggerEl.className = styles.lawInfoIcon;
    this.triggerEl.setAttribute("popovertarget", this.popoverEl.id);
    this.triggerEl.setAttribute("popovertargetaction", "toggle");
  }

  private insertTrigger(): void {
    this.link.insertAdjacentElement("afterend", this.triggerEl);
  }

  private setupEventListeners(): void {
    // trigger クリック時に、既存のポップオーバーを削除して、自身のものを body に追加
    this.triggerEl.addEventListener("click", () => {
      Popover.removeExistingPopovers();
      if (!document.getElementById(this.popoverEl.id)) {
        document.body.appendChild(this.popoverEl);
      }
    });

    // popover の toggle イベント時に、開いた際に位置調整とコンテンツ更新
    this.popoverEl.addEventListener("toggle", async () => {
      if (this.popoverEl.matches(":popover-open")) {
        this.adjustPosition();
        this.popoverEl.textContent = "読込中...";
        await this.updateContent();
      }
    });
  }

  // trigger の位置から popover の表示位置を手動で設定
  private adjustPosition(): void {
    const rect = this.triggerEl.getBoundingClientRect();
    this.popoverEl.style.position = "absolute";
    this.popoverEl.style.top = `${rect.bottom + window.scrollY + 5}px`;
    this.popoverEl.style.left = `${rect.left + window.scrollX}px`;
  }

  // 法令データの取得と内容更新
  private async updateContent(): Promise<void> {
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
    if (!lawId) {
      this.popoverEl.textContent = "取得に失敗しました。";
      return;
    }

    const href = this.link.getAttribute("href");
    if (!href) return;
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
    try {
      const res = await fetchLawData(
        lawIdOrNumOrRevisionId,
        elmParam || undefined
      );
      const lawJson = res.law_full_text;
      // ここで JSON 形式の法令本文を DOM に変換
      const formattedContent = renderLawFullText(lawJson);
      // 既存の内容をクリアしてから挿入
      this.popoverEl.innerHTML = "";
      this.popoverEl.appendChild(formattedContent);
    } catch (err) {
      this.popoverEl.textContent =
        "内容を取得できませんでした。廃止または移設された法令の可能性もあります。";
    }
  }
}

/**
 * 対象となるリンクに対して Popover クラスを適用する
 */
function setupPopover(link: HTMLAnchorElement) {
  // 無限ループに陥るため、すでに適用済みならスキップする
  if (link.dataset.popoverInitialized === "true") return;

  link.dataset.popoverInitialized = "true";
  new Popover(link);
}

/**
 * 対象となるリンクの追加・変更を監視する
 */
function setupLawPopoverObserver() {
  const observer = new MutationObserver(() => {
    const links = document.querySelectorAll("a[href^='/law/']");
    links.forEach((link) => setupPopover(link as HTMLAnchorElement));
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const existingLinks = document.querySelectorAll("a[href^='/law/']");
  existingLinks.forEach((link) => setupPopover(link as HTMLAnchorElement));
}

const ExternalLinkPopover = () => {
  useEffect(() => {
    setupLawPopoverObserver();
    return () => {
      Popover.removeExistingPopovers();
    };
  }, []);

  return null;
};

export default ExternalLinkPopover;
