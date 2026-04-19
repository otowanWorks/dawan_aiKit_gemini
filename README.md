# 友達AI「だわん」

> AIの頭脳（Gemini API）に、キャラクターの魂を乗せたHTMLアプリ

犬のキャラクターをモチーフにした、友達感覚で話せるAIフレームです。
キーワードに応じてキャラクターの表情が自動で切り替わり、「感情を動かすAI」「関係性を作るUI」として設計されています。

---

## デモ・関連リンク

- **ランディングページ**：https://chotbotlabo.net/dawan_ai/
- **AIエンジン（Google AI Studio）**：https://aistudio.google.com/

---

## 特徴

- **6種類の表情変化**：入力キーワードに応じてキャラクター画像が自動で切り替わる
- **まばたきアニメーション**：3〜6秒ごとにランダムでまばたき（間隔・速さは変更可）
- **タイプライター表示**：AIの返答が1文字ずつ表示される演出
- **定型メッセージ**：ハンバーガーメニューからよく使うメッセージをワンタップ送信
- **音声入力**：マイクで話しかけてそのまま送信（Vercel版のみ）
- **効果音**：送信音・タイプライター音のオン/オフ切り替え
- **プログラミング不要でカスタマイズ可能**：専用GUIツールでコード生成できる

---

## 必要なもの

### 共通
- [Google AI Studio](https://aistudio.google.com/) のアカウント（無料）
- Gemini APIキー

### ローカル版
- PC（Windows / Mac）
- VSCode（または任意のエディタ）
- ブラウザ（Chrome推奨）

### Vercel版（ネット公開）
- GitHubアカウント
- Vercelアカウント（無料）

---

## フォルダ構成

```
dawan_aiKit_gemini/
├── var_local/    # ローカル版（PC・家族内利用向け）
├── var_vercel/   # Vercel版（インターネット公開向け）
└── README.md
```

---

## セットアップ手順

### ローカル版

1. このリポジトリをダウンロード（ZIP展開 または `git clone`）
2. `var_local/js/api_id.js` を開き、Gemini APIキーを入力

```js
const GEMINI_API_KEY = "ここにAPIキーを入力";
```

3. `var_local/index.html` をブラウザで開く

### Vercel版

1. `var_vercel/` の中身をGitHubリポジトリにアップロード
2. [Vercel](https://vercel.com/) でプロジェクトをインポート
3. **Output Directory** を `.` に設定
4. 環境変数を設定：

| 変数名 | 値 |
|---|---|
| `GEMINI_API_KEY` | GeminiのAPIキー |

5. デプロイ実行

> ⚠️ `api_id.js` にAPIキーを書いたままGitHubに上げないよう注意してください。

---

## カスタマイズ

### 主なカスタマイズ項目

| ファイル | 内容 | 難易度 |
|---|---|---|
| `js/prompt.js` | だわんのキャラクター設定（性格・口調・ルール） | ★☆☆ |
| `js/knowledge.js` | ナレッジデータ（簡易RAG） | ★★☆ |
| `js/greeting.js` | 起動時のあいさつメッセージ | ★☆☆ |
| `js/quick_reply.js` | ハンバーガーメニューの定型メッセージ | ★☆☆ |
| `js/sound.js` | 効果音のオン/オフ | ★☆☆ |
| `js/keyword.js` | キーワード→表情の対応設定 | ★★☆ |
| `js/script.js` | タイプライター速度・まばたき間隔など | ★★☆ |
| `css/style.css` | 背景色・背景画像・フォントサイズなど | ★★☆ |
| `image/` | キャラクター画像の差し替え | ★★☆ |

### キャラクターを差し替える

`image/` フォルダの画像ファイルを自分のキャラクター画像に差し替えるだけで、
まったく別のAIフレームとして転用できます。
（ソースコードはMITライセンスのため商用利用も可能です）

---

## 音声入力について（Vercel版）

音声入力にはブラウザの音声認識機能（Web Speech API）を使用しています。
無音状態が続くと認識が自動終了します。これはブラウザ間の互換性を確保するために
「1発話ごとに認識を完結させる」方式を意図的に採用しているためです。

だわんは「気軽にひとこと話しかけるAI」として設計されています。音声入力も長文の正確な入力よりも、
短いひとことや日常会話での利用を想定しており、この仕様はだわんの用途と合致しています。

---

## ライセンス

### ソースコード
[MIT License](LICENSE) — 無償利用・商用利用・改変・再配布すべて可能です。

```
MIT License

Copyright (c) 2025 オトーワン

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### キャラクター「だわん」
著作権は作者（オトーワン）に帰属します。

| 利用 | 可否 |
|---|---|
| 個人利用・雑談・癒しなど | ✅ OK |
| SNS・ブログでの紹介 | ✅ OK |
| カスタマイズして自分用AIとして利用 | ✅ OK |
| キャラクター画像の再配布・商品化 | ❌ NG |
| だわんキャラクターのままでの商用利用 | ❌ NG（要相談） |

> 自分のキャラクター画像に差し替えれば、商用利用を含めて自由に使えます。

---

## 免責事項

- 本プロジェクトは「現状有姿」で提供されます。動作保証は行いません。
- 不具合・サービス停止が発生する可能性があります。
- AIの応答内容の正確性は保証されません。
- 本プロジェクトの利用によって発生したいかなる損害についても、作者は責任を負いません。
- だわんはエンターテインメント・雑談を目的としたAIフレームです。医療・カウンセリング・福祉の代替にはなりません。
- AI機能にはGemini APIを使用しています。AIの挙動・データ取り扱いはGoogleの利用規約に準拠します。
- APIキーは利用者自身の責任で管理してください。
- **`api_id.js` にAPIキーを記載したままGitHubなどの公開リポジトリにアップロードすると、第三者にキーが盗まれ、無断利用・不正アクセス・意図しない課金が発生する危険があります。**
- このような情報漏洩によって生じたいかなる損害・不利益についても、作者（オトーワン）は一切の責任を負いません。公開前に必ず `api_id.js` が `.gitignore` に含まれていることを確認してください。
- 本プロジェクトに対するサポートは原則行いません。

---

## 制作者

**オトーワン**
X（Twitter）：[@otousan19](https://x.com/otousan19)
note：[oto_wan_ai](https://note.com/oto_wan_ai)
