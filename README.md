# 2025-digital-hackathon

> An Extension.js example.

## Available Scripts

### インストール

プロジェクトに必要な依存関係をインストールするには、次のコマンドを実行します。

```bash
npm install
```

###

In the project directory, you can run the following scripts:

### npm dev

**Development Mode**: This command runs your extension in development mode. It will launch a new browser instance with your extension loaded. The page will automatically reload whenever you make changes to your code, allowing for a smooth development experience.

```bash
npm dev
```

### npm start

**Production Preview**: This command runs your extension in production mode. It will launch a new browser instance with your extension loaded, simulating the environment and behavior of your extension as it will appear once published.

```bash
npm start
```

### npm build

**Build for Production**: このコマンドは、拡張機能を本番環境用にビルドします。拡張機能を最適化およびバンドルし、対象ブラウザのストアへのデプロイに備えます。

**Note**: ビルドを実行する前に、`extension`パッケージがグローバルにインストールされていることを確認してください。まだインストールされていない場合は、次のコマンドを実行してください: `npm install -g extension`

```bash
npm build
```

### Chrome拡張のローカル環境実行
1. Chromeブラウザを開き、URL欄に```chrome://extensions/```を入力して遷移
2. "パッケージ化されていない拡張機能を読み込む"ボタンを押下
3. ```dist/chrome```を選択
4. [e-Gov法令検索](https://laws.e-gov.go.jp/)で法令を開く

## Learn More

To learn more about creating cross-browser extensions with Extension.js, visit the [official documentation](https://extension.js.org).
