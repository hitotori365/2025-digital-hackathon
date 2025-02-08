// Chrome 拡張のイベント登録
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "highlightSelection",
    title: "ハイライトを引く",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    if (info.menuItemId === "highlightSelection") {
      if (!tab || typeof tab.id !== "number") {
        console.warn("No valid tab found.");
        return;
      }
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: highlightAndStore,
      });
    }
  }
);

/**
 * ページ内で実行される関数
 * 選択範囲をハイライトして、テキストを chrome.storage に保存する
 */
export function highlightAndStore(): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);

  const highlightSpan = document.createElement("span");
  highlightSpan.style.backgroundColor = "yellow";
  highlightSpan.style.color = "black";
  highlightSpan.classList.add("my-highlight");

  try {
    range.surroundContents(highlightSpan);
    selection.removeAllRanges();
  } catch (e) {
    console.warn("ハイライトでエラーが発生しました:", e);
    return;
  }

  const highlightedText = highlightSpan.textContent;
  const url = location.href;

  chrome.storage.local.get(
    ["highlights"],
    (res: { highlights?: Record<string, any> }) => {
      const highlights = res.highlights || {};
      if (!highlights[url]) {
        highlights[url] = [];
      }
      if (!highlights[url].includes(highlightedText)) {
        highlights[url].push(highlightedText);
      }
      chrome.storage.local.set({ highlights }, () => {
        console.log("ハイライトデータを保存:", highlights);
      });
    }
  );
}
