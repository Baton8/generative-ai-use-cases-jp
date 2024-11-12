import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Markdown from '../components/Markdown';
import ButtonCopy from '../components/ButtonCopy';
import Select from '../components/Select';
import useChat from '../hooks/useChat';
import useTyping from '../hooks/useTyping';
import { MODELS } from '../hooks/useModel';
import { Input } from '@aws-amplify/ui-react';

const useAsasorePageState = () => {
  const [text, setText] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [theme, setTheme] = React.useState('');
  const [mode, setMode] = React.useState<'theme' | 'answer'>('theme');
  const [inputTheme, setInputTheme] = React.useState('');
  
  const clear = () => {
    setText('');
    setAnswer('');
    setTheme('');
    setInputTheme('');
  };
  
  return { 
    text, setText, 
    theme, setTheme, 
    answer, setAnswer, 
    mode, setMode, 
    inputTheme, setInputTheme,
    clear 
  };
};

const AsasorePage: React.FC = () => {
  const { text, setText, theme, setTheme, answer, setAnswer, mode, setMode, inputTheme, setInputTheme, clear } = useAsasorePageState();
  const { pathname } = useLocation();
  const {
    getModelId,
    setModelId,
    loading,
    messages,
    postChat,
    clear: clearChat,
  } = useChat(pathname);
  const { setTypingTextInput, typingTextOutput } = useTyping(loading);
  const { modelIds: availableModels } = MODELS;
  const modelId = getModelId();

  // text が変更されたら typing input を更新
  useEffect(() => {
    setTypingTextInput(text);
  }, [text, setTypingTextInput]);

  const generateAsasoreTheme = () => {
    const timestamp = new Date().getTime();
    const randomSeed = Math.floor(Math.random() * 1000);
    const randomHiragana = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split('')[Math.floor(Math.random() * 46)];
    
    const prompt = `あなたはQuizKnockの人気企画「朝からそれ正解」のお題を考える担当です。
以下の形式で、「${randomHiragana}」から始まるお題を1つ生成してください。

出力形式:
「${randomHiragana}」から始まる[お題]

条件:
- お題は具体的で面白く、かつ複数の正解が考えられるものにしてください
- 出力は上記の形式のみとし、説明等は不要です
- 以下のカテゴリーからランダムに1つ選んで、そのカテゴリーに関連するお題を考えてください（シード値: ${randomSeed}）：
  * 食べ物・料理
  * スポーツ・運動
  * 文化・芸術
  * 科学・技術
  * 生活・日常
  * 自然・動物
  * エンターテイメント
  * ビジネス・仕事
  * 学校・教育
  * 趣味・娯楽

例:
「あ」から始まる強いもの
「か」から始まるお正月のもの
「て」から始まる頭を使うもの

タイムスタンプ: ${timestamp}`;

    postChat(prompt, true);
  };

  const generateAnswer = () => {
    if (!inputTheme) return;
    
    const prompt = `-----ここからプロンプト-----
添付したCSVファイルは、QuizKnockの人気企画、『朝からそれ正解』という企画にて、過去にお題に対して正解した回答のリストです。

#朝からそれ正解とは？
「朝からそれ正解」は、与えられた頭文字とお題からそれぞれが当てはまる答えを出し、「正解」をメンバー9人で決めていく人気企画です。

お題が入力されたら、正解とその理由を考えてください。
例)「あ」で始まる、速いものといえば？

「解答: ○○、理由: △△」という形式で答えてください。理由は100文字以内とし、端的に人を説得してください。

---csv---
放送回,頭文字,,お題,正解,,,,,,,,,
#1,し,で始まる,はやいもの,師走,,,,,,,,,
#1,か,で始まる,お正月のもの,かずのこ,,,,,,,,,
#1,て,で始まる,頭を使うもの,テトリス,,,,,,,,,
#2,あ,で始まる,悲しい出来事,安楽死,,,,,,,,,
#2,え,で始まる,天才,エジソン,,,,,,,,,
#2,は,で始まる,明るいもの,発光ダイオード,,,,,,,,,
#3,き,で始まる,見るべきもの,旧作,,,,,,,,,
#3,や,で始まる,疲れるもの,ヤールギュレシ,,,,,,,,,
#3,そ,で始まる,難しいもの,素因数分解,,,,,,,,,
#3,ち,で始まる,憧れるもの,チャック・ノリス,,,,,,,,,
#4,か,で始まる,遅いもの,各駅停車,,,,,,,,,
#4,し,で始まる,子供の頃から学ぶべきもの,社会常識,,,,,,,,,
#4,き,で始まる,偉大な人,金田一京助,,,,,,,,,
#5,さ,で始まる,簡単にはできないもの,逆上がり,,,,,,,,,
#5,ふ,で始まる,丸いもの,フラーレン,,,,,,,,,
#5,け,で始まる,いつまでも見てしまうもの,携帯電話,,,,,,,,,
#5,う,で始まる,なつかしいもの,運動会,,,,,,,,,
#6,た,で始まる,生まれ変わりたいもの,多聞天,,,,,,,,,
#6,め,で始まる,覚えているとかっこいいもの,冥王星の衛星,,,,,,,,,
#6,い,で始まる,尖っているもの,イッカク,,,,,,,,,
#7,た,で始まる,はやいもの,タキオン,,,,,,,,,
#7,か,で始まる,絶対敵わないもの,神,,,,,,,,,
#7,に,で始まる,柔らかいもの,にゃんこ,,,,,,,,,
#8,ぶ,で始まる,キラキラなもの,ブリリアントカット,,,,,,,,,
#8,し,で始まる,人生で一度は見たいもの,シライ/グエン,,,,,,,,,
#8,じ,で始まる,集中力が必要なもの,重量挙げ,,,,,,,,,
#9,あ,で始まる,高いもの,above,,,,,,,,,
#9,へ,で始まる,大切にしたいもの,平和,,,,,,,,,
#9,こ,で始まる,もらうと困るもの,故障した自転車,,,,,,,,,
#10,ち,で始まる,長いもの,チリ,,,,,,,,,
#10,せ,で始まる,傑作,千と千尋の神隠し,,,,,,,,,
#10,ぴ,で始まる,時間のかかるもの,ピラミッドの建設,,,,,,,,,
#11,あ,で始まる,危ないこと,あおり運転,,,,,,,,,
#11,ほ,で始まる,思わず拍手が起こること,本人登場,,,,,,,,,
#11,と,で始まる,偉業,トリプルスリー,,,,,,,,,
#11,お,で始まる,重いもの,オスミウム,,,,,,,,,
#12,さ,で始まる,いつかは身に付けたいこと,作法,,,,,,,,,
#12,く,で始まる,踏むと痛いもの,釘,,,,,,,,,
#12,し,で始まる,頭がいい人,シャンポリオン,シーボルト,シュヴァイツァー,シュリーファー,シュリーマン,シェイクスピア,シートン,志村五郎,シコルスキー,シュレーディンガー
#13,せ,で始まる,短いもの,刹那,,,,,,,,,
#13,は,で始まる,温まるもの,半身浴,,,,,,,,,
#13,か,で始まる,学びたいもの,科学,,,,,,,,,
#14,う,で始まる,キレイなもの,ウユニ塩湖,,,,,,,,,
#14,ま,で始まる,意味のないこと,負け,,,,,,,,,
#14,あ,で始まる,人が集まる場所,アゴラ,,,,,,,,,
#15,た,で始まる,ノーベル賞を贈りたい人,多和田葉子,,,,,,,,,
#15,ふ,で始まる,サクサクなもの,5G,,,,,,,,,
#15,き,で始まる,無人島に持っていきたいもの,キャンピングカー,,,,,,,,,
#15,え,で始まる,子供が大はしゃぎするもの,遠足,,,,,,,,,
#16,か,で始まる,家の中でしたいこと,家事,,,,,,,,,
#16,こ,で始まる,大切なもの,心,,,,,,,,,
#16,は,で始まる,会いたい人,橋本環奈,,,,,,,,,
#17,ど,で始まる,学生がするべきこと,読書,,,,,,,,,
#17,ぽ,で始まる,赤いもの,ポインセチア,,,,,,,,,
#17,や,で始まる,QuizKnockに足りないもの,八百万,,,,,,,,,
#18,こ,で始まる,歴史があるもの,ことば,,,,,,,,,
#18,は,で始まる,根気が必要なもの,博士課程,,,,,,,,,
#18,か,で始まる,薄いもの,紙,,,,,,,,,
#19,き,で始まる,壊れやすいもの,絆,,,,,,,,,
#19,お,で始まる,見つけたいもの,黄金郷,,,,,,,,,
#19,け,で始まる,昔はできなかったもの,検索,,,,,,,,,
#20,し,で始まる,テクニックが必要なもの,職人,,,,,,,,,
#20,ご,で始まる,元気が出ること,ゴチになる/ご馳走になる,,,,,,,,,
#20,と,で始まる,目が離せない瞬間,トリプルアクセル,,,,,,,,,
#21,あ,で始まる,便利なもの,iPhone,,,,,,,,,
#21,せ,で始まる,忘れてしまいそうなもの,世界観,,,,,,,,,
#22,ほ,で始まる,いっぱいほしいもの,報酬,,,,,,,,,
#22,い,で始まる,うまくいかないもの,イライラ棒,,,,,,,,,
#23,や,で始まる,参考になるもの,Yahoo!知恵袋,,,,,,,,,
#23,に,で始まる,予想できないもの,Nintendo Direct,,,,,,,,,
#24,ふ,で始まる,自慢になること,譜代,,,,,,,,,
#24,も,で始まる,怖いもの,物の怪,,,,,,,,,
#25,と,で始まる,残したいもの,富,,,,,,,,,
#25,ぬ,で始まる,声に出したい言葉,ヌクレオチド,,,,,,,,,
#26,さ,で始まる,増えるもの,サブスク,,,,,,,,,
#26,て,で始まる,ついやってしまうこと,手遊び・手わすら,,,,,,,,,
#27,も,で始まる,不思議なもの,モアイ,,,,,,,,,
#27,あ,で始まる,平成に流行ったもの,安室奈美恵,,,,,,,,,
#28,ひ,で始まる,スッキリすること,氷釈,,,,,,,,,
#28,お,で始まる,深いもの,大江戸線,,,,,,,,,
#28,そ,で始まる,ぐるぐるしているもの,ソレノイド,,,,,,,,,
#29,え,で始まる,よく伸びるもの,円周率の世界記録,,,,,,,,,
#29,ど,で始まる,軽いもの,ドライフラワー,,,,,,,,,
#30,さ,で始まる,ピカピカなもの,砂金,,,,,,,,,
#30,で,で始まる,理論的思考が求められるもの,ディベート,,,,,,,,,
#30,お,で始まる,ドキドキすること,お化け屋敷,,,,,,,,,
---csv---

-----ここまでプロンプト-----

${inputTheme}`;

    postChat(prompt, true);
  };

  // メッセージの監視を更新
  useEffect(() => {
    if (messages.length === 0) return;
    const _lastMessage = messages[messages.length - 1];
    if (_lastMessage.role !== 'assistant') return;
    const _response = messages[messages.length - 1].content;
    
    // テーマ生成時の応答
    if (_response.includes('から始まる')) {
      setText(_response.trim());
      setTheme(_response.trim());
    } else {
      // 回答生成時の応答
      setAnswer(_response.trim());
    }
  }, [messages, setText, setTheme, setAnswer]);

  return (
    <div className="grid grid-cols-12">
      <div className="invisible col-span-12 my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
        朝からそれ正解 お題ジェネレーター
      </div>
      <div className="col-span-12 col-start-1 mx-2 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
        <div className="flex justify-center gap-3 mb-5">
          <Button 
            outlined={mode !== 'theme'} 
            onClick={() => setMode('theme')}
          >
            お題生成モード
          </Button>
          <Button 
            outlined={mode !== 'answer'} 
            onClick={() => setMode('answer')}
          >
            回答生成モード
          </Button>
        </div>

        {mode === 'theme' ? (
          <Card label="お題生成">
            <div className="mb-2 flex w-full">
              <Select
                value={modelId}
                onChange={setModelId}
                options={availableModels.map((m) => ({
                                  value: m,
                  label: m,
                }))}
              />
            </div>

            <div className="flex justify-center gap-3 mb-5">
              <Button outlined onClick={() => { clear(); clearChat(); }}>
                クリア
              </Button>
              <Button onClick={generateAsasoreTheme} disabled={loading}>
                お題を生成する
              </Button>
            </div>

            <div className="mt-5 rounded border border-black/30 p-1.5">
              <div className="text-2xl text-center">
                <Markdown>{typingTextOutput}</Markdown>
              </div>
              {!loading && text === '' && (
                <div className="text-gray-500 text-center">
                  「お題を生成する」をクリックしてください
                </div>
              )}
              {loading && (
                <div className="flex justify-center">
                  <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
                </div>
              )}
              <div className="flex w-full justify-end">
                <ButtonCopy text={text} interUseCasesKey="text"></ButtonCopy>
              </div>
            </div>
          </Card>
        ) : (
          <Card label="回答生成">
            <div className="mb-2 flex w-full">
              <Select
                value={modelId}
                onChange={setModelId}
                options={availableModels.map((m) => ({
                  value: m,
                  label: m,
                }))}
              />
            </div>

            <div className="mb-4">
              <Input
                // label="お題"
                placeholder="「あ」から始まる速いもの"
                value={inputTheme}
                onChange={(e) => setInputTheme(e.target.value)}
              />
            </div>

            <div className="flex justify-center gap-3 mb-5">
              <Button outlined onClick={() => { setAnswer(''); setInputTheme(''); clearChat(); }}>
                クリア
              </Button>
              <Button onClick={generateAnswer} disabled={loading || !inputTheme}>
                回答を生成する
              </Button>
            </div>

            <div className="mt-5 rounded border border-black/30 p-1.5">
              <div className="text-xl">
                <Markdown>{answer}</Markdown>
              </div>
              {!loading && !answer && (
                <div className="text-gray-500 text-center">
                  お題を入力して「回答を生成する」をクリックしてください
                </div>
              )}
              {loading && (
                <div className="flex justify-center">
                  <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
                </div>
              )}
              <div className="flex w-full justify-end">
                <ButtonCopy text={answer} interUseCasesKey="answer"></ButtonCopy>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AsasorePage;
