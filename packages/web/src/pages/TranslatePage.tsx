import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import ExpandableField from '../components/ExpandableField';
import Select from '../components/Select';
import Markdown from '../components/Markdown';
import ButtonCopy from '../components/ButtonCopy';
import Switch from '../components/Switch';
import useChat from '../hooks/useChat';
import useMicrophone from '../hooks/useMicrophone';
import useTyping from '../hooks/useTyping';
import { PiMicrophoneFill, PiMicrophoneSlash } from 'react-icons/pi';
import { create } from 'zustand';
import debounce from 'lodash.debounce';
import { TranslatePageQueryParams } from '../@types/navigate';
import { MODELS } from '../hooks/useModel';
import { getPrompter } from '../prompts';
import queryString from 'query-string';

const languages = [
  '英語',
  '日本語',
  '中国語',
  '韓国語',
  'フランス語',
  'スペイン語',
  'ドイツ語',
];

type StateType = {
  sentence: string;
  setSentence: (s: string) => void;
  additionalContext: string;
  setAdditionalContext: (s: string) => void;
  language: string;
  setLanguage: (s: string) => void;
  translatedSentence: string;
  setTranslatedSentence: (s: string) => void;
  clear: () => void;
};

const useTranslatePageState = create<StateType>((set) => {
  const INIT_STATE = {
    sentence: '',
    additionalContext: '',
    language: languages[0],
    translatedSentence: '',
  };
  return {
    ...INIT_STATE,
    setSentence: (s: string) => {
      set(() => ({
        sentence: s,
      }));
    },
    setAdditionalContext: (s: string) => {
      set(() => ({
        additionalContext: s,
      }));
    },
    setLanguage: (s: string) => {
      set(() => ({
        language: s,
      }));
    },
    setTranslatedSentence: (s: string) => {
      set(() => ({
        translatedSentence: s,
      }));
    },
    clear: () => {
      set(INIT_STATE);
    },
  };
});

const TranslatePage: React.FC = () => {
  const {
    sentence,
    setSentence,
    additionalContext,
    setAdditionalContext,
    language,
    setLanguage,
    translatedSentence,
    setTranslatedSentence,
    clear,
  } = useTranslatePageState();
  const {
    startTranscription,
    stopTranscription,
    transcriptMic,
    recording,
    clearTranscripts,
  } = useMicrophone();

  const { pathname, search } = useLocation();
  const {
    getModelId,
    setModelId,
    loading,
    messages,
    postChat,
    clear: clearChat,
    updateSystemContextByModel,
  } = useChat(pathname);
  const { setTypingTextInput, typingTextOutput } = useTyping(loading);
  const { modelIds: availableModels } = MODELS;
  const modelId = getModelId();
  const prompter = useMemo(() => {
    return getPrompter(modelId);
  }, [modelId]);
  const [auto, setAuto] = useState(true);
  const [audio, setAudioInput] = useState(false); // 音声入力フラグ

  useEffect(() => {
    updateSystemContextByModel();
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [prompter]);

  // Memo 変数
  const disabledExec = useMemo(() => {
    return sentence === '' || loading;
  }, [sentence, loading]);

  useEffect(() => {
    const _modelId = !modelId ? availableModels[0] : modelId;
    if (search !== '') {
      const params = queryString.parse(search) as TranslatePageQueryParams;
      setSentence(params.sentence ?? '');
      setAdditionalContext(params.additionalContext ?? '');
      setLanguage(params.language || languages[0]);
      setModelId(
        availableModels.includes(params.modelId ?? '')
          ? params.modelId!
          : _modelId
      );
    } else {
      setModelId(_modelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setSentence,
    setAdditionalContext,
    setLanguage,
    modelId,
    availableModels,
    search,
  ]);

  useEffect(() => {
    setTypingTextInput(translatedSentence);
  }, [translatedSentence, setTypingTextInput]);

  // 文章の更新時にコメントを更新
  useEffect(() => {
    if (auto) {
      // debounce した後翻訳
      onSentenceChange(sentence, additionalContext, language, loading);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence, language]);

  // debounce した後翻訳
  // 入力を止めて1秒ほど待ってから翻訳リクエストを送信
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSentenceChange = useCallback(
    debounce(
      (
        _sentence: string,
        _additionalContext: string,
        _language: string,
        _loading: boolean
      ) => {
        if (_sentence === '') {
          setTranslatedSentence('');
        }
        if (_sentence !== '' && !_loading) {
          getTranslation(_sentence, _language, _additionalContext);
        }
      },
      1000
    ),
    []
  );

  // リアルタイムにレスポンスを表示
  useEffect(() => {
    if (messages.length === 0) return;
    const _lastMessage = messages[messages.length - 1];
    if (_lastMessage.role !== 'assistant') return;
    const _response = messages[messages.length - 1].content;
    setTranslatedSentence(_response.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // 音声入力フラグの切り替え
  // audioのトグルボタンがOnになったら、startTranscriptionを実行する
  useEffect(() => {
    if (audio) {
      startTranscription();
    } else {
      stopTranscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio]);

  // 録音機能がエラー終了した時にトグルスイッチをOFFにする
  useEffect(() => {
    if (!recording) {
      setAudioInput(false);
    }
  }, [recording]);
  // transcribeの要素が追加された時の処理. 左のボックスに自動入力する
  useEffect(() => {
    console.log('transcriptMic', transcriptMic);
    // transcriptMic[*].transcriptが重複していたら削除する
    const uniqueTranscripts = transcriptMic.filter((transcript, index) => {
      const transcripts = transcriptMic.map((t) => t.transcript);
      return transcripts.indexOf(transcript.transcript) === index;
    });
    console.log('uniqueTranscripts', uniqueTranscripts);

    // uniqueTranscripts[*].transcriptの文字列を結合する
    const combinedTranscript = uniqueTranscripts.map(
      (transcript) => transcript.transcript
    );
    setSentence(combinedTranscript.join(''));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptMic]);

  // LLM にリクエスト送信
  const getTranslation = (
    sentence: string,
    language: string,
    context: string
  ) => {
    postChat(
      prompter.translatePrompt({
        sentence,
        language,
        context: context === '' ? undefined : context,
      }),
      true
    );
  };

  // 翻訳を実行
  const onClickExec = useCallback(() => {
    if (loading) return;
    getTranslation(sentence, language, additionalContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence, additionalContext, loading]);

  // リセット
  const onClickClear = useCallback(() => {
    clear();
    clearChat();
    clearTranscripts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-12">
      <div className="invisible col-span-12 my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
        翻訳
      </div>
      <div className="col-span-12 col-start-1 mx-2 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
        <Card label="翻訳したい文章">
          <div className="flex w-full items-center justify-between">
            <Select
              value={modelId}
              onChange={setModelId}
              options={availableModels.map((m) => {
                return { value: m, label: m };
              })}
            />
            <div className="col-span-12 col-start-1 mx-2 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
              <Switch label="自動翻訳" checked={auto} onSwitch={setAuto} />
            </div>
          </div>
          <div className="flex w-full flex-col lg:flex-row">
            <div className="w-full lg:w-1/2">
              <div className="flex py-2.5">
                言語を自動検出
                <div className="ml-2 justify-end">
                  {audio && (
                    <PiMicrophoneFill
                      onClick={() => {
                        stopTranscription();
                        setAudioInput(false);
                      }}
                      className="h-7 w-7 text-orange-500"></PiMicrophoneFill>
                  )}
                  {!audio && (
                    <PiMicrophoneSlash
                      onClick={() => {
                        startTranscription();
                        setAudioInput(true);
                      }}
                      className="h-7 w-7"></PiMicrophoneSlash>
                  )}
                </div>
              </div>

              <Textarea
                placeholder="入力してください"
                value={sentence}
                onChange={setSentence}
                maxHeight={-1}
              />
            </div>
            <div className="w-full lg:ml-2 lg:w-1/2">
              <Select
                value={language}
                options={languages.map((l) => {
                  return { value: l, label: l };
                })}
                onChange={setLanguage}
              />
              <div className="rounded border border-black/30 p-1.5">
                <Markdown>{typingTextOutput}</Markdown>
                {loading && (
                  <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
                )}
                <div className="flex w-full justify-end">
                  <ButtonCopy
                    text={translatedSentence}
                    interUseCasesKey="translatedSentence"></ButtonCopy>
                </div>
              </div>
            </div>
          </div>

          <ExpandableField label="追加コンテキスト" optional>
            <Textarea
              placeholder="追加で考慮してほしい点を入力することができます（カジュアルさ等）"
              value={additionalContext}
              onChange={setAdditionalContext}
            />
          </ExpandableField>

          <div className="flex justify-end gap-3">
            <Button outlined onClick={onClickClear} disabled={disabledExec}>
              クリア
            </Button>

            <Button disabled={disabledExec} onClick={onClickExec}>
              実行
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TranslatePage;
