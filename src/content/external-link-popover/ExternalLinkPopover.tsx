import { useEffect } from "react";

import { fetcher as fetchLawData } from "./fetcher";
import { parseLawFullText, fragmentToElm } from "./parser";

import styles from "./ExternalLinkPopover.module.css";

/** 既存のポップオーバー要素をすべて削除する */
function removeExistingPopovers() {
  document.querySelectorAll(`.${styles.lawPopup}`).forEach((p) => p.remove());
}

/**
 * アイコン（または指定された要素）の位置に合わせてポップオーバーの位置を調整する
 */
function positionPopover(triggerElement: HTMLElement, popover: HTMLElement) {
  const rect = triggerElement.getBoundingClientRect();
  popover.style.position = "absolute";
  popover.style.top = `${rect.bottom + window.scrollY + 5}px`;
  popover.style.left = `${rect.left + window.scrollX}px`;
}

/**
 * リンクに info アイコンを追加し、クリック時にポップオーバーで条文を表示する
 */
function setupLawLinkEvents(link: HTMLAnchorElement) {
  // すでに初期化済みならスキップ
  if (link.dataset.infoIconInitialized === "true") return;
  link.dataset.infoIconInitialized = "true";

  // data属性がない場合、href から法令IDと条番号を抽出
  if (!link.dataset.lawId || !link.dataset.articleNumber) {
    const url = new URL(link.getAttribute("href") || "", document.baseURI);
    const parts = url.pathname.split("/");
    if (parts.length >= 3 && parts[1] === "law") {
      link.dataset.lawId = parts[2];
    }
    // #Mp-At_29 のようなハッシュから条番号抽出
    const hashMatch = url.hash.match(/At_(\d+)/);
    if (hashMatch) {
      link.dataset.articleNumber = hashMatch[1];
    }
  }

  // info アイコン要素を作成
  const infoIcon = document.createElement("span");
  infoIcon.textContent = "ⓘ";
  infoIcon.className = styles.lawInfoIcon;

  // ポップオーバー要素を作成（初期状態は非表示）
  const popover = document.createElement("div");
  popover.textContent = "読込中...";
  popover.className = styles.lawPopup;

  // アイコンをクリックしたときの動作
  infoIcon.addEventListener("click", async (event) => {
    // 既存のポップオーバーを全て消す
    removeExistingPopovers();

    // 新規ポップオーバーを改めて body に追加し、位置と表示を設定
    document.body.appendChild(popover);
    positionPopover(infoIcon, popover);
    popover.style.display = "block";
    popover.textContent = "読込中...";

    const lawId = link.dataset.lawId;
    if (!lawId) {
      console.warn("法令IDが見つかりません");
      popover.textContent = "法令IDがありません。";
      return;
    }

    // 例: /law/408AC0000000109#Mp-Pa_1-Ch_3-Se_1-At_36-Pr_1
    const href = link.getAttribute("href");
    if (!href) return;
    const url = new URL(href, window.location.origin);
    const pathParts = url.pathname.split("/");
    let lawIdOrNumOrRevisionId = "";
    if (pathParts.length >= 3 && pathParts[1] === "law") {
      lawIdOrNumOrRevisionId = pathParts[2];
    }

    // ハッシュ(#...) → elm に変換
    let elmParam: string | null = null;
    if (url.hash) {
      elmParam = fragmentToElm(url.hash);
    }

    try {
      const res = await fetchLawData(
        lawIdOrNumOrRevisionId,
        elmParam || undefined
      );
      const text = res.law_full_text || "本文が取得できません";
      const parsedLawText = parseLawFullText(text);
      console.log("法令本文:", parsedLawText);
      popover.textContent = parsedLawText;
    } catch (err) {
      popover.textContent = "取得に失敗しました。";
    }
  });

  // ドキュメント全体のクリックでポップオーバーを閉じる (アイコン上のクリックは除外)
  document.addEventListener("click", (e) => {
    if (
      popover.style.display === "block" &&
      !popover.contains(e.target as Node) &&
      e.target !== infoIcon
    ) {
      popover.remove();
    }
  });

  // リンクの直後に info アイコンを挿入して、Popover自体は body に追加しておく
  link.insertAdjacentElement("afterend", infoIcon);
}

/**
 * 対象となるリンクの追加・変更を監視し、info アイコンを設定する
 */
function setupLawPopoverObserver() {
  const observer = new MutationObserver(() => {
    const links = document.querySelectorAll("a[href^='/law/']");
    links.forEach((link) => setupLawLinkEvents(link as HTMLAnchorElement));
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // ページロード後に既に存在しているリンクに対しても設定
  const existingLinks = document.querySelectorAll("a[href^='/law/']");
  console.log("初期リンク数:", existingLinks.length);
  existingLinks.forEach((link) =>
    setupLawLinkEvents(link as HTMLAnchorElement)
  );
}

/**
 * React コンポーネント: LawPopover
 * - 対象ページ内の法令リンクを監視し、info アイコンを追加します
 */
const ExternalLinkPopover = () => {
  useEffect(() => {
    setupLawPopoverObserver();
    return () => {
      removeExistingPopovers();
    };
  }, []);

  return null;
};

export default ExternalLinkPopover;
