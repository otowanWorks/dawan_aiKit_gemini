// グローバル変数
var isThinking = false;
var LIVE_OWNER_ID = createUuid();
var recognition = null;
var isRecording = false;
var wantsToRecord = false;  // ユーザーの録音意図
var isRestarting = false;   // 二重起動防止
var typingGeneration = 0;
var conversationHistory = [];

// UUID生成
function createUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (a) {
        let r = (new Date().getTime() + Math.random() * 16) % 16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 音声入力機能
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.lang = 'ja-JP';
        recognition.continuous = true; // 連続音声認識をオンにする
        recognition.interimResults = true;

        recognition.onstart = function() {
            isRecording = true;
            const voiceButton = document.getElementById('voiceButton');
            voiceButton.classList.add('recording');
            voiceButton.textContent = '🔴';
            document.getElementById('utterance').placeholder = '音声を認識中... (ボタンを押して停止)';
        };

        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('utterance').value = transcript;

            // 末尾が「どうぞ」なら自動送信
            if (transcript.trimEnd().endsWith('どうぞ')) {
                const cleanMessage = transcript.trimEnd().slice(0, -3).trimEnd();
                document.getElementById('utterance').value = cleanMessage;
                wantsToRecord = false;
                stopVoiceRecording();
                recognition.stop();
                onClickSend();
            }
        };

        recognition.onend = function() {
            isRecording = false;
            // wantsToRecordがtrueなら再起動を試みる
            if (wantsToRecord && !isRestarting) {
                isRestarting = true;
                setTimeout(() => {
                    isRestarting = false;
                    if (wantsToRecord && !isRecording) {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.log('音声認識の再開に失敗:', e);
                        }
                    }
                }, 300);
            }
        };

        recognition.onerror = function(event) {
            console.error('音声認識エラー:', event.error);
            // マイク拒否のみ停止。それ以外はonendで再起動に任せる
            if (event.error === 'not-allowed') {
                const userCommentElement = document.querySelector("#userComment");
                userCommentElement.textContent = 'マイクの使用が許可されていません。ブラウザの設定を確認してください。';
                wantsToRecord = false;
                stopVoiceRecording();
            }
        };

        return true;
    } else {
        console.warn('このブラウザは音声認識をサポートしていません');
        return false;
    }
}

// 音声録音を停止する関数
function stopVoiceRecording() {
    isRecording = false;
    wantsToRecord = false;
    const voiceButton = document.getElementById('voiceButton');
    voiceButton.classList.remove('recording');
    voiceButton.textContent = '🎤';
    document.getElementById('utterance').placeholder = 'メッセージを入力してください...';
}

// 音声入力の開始/停止
function toggleVoiceInput() {
    if (!recognition) {
        const userCommentElement = document.querySelector("#userComment");
        userCommentElement.textContent = 'このブラウザは音声認識をサポートしていません';
        return;
    }

    if (wantsToRecord) {
        // 手動停止
        wantsToRecord = false;
        stopVoiceRecording();
        recognition.stop();
    } else {
        // 開始
        wantsToRecord = true;
        try {
            recognition.start();
        } catch (e) {
            console.error('音声認識の開始に失敗:', e);
            wantsToRecord = false;
        }
    }
}

// タイプライター効果
function startTyping(param) {
    typingGeneration++;
    const myGen = typingGeneration;

    let el = document.querySelector(param.el);
    el.textContent = "";
    el.classList.add('typing-cursor');

    let speed = param.speed;
    let string = param.string;
    let index = 0;

    const typeChar = () => {
        if (myGen !== typingGeneration) return; // 新しい呼び出しがあればキャンセル

        if (index < string.length) {
            el.textContent = string.substring(0, index + 1);
            index++;
            if (typeof playTypeSound === 'function' && index % 4 === 0) playTypeSound();

            // AIレスポンスボックスを最下部にスクロール
            const aiResponseBox = document.querySelector('.aiResponseBox');
            if (aiResponseBox) {
                aiResponseBox.scrollTop = aiResponseBox.scrollHeight;
            }

            setTimeout(typeChar, speed);
        } else {
            el.classList.remove('typing-cursor');

            // タイピング完了後も最下部にスクロール
            const aiResponseBox = document.querySelector('.aiResponseBox');
            if (aiResponseBox) {
                aiResponseBox.scrollTop = aiResponseBox.scrollHeight;
            }

            if (typeof param.onComplete === 'function') param.onComplete();
        }
    };

    typeChar();
}

// だわんのシステムプロンプト（prompt.js の DAWAN_SYSTEM_PROMPT を参照）
function buildSystemPrompt() {
    return DAWAN_SYSTEM_PROMPT;
}

// Gemini APIからレスポンスを取得
async function getGeminiResponse(utterance) {
    conversationHistory.push({ role: 'user', parts: [{ text: utterance }] });

    // ナレッジ検索して関連データをプロンプトに追加
    const knowledgeContext = (typeof searchKnowledge === 'function') ? searchKnowledge(utterance) : '';
    const systemPrompt = buildSystemPrompt()
        + (knowledgeContext ? '\n\n# 参考ナレッジ（関連する場合は積極的に活用してください）\n' + knowledgeContext : '');

    const requestBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: conversationHistory,
        generationConfig: { temperature: 0.9, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } }
    };

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content = await response.json();
        const replyText = content.candidates[0].content.parts[0].text;

        conversationHistory.push({ role: 'model', parts: [{ text: replyText }] });

        // 会話履歴が長くなりすぎないよう20件に制限
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        return replyText;
    } catch (error) {
        console.error('Gemini API Error:', error);
        conversationHistory.pop();
        return 'すみません、少し調子が悪いみたいです。もう一度試してくださいね。';
    }
}

