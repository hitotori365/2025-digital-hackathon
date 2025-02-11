import React, { useEffect } from "react";

/**
 * 指定したセレクタの要素が見つかるまで待機する querySelectorAll のラッパー関数
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
 * 括弧をハイライトする関数
 */
async function highlightBrackets() {
  try {
    // p.sentence要素を待機して取得
    const elements = await querySelectorAllWithDelay("p.sentence");
    console.log("テキスト要素数:", elements.length);

    elements.forEach((element) => {
      const text = element.textContent;
      if (text && (text.includes("（") || text.includes("）"))) {
        element.innerHTML = element.innerHTML.replace(
          /([（）])/g,
          '<span style="background-color: yellow">$1</span>'
        );
        console.log("括弧を含むテキスト処理:", text);
      }
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * React コンポーネント:
 * マウント時に一度だけ `highlightBrackets` を実行し、括弧をハイライト。
 */
const HighlightBrackets: React.FC = () => {
  useEffect(() => {
    // コンポーネントがマウントしたら実行
    highlightBrackets();
  }, []);

  // DOM 操作だけを行うため描画要素はない
  return null;
};

export default HighlightBrackets;
