// Speech bubble — matches the Khan Academy Kids style from the references:
// rounded white card with a small triangular tail.
export function SpeechBubble({ children, side = 'left', className = '' }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 shadow-card text-base font-semibold text-ink">
        {children}
      </div>
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${
          side === 'left' ? '-left-2' : '-right-2'
        }`}
      >
        <div
          className="w-3 h-3 bg-white border-2 border-gray-200 rotate-45"
          style={{
            borderRight: side === 'left' ? '2px solid #e5e7eb' : 'none',
            borderTop: side === 'left' ? 'none' : '2px solid #e5e7eb',
            borderBottom: side === 'left' ? '2px solid #e5e7eb' : 'none',
            borderLeft: side === 'left' ? 'none' : '2px solid #e5e7eb',
          }}
        />
      </div>
    </div>
  );
}
