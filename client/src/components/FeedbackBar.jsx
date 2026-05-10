// Bottom feedback bar. Shows result + Continue button.
export function FeedbackBar({ status, title, body, onContinue }) {
  if (!status) return null;
  const positive = status === 'correct' || status === 'excellent' || status === 'good';
  return (
    <div
      className={`fixed left-0 right-0 bottom-0 z-40 px-4 pt-4 pb-6 ${
        positive ? 'bg-[#D7FFB8]' : 'bg-[#FFDFE0]'
      }`}
      style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
    >
      <div className="max-w-screen-md mx-auto flex flex-col gap-3">
        <div>
          <div
            className={`text-xl font-extrabold ${
              positive ? 'text-[#58A700]' : 'text-[#EA2B2B]'
            }`}
          >
            {title}
          </div>
          {body && <div className="text-sm text-ink mt-1">{body}</div>}
        </div>
        <button
          type="button"
          onClick={onContinue}
          className={positive ? 'duo-btn-primary' : 'duo-btn'}
          style={{
            background: positive ? '#58CC02' : '#FF4B4B',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
