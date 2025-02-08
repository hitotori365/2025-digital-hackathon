// jest.setup.ts
// ここにテスト実行前に実行するコードを記述できます。
// 例として chrome のグローバルモックを定義する場合：
(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn((keys: string[], callback: (result: any) => void) => {
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
