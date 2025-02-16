/**
 * e-govページのタグ名と法令APIの `elm` パラメータ形式のマッピング
 * ref: https://laws.e-gov.go.jp/docs/law-data-basic/419a603-xml-schema-for-japanese-law/
 */
const MAPPING_TAG_ELM: Record<string, string> = {
  Law: "Law",
  ES: "EnactStatement",
  Prmb: "Preamble",
  Mp: "MainProvision",
  Sp: "SupplProvision",
  Ss: "Subsection",

  // 条文階層（構造的指定: 「_番号」形式）
  Pa: "Part",
  PaT: "PartTitle",
  Ch: "Chapter",
  ChT: "ChapterTitle",
  Se: "Section",
  SeT: "SectionTitle",
  Su: "Subsection",
  SuT: "SubsectionTitle",
  Di: "Division",
  DiT: "DivisionTitle",
  At: "Article",
  AtT: "ArticleTitle",
  AtC: "ArticleCaption",
  Pr: "Paragraph",
  PrC: "ParagraphCaption",
  PrN: "ParagraphNum",
  PrS: "ParagraphSentence",

  // 補足・改正系
  SpN: "SupplNote",
  AmdP: "AmendProvision",
  AmdPS: "AmendProvisionSentence",
  NwP: "NewProvision",
  Cl: "Class",
  ClT: "ClassTitle",
  ClS: "ClassSentence",

  // 号
  It: "Item",
  ItT: "ItemTitle",
  ItS: "ItemSentence",

  // 号の細分（Subitem1～Subitem10）
  Si1: "Subitem1",
  Si1T: "Subitem1Title",
  Si1S: "Subitem1Sentence",
  Si2: "Subitem2",
  Si2T: "Subitem2Title",
  Si2S: "Subitem2Sentence",
  Si3: "Subitem3",
  Si3T: "Subitem3Title",
  Si3S: "Subitem3Sentence",
  Si4: "Subitem4",
  Si4T: "Subitem4Title",
  Si4S: "Subitem4Sentence",
  Si5: "Subitem5",
  Si5T: "Subitem5Title",
  Si5S: "Subitem5Sentence",
  Si6: "Subitem6",
  Si6T: "Subitem6Title",
  Si6S: "Subitem6Sentence",
  Si7: "Subitem7",
  Si7T: "Subitem7Title",
  Si7S: "Subitem7Sentence",
  Si8: "Subitem8",
  Si8T: "Subitem8Title",
  Si8S: "Subitem8Sentence",
  Si9: "Subitem9",
  Si9T: "Subitem9Title",
  Si9S: "Subitem9Sentence",
  Si10: "Subitem10",
  Si10T: "Subitem10Title",
  Si10S: "Subitem10Sentence",

  // 付属文書・アペンディクス系
  ApT: "AppdxTable",
  ApTT: "AppdxTableTitle",
  ApN: "AppdxNote",
  ApNT: "AppdxNoteTitle",
  ApS: "AppdxStyle",
  ApST: "AppdxStyleTitle",
  ApF: "AppdxFormat",
  ApFT: "AppdxFormatTitle",
  Ap: "Appdx",
  AFN: "ArithFormulaNum",
  AF: "ArithFormula",
  ApFi: "AppdxFig",
  ApFiT: "AppdxFigTitle",

  // 表・図等（通常内部指定）
  TbSt: "TableStruct",
  TbStT: "TableStructTitle",
  Tb: "Table",
  TbR: "TableRow",
  TbHR: "TableHeaderRow",
  TbHC: "TableHeaderColumn",
  TbC: "TableColumn",
  FgSt: "FigStruct",
  FgStT: "FigStructTitle",
  Fg: "Fig",

  // その他（例：Remarks, Ruby, など）
  Rm: "Remarks",
  RmL: "RemarksLabel",
  Qs: "QuoteStruct",
  Rb: "Ruby",
  Rt: "Rt",
  LnEl: "Line",
  SupEl: "Sup",
  SubEl: "Sub",
} as const;

/**
 * フラグメント文字列 (#～) を法令APIの `elm` パラメータ形式へ変換する
 *
 * 例:
 *   #Mp-Pa_1-Ch_3-Se_1-At_36-Pr_1
 *     => MainProvision-Part_1-Chapter_3-Section_1-Article_36-Paragraph_1
 *   #Pa_1-Ch_2-At_5
 *     => Part_1-Chapter_2-Article_5
 *   #ES
 *     => EnactStatement
 *   #Prmb-Ch_1
 *     => Preamble-Chapter_1
 */
export function convertFragmentToElm(fragment: string): string | null {
  const frag = fragment.replace(/^#/, "");
  const parts = frag.split("-");
  if (parts.length === 0) return null;

  let resultArray: string[] = [];

  for (const seg of parts) {
    const segParts = seg.split("_");
    const code = segParts[0];
    const mapped = MAPPING_TAG_ELM[code];
    if (!mapped) {
      console.warn("Unknown Segment", code);
      return null;
    }

    // 「_」が2個以上連続している場合、2つ目以降のセグメントは枝刈りする
    if (segParts.length > 2) {
      // WHY:
      // 法令API v2 の仕様上、枝番号は直接指定できないため
      // たとえば、"At_36-Pr_1_2" の場合、At_36-Pr_1までしか指定できす、XMLの構造のレスポンスを取得してから、At_36-Pr_1_2の枝番号の本文はパースして抽出する必要がある
      // パーサーでの処理が複雑になるため、ここでは単純に枝番号以下の文字列を無視することで対応している
      const num = segParts[1];
      resultArray.push(`${mapped}_${num}`);
      break; // 処理を中断し、以降のセグメントは無視する
    } else if (segParts.length === 2) {
      const num = segParts[1];
      resultArray.push(`${mapped}_${num}`);
    } else {
      // アンダースコアがない場合は単にマッピング名のみ
      resultArray.push(mapped);
    }
  }

  return resultArray.join("-");
}
