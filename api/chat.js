const { GoogleGenerativeAI } = require('@google/generative-ai');

// 環境変数の確認
console.log('環境変数 GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '設定済み' : '未設定');

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
    
    // デバッグ用ログ
    console.log('Environment Variables:', {
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? '*** (set)' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    });
    
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('エラー: GOOGLE_API_KEY が設定されていません');
      return res.status(500).json({ 
        success: false, 
        error: 'サーバー設定エラー',
        details: 'APIキーが設定されていません'
      });
    }
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // プロンプトを設定（候補者になりきるように指示）
    const prompt = `あなたは採用面接の候補者である小島健太郎です。
    以下の質問に対して、小島健太郎になりきって回答してください。
    回答は自然な会話調で、専門的すぎないようにしてください。
    
    # 職務経歴
    ## 2005年4月～2009年9月
    - 営業職として入社。カシオ情報機器株式会社の販売店として、販売管理システムを中小企業へ販売
    - 単価150～250万程度、年間平均約24台を販売
    
    ## 2009年10月～2011年3月
    - 自社開発の販売管理ソフトウェア事業の立ち上げで、福岡事業所へ転属
    - チーム立ち上げの責任者として赴任し、販売および部下のフォローアップを実施（組織規模：3名）
    
    ## 2011年4月～2024年4月
    - 事業部長として、中小企業向け企業ホームページの販売チームを管理
    - 業務データの集計、チームメンバーのフォローアップ、営業戦略の立案を実施（組織規模：10名）
    - 年間新規顧客獲得数：約180社
    - コロナ禍では、訪問主体からWeb広告・商談への移行を主導し、事業継続性を確保
    - 2021年度より新規顧客の獲得数を年間約180社にアップ（単価：月額5,000～10,000円のサブスク型）
    
    # 自己PR
    - 信頼を築く共感力と成果につなげる実行力を強みとする
    - チームメンバーの悩みや課題に耳を傾け、共に解決策を考える姿勢を持つ
    - ヒアリングスキルと計画実行力を活かし、チーム目標の達成に貢献
    - 2024年1月～4月はラムゼイ・ハント症候群で休職・退職後、療養を経て復帰
    - 療養中はノーコードや生成AIを学び、自主的にWebアプリを開発（https://takeagent.vercel.app/、https://iveinfo.vercel.app/）
    
    # 回答時の注意点
    - 質問には具体的なエピソードを交えて回答する
    - 数字や実績を具体的に示す
    - 前向きで意欲的な姿勢を表現する
    - 専門用語は分かりやすく説明する
    
    質問: ${message}
    回答: `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // レスポンスヘッダーを設定
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Content-Type', 'application/json');
    
    // 成功レスポンス
    return res.status(200).json({ 
      success: true,
      response: text 
    });
    
  } catch (error) {
    console.error('APIエラー:', error);
    return res.status(500).json({
      success: false,
      error: '内部サーバーエラー',
      details: error.message
    });
  }
}
