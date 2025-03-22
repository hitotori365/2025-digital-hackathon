import React, { useEffect } from "react";
import { querySelectorAllWithDelay } from "../utils/utils";
import { debounce, createProcessLock } from "../utils/processControl";

type Abbreviation = {
  term: string; // 略称
  id: string; // 参照先ID（ツールチップで表示する要素）
};

/**
 * 文字列から略称定義を抽出する
 * 例1: 以下〜「○○」という。
 * 例2: 以下〜「○○」と総称する。
 */
const extractAbbreviation = (text: string): string | null => {
  const regex = /以下[\s\S]*?「([^」]+)」/;
  const match = text.match(regex);
  if (!match) return null;
  let abbr = match[1];
  abbr = abbr.replace(/(と(?:する|いう|総称する))$/, "");
  return abbr;
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
 * もし対象の要素に id がなければ、一意な id を付与して返す
 */
const ensureElementId = (element: Element): string => {
  if (element.id) return element.id;
  const newId = `generated-id-${Math.random().toString(36).substr(2, 9)}`;
  element.id = newId;
  return newId;
};

/**
 * テキストノード内の略称をリンクに変換する
 */
const convertToLink = (node: Text, abbreviations: Abbreviation[]) => {
  // 既にリンク (<a> 要素) 内にある場合は変換しない
  if (node.parentElement?.closest("a")) {
    return;
  }
  const container = document.createElement("span");
  const text = node.textContent || "";
  let lastIndex = 0;
  const matches: { index: number; term: string; length: number }[] = [];

  abbreviations.forEach((abbr) => {
    const pattern = new RegExp(abbr.term, "g");
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      matches.push({ index: m.index, term: abbr.term, length: m[0].length });
    }
  });
  matches.sort((a, b) => a.index - b.index);

  matches.forEach((match) => {
    if (match.index < lastIndex) return;
    container.appendChild(
      document.createTextNode(text.slice(lastIndex, match.index))
    );
    const abbr = abbreviations.find((a) => a.term === match.term);
    const link = document.createElement("a");
    // リンク先は対象要素の id（後述の ensureElementId で設定）
    link.href = abbr ? `#${abbr.id}` : "#";
    link.textContent = match.term;
    container.appendChild(link);
    lastIndex = match.index + match.length;
  });

  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
  node.parentNode?.replaceChild(container, node);
};

/**
 * ページ内の略称を処理する
 */
async function processAbbreviations(): Promise<void> {
  try {
    // 対象は <main class="main-content"> 内の全子孫要素
    const elements = await querySelectorAllWithDelay("main.main-content");
    const abbreviations: Abbreviation[] = [];

    elements.forEach((element) => {
      const textNodes = getTextNodes(element);
      textNodes.forEach((node) => {
        const text = node.textContent || "";
        const abbr = extractAbbreviation(text);
        if (abbr) {
          console.log(`Found abbreviation: ${abbr}`);
          const targetEl = node.parentElement;
          if (targetEl) {
            const id = ensureElementId(targetEl);
            console.log(`Using target ID: ${id}`);
            abbreviations.push({ term: abbr, id });
          }
        }
      });
    });
    console.log("Collected abbreviations:", abbreviations);
    if (abbreviations.length === 0) {
      console.log("略称が見つかりませんでした");
      return;
    }
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
    const processLock = createProcessLock();
    const debouncedProcess = debounce(() => {
      processLock(async () => {
        await processAbbreviations();
      });
    }, 100);

    const observer = new MutationObserver((mutations) => {
      // 大量の変更がある場合はスキップ
      if (mutations.length > 100) return;
      debouncedProcess();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};

export default AbbreviationLinker;
