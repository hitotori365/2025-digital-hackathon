/**
 * 法令API から指定の法令IDの法令本文を取得する関数
 */
export async function fetcher(lawIdOrNumOrRevisionId: string, elm?: string) {
  // base endpoint: GET /api/2/law_data/{law_id_or_num_or_revision_id}
  const endpoint = `https://laws.e-gov.go.jp/api/2/law_data/${encodeURIComponent(
    lawIdOrNumOrRevisionId
  )}`;

  // クエリパラメータ指定
  const url = new URL(endpoint);
  // レスポンス: JSON
  url.searchParams.set("response_format", "json");
  // law_full_text: JSON形式
  url.searchParams.set("law_full_text_format", "json");
  if (elm) {
    url.searchParams.set("elm", elm);
  }

  try {
    const response = await fetch(url.toString());
    console.log("APIリクエスト:", url.toString());
    if (!response.ok) {
      throw new Error("法令データの取得に失敗しました");
    }
    const json = await response.json();
    console.log("APIレスポンス:", json);
    return json;
  } catch (error) {
    console.error("法令APIの取得エラー:", error);
    throw error;
  }
}
