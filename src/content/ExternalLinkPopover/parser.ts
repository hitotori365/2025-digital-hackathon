/**
 * law_full_text（JSON形式）のノードを DOM 要素に変換する再帰関数
 */
export function renderLawNode(node: any): Node {
  if (typeof node === "string") {
    return document.createTextNode(node);
  }

  const { tag, children = [] } = node;
  let el: HTMLElement;

  // タグごとに要素とクラスを割り当てる
  switch (tag) {
    case "LawTitle":
    case "PartTitle":
    case "ChapterTitle":
    case "SectionTitle":
    case "SubsectionTitle":
    case "ArticleTitle":
      el = document.createElement("div");
      el.className = "title";
      break;
    case "Article":
      el = document.createElement("div");
      el.className = "article";
      break;
    case "Paragraph":
      el = document.createElement("p");
      el.className = "paragraph";
      break;
    case "Item":
      el = document.createElement("div");
      el.className = "item";
      break;
    case "Sentence":
      el = document.createElement("span");
      el.className = "sentence";
      break;
    default:
      el = document.createElement("div");
      break;
  }

  // 子要素を再帰的に生成して追加
  children.forEach((child: any) => {
    el.appendChild(renderLawNode(child));
  });

  return el;
}

/**
 * law_full_text の JSON オブジェクトを読みやすい形式（DOM要素）に変換する
 */
export function renderLawFullText(lawFullText: any): HTMLElement {
  // ルート要素として DocumentFragment を利用してからラッパーにする方法も可能
  const container = document.createElement("div");
  container.appendChild(renderLawNode(lawFullText));
  return container;
}
