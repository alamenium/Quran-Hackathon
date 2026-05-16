import { ChooseMeaning } from './ChooseMeaning.jsx';
import { MeaningMatch } from './MeaningMatch.jsx';
import { ListenChoose } from './ListenChoose.jsx';
import { FillBlank } from './FillBlank.jsx';
import { OrderEvents } from './OrderEvents.jsx';
import { TapAyahLesson } from './TapAyahLesson.jsx';
import { Reflection } from './Reflection.jsx';
import { Recite } from './Recite.jsx';
import { MoralScenario } from './MoralScenario.jsx';
import { TajweedHighlight } from './TajweedHighlight.jsx';
import { HeartLabSort } from './HeartLabSort.jsx';

const MAP = {
  choose_meaning: ChooseMeaning,
  meaning_match: MeaningMatch,
  listen_choose: ListenChoose,
  fill_blank: FillBlank,
  order_events: OrderEvents,
  tap_ayah_lesson: TapAyahLesson,
  reflection: Reflection,
  recite: Recite,
  moral_scenario: MoralScenario,
  tajweed_highlight: TajweedHighlight,
  // New Heart Lab sorting question (Gratitude Compass — Heart Lens).
  heart_lab_sort: HeartLabSort,
};

export function QuestionRenderer({ question, onAnswer, locked }) {
  const Comp = MAP[question.type];
  if (!Comp) {
    return (
      <div className="text-sm text-ink-soft p-4 border rounded-2xl">
        (Question type <code>"{question.type}"</code> is not implemented yet.)
      </div>
    );
  }
  // CRITICAL: keying on the question id forces React to unmount + remount the
  // child when the parent advances to the next question. Without this, the
  // child component instance is reused across questions and its local
  // useState (e.g. `selected`) leaks from the previous question — so the
  // same option index stays highlighted on the next question.
  const key = question.id || `${question.type}:${question.prompt || ''}`;
  return <Comp key={key} question={question} onAnswer={onAnswer} locked={locked} />;
}
