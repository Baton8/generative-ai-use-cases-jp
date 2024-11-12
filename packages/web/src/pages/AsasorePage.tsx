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

const useAsasorePageState = () => {
  const [text, setText] = React.useState('');
  
  const clear = () => setText('');
  
  return { text, setText, clear };
};

const AsasorePage: React.FC = () => {
  const { text, setText, clear } = useAsasorePageState();
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

  // リアルタイムにレスポンスを表示
  useEffect(() => {
    if (messages.length === 0) return;
    const _lastMessage = messages[messages.length - 1];
    if (_lastMessage.role !== 'assistant') return;
    const _response = messages[messages.length - 1].content;
    setText(_response.trim());
  }, [messages, setText]);

  return (
    <div className="grid grid-cols-12">
      <div className="invisible col-span-12 my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
        朝からそれ正解 お題ジェネレーター
      </div>
      <div className="col-span-12 col-start-1 mx-2 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
        <Card label="お題生成">
          <div className="mb-2 flex w-full">
            <Select
              value={modelId}
              onChange={setModelId}
              options={availableModels.map((m) => {
                return { value: m, label: m };
              })}
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
      </div>
    </div>
  );
};

export default AsasorePage;
