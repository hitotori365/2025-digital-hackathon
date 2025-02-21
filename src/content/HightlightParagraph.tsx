import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../utils/utils";

/**
 * HACK: テキストに全角数字が含まれているかどうかで、段落タイトルかを判定する
 */
function isParagraphTitle(text: string | null): boolean {
  if (!text) return false;
  const fullWidthDigitPattern = /[\uFF10-\uFF19]+/; // 全角数字(0-9)
  return fullWidthDigitPattern.test(text);
}

/**
 * 単一の要素にハイライト処理を適用
 */
function applyHighlight(element: Element): void {
  const text = element.textContent;
  // 全角数字が含まれる場合はオレンジ、含まれない場合は赤
  element.setAttribute(
    "style",
    `color: ${isParagraphTitle(text) ? "orange" : "red"};`
  );
}

/**
 * 指定されたルート要素以下のすべての span.paragraphtitle にハイライト処理を実施
 */
function processParagraphTitles(root: ParentNode = document): void {
  const elements = root.querySelectorAll("span.paragraphtitle");
  elements.forEach(applyHighlight);
}

/**
 * React コンポーネント:
 * 初回レンダリング時に既存の span.paragraphtitle をハイライトし、
 * MutationObserver により追加された要素にも動的にハイライトを適用する
 */
const HighlightParagraph: React.FC = () => {
  useEffect(() => {
    // 初回レンダリング時は querySelectorAllWithDelay を利用して要素を待機・取得
    querySelectorAllWithDelay("span.paragraphtitle")
      .then((elements) => {
        elements.forEach(applyHighlight);
      })
      .catch((error) => {
        console.error("要素取得に失敗:", error);
      });

    // MutationObserver を利用して DOM 変更時に新たな要素を監視
    const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 追加されたノード以下の span.paragraphtitle に対してハイライト処理を適用
            processParagraphTitles(node as Element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // DOM 操作のみを行うため、レンダリングする要素は不要
  return null;
};

export default HighlightParagraph;
