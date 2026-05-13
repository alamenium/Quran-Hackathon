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
  return <Comp question={question} onAnswer={onAnswer} locked={locked} />;
}
