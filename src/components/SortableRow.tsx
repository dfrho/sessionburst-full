'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Props {
  action: {
    id: string;
    type: 'goto' | 'act' | 'extract' | 'observe';
    value: string;
  };
  onChangeAction: (id: string, field: 'type' | 'value', value: string) => void;
  onRemove: (id: string) => void;
}

const SortableRow = ({ action, onChangeAction, onRemove }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const getPlaceholder = (type: 'goto' | 'act' | 'extract' | 'observe') => {
    switch (type) {
      case 'goto':
        return 'https://example.com';
      case 'act':
        return 'click login button';
      case 'extract':
        return 'user profile data';
      case 'observe':
        return 'wait for element to appear';
      default:
        return '';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 bg-white rounded-lg border ${
        isDragging
          ? 'opacity-50 border-indigo-300 shadow-lg'
          : 'border-gray-200'
      }`}
    >
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="h-5 w-5" />
      </button>

      <select
        value={action.type}
        onChange={(e) =>
          onChangeAction(
            action.id,
            'type',
            e.target.value as 'goto' | 'act' | 'extract' | 'observe'
          )
        }
        className="w-28 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="goto">goto</option>
        <option value="act">act</option>
        <option value="extract">extract</option>
        <option value="observe">observe</option>
      </select>

      <input
        type="text"
        value={action.value}
        onChange={(e) => onChangeAction(action.id, 'value', e.target.value)}
        placeholder={getPlaceholder(action.type)}
        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />

      <button
        type="button"
        onClick={() => onRemove(action.id)}
        className="text-gray-400 hover:text-red-600 transition-colors"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SortableRow;
