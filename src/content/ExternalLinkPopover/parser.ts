/**
 * law_full_text（JSON形式） をテキスト化するための再帰関数
 */
export function parseLawNode(node: any, depth: number = 0): string {
  if (typeof node === "string") {
    return node;
  }

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
