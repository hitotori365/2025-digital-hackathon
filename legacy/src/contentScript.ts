/**
 * 指定した DOM ツリー内で、キーワードのすべての出現箇所をハイライト
 */
export function highlightOccurrences(root: HTMLElement, keyword: string): void {
  if (!keyword) return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const index = node.nodeValue?.indexOf(keyword) ?? -1
    if (index >= 0) {
      const parent = node.parentNode
      if (!parent) continue

      // キーワード部分を強調表示する span 要素を作成
      const span = document.createElement('span')
      span.textContent = keyword
      span.style.backgroundColor = 'yellow'
      span.classList.add('my-highlighted-text')

      // キーワードより前のテキスト部分と、後ろのテキスト部分をそれぞれテキストノードとして生成
      const before = document.createTextNode(node.nodeValue!.slice(0, index))
      const after = document.createTextNode(node.nodeValue!.slice(index + keyword.length))

      // 親要素内で、元のテキストノードを「before」「ハイライトされた span」「after」の順に挿入
      parent.insertBefore(before, node)
      parent.insertBefore(span, node)
      parent.insertBefore(after, node)
      parent.removeChild(node)
    }
  }
}

/**
 * Chrome のローカルストレージからハイライト対象の文字列を取得し、ページ内の該当箇所をハイライト
 */
function initHighlight(): void {
  chrome.storage.local.get(['highlights'], (res: { highlights?: Record<string, any> }) => {
    const currentUrl = window.location.href
    const allData = res.highlights || {}
    const highlightsForThisUrl = allData[currentUrl] || []
    highlightsForThisUrl.forEach((text: string) => {
      highlightOccurrences(document.body, text)
    })
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHighlight)
} else {
  initHighlight()
}
