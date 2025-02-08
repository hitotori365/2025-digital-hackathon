export function highlightOccurrences(root: HTMLElement, keyword: string): void {
  if (!keyword) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const index = node.nodeValue?.indexOf(keyword) ?? -1;
    if (index >= 0) {
      const parent = node.parentNode;
      if (!parent) continue;

      const span = document.createElement("span");
      span.textContent = keyword;
      span.style.backgroundColor = "yellow";
      span.classList.add("my-highlighted-text");

      const before = document.createTextNode(node.nodeValue!.slice(0, index));
      const after = document.createTextNode(
        node.nodeValue!.slice(index + keyword.length)
      );

      parent.insertBefore(before, node);
      parent.insertBefore(span, node);
      parent.insertBefore(after, node);
      parent.removeChild(node);
    }
  }
}

function initHighlight(): void {
  chrome.storage.local.get(
    ["highlights"],
    (res: { highlights?: Record<string, any> }) => {
      const currentUrl = window.location.href;
      const allData = res.highlights || {};
      const highlightsForThisUrl = allData[currentUrl] || [];
      highlightsForThisUrl.forEach((text: string) => {
        highlightOccurrences(document.body, text);
      });
    }
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHighlight);
} else {
  initHighlight();
}
