import { useEffect, useMemo, useState } from 'react'
import './App.css'

const defaultNames = [
  'Engineer 01',
  'Engineer 02',
  'Engineer 03',
  'Engineer 04',
  'Engineer 05',
  'Engineer 06',
  'Engineer 07',
  'Engineer 08',
  'Engineer 09',
  'Engineer 10',
  'Engineer 11',
  'Engineer 12',
  'Engineer 13',
  'Engineer 14',
  'Engineer 15',
]

const rounds = [
  {
    title: 'ログだけ自己紹介',
    minutes: 8,
    rule: '最近の自分をログっぽく3行で話す。例: INFO、WARN、TODO。',
    prompt: 'いまの自分の「INFO / WARN / TODO」を1つずつ。',
  },
  {
    title: 'バグ報告リレー',
    minutes: 10,
    rule: '一人ずつ「最近ハマったバグ」を20秒で共有。隣の人が原因を勝手に推理する。',
    prompt: '原因を当てるより、思考の癖が見える推理を出す。',
  },
  {
    title: '架空プロダクト設計',
    minutes: 12,
    rule: 'チームで「初対面15人を仲良くする社内ツール」を1機能だけ設計する。',
    prompt: '機能名、最初の画面、絶対に入れない機能を決める。',
  },
  {
    title: '技術スタック人狼',
    minutes: 10,
    rule: 'チームで1つだけ「実は詳しくない技術」を混ぜて発表。他チームが見抜く。',
    prompt: '詳しいふりのリアリティをどこで出すか相談する。',
  },
  {
    title: 'デプロイ宣言',
    minutes: 6,
    rule: '今日から1週間で試す小さな改善を一人1つ宣言する。',
    prompt: '完璧な目標ではなく、金曜までに試せる1コミットにする。',
  },
]

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function makeTeams(names: string[], roundIndex: number) {
  const rotated = names.map((_, index) => names[(index + roundIndex * 3) % names.length])
  const mixed = shuffle(rotated)
  return [mixed.slice(0, 5), mixed.slice(5, 10), mixed.slice(10, 15)]
}

function App() {
  const [namesText, setNamesText] = useState(defaultNames.join('\n'))
  const [roundIndex, setRoundIndex] = useState(0)
  const [seed, setSeed] = useState(1)
  const [secondsLeft, setSecondsLeft] = useState(rounds[0].minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [memo, setMemo] = useState('')

  const names = useMemo(
    () =>
      namesText
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)
        .slice(0, 15),
    [namesText],
  )

  const teams = useMemo(() => makeTeams(names, roundIndex + seed), [names, roundIndex, seed])
  const round = rounds[roundIndex]
  const ready = names.length === 15

  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setIsRunning(false)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isRunning])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  function changeRound(nextIndex: number) {
    setRoundIndex(nextIndex)
    setSecondsLeft(rounds[nextIndex].minutes * 60)
    setIsRunning(false)
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">15 engineers / first meeting</p>
          <h1>初対面エンジニア会</h1>
          <p className="lead">
            15人を3チームに分け、会話のきっかけ、設計遊び、軽い発表まで進行する飲み会・懇親会用アプリ。
          </p>
        </div>
        <div className="timer" aria-label="round timer">
          <span>{minutes}</span>
          <small>:</small>
          <span>{seconds}</span>
        </div>
      </section>

      <section className="control-strip">
        {rounds.map((item, index) => (
          <button
            className={index === roundIndex ? 'active' : ''}
            key={item.title}
            onClick={() => changeRound(index)}
            type="button"
          >
            {index + 1}. {item.title}
          </button>
        ))}
      </section>

      <section className="grid">
        <aside className="panel setup-panel">
          <div className="panel-title">
            <h2>参加者</h2>
            <span className={ready ? 'status ok' : 'status'}>{names.length}/15</span>
          </div>
          <textarea
            aria-label="参加者名"
            value={namesText}
            onChange={(event) => setNamesText(event.target.value)}
          />
          <button className="wide" onClick={() => setSeed((value) => value + 1)} type="button">
            チームをシャッフル
          </button>
        </aside>

        <section className="panel main-panel">
          <div className="panel-title">
            <h2>{round.title}</h2>
            <span className="status">{round.minutes} min</span>
          </div>
          <p className="rule">{round.rule}</p>
          <p className="prompt">{round.prompt}</p>
          <div className="actions">
            <button onClick={() => setIsRunning((value) => !value)} type="button">
              {isRunning ? '一時停止' : '開始'}
            </button>
            <button onClick={() => setSecondsLeft(round.minutes * 60)} type="button">
              リセット
            </button>
            <button onClick={() => changeRound((roundIndex + 1) % rounds.length)} type="button">
              次へ
            </button>
          </div>
          <div className="teams">
            {teams.map((team, index) => (
              <div className="team" key={index}>
                <h3>Team {String.fromCharCode(65 + index)}</h3>
                <ol>
                  {team.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel memo-panel">
          <div className="panel-title">
            <h2>メモ</h2>
            <span className="status">share</span>
          </div>
          <textarea
            aria-label="会のメモ"
            placeholder="盛り上がった話、次に話したい技術、GitHub IDなど"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
          />
        </aside>
      </section>
    </main>
  )
}

export default App
