// Vercelサーバーレス関数 - Gemini APIキー隠蔽用
export default async function handler(req, res) {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { contents, systemPrompt } = req.body;

        if (!contents || !Array.isArray(contents) || contents.length === 0) {
            return res.status(400).json({ error: 'contents is required' });
        }

        // 環境変数からAPIキーを取得
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error('Missing GEMINI_API_KEY environment variable');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const requestBody = {
            system_instruction: { parts: [{ text: systemPrompt || '' }] },
            contents: contents,
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 2048,
                thinkingConfig: { thinkingBudget: 0 }
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            console.error(`Gemini API error: ${response.status}`);
            return res.status(500).json({ error: 'AI service temporarily unavailable' });
        }

        const content = await response.json();
        const replyText = content.candidates[0].content.parts[0].text;

        return res.status(200).json({ response: replyText });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
