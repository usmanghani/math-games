import { useMemo, useState } from 'react'

import EquationCard from './components/EquationCard'
import NumberLine from './components/NumberLine'
import { NumberLineProblem, generateProblem } from './lib/problem'
import './App.css'

const RANGE = { min: 0, max: 20 }
const TOTAL_ROUNDS = 5

const POSITIVE_FEEDBACK = [
  'Beautiful hop! That carrot is yours.',
  'Another confident landing. Keep zooming!',
  'Carrot cart unlocked! Your hops are so steady.',
]

const GROWTH_FEEDBACK = [
  'Great observation practice. Watch the hop trail and try again next round.',
  'Every detective hop teaches us something—notice the distance and keep going!',
  "Close! Count each step aloud when you're unsure.",
]

const pickMessage = (messages: string[], seed: number) =>
  messages[seed % messages.length]

function App() {
  const [problem, setProblem] = useState<NumberLineProblem>(() => generateProblem(RANGE))
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [roundIndex, setRoundIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [history, setHistory] = useState<boolean[]>([])
  const [sessionComplete, setSessionComplete] = useState(false)

  const isCorrect = selected !== null && selected === problem.answer
  const progress = Math.min(history.length / TOTAL_ROUNDS, 1) * 100
  const isLastRound = roundIndex === TOTAL_ROUNDS - 1
  const displayedRound = sessionComplete ? TOTAL_ROUNDS : roundIndex + 1

  const handleAnswer = (value: number) => {
    if (showResult || sessionComplete) return
    setSelected(value)
    setShowResult(true)
    const wasCorrect = value === problem.answer
    setHistory((prev) => [...prev, wasCorrect])
    if (wasCorrect) {
      setCorrectCount((prev) => prev + 1)
      setStreak((prev) => {
        const next = prev + 1
        setBestStreak((best) => Math.max(best, next))
        return next
      })
    } else {
      setStreak(0)
    }
  }

  const resetForNextProblem = () => {
    setProblem(generateProblem(RANGE))
    setSelected(null)
    setShowResult(false)
  }

  const restartSession = () => {
    setRoundIndex(0)
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setHistory([])
    setSessionComplete(false)
    resetForNextProblem()
  }

  const handleNext = () => {
    if (!showResult) return
    if (sessionComplete) {
      restartSession()
      return
    }

    if (isLastRound) {
      setSessionComplete(true)
      return
    }

    setRoundIndex((prev) => prev + 1)
    resetForNextProblem()
  }

  const feedback = useMemo(() => {
    if (sessionComplete) {
      return 'Choose “Play again” to keep the learning momentum going.'
    }

    if (!showResult || selected === null) {
      return 'Pick the landing number and lock in your hop.'
    }

    if (isCorrect) {
      return streak > 1
        ? `Yes! ${streak} hops in a row. Keep that flow going!`
        : pickMessage(POSITIVE_FEEDBACK, problem.answer)
    }

    return pickMessage(GROWTH_FEEDBACK, problem.start)
  }, [isCorrect, problem.answer, problem.start, selected, sessionComplete, showResult, streak])

  const hopDirection = problem.operation === 'addition' ? 'forward' : 'backward'

  const timeline = useMemo(() => {
    return Array.from({ length: TOTAL_ROUNDS }, (_, index) => history[index])
  }, [history])

  const encouragementTitle = sessionComplete
    ? 'Adventure report'
    : `Round ${displayedRound} of ${TOTAL_ROUNDS}`

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Milestone 1 prototype</p>
        <h1>Number Line Adventure</h1>
        <p className="subtitle">
          Strengthen gentle addition and subtraction by tracing our bunny’s hops on a colorful number line.
        </p>
      </header>

      <section className="session-panel" aria-label="Progress dashboard">
        <div className="stat-card">
          <p className="stat-label">{encouragementTitle}</p>
          <p className="stat-value">{sessionComplete ? 'Complete!' : `${displayedRound}/${TOTAL_ROUNDS}`}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Correct answers</p>
          <p className="stat-value">{correctCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Best streak</p>
          <p className="stat-value">{bestStreak}</p>
        </div>
        <div className="progress-card">
          <p className="stat-label">Session progress</p>
          <div className="progress-bar" role="img" aria-label={`Progress ${progress}%`}>
            <span className="progress-bar__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <main className="play-area">
        <div className="play-panels">
          <section className="scene">
            <p className="prompt">{sessionComplete ? 'That was a full adventure!' : problem.prompt}</p>
            <p className="scene__hint">
              {sessionComplete
                ? 'Review the timeline below or jump back in for another trail.'
                : `Bunny starts at ${problem.start} and hops ${hopDirection} ${problem.delta} step${
                    problem.delta === 1 ? '' : 's'
                  }. Guess the landing number!`}
            </p>
            {!sessionComplete && (
              <EquationCard
                start={problem.start}
                delta={problem.delta}
                operation={problem.operation}
                reveal={showResult}
                selected={selected}
                answer={problem.answer}
              />
            )}
          </section>
          <section className="choices" aria-live="polite">
          {sessionComplete ? (
            <div className="summary">
              <h2>Way to hop!</h2>
              <p>
                You solved {correctCount} of {TOTAL_ROUNDS} challenges. Your longest streak was {bestStreak}{' '}
                correct hop{bestStreak === 1 ? '' : 's'}.
              </p>
              <button className="next" onClick={restartSession}>
                Play again
              </button>
            </div>
          ) : (
            <>
              <div className="choices__grid">
                {problem.options.map((option) => {
                  const state = selected === option ? (isCorrect ? 'correct' : 'incorrect') : 'idle'
                  return (
                    <button
                      key={option}
                      className={`choice choice--${state}`}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              <p className="feedback">{feedback}</p>
              <button className="next" onClick={handleNext} disabled={!showResult} aria-label="Get a new problem">
                {isLastRound ? 'See progress report' : 'Next challenge'}
              </button>
            </>
          )}
          </section>
        </div>
        <section className="number-line-panel">
          <NumberLine
            min={problem.min}
            max={problem.max}
            start={problem.start}
            end={problem.answer}
            reveal={showResult || sessionComplete}
          />
        </section>
      </main>

      <section className="timeline" aria-label="Timeline of rounds">
        {timeline.map((result, index) => {
          const status = result === undefined ? 'pending' : result ? 'correct' : 'incorrect'
          const label =
            result === undefined
              ? `Round ${index + 1} not played yet`
              : `Round ${index + 1} ${result ? 'correct' : 'incorrect'}`
          return (
            <span key={`round-${index}`} className={`timeline__dot timeline__dot--${status}`} aria-label={label} />
          )
        })}
      </section>
    </div>
  )
}

export default App
