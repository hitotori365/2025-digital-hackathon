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
    { color: 'rgba(255, 255, 0, 0.3)', depth: 1 },
    { color: 'rgba(255, 255, 0, 0.6)', depth: 2 },
    { color: 'rgba(255, 255, 0, 0.9)', depth: 3 },
  ] as BracketStyle[],
  maxDepth: 3,
};


/**
 * テキストを解析して括弧の深さと位置を分析する
 */
const analyzeBrackets = (text: string): {
  segments: TextSegment[],
  errors: string[]
} => {
  let depth = 0;
  let currentSegment = '';
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

    if (char === '（') {
      // 現在のセグメントを追加
      addSegment(currentSegment, depth, depth > STYLES.maxDepth);
      currentSegment = char;
      depth++;
      openBrackets.push(i);

      if (depth > STYLES.maxDepth) {
        errors.push(`括弧の深さが最大値(${STYLES.maxDepth})を超えています。位置: ${i}`);
      }
    } else if (char === '）') {
      currentSegment += char;
      if (depth === 0) {
        errors.push(`閉じ括弧が多すぎます。位置: ${i}`);
      } else {
        openBrackets.pop();
      }

      addSegment(currentSegment, depth, depth > STYLES.maxDepth);
      currentSegment = '';
      depth = Math.max(0, depth - 1);
    } else {
      currentSegment += char;
    }
  }

  // 残りのテキストを追加
  addSegment(currentSegment, depth, depth > STYLES.maxDepth);

  // 閉じられていない括弧のチェック
  if (openBrackets.length > 0) {
    errors.push(`閉じられていない括弧があります。位置: ${openBrackets.join(', ')}`);
  }

  return { segments, errors };
};

// 括弧の深さに応じた色を取得する関数
const getBracketColor = (depth: number): string => {
  if (depth <= 0) return '';
  if (depth > STYLES.maxDepth) return STYLES.brackets[STYLES.brackets.length - 1].color;
  return STYLES.brackets[depth - 1].color;
};

/**
 * セグメントをHTML要素に変換する
 */
const renderSegment = (segment: TextSegment): string => {
  if (segment.depth === 0) return segment.text;

  const style = getBracketColor(segment.depth);
  return `<span style="background-color: ${style}">${segment.text}</span>`;
};

/**
 * 括弧とその中身をハイライトする関数
 */
async function highlightBrackets() {
  try {
    const elements = await querySelectorAllWithDelay("p.sentence");
    console.log("テキスト要素数:", elements.length);

    elements.forEach((element) => {
      const text = element.innerHTML;
      if (!text || (!text.includes("（") && !text.includes("）"))) return;

      const { segments, errors } = analyzeBrackets(text);

      // エラーがある場合は警告を表示
      if (errors.length > 0) {
        console.warn(errors);
        element.setAttribute('title', errors.join('\n'));
        element.classList.add('bracket-error');
      }

      // セグメントをレンダリング
      element.innerHTML = segments.map(renderSegment).join('');
    });
  } catch (error) {
    console.error("要素取得に失敗:", error);
  }
}

/**
 * React コンポーネント
 */
const HighlightBrackets: React.FC = () => {
  useEffect(() => {
    highlightBrackets();
  }, []);

  return null;
};

export default HighlightBrackets;