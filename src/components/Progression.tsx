import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { playChord } from '../lib/audio';
import type { InstrumentId } from '../types';

interface ProgressionItem {
  id: string;       // identificador único para dnd-kit
  chord: string;    // nombre del acorde, p.ej. "Am"
}

interface Props {
  items: ProgressionItem[];
  instrument: InstrumentId;
  onRemove: (id: string) => void;
}

export function Progression({ items, instrument, onRemove }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'progression-drop' });

  return (
    <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`min-h-[64px] p-2 rounded-lg border-2 border-dashed flex flex-wrap gap-2 transition ${
          isOver ? 'border-indigo-400 bg-indigo-950/30' : 'border-slate-700 bg-slate-900/50'
        }`}
      >
        {items.length === 0 && (
          <p className="text-slate-500 text-sm self-center mx-auto">
            Arrastra aquí un acorde, o tócalo en la paleta para añadirlo.
          </p>
        )}
        {items.map((item) => (
          <ChordBubble key={item.id} item={item} instrument={instrument} onRemove={onRemove} />
        ))}
      </div>
    </SortableContext>
  );
}

function ChordBubble({
  item,
  instrument,
  onRemove,
}: {
  item: ProgressionItem;
  instrument: InstrumentId;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full bg-indigo-600 text-white shadow touch-none"
    >
      <button
        {...attributes}
        {...listeners}
        onClick={() => playChord(item.chord, instrument)}
        className="font-bold cursor-grab active:cursor-grabbing select-none"
        title="Arrastra para reordenar · click para oír"
      >
        {item.chord}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="w-6 h-6 rounded-full bg-indigo-800 hover:bg-rose-600 text-xs flex items-center justify-center"
        aria-label={`Quitar ${item.chord}`}
      >
        ×
      </button>
    </div>
  );
}
