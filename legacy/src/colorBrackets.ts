// src/colorBrackets.ts

/**
 * 指定したセレクタの要素が見つかるまで待機するquerySelectorAllのラッパー関数
 * @param {string} selector - セレクタ
 * @param {number} delay - ポーリング間隔 (ms)
 * @param {number} maxTimeout - 最大待機時間 (ms)
 */
async function querySelectorAllWithDelay(
  selector: string,
  delay = 1000,
  maxTimeout = 10000,
): Promise<NodeListOf<Element>> {
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
 * 括弧をハイライトする関数
 */
const highlightBrackets = async () => {
  try {
    // p.sentence要素を待機して取得
    const elements = await querySelectorAllWithDelay('p.sentence')
    console.log('テキスト要素数:', elements.length)

    elements.forEach((element) => {
      const text = element.textContent
      if (text && (text.includes('（') || text.includes('）'))) {
        element.innerHTML = element.innerHTML.replace(/([（）])/g, '<span style="background-color: yellow">$1</span>')
      }
    })
  } catch (error) {
    console.error('要素取得に失敗:', error)
  }
}

// 実行
highlightBrackets()
