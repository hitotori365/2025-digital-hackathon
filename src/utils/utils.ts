/**
 * 指定したセレクタの要素が見つかるまで待機するquerySelectorAllのラッパー関数
 * @param selector - セレクタ
 * @param delay - ポーリング間隔 (ms)
 * @param maxTimeout - 最大待機時間 (ms)
 */
export async function querySelectorAllWithDelay(
  selector: string,
  delay = 1000,
  maxTimeout = 10000
): Promise<NodeListOf<Element>> {
  const startTime = Date.now();

  while (true) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      return elements;
    }

    const elapsed = Date.now() - startTime;
    if (elapsed > maxTimeout) {
      throw new Error(
        `Timeout: セレクタ "${selector}" の要素が ${maxTimeout}ms 内に見つかりませんでした。`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * law_full_text（JSON形式）をテキスト化するための再帰関数
 */
function parseLawNode(node: any, depth: number = 0): string {
  // 1. もし node が文字列なら、そのまま返す
  if (typeof node === "string") {
    return node;
  }

  // 2. node がオブジェクトの場合、tag や attr, children を取得
  const { tag, attr, children = [] } = node;

  // タグに応じて見出しなどを軽く整形してみる (必要に応じて拡張)
  let prefix = "";
  let suffix = "";

  switch (tag) {
    case "LawTitle":
    case "PartTitle":
    case "ChapterTitle":
    case "SectionTitle":
    case "SubsectionTitle":
    case "ArticleTitle":
      // 見出し系は前後に改行を挟む
      prefix = "\n\n";
      suffix = "\n";
      break;
    case "Article":
      // Article は記事番号を表示させたりもできる (attr.Num)
      // ここでは単純に前後に改行だけ
      prefix = "\n";
      suffix = "\n";
      break;
    case "Paragraph":
      // 段落ごとに改行
      prefix = "\n";
      suffix = "\n";
      break;
    case "Item":
      // 号などを表示
      prefix = "\n  ・";
      break;
    case "Sentence":
      // 文章の続きなのであまり区切らないが、
      // 例として改行入れたい場合は suffix = "\n"; にしても良い
      break;
    default:
      break;
  }

  // 3. children を再帰的にパースし、連結
  let content = children
    .map((child: any) => parseLawNode(child, depth + 1))
    .join("");

  // 4. 必要に応じて、タグが "ArticleTitle" のときに記事番号を付けるなど拡張可能
  //   例: if (tag === "ArticleTitle") { content = `【${content}】`; }

  return prefix + content + suffix;
}

/**
 * law_full_text のオブジェクト（JSON）をまとめてテキスト化
 */
export function parseLawFullText(lawFullText: any): string {
  return parseLawNode(lawFullText);
}
