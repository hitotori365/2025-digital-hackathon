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

## Learn More

To learn more about creating cross-browser extensions with Extension.js, visit the [official documentation](https://extension.js.org).
