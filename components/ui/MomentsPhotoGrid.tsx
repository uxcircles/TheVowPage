"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { useHasFinePointer } from "@/lib/useHasFinePointer";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { momentsPhotoGridCopy } from "@/lib/i18n/dictionaries/dashboard";

export type MomentsPhotoItem = { id: string; url: string };

// Drag-and-drop only works well with a mouse - on touch screens the browser
// can't tell "dragging this photo" apart from "scrolling the page" without
// extra long-press handling that tends to feel janky. So this only offers
// drag on devices that report a fine pointer (i.e. a mouse), and falls back
// to explicit ↑/↓ buttons everywhere else instead of trying to make touch
// drag work.

function SortablePhoto({
  item,
  onRemove,
}: {
  item: MomentsPhotoItem;
  onRemove: (id: string) => void;
}) {
  const locale = useLocale();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-1.5">
      <div
        {...attributes}
        {...listeners}
        className="aspect-[4/5] cursor-grab touch-none overflow-hidden rounded border border-[var(--brand-line)] active:cursor-grabbing"
      >
        <img src={item.url} alt="" className="h-full w-full object-cover" />
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={momentsPhotoGridCopy.remove[locale]}
        className="self-end rounded border border-[var(--brand-line)] p-1.5 text-[var(--brand-ink-soft)] hover:border-[var(--brand-error)] hover:text-[var(--brand-error)]"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function StaticPhoto({
  item,
  index,
  count,
  disabled,
  onMove,
  onRemove,
}: {
  item: MomentsPhotoItem;
  index: number;
  count: number;
  disabled?: boolean;
  onMove: (id: string, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
}) {
  const locale = useLocale();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="aspect-[4/5] overflow-hidden rounded border border-[var(--brand-line)]">
        <img src={item.url} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={disabled || index === 0}
          onClick={() => onMove(item.id, "up")}
          aria-label={momentsPhotoGridCopy.moveUp[locale]}
          className="flex-1 rounded border border-[var(--brand-line)] py-1.5 text-[var(--brand-ink-soft)] disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={disabled || index === count - 1}
          onClick={() => onMove(item.id, "down")}
          aria-label={momentsPhotoGridCopy.moveDown[locale]}
          className="flex-1 rounded border border-[var(--brand-line)] py-1.5 text-[var(--brand-ink-soft)] disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(item.id)}
          aria-label={momentsPhotoGridCopy.remove[locale]}
          className="flex-1 rounded border border-[var(--brand-line)] py-1.5 text-[var(--brand-ink-soft)] hover:border-[var(--brand-error)] hover:text-[var(--brand-error)] disabled:opacity-30"
        >
          <TrashIcon className="mx-auto h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function MomentsPhotoGrid({
  items,
  disabled,
  onReorder,
  onMove,
  onRemove,
}: {
  items: MomentsPhotoItem[];
  disabled?: boolean;
  /** Desktop drag-drop: full new order after a drop. */
  onReorder: (orderedIds: string[]) => void;
  /** Mobile buttons: swap this item with its up/down neighbour. */
  onMove: (id: string, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
}) {
  const hasFinePointer = useHasFinePointer();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex).map((i) => i.id));
  }

  if (hasFinePointer) {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {items.map((item) => (
              <SortablePhoto key={item.id} item={item} onRemove={onRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item, i) => (
        <StaticPhoto
          key={item.id}
          item={item}
          index={i}
          count={items.length}
          disabled={disabled}
          onMove={onMove}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
