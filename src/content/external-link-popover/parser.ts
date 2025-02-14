/**
 * law_full_text（JSON形式） をテキスト化するための再帰関数
 */
export function parseLawNode(node: any, depth: number = 0): string {
  // node が文字列なら、そのまま返す
  if (typeof node === "string") {
    return node;
  }

  // node がオブジェクトの場合、tag や attr, children を取得
  const { tag, attr, children = [] } = node;

  let prefix = "";
  let suffix = "";

  switch (tag) {
    case "LawTitle":
    case "PartTitle":
    case "ChapterTitle":
    case "SectionTitle":
    case "SubsectionTitle":
    case "ArticleTitle":
      prefix = "\n\n";
      suffix = "\n";
      break;
    case "Article":
      prefix = "\n";
      suffix = "\n";
      break;
    case "Paragraph":
      prefix = "\n";
      suffix = "\n";
      break;
    case "Item":
      prefix = "\n  ・";
      break;
    case "Sentence":
      break;
    default:
      break;
  }

  // children を再帰的にパースし、連結
  let content = children
    .map((child: any) => parseLawNode(child, depth + 1))
    .join("");

  // 必要に応じて、タグが "ArticleTitle" のときに記事番号を付けるなど拡張可能
  //  例: if (tag === "ArticleTitle") { content = `【${content}】`; }

  return prefix + content + suffix;
}

/**
 * law_full_text のオブジェクト（JSON）をまとめてテキスト化
 */
export function parseLawFullText(lawFullText: any): string {
  return parseLawNode(lawFullText);
}

/**
 * フラグメント文字列(#以降) → 法令APIの elm (例: MainProvision-Article_36) へ変換
 * 例:
 *   "#Mp-Pa_1-Ch_3-Se_1-At_36-Pr_1"
 *   => "MainProvision-Part_1-Chapter_3-Section_1-Article_36-Paragraph_1"
 */
export function fragmentToElm(fragment: string): string | null {
  // 先頭に # があれば除去
  const frag = fragment.replace(/^#/, "");

  const mapping: Record<string, string> = {
    Mp: "MainProvision",
    Sp: "SupplProvision",
    Pa: "Part",
    Ch: "Chapter",
    Se: "Section",
    Su: "Subsection",
    Di: "Division",
    At: "Article",
    Pr: "Paragraph",
  };

  const parts = frag.split("-");
  if (!parts.length) return null;

  // MainProvision or SupplProvision の処理
  const root = parts[0];
  let resultArray: string[] = [];
  if (root === "Mp") {
    resultArray.push("MainProvision");
  } else if (root === "Sp") {
    resultArray.push("SupplProvision");
  } else {
    console.warn("Unknown fragment root:", root);
    return null;
  }

  for (let i = 1; i < parts.length; i++) {
    const seg = parts[i];
    const [code, num] = seg.split("_");
    const mapped = mapping[code];
    if (!mapped) {
      console.warn("Unknown segment code:", code);
      return null;
    }
    resultArray.push(`${mapped}_${num}`);
  }

  return resultArray.join("-");
}
