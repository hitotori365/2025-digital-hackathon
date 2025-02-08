import { highlightOccurrences } from "../src/contentScript";

// Jest のテスト環境で chrome オブジェクトのモックを定義
(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn((keys: string[], callback: (result: any) => void) => {
        // モックとして highlights が空のオブジェクトを返す例
        callback({ highlights: {} });
      }),
      set: jest.fn((data: any, callback?: () => void) => {
        if (callback) callback();
      }),
    },
  },
  runtime: {
    onInstalled: { addListener: jest.fn() },
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: { addListener: jest.fn() },
  },
  scripting: {
    executeScript: jest.fn().mockResolvedValue(undefined),
  },
};

describe("highlightOccurrences", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
        <div id="container">
          チームこたつみかんが優勝しました！
        </div>
      `;
    container = document.getElementById("container") as HTMLElement;
  });

  test("キーワードが存在する場合、ハイライトされる", () => {
    highlightOccurrences(container, "こたつみかん");
    const highlighted = container.querySelectorAll("span.my-highlighted-text");
    expect(highlighted.length).toBeGreaterThan(0);
    highlighted.forEach((span) => {
      expect(span.textContent).toBe("こたつみかん");
      expect((span as HTMLElement).style.backgroundColor).toBe("yellow");
    });
  });

  test("キーワードが存在しない場合、何もハイライトされない", () => {
    highlightOccurrences(container, "nonexistent");
    const highlighted = container.querySelectorAll("span.my-highlighted-text");
    expect(highlighted.length).toBe(0);
  });

  test("空文字のキーワードの場合、何も処理されない", () => {
    highlightOccurrences(container, "");
    const highlighted = container.querySelectorAll("span.my-highlighted-text");
    expect(highlighted.length).toBe(0);
  });
});
