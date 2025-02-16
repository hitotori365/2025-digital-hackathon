import React, { useEffect } from "react";
import { querySelectorAllWithDelay
  
 } from "../utils/utils";
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
