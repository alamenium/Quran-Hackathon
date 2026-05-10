import { ChooseMeaning } from './ChooseMeaning.jsx';
import { MeaningMatch } from './MeaningMatch.jsx';
import { ListenChoose } from './ListenChoose.jsx';
import { FillBlank } from './FillBlank.jsx';
import { OrderEvents } from './OrderEvents.jsx';
import { TapAyahLesson } from './TapAyahLesson.jsx';
import { Reflection } from './Reflection.jsx';
import { Recite } from './Recite.jsx';

export function QuestionRenderer({ question, onAnswer, locked }) {
  const Comp = {
    choose_meaning: ChooseMeaning,
    meaning_match: MeaningMatch,
    listen_choose: ListenChoose,
    fill_blank: FillBlank,
    order_events: OrderEvents,
    tap_ayah_lesson: TapAyahLesson,
    reflection: Reflection,
    recite: Recite,
  }[question.type];

  if (!Comp) {
    return (
      <div className="text-sm text-ink-soft">
        (Question type "{question.type}" not implemented yet.)
      </div>
    );
  }
  return <Comp question={question} onAnswer={onAnswer} locked={locked} />;
}
