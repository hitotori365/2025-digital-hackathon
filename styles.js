/**
 * 指定したセレクタの要素が見つかるまで待機するquerySelectorAllのラッパー関数
 * @param {string} selector - セレクタ
 * @param {number} delay - ポーリング間隔 (ms)
 * @param {number} maxTimeout - 最大待機時間 (ms)
 */
const querySelectorAllWithDelay = (selector, delay = 1000, maxTimeout = 10000) =>
  new Promise((resolve, reject) => {
    const start = Date.now()
    const poll = () => {
      // 最大待機時間を超えている場合は reject する
      if (Date.now() - start > maxTimeout) {
        reject(new Error(`Timeout: セレクタ "${selector}" の要素が ${maxTimeout}ms 内に見つかりませんでした。`))
        return
      }
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        resolve(elements)
      } else {
        setTimeout(poll, delay)
      }
    }
    poll()
  })

function isParagraph(text) {
  const fullWidthDigitPattern = /[\uFF10-\uFF19]+/
  return fullWidthDigitPattern.test(text)
}

const highlightArticleAndParagraph = async () => {
  try {
    const elements = await querySelectorAllWithDelay('span.paragraphtitle')
    elements.forEach((element) => {
      element.style.color = isParagraph(element.textContent) ? 'orange' : 'red'
    })
  } catch (error) {
    console.error('要素取得に失敗:', error)
  }
}

highlightArticleAndParagraph()
// TODO: カッコを見やすくハイライトなどする
