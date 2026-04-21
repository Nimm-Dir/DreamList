export function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        const m = /^(\s*)(?:- |• )(.*)$/.exec(line)
        if (m) {
          return (
            <div key={i} className="bullet-line">
              <span className="bullet-dot">•</span>
              <span>{m[2] || '\u00A0'}</span>
            </div>
          )
        }
        return (
          <div key={i} className="task-text">
            {line || '\u00A0'}
          </div>
        )
      })}
    </>
  )
}
