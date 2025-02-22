import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../utils/utils";

type BracketStyle = {
  color: string;
  depth: number;
};

type TextSegment = {
  text: string;
  depth: number;
  hasError: boolean;
};

const STYLES = {
  brackets: [
    { color: "rgba(27, 57, 147, 0.3)", depth: 1 },
    { color: "rgba(27, 57, 147, 0.6)", depth: 2 },
    { color: "rgba(27, 57, 147, 0.9)", depth: 3 },
  ] as BracketStyle[],
  maxDepth: 3,
};

/**
 * テキストを解析して括弧の深さと位置を分析する
 */
const analyzeBrackets = (
  text: string
): {
  segments: TextSegment[];
  errors: string[];
} => {
  let depth = 0;
  let currentSegment = "";
  const segments: TextSegment[] = [];
  const errors: string[] = [];
  const openBrackets: number[] = [];

  const addSegment = (text: string, depth: number, hasError: boolean) => {
    if (text) {
      segments.push({ text, depth, hasError });
    }
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "（") {
      // 現在のセグメントを追加
      addSegment(currentSegment, depth, depth > STYLES.maxDepth);
      currentSegment = char;
      depth++;
      openBrackets.push(i);

      if (depth > STYLES.maxDepth) {
        errors.push(
          `括弧の深さが最大値(${STYLES.maxDepth})を超えています。位置: ${i}`
        );
      }
    } else if (char === "）") {
      currentSegment += char;
      if (depth === 0) {
        errors.push(`閉じ括弧が多すぎます。位置: ${i}`);
      } else {
        openBrackets.pop();
      }
      addSegment(currentSegment, depth, depth > STYLES.maxDepth);
      currentSegment = "";
      depth = Math.max(0, depth - 1);
    } else {
      currentSegment += char;
    }
  }

  // 残りのテキストを追加
  addSegment(currentSegment, depth, depth > STYLES.maxDepth);

  // 閉じられていない括弧のチェック
  if (openBrackets.length > 0) {
    errors.push(
      `閉じられていない括弧があります。位置: ${openBrackets.join(", ")}`
    );
  }

  return { segments, errors };
};

/**
 * セグメントを HTML 要素に変換する（スタイルは depth に応じて付与）
 */
const renderSegment = (segment: TextSegment): string => {
  if (segment.depth === 0) return segment.text;

  const depth = Math.min(segment.depth, STYLES.maxDepth);
  const color = STYLES.brackets[depth - 1].color;

  return `<span style="border-bottom: 2px solid ${color};">${segment.text}</span>`;
};

/**
 * 括弧とその中身をハイライトする関数
 */
async function underlineBrackets() {
  try {
    const elements = await querySelectorAllWithDelay("p.sentence");

    elements.forEach((element) => {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );
      const textNodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        // 括弧が含まれない場合は処理しない
        if (!text.includes("（") && !text.includes("）")) return;

        const { segments, errors } = analyzeBrackets(text);
        const replacedHTML = segments.map(renderSegment).join("");

        // テキストノードを span でラップして、部分的に書き換え　ることで、全体の書き換えを避ける
        const span = document.createElement("span");
        span.innerHTML = replacedHTML;

        // エラーがある場合は警告を表示
        if (errors.length > 0) {
          span.setAttribute("title", errors.join("\n"));
          span.classList.add("bracket-error");
          console.warn(errors);
        }

        textNode.parentNode?.replaceChild(span, textNode);
      });
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * React コンポーネント
 */
const UnderlineBrackets: React.FC = () => {
  useEffect(() => {
    underlineBrackets();
  }, []);

  return null;
};

export default UnderlineBrackets;
