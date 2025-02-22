import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../../utils/utils";

/**
 * HACK: テキストに全角数字が含まれているかどうかで、段落タイトルであるかどうかを判定している
 */
function isParagraphTitle(text: string | null): boolean {
  if (!text) return false;
  const fullWidthDigitPattern = /[\uFF10-\uFF19]+/; // 全角数字(0-9)
  return fullWidthDigitPattern.test(text);
}

/**
 * span.paragraphtitle に、ハイライト用のクラスを追加する
 */
async function addClassToArticleTitleAndParagraphTitle(): Promise<void> {
  try {
    // span.paragraphtitle要素を待機して取得
    const elements = await querySelectorAllWithDelay("span.paragraphtitle");
    elements.forEach((element) => {
      const text = element.textContent;
      // 全角数字が含まれる場合: オレンジ、含まれない場合: 赤
      element.classList.add(
        isParagraphTitle(text) ? "paragraph-title" : "article-title"
      );
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * React コンポーネント:
 * マウント時 (初回レンダリング時) に `addClassToArticleAndParagraph` を実行。
 */
const DecorateLawTitles: React.FC = () => {
  useEffect(() => {
    addClassToArticleTitleAndParagraphTitle();
  }, []);

  // DOM 操作だけを行うため、描画要素は不要
  return null;
};

export default DecorateLawTitles;