// 文章整形
function formatResponse(text) {
    return text
        .replace(/([。！？])/g, '$1\n')
        .replace(/\n{3,}/g, '\n\n')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();
}

// コメント処理
async function handleComment(comment, username) {
    if (isThinking) return;

    isThinking = true;
    const sendButton = document.getElementById('sendButton');
    const voiceButton = document.getElementById('voiceButton');
    const utteranceInput = document.getElementById('utterance');
    const userCommentElement = document.querySelector("#userComment");

    sendButton.disabled = true;
    sendButton.innerHTML = '<div class="loading"></div>';
    voiceButton.disabled = true;
    utteranceInput.disabled = true;
    userCommentElement.textContent = username + ": " + comment;

    // キーワードに基づいて適切な画像を選択
    const selectedImage = getImageForComment(comment);
    changeCharacterImage(selectedImage);

    document.querySelector("#aiResponseUtterance").textContent = "そうだワンね...";

    function reEnableInput() {
        isThinking = false;
        sendButton.disabled = false;
        sendButton.textContent = '送信';
        voiceButton.disabled = false;
        utteranceInput.disabled = false;
    }

    try {
        const response = await getGeminiResponse(comment);
        const formattedResponse = formatResponse(response);

        // タイプライター効果で表示（開始直後に入力解除して割り込み可能に）
        startTyping({
            el: "#aiResponseUtterance",
            string: formattedResponse,
            speed: 80
        });
        reEnableInput();

    } catch (error) {
        console.error('Error handling comment:', error);
        document.querySelector("#aiResponseUtterance").textContent = 'エラーが発生しました。もう一度お試しください。';
        reEnableInput();
    }
}

// 送信処理
function onClickSend() {
    const utteranceInput = document.querySelector("#utterance");
    const message = utteranceInput.value.trim();

    if (message === '' || isThinking) return;

    if (typeof playSendSound === 'function') playSendSound();
    handleComment(message, 'あなた');
    utteranceInput.value = "";
    utteranceInput.blur();
}

// まばたき機能
const blinkImageMap = {
    "image/character001.png": "image/character001_off.png",
    "image/character004.png": "image/character004_off.png",
    "image/character005.png": "image/character005_off.png"
};
var isBlinking = false;

function blink() {
    const charaImg = document.getElementById("charaImg");
    if (!charaImg) return;

    const offImage = blinkImageMap[currentBaseImage];

    if (!offImage) {
        // まばたき画像がないキャラはタイミングだけ待って次へ
        setTimeout(blink, 3000 + Math.random() * 3000);
        return;
    }

    if (isBlinking) {
        // 目を開ける
        isBlinking = false;
        charaImg.src = currentBaseImage;
        setTimeout(blink, 3000 + Math.random() * 3000);
    } else {
        // 目を閉じる
        isBlinking = true;
        charaImg.src = offImage;
        setTimeout(blink, 100 + Math.random() * 100);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 音声認識の初期化
    const speechSupported = initSpeechRecognition();
    if (!speechSupported) {
        const voiceButton = document.getElementById('voiceButton');
        voiceButton.style.opacity = '0.5';
        voiceButton.title = 'このブラウザは音声認識をサポートしていません';
    }

    // 定型メッセージメニューの初期化
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (typeof PRESET_MESSAGES !== 'undefined' && hamburgerMenu) {
        PRESET_MESSAGES.forEach(message => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.textContent = message;
            menuItem.onclick = function() {
                selectPresetMessage(message);
            };
            hamburgerMenu.appendChild(menuItem);
        });
    }

    // Enterキー送信
    const utteranceInput = document.querySelector("#utterance");
    utteranceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onClickSend();
        }
    });

    // 起動時のランダム挨拶
    if (typeof GREETING_MESSAGES !== 'undefined' && GREETING_MESSAGES.length > 0) {
        const randomGreeting = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
        document.getElementById('aiResponseUtterance').textContent = randomGreeting;
    }

    // 初期フォーカス
    utteranceInput.focus();

    // まばたき開始
    blink();

    // キーボード表示時にBottomBoxを押し上げる（Android Chrome対応）
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function() {
            const keyboardHeight = window.innerHeight - window.visualViewport.height;
            document.querySelector('.bottomBox').style.bottom = keyboardHeight + 'px';
        });
    }
});

// ハンバーガーメニューの開閉
function toggleHamburgerMenu() {
    const menu = document.getElementById('hamburgerMenu');
    menu.classList.toggle('show');
}

// 定型文選択
function selectPresetMessage(message) {
    const utteranceInput = document.getElementById('utterance');
    utteranceInput.value = message;
    utteranceInput.focus();

    // メニューを閉じる
    const menu = document.getElementById('hamburgerMenu');
    menu.classList.remove('show');
}

// メニュー外クリックで閉じる
document.addEventListener('click', function(event) {
    const menu = document.getElementById('hamburgerMenu');
    const menuButton = document.getElementById('menuButton');

    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
        menu.classList.remove('show');
    }
});

