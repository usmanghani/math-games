import './NumberLine.css'

interface NumberLineProps {
  min: number
  max: number
  start: number
  end: number
  reveal?: boolean
}

const getPercent = (value: number, min: number, max: number) => {
  if (max === min) return 0
  return ((value - min) / (max - min)) * 100
}

export const NumberLine = ({ min, max, start, end, reveal = false }: NumberLineProps) => {
  const ticks = []
  for (let value = min; value <= max; value += 1) {
    ticks.push({ value, percent: getPercent(value, min, max) })
  }

  const startPercent = getPercent(start, min, max)
  const endPercent = getPercent(end, min, max)
  const pathLeft = Math.min(startPercent, endPercent)
  const pathWidth = Math.abs(endPercent - startPercent)
  const hopCount = Math.abs(end - start)
  const direction = end >= start ? 1 : -1
  const footprints = Array.from({ length: hopCount }, (_, index) => {
    const stepValue = start + direction * (index + 1)
    return { id: `${stepValue}-${index}`, percent: getPercent(stepValue, min, max) }
  })

  return (
    <div className="number-line" role="img" aria-label="Interactive number line">
      <div className="number-line__legend">
        <div className="number-line__legend-card number-line__legend-card--start">
          <span className="number-line__legend-emoji" role="img" aria-label="Bunny start">
            🐰
          </span>
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
          const showLabel = value === min || value === max || value % 2 === 0
          return (
            <div className="number-line__tick" style={{ left: `${percent}%` }} key={value}>
              <span className="number-line__tick-mark" />
              {showLabel && <span className="number-line__label">{value}</span>}
            </div>
          )
        })}
      </div>
      <div className="number-line__marker number-line__marker--start" style={{ left: `${startPercent}%` }}>
        <span role="img" aria-label="Bunny start" className="number-line__emoji">
          🐰
        </span>
        Start
      </div>
      {reveal && (
        <>
          <div className="number-line__path" style={{ left: `${pathLeft}%`, width: `${pathWidth}%` }} aria-hidden />
          {footprints.map(({ id, percent }) => (
            <span key={id} className="number-line__hop" style={{ left: `${percent}%` }} aria-hidden>
              🐾
            </span>
          ))}
          <div className="number-line__marker number-line__marker--end" style={{ left: `${endPercent}%` }}>
            <span role="img" aria-label="Carrot reward" className="number-line__emoji">
              🥕
            </span>
            Landing
          </div>
        </>
      )}
    </div>
  )
}

export default NumberLine
