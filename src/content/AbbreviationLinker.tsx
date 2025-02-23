import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../utils/utils";

type Abbreviation = {
  term: string; // 略称
  id: string; // 参照先ID
};

/**
 * 文字列から略称定義を抽出する
 * 例：～以下「○○」という。
 */
const extractAbbreviation = (text: string): string | null => {
  const match = text.match(/以下「([^」]+)」という。/);
  return match ? match[1] : null;
};

/**
 * 要素のIDを再帰的に取得する
 */
const findParentId = (element: Element): string | null => {
  if (element.id) return element.id;
  return element.parentElement ? findParentId(element.parentElement) : null;
};

/**
 * 指定ノード以下のすべてのテキストノードを再帰的に取得する
 */
const getTextNodes = (node: Node): Text[] => {
  let texts: Text[] = [];
  if (node.nodeType === Node.TEXT_NODE) {
    texts.push(node as Text);
  } else {
    node.childNodes.forEach((child) => {
      texts = texts.concat(getTextNodes(child));
    });
  }
  return texts;
};

/**
 * テキストノード内の略称をリンクに変換する
 */
const convertToLink = (node: Text, abbreviations: Abbreviation[]) => {
  const container = document.createElement("span");
  const text = node.textContent || "";
  let lastIndex = 0;

  // 各略称ごとにマッチ箇所を検索（複数略称が同一ノード内にある場合にも対応）
  // ※複数パターンが混在する場合、処理順序に注意が必要です
  // ここでは全略称について、テキスト全体を走査する方法を採用
  const matches: { index: number; term: string; length: number }[] = [];
  abbreviations.forEach((abbr) => {
    const pattern = new RegExp(abbr.term, "g");
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      matches.push({ index: m.index, term: abbr.term, length: m[0].length });
    }
  });
  // マッチ箇所でインデックス順にソート
  matches.sort((a, b) => a.index - b.index);

  matches.forEach((match) => {
    if (match.index < lastIndex) {
      return; // すでに置換済みの部分はスキップ
    }
    // マッチ前のテキストを追加
    container.appendChild(
      document.createTextNode(text.slice(lastIndex, match.index))
    );
    // 対応する略称のIDを取得
    const abbr = abbreviations.find((a) => a.term === match.term);
    const link = document.createElement("a");
    link.href = abbr ? `#${abbr.id}` : "#";
    link.textContent = match.term;
    container.appendChild(link);
    lastIndex = match.index + match.length;
  });

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
  node.parentNode?.replaceChild(container, node);
};

/**
 * ページ内の略称を処理する
 */
async function processAbbreviations() {
  try {
    // .article クラスを持つ要素全体を対象に（<div>、<article>の両方に対応）
    const elements = await querySelectorAllWithDelay(".article");
    const abbreviations: Abbreviation[] = [];

    // 各記事内のすべてのテキストノードから略称定義を収集
    elements.forEach((element) => {
      const textNodes = getTextNodes(element);
      textNodes.forEach((node) => {
        const text = node.textContent || "";
        const abbr = extractAbbreviation(text);
        if (abbr) {
          console.log(`Found abbreviation: ${abbr}`);
          const id = findParentId(element);
          if (id) {
            console.log(`Found ID: ${id}`);
            abbreviations.push({ term: abbr, id });
          }
        }
      });
    });

    if (abbreviations.length === 0) return;

    // 収集した略称をすべての記事内のテキストノードに適用
    elements.forEach((element) => {
      const textNodes = getTextNodes(element);
      textNodes.forEach((node) => {
        convertToLink(node, abbreviations);
      });
    });
  } catch (error) {
    console.error("略称処理に失敗:", error);
  }
}

const AbbreviationLinker: React.FC = () => {
  useEffect(() => {
    processAbbreviations();
  }, []);
  return null;
};

export default AbbreviationLinker;
