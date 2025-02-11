import React, { useEffect } from "react";

/**
 * 指定したセレクタの要素が見つかるまで待機するquerySelectorAllのラッパー関数
 * @param selector - セレクタ
 * @param delay - ポーリング間隔 (ms)
 * @param maxTimeout - 最大待機時間 (ms)
 */
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

    // 最大待機時間を超えている場合は reject する
    const elapsed = Date.now() - startTime;
    if (elapsed > maxTimeout) {
      throw new Error(
        `Timeout: セレクタ "${selector}" の要素が ${maxTimeout}ms 内に見つかりませんでした。`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * HACK: テキストに全角数字が含まれているかどうかで、段落タイトルであるかどうかを判定している
 */
function isParagraphTitle(text: string | null): boolean {
  if (!text) return false;
  const fullWidthDigitPattern = /[\uFF10-\uFF19]+/; // 全角数字(0-9)
  return fullWidthDigitPattern.test(text);
}

/**
 * span.paragraphtitle をハイライトする処理
 */
async function highlightArticleAndParagraph(): Promise<void> {
  try {
    // span.paragraphtitle要素を待機して取得
    const elements = await querySelectorAllWithDelay("span.paragraphtitle");
    elements.forEach((element) => {
      const text = element.textContent;
      // 全角数字が含まれる場合: オレンジ、含まれない場合: 赤
      element.setAttribute(
        "style",
        `color: ${isParagraphTitle(text) ? "orange" : "red"};`
      );
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * React コンポーネント:
 * マウント時 (初回レンダリング時) に `highlightArticleAndParagraph` を実行。
 */
const HighlightParagraph: React.FC = () => {
  useEffect(() => {
    highlightArticleAndParagraph();
  }, []);

  // DOM 操作だけを行うため、描画要素は不要
  return null;
};

export default HighlightParagraph;
