/**
 * 指定したセレクタの要素が見つかるまで待機するquerySelectorAllのラッパー関数
 * @param {string} selector - セレクタ
 * @param {number} delay - ポーリング間隔 (ms)
 * @param {number} maxTimeout - 最大待機時間 (ms)
 */
async function querySelectorAllWithDelay(selector, delay = 1000, maxTimeout = 10000) {
  const startTime = Date.now()

  while (true) {
    const elements = document.querySelectorAll(selector)

    if (elements.length > 0) {
      return elements
    }

    // 最大待機時間を超えている場合は reject する
    const elapsed = Date.now() - startTime
    if (elapsed > maxTimeout) {
      throw new Error(`Timeout: セレクタ "${selector}" の要素が ${maxTimeout}ms 内に見つかりませんでした。`)
    }

    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

/**
 * HACK: テキストに全角数字が含まれているかどうかで、段落タイトルであるかどうかを判定している
 * @param {string} text
 * @returns {boolean} 判定結果
 */
function isParagraphTitle(text) {
  const fullWidthDigitPattern = /[\uFF10-\uFF19]+/
  return fullWidthDigitPattern.test(text)
}

const highlightArticleAndParagraph = async () => {
  try {
    const elements = await querySelectorAllWithDelay('span.paragraphtitle')
    elements.forEach((element) => {
      element.style.color = isParagraphTitle(element.textContent) ? 'orange' : 'red'
    })
  } catch (error) {
    console.error('要素取得に失敗:', error)
  }
}

highlightArticleAndParagraph()
