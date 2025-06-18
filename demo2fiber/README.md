# Frontier Demo

## 主な機能一覧
1. **3Dキャラクターのロードとアニメーション再生**
    - キャラクターおよびそのアニメーションファイル(FBX形式)を読み込み、表示。
    - 再生速度の変更スライダー、停止・再開ボタン機能を提供。

2. **フォースプレートデータの解析・可視化**
    - CSVデータのロード後、フォースプレートからの力や位置のベクトル表示。
    - 複数のフォースプレートデータに対応。

3. **3D環境のカスタマイズ**
    - カメラの自動回転やスケルトン構造の表示切り替え。

4. **グラフデータの出力と表示**
    - 任意のデータ（フォースプレートor骨格アニメーション）に基づいたグラフ作成とリアルタイム追跡。
    - 角速度の有無を選択可能。

## アプリケーションの起動とUI概要
アプリを起動すると、次のような構成で画面が表示されます。
1. **メイン3Dビュー（Canvasエリア）**
    - 3Dキャラクター、フォースプレート、ベクトル矢印データなどが表示されます。
    - `OrbitControls` により、ドラッグでカメラを操作可能（ズーム・回転対応）。
    - `Shift + ドラッグ` で3Dビュー内のオブジェクトを平行移動（パン操作）が可能。
    - `スクロール` でズームイン/ズームアウトも対応。

2. **グラフエリア**
    - 選択したデータ（例: 力, 位置, アニメーションのトラックデータ）をリアルタイムで可視化。
    - グラフエリアにも`スクロール` でズームイン/ズームアウトも対応。

3. **コントロールパネル**
    - データの選択、再生速度の調整、アニメーションスケルトンや角速度表示のON/OFFボタンなどが並びます。

4. **データアップロードのモーダル画面**
    - キャラクターデータやフォースプレートデータのアップロード用インターフェース。

### **1. ファイルの読み込み**
#### 1.1 FBXファイル（キャラクターまたはトラックデータ）のアップロード
1. **モーダルを開く**：
    - 「📂 データファイルを読み込む」ボタンを押します。

2. **キャラクター/トラックデータのロード**：
    - ローカルで起動する場合、指定されたURL（例: `f2.fbx`や`binaryMotiveData.fbx`）から自動的にデータを取得します。
    - URLから読み込めない場合は、ローカルデバイスの`.fbx`ファイルを選択。

#### 1.2 フォースプレートのCSVファイルアップロード
1. **自動読み込み（現在ローカルで起動する場合のみ）**：
    - ローカルで起動する場合、アプリ起動時に`pressure.csv`を読み込んでデータをロードします。

2. **手動アップロード**：
    - モーダル内からローカルのCSVファイルを選択。

### **2. 3Dモデル操作とカメラ制御**
#### 2.1 モデルの操作
- **キャラクター表示**：
    - 読み込んだキャラクターを表示。
    - アニメーション再生が可能。

- **スケルトンの表示**：
    - 「スケルトンを表示」チェックボックスで有効化します。

#### 2.2 カメラ制御
- **マニュアル操作**：
    - マウスの左クリック＆ドラッグで視点の回転、スクロールでズームイン/アウト。

- **自動回転**：
    - 「自動回転」チェックボックスを有効にすると、カメラが自動的に対象を回転。

### **3. フォースプレートデータの解析**
#### 3.1 データ表示
- 「フォースプレート 力」ボタンを押して、各フォースプレートの"力の大きさ"を表示。
- 「フォースプレート 位置」ボタンを押して、各フォースプレートで得られた座標データを可視化。

#### 3.2 ベクトル矢印の表示設定
- ベクトルスケール（矢印の長さ）を指定：**`forcePlateVectorDisplayScale`を調整**。
- 再ビルド、デプロイは必要です。

### **4. アニメーション制御**
#### 4.1 再生コントロール
- 再生速度：
    - スライダーを動かし速度調整。
    - 現在の速度は `現在再生速度` に表示。

- 再生ボタン：
    - `▶`：再生。
    - `⏸`：一時停止。
    - `◀`：逆再生。

#### 4.2 トラックデータの表示
- 骨格アニメーションのトラックデータ（例: ポーズ、回転データ）をボタンから選択して、グラフ化。

### **Q&A：よくある質問**
**Q1: CSVデータが読み込めない場合、どうすればいいですか？**
- モーダルを開き、ローカルの`.csv`ファイルを手動でアップロードしてください。

**Q2: FBXファイルロードが失敗しました。修正できますか？**
- 自動ロードに失敗した場合は、同じモーダルでローカル`fbx`ファイルを選択してください。

**Q3: 角速度やスケルトンの動きも解析可能ですか？**
- 「角速度を表示」「スケルトンを表示」のチェックボックスで可視化可能です。

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
