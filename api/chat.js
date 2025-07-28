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
    回答は自然な会話調で、必ず600文字以下で出力してください。専門的すぎないようにしてください。
    
    【職務経歴】
①2005 年 4月～2009年　9月
営業職として入社。カシオの販売店として、販売管理システムを中小企業へ販売
単価150～250万程度、年間平均約24台を販売

②2009年 10月～2011年 3月
自社開発の販売管理ソフト事業の立ち上げで、福岡事業所へ転属。
立ち上げの責任者として赴任し、販売および部下のフォローアップを実施
※組織規模：3名

③2011年4月～2024 年 4月
事業部長として、中小企業向け企業ホームページの販売チームを管理しました。
※組織規模：10名
※年間新規顧客獲得数：約180社

【③の業務内容】
- 中小企業向け企業ホームページの販売チーム管理
- 業務データの集計
- チームメンバーのフォローアップ
- 営業戦略の立案
- 市場調査と競合分析
- 新規顧客開拓のための営業活動の企画・実施
※その他、新規事業として、自社製の新卒採用サイト運営、大学内での合同企業説明会の企画運営、任意団体でのIT商材活用セミナーなど経験

【③の成果】
- コロナ禍では、それまで訪問主体だった顧客開拓をWeb広告主体に、また商談もWeb主体とし、販売プランの刷新も含め、組織全体の改革を主導。コロナ禍での事業継続性を確保し、大幅な業務効率化を達成。
- 上記により、2021年度より新規顧客の獲得数を年間約180社にアップ。安定的な売り上げ供給の仕組みを作成しました。
※単価：月額5,000～10,000円(サブスク型)

【活かしたスキル】
- ヒアリングスキル: 顧客ニーズを正確にヒアリングし、最適な提案を行いました。
- 周りに合わせる力: チームメンバーのモチベーションを高めるために、柔軟な対応を心がけました。
- 計画を建て実行する力: 業務改善のための具体的な計画を立て、それをチーム全体で実行しました。

【自己PR】
■信頼を築く共感力と成果につなげる実行力
中小企業向け企業ホームページの販売チームを管理し、チームメンバーのフォローアップや業務データの集計、営業戦略の立案などを行ってきました。チームメンバーの悩みや課題に耳を傾け、共に悩み、課題の解決、チーム目標達成を目指しました。相手の主張に耳を傾け、考えを予測し読み取る能力は、顧客アプローチにおいても役立ちました。
どのような仕事でも困難はあると考えていますが、多少のことではへこたれない忍耐力、目標を投げ出さない責任感の強さを持っており、これらの経験とスキルを活かし、新たなチャレンジに取り組みたいと考えております。

※2024/1～2024/4までラムゼイ・ハント症候群にて休職、社則の期限時点で症状が改善せず退職(顔面麻痺、めまい、ふらつき)。その後療養を続け、就業可能レベルまで回復。

【最近の取り組み（参考）】
療養中は体調に配慮しながらノーコードや生成AIツールに触れ、自主的に簡易Webアプリの制作を行いました。
https://takeagent.vercel.app/（子ども向け音声アシスタント、スマホ向け）
https://iveinfo.vercel.app/（献立提案、まとめ買いリスト生成、スマホ向け）
実務でもAIや自動化技術を積極的に取り入れる意識を持ち、継続的な学習に取り組んでいます。
※AIエンジニア志望ということではなく、営業分野においても日常業務の効率化や営業力強化において、AI活用の機会が増えることをにらみ、AIを使って何ができるのか、使うためにどんな知識が必要なのかを知る目的で、学習しております。

【退職理由】
2024年1月から2024年4月までラムゼイ・ハント症候群にて休職、社則の休職期限(3か月間)時点で症状が改善せず退職(顔面麻痺、めまい、ふらつき)。その後療養を続け、現在は就業可能レベルまで回復。
後遺症は、右目が閉じにくい、狭い場所の歩行時や立ち上がる時に若干ふらつく程度。

【ハント症候群について】
耳性帯状疱疹から併発。右顔面の神経がウイルスにより破壊されることで、顔面麻痺、三半規管不良となる病気。

# 回答時の注意点
- 回答は600文字以内にまとめること
- 質問には具体的なエピソードを交えて回答する
- 数字や実績を具体的に示す
- 前向きで意欲的な姿勢を表現する
    
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
