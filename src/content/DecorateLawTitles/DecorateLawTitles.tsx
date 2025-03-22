import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../../utils/utils";

/**
 * テキストが条のタイトルであるかどうかを判定する
 */
function isArticleTitle(text: string | null): boolean {
  if (!text) return false;
  const articlePattern = /^第.+条(|の[二三四五六七八九])$/;
  return articlePattern.test(text);
}

/**
 * HACK: テキストが全角数字で構成されているかどうかで、項のタイトルであるかどうかを判定している
 */
function isParagraphTitle(text: string | null): boolean {
  if (!text) return false;
  const fullWidthDigitPattern = /^[\uFF10-\uFF19]+$/; // 全角数字(0-9)
  return fullWidthDigitPattern.test(text);
}

/**
 * HACK: テキストが漢数字で構成されているかどうかで、段落タイトルであるかどうかを判定している
 */
function isItemTitle(text: string | null): boolean {
  if (!text) return false;
  const itemPattern = /^[零一二三四五六七八九十の]+$/;
  return itemPattern.test(text);
}

/**
 * HACK: テキストがイロハで構成されているかどうかで、段落タイトルであるかどうかを判定している
 */
function isPortionTitle(text: string | null): boolean {
  if (!text) return false;
  const portionPattern = /^[イロハニホヘトチリヌルヲ]$/;
  return portionPattern.test(text);
}

/**
 * span.paragraphtitle にクラスを追加する
 */
async function addClassToArticleTitleAndParagraphTitle(): Promise<void> {
  try {
    // 子要素に任意のHTML要素を持たず、かつ空でないspan.paragraphtitle要素のみを取得
    const spans = await querySelectorAllWithDelay(
      "span.paragraphtitle:not(:has(*)):not(:empty)"
    );
    spans.forEach((span) => {
      const text = span.textContent;
      if (isArticleTitle(text)) {
        span.classList.add("articletitle");
      }
      if (isParagraphTitle(text)) {
        span.classList.add("paragraphtitle");
      }
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * div._div_ArticleTitle 内の一番内側のspanにクラスを追加する
 */
async function addClassToArticleTitle(): Promise<void> {
  try {
    // div._div_ArticleTitle内の、子要素に任意のHTML要素を持たず、かつ空でないspan要素を取得
    const spans = await querySelectorAllWithDelay(
      "div._div_ArticleTitle span:not(:has(*)):not(:empty)"
    );
    spans.forEach((span) => {
      const text = span.textContent;
      if (isArticleTitle(text)) {
        span.classList.add("articletitle");
      }
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * div._div_ParagraphSentence 内の一番内側のspanにクラスを追加する
 */
async function addClassToParagraphTitle(): Promise<void> {
  try {
    // div._div_ParagraphSentence内の、子要素に任意のHTML要素を持たず、かつ空でないspan要素を取得
    const spans = await querySelectorAllWithDelay(
      "div._div_ParagraphSentence span:not(:has(*)):not(:empty)"
    );
    spans.forEach((span) => {
      const text = span.textContent;
      if (isParagraphTitle(text)) {
        span.classList.add("paragraphtitle");
      }
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * div._div_ItemSentence 内の一番内側のspanにクラスを追加する
 */
async function addClassToItemTitle(): Promise<void> {
  try {
    // div._div_ItemSentence内の、子要素に任意のHTML要素を持たず、かつ空でないspan要素を取得
    const spans = await querySelectorAllWithDelay(
      "div._div_ItemSentence span:not(:has(*)):not(:empty)"
    );
    spans.forEach((span) => {
      const text = span.textContent;
      if (isItemTitle(text)) {
        span.classList.add("itemtitle");
      }
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * div._div_Subitem1Sentence 内の一番内側のspanにクラスを追加する
 */
async function addClassToPortionTitle(): Promise<void> {
  try {
    // div._div_Subitem1Sentence内の、子要素に任意のHTML要素を持たず、かつ空でないspan要素を取得
    const spans = await querySelectorAllWithDelay(
      "div._div_Subitem1Sentence span:not(:has(*)):not(:empty)"
    );
    spans.forEach((span) => {
      const text = span.textContent;
      if (isPortionTitle(text)) {
        span.classList.add("portiontitle");
      }
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * React コンポーネント:
 * マウント時 (初回レンダリング時) に クラス追加関数を実行。
 */
const DecorateLawTitles: React.FC = () => {
  useEffect(() => {
    addClassToArticleTitleAndParagraphTitle();
    addClassToArticleTitle();
    addClassToParagraphTitle();
    addClassToItemTitle();
    addClassToPortionTitle();
  }, []);

  // DOM 操作だけを行うため、描画要素は不要
  return null;
};

export default DecorateLawTitles;
