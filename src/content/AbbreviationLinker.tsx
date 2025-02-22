// AbbreviationLinker.tsx
import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../utils/utils";

type Abbreviation = {
  term: string;    // 略称
  id: string;      // 参照先ID
};

/**
 * 文字列から略称定義を抽出する
 */
const extractAbbreviation = (text: string): string | null => {
  const match = text.match(/以下「([^」]+)」という。/);
  return match ? match[1] : null;
};

/**
 * 要素のIDを再帰的に取得する
 */
const findParentId = (element: Element): string | null => {
  if (!element) return null;
  if (element.id) return element.id;
  return element.parentElement ? findParentId(element.parentElement) : null;
};

/**
 * テキストノードを略称リンクに変換する
 */
const convertToLink = (node: Text, abbreviations: Abbreviation[]) => {
  const container = document.createElement('span');
  let lastIndex = 0;
  const text = node.textContent || '';

  abbreviations.forEach(abbr => {
    const pattern = new RegExp(abbr.term, 'g');
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      // マッチ前のテキストを追加
      container.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

      // リンクを作成
      const link = document.createElement('a');
      link.href = `#${abbr.id}`;
      link.textContent = abbr.term;
      container.appendChild(link);

      lastIndex = pattern.lastIndex;
    }
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
    console.log("processAbbreviations started"); // 追加

    const elements = await querySelectorAllWithDelay("p.sentence");
    console.log("Found elements:", elements.length); // 追加

    const abbreviations: Abbreviation[] = [];

    // 略称を収集
    elements.forEach((element, index) => { // indexを追加
      console.log(`Processing element ${index}:`, element); // 追加
      
      const textNodes = Array.from(element.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE) as Text[];
      
      console.log(`Found ${textNodes.length} text nodes in element ${index}`); // 追加

      textNodes.forEach(node => {
        const text = node.textContent || '';
        console.log(`Checking text:`, text); // 追加
        
        const abbr = extractAbbreviation(text);
        if (abbr) {
          console.log(`Found abbreviation: ${abbr}`); // 追加
          const id = findParentId(element);
          if (id) {
            console.log(`Found ID: ${id}`); // 追加
            abbreviations.push({ term: abbr, id });
          }
        }
      });
    });

    console.log('Found abbreviations:', abbreviations);

    if (abbreviations.length === 0) {
      console.log("No abbreviations found to process"); // 追加
      return;
    }

    // 略称をリンクに変換
    elements.forEach((element, index) => { // indexを追加
      console.log(`Converting links in element ${index}`); // 追加
      
      const textNodes = Array.from(element.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE) as Text[];

      textNodes.forEach(node => {
        convertToLink(node, abbreviations);
      });
    });

    console.log("processAbbreviations completed"); // 追加

  } catch (error) {
    console.error("略称処理に失敗:", error);
  }
}

/**
 * React コンポーネント
 */
const AbbreviationLinker: React.FC = () => {
  useEffect(() => {
    console.log("AbbreviationLinker mounted"); // 追加
    processAbbreviations();
  }, []);

  return null;
};

export default AbbreviationLinker;