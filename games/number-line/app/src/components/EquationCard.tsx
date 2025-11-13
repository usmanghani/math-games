import type { NumberLineProblem } from '../lib/problem'
import './EquationCard.css'

interface EquationCardProps {
  start: number
  delta: number
  operation: NumberLineProblem['operation']
  reveal: boolean
  selected: number | null
  answer: number
}

const getStatus = (reveal: boolean, selected: number | null) => {
  if (reveal) return 'answer'
  if (selected === null) return 'pending'
  return 'guess'
}

const EquationCard = ({ start, delta, operation, reveal, selected, answer }: EquationCardProps) => {
  const symbol = operation === 'addition' ? '+' : '−'
  const operationWord = operation === 'addition' ? 'plus' : 'minus'
  const status = getStatus(reveal, selected)
  const displayedResult = reveal ? answer : selected ?? '?'
  const equationAnnouncement = `${start} ${operationWord} ${delta} equals ${displayedResult}`

  const caption = reveal
    ? `Bunny landed on ${answer}.`
    : selected === null
    ? 'Tap a number to complete the sentence.'
    : `You guessed ${selected}. Compare it with the hop trail!`

  return (
    <section className="equation-card" aria-label="Number sentence" aria-live="polite">
      <p className="equation-card__eyebrow">Number sentence</p>
      <div className="equation-card__equation" role="img" aria-label={equationAnnouncement}>
        <span className="equation-card__token" data-tone="given">
          <span className="equation-card__label">Start</span>
          {start}
        </span>
        <span className="equation-card__operator" aria-hidden>
          {symbol}
        </span>
        <span className="equation-card__token" data-tone="change">
          <span className="equation-card__label">Hops</span>
          {delta}
        </span>
        <span className="equation-card__operator" aria-hidden>
          =
        </span>
        <span className={`equation-card__token equation-card__token--result equation-card__token--${status}`}>
          <span className="equation-card__label">Landing</span>
          {displayedResult}
        </span>
      </div>
      <p className="equation-card__caption">{caption}</p>
    </section>
  )
}

export default EquationCard
