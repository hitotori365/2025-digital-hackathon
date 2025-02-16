const cacheMap = new Map<string, any>();

/**
 * 法令API から指定の法令IDの法令本文を取得する関数
 */
export async function fetchLawData(
  lawIdOrNumOrRevisionId: string,
  elm?: string
) {
  const endpoint = `https://laws.e-gov.go.jp/api/2/law_data/${encodeURIComponent(
    lawIdOrNumOrRevisionId
  )}`;

  const url = new URL(endpoint);
  url.searchParams.set("response_format", "json");
  url.searchParams.set("law_full_text_format", "json");

  if (elm) {
    url.searchParams.set("elm", elm);
  }

  try {
    // HACK:
    // fetchのレイテンシーが気になる & ユーザーが再度開くケースも多そうなのでキャッシュする
    // 法令APIの仕様上 no-store が指定されているためクライアント側での簡易的なキャッシュだけ行う
    // Tanstack Queryのようなライブラリを使う方がベターだが、今回は簡易的にMapで実装
    if (cacheMap.has(url.toString())) {
      return cacheMap.get(url.toString());
    }

    const response = await fetch(url.toString());
    const json = await response.json();
    cacheMap.set(url.toString(), json);

    return json;
  } catch (error) {
    throw error;
  }
}
