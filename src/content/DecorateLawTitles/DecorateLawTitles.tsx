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
    // span.paragraphtitle要素を待機して取得
    const elements = await querySelectorAllWithDelay("span.paragraphtitle");
    elements.forEach((element) => {
      const text = element.textContent;
      if (isArticleTitle(text)) {
        element.classList.add("articletitle");
      }
      if (isParagraphTitle(text)) {
        element.classList.add("paragraphtitle");
      }
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * div._div_ArticleTitle 内のspanにクラスを追加する
 */
async function addClassToArticleTitle(): Promise<void> {
  try {
    // div._div_ArticleTitle要素を待機して取得
    const elements = await querySelectorAllWithDelay("div._div_ArticleTitle");
    elements.forEach((element) => {
      const spans = element.querySelectorAll("span");
      spans.forEach((span) => {
        const text = span.textContent;
        if (isArticleTitle(text)) {
          span.classList.add("articletitle");
        }
      });
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * div._div_ParagraphSentence 内のspanにクラスを追加する
 */
async function addClassToParagraphTitle(): Promise<void> {
  try {
    // div._div_ParagraphSentence要素を待機して取得
    const elements = await querySelectorAllWithDelay(
      "div._div_ParagraphSentence"
    );
    elements.forEach((element) => {
      const spans = element.querySelectorAll("span");
      spans.forEach((span) => {
        const text = span.textContent;
        if (isParagraphTitle(text)) {
          span.classList.add("paragraphtitle");
        }
      });
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

async function addClassToItemTitle(): Promise<void> {
  try {
    // div._div_ItemSentence要素を待機して取得
    const elements = await querySelectorAllWithDelay("div._div_ItemSentence");
    elements.forEach((element) => {
      const spans = element.querySelectorAll("span");
      spans.forEach((span) => {
        const text = span.textContent;
        if (isItemTitle(text)) {
          span.classList.add("itemtitle");
        }
      });
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

async function addClassToPortionTitle(): Promise<void> {
  try {
    // div._div_ItemSentence要素を待機して取得
    const elements = await querySelectorAllWithDelay(
      "div._div_Subitem1Sentence"
    );
    elements.forEach((element) => {
      const spans = element.querySelectorAll("span");
      spans.forEach((span) => {
        const text = span.textContent;
        if (isPortionTitle(text)) {
          span.classList.add("portiontitle");
        }
      });
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
    addClassToArticleTitle();
    addClassToParagraphTitle();
    addClassToItemTitle();
    addClassToPortionTitle();
  }, []);

  // DOM 操作だけを行うため、描画要素は不要
  return null;
};

export default DecorateLawTitles;
