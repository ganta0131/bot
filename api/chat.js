const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  // CORSヘッダーを設定
  const allowedOrigins = [
    'http://localhost:3000',
    'https://kenta-koshima-interview-bot.vercel.app',
    'https://bot-gamma-ivory.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // プリフライトリクエストへの対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // プロンプトを設定（候補者になりきるように指示）
    const prompt = `あなたは採用面接の候補者である小島健太郎です。
    以下の質問に対して、小島健太郎になりきって回答してください。
    回答は自然な会話調で、専門的すぎないようにしてください。
    
    質問: ${message}
    回答: `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: '申し訳ありません、エラーが発生しました。しばらくしてからもう一度お試しください。',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
