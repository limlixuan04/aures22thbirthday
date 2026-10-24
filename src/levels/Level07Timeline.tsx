import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { timeline } from '../content/content';
import { shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import type { LevelProps } from '.';

const CORRECT = timeline.map((_, i) => i);

function scrambled(): number[] {
  let order = shuffle(CORRECT);
  while (order.every((v, i) => v === i)) order = shuffle(CORRECT);
  return order;
}

interface ItemProps {
  id: number;
  pos: number;
  total: number;
  status: 'right' | 'wrong' | null;
  solved: boolean;
  move: (from: number, to: number) => void;
}

function TimelineCard({ id, pos, total, status, solved, move }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id + 1, disabled: solved });
  const item = timeline[id];
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex items-center gap-3 rounded-2xl border-2 bg-white p-3 shadow-soft sm:gap-4 sm:p-4 ${isDragging ? 'z-10 scale-[1.02] border-berry-400 shadow-card' : ''} ${
        status === 'right' || solved ? 'border-sage-400 bg-sage-200/50' : status === 'wrong' ? 'border-blush-400 bg-blush-50' : 'border-blush-200'
      }`}
      data-testid="timeline-item"
      data-id={id}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-berry-600 font-display font-bold text-cream-50">{pos + 1}</span>
      {!solved && (
        <button
          type="button"
          className="hidden cursor-grab touch-none rounded-lg px-1 text-2xl text-blush-400 active:cursor-grabbing sm:block"
          aria-label={`Drag to reorder: ${item.title}`}
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      )}
      <div
        className={`flex min-w-0 flex-1 items-center gap-3 ${solved ? '' : 'cursor-grab touch-manipulation active:cursor-grabbing'}`}
        {...(solved ? {} : listeners)}
      >
        <span className="text-3xl sm:text-4xl" aria-hidden="true">{item.emoji}</span>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight text-berry-600">{item.title}</p>
          {solved ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-berry-400">
              <span className="font-semibold">{item.date}</span> · {item.note}
            </motion.p>
          ) : (
            <p className="text-sm text-cocoa-400">📅 Date hidden until you solve it!</p>
          )}
        </div>
      </div>
      {!solved && (
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" className="rounded-lg bg-blush-100 px-2.5 py-1 text-berry-600 hover:bg-blush-200 disabled:opacity-30" onClick={() => move(pos, pos - 1)} disabled={pos === 0} aria-label={`Move “${item.title}” up`}>
            ▲
          </button>
          <button type="button" className="rounded-lg bg-blush-100 px-2.5 py-1 text-berry-600 hover:bg-blush-200 disabled:opacity-30" onClick={() => move(pos, pos + 1)} disabled={pos === total - 1} aria-label={`Move “${item.title}” down`}>
            ▼
          </button>
        </div>
      )}
    </li>
  );
}

export default function Level07Timeline({ onComplete }: LevelProps) {
  const [order, setOrder] = useState<number[]>(scrambled);
  const [checked, setChecked] = useState<boolean[] | null>(null);
  const [solved, setSolved] = useState(false);
  const [tries, setTries] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    sfx.slide();
    setOrder((o) => arrayMove(o, from, to));
    setChecked(null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = order.indexOf(Number(e.active.id) - 1);
    const to = order.indexOf(Number(e.over.id) - 1);
    move(from, to);
  };

  const check = () => {
    const result = order.map((v, i) => v === i);
    setTries((t) => t + 1);
    if (result.every(Boolean)) {
      setSolved(true);
      setChecked(null);
      onComplete();
    } else {
      sfx.error();
      setChecked(result);
    }
  };

  const correctCount = checked?.filter(Boolean).length ?? 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
      <div className="flex w-full items-center justify-between px-1 font-display text-sm font-semibold text-berry-400">
        <span>⬆ Oldest</span>
        <span className="chip">Checks: {tries}</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order.map((id) => id + 1)} strategy={verticalListSortingStrategy}>
          <ol className="relative flex w-full flex-col gap-3" aria-label="Timeline items, oldest first">
            <div className="absolute bottom-4 left-[30px] top-4 -z-0 w-1 rounded bg-blush-200 sm:left-[34px]" aria-hidden="true" />
            {order.map((id, pos) => (
              <TimelineCard key={id} id={id} pos={pos} total={order.length} status={checked ? (checked[pos] ? 'right' : 'wrong') : null} solved={solved} move={move} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <div className="flex w-full items-center justify-between px-1 font-display text-sm font-semibold text-berry-400">
        <span>⬇ Newest</span>
      </div>

      {!solved && (
        <button type="button" className="btn-primary" onClick={check} data-testid="timeline-check">
          Check my order 💌
        </button>
      )}
      <p className="min-h-[2rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
        {solved ? 'Perfect! That’s our story so far. 💞' : checked ? `${correctCount} of ${order.length} are in the right spot. Keep shuffling!` : ''}
      </p>
    </div>
  );
}
