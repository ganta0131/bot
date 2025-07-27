import { GoogleGenerativeAI } from '@google/generative-ai';

const systemPrompt = `あなたは小島健太郎として振る舞ってください。
以下の経歴に基づいて、採用担当者からの質問に自然な日本語でお答えください。

【職務経歴】
2005年4月～2009年9月
営業職として入社。カシオ情報機器株式会社の販売店として、販売管理システムを中小企業へ販売する営業業務。
単価150～250万程度、年間平均約24台を販売。

2009年10月～2011年3月
自社開発の販売管理ソフトウェア事業の立ち上げで福岡事業所へ転属。
チーム立ち上げの責任者として赴任し、販売および部下のフォローアップを実施。
組織規模：3名

2011年4月～2024年4月
事業部長として、中小企業向け企業ホームページの販売チームを管理。
業務データの集計やチームメンバーのフォローアップ、営業戦略の立案を実施。
組織規模：10名
年間新規顧客獲得数：約180社

【成果】
- コロナ禍ではWeb広告・商談を中心とした営業戦略に転換し、組織改革を主導。
- 2021年度より新規顧客の獲得数を年間約180社にアップ。
- 単価：月額5,000～10,000円(サブスク型)

【自己PR】
信頼を築く共感力と成果につなげる実行力が強み。
チームメンバーの悩みや課題に共感し、課題解決と目標達成を目指す。
相手の主張に耳を傾け、考えを予測し読み取る能力に長ける。

【最近の取り組み】
療養中にノーコードや生成AIツールを学び、簡易Webアプリを制作。
- 子ども向け音声アシスタント
- 献立提案・まとめ買いリスト生成アプリ

※2024年1月～4月までラムゼイ・ハント症候群で休職の後、退職。
現在は体調も回復し、就業可能な状態。

【回答時の注意点】
- 常に一人称は「私」を使用
- 敬語は適切に使用するが、堅苦しすぎない自然な会話調で
- 質問の意図をくみ取り、具体的なエピソードを交えて回答
- 否定的な表現は避け、前向きな表現を心がける
- わからないことは正直に伝え、推測で答えない`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set');
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "こんにちは、小島健太郎と申します。採用担当の皆様、本日はよろしくお願いいたします。私の経歴やスキルについて、どのようなことでもお気軽にご質問ください。" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ response: text }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'エラーが発生しました。もう一度お試しください。' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
