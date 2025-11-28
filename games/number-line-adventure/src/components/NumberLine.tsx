import './NumberLine.css'
import BunnySprite from './BunnySprite'

interface NumberLineProps {
  min: number
  max: number
  start: number
  end: number
  reveal?: boolean
  options?: number[]
  onNumberClick?: (value: number) => void
  selected?: number | null
  disabled?: boolean
}

const getPercent = (value: number, min: number, max: number) => {
  if (max === min) return 0
  return ((value - min) / (max - min)) * 100
}

export const NumberLine = ({ 
  min, 
  max, 
  start, 
  end, 
  reveal = false, 
  options = [], 
  onNumberClick, 
  selected = null,
  disabled = false 
}: NumberLineProps) => {
  const ticks = []
  for (let value = min; value <= max; value += 1) {
    ticks.push({ value, percent: getPercent(value, min, max) })
  }

  const startPercent = getPercent(start, min, max)
  const endPercent = getPercent(end, min, max)

  // Adjust for the 6% left padding of the ticks container (spans 6% to 94%)
  const adjustedStartPercent = 6 + (startPercent * 0.88)
  const adjustedEndPercent = 6 + (endPercent * 0.88)
  const pathLeft = Math.min(adjustedStartPercent, adjustedEndPercent)
  const pathWidth = Math.abs(adjustedEndPercent - adjustedStartPercent)
  const hopCount = Math.abs(end - start)
  const direction = end >= start ? 1 : -1
  const footprints = Array.from({ length: hopCount }, (_, index) => {
    const stepValue = start + direction * (index + 1)
    const rawPercent = getPercent(stepValue, min, max)
    const adjustedPercent = 6 + (rawPercent * 0.88)
    return { id: `${stepValue}-${index}`, percent: adjustedPercent }
  })

  return (
    <div className="number-line" role="img" aria-label="Interactive number line">
      <div className="number-line__legend">
        <div className="number-line__legend-card number-line__legend-card--start">
          <div className="number-line__legend-sprite">
            <BunnySprite size="medium" animation="idle" direction="right" />
          </div>
          <div>
            <p className="number-line__legend-label">Start</p>
            <p className="number-line__legend-value">{start}</p>
          </div>
        </div>
        <div className="number-line__legend-card number-line__legend-card--end">
          <span className="number-line__legend-emoji" role="img" aria-label="Carrot landing">
            🥕
          </span>
          <div>
            <p className="number-line__legend-label">Landing</p>
            <p className="number-line__legend-value">{reveal ? end : '??'}</p>
          </div>
        </div>
      </div>
      <div className="number-line__decor">
        <span className="number-line__cloud number-line__cloud--one" aria-hidden />
        <span className="number-line__cloud number-line__cloud--two" aria-hidden />
        <span className="number-line__sun" aria-hidden />
      </div>
      <div className="number-line__ticks">
        {ticks.map(({ value, percent }) => {
          const isClickable = !reveal && !disabled && options.includes(value) && onNumberClick
          const isSelected = selected === value
          return (
            <div 
              className={`number-line__tick ${isClickable ? 'number-line__tick--clickable' : ''} ${isSelected ? 'number-line__tick--selected' : ''}`}
              style={{ left: `${percent}%` }} 
              key={value}
              onClick={isClickable ? () => onNumberClick(value) : undefined}
              onKeyDown={isClickable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onNumberClick(value)
                }
              } : undefined}
              role={isClickable ? 'button' : undefined}
              aria-label={isClickable ? `Select ${value}` : undefined}
              aria-pressed={isClickable ? isSelected : undefined}
              data-value={value}
              tabIndex={isClickable ? 0 : undefined}
            >
              <span className="number-line__tick-mark" />
              <span className="number-line__label">{value}</span>
            </div>
          )
        })}
      </div>
      <div
        className={`number-line__marker ${reveal ? 'number-line__marker--moving' : ''}`}
        style={{ left: reveal ? `${adjustedEndPercent}%` : `${adjustedStartPercent}%` }}
      >
        <BunnySprite 
          size="large" 
          animation={reveal ? 'moving' : 'idle'} 
          direction={end >= start ? 'right' : 'left'} 
        />
      </div>
      {reveal && (
        <>
          <div className="number-line__path" style={{ left: `${pathLeft}%`, width: `${pathWidth}%` }} aria-hidden />
          {footprints.map(({ id, percent }) => (
            <span
              key={id}
              className={`number-line__hop ${direction === -1 ? 'number-line__hop--backward' : ''}`}
              style={{ left: `${percent}%` }}
              aria-hidden
            >
              🐾
            </span>
          ))}
        </>
      )}
    </div>
  )
}

export default NumberLine
