import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../utils/utils";

type Abbreviation = {
  term: string; // 略称
  id: string; // 参照先ID
};

/**
 * 文字列から略称定義を抽出する
 * 例1:以下〜「○○」という。
 * 例2:以下〜「○○」と総称する。
 */
const extractAbbreviation = (text: string): string | null => {
  // 「以下」から始まる部分のうち、引用符「」内の文字列を抽出する
  const regex = /以下[\s\S]*?「([^」]+)」/;
  const match = text.match(regex);
  if (!match) return null;
  let abbr = match[1];
  // 末尾に「とする」「という」「と総称する」があれば削除（末尾以外に現れる場合はそのまま残す）
  abbr = abbr.replace(/(と(?:する|いう|総称する))$/, "");
  return abbr;
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

  // 各略称ごとにマッチ箇所を検索
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
    // 重複する箇所はスキップ
    if (match.index < lastIndex) {
      return;
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
    // .main-content 内の .article 要素全体を対象に（<div>、<article> の両方に対応）
    const elements = await querySelectorAllWithDelay(".main-content .article");
    const abbreviations: Abbreviation[] = [];

    // 各記事内の全テキストノードから略称定義を収集
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

    // 収集した略称を全記事内のテキストノードに適用
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
