'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Bars3Icon as GripVerticalIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

type ActionType = 'goto' | 'act' | 'extract' | 'observe';
type Action = {
  id: string;
  type: ActionType;
  value: string;
};

function SortableRow({
  action,
  onChangeAction,
  onRemove,
}: {
  action: Action;
  onChangeAction: (id: string, field: 'type' | 'value', value: string) => void;
  onRemove: (id: string) => void;
}) {
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

  const getPlaceholder = (type: ActionType) => {
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
          onChangeAction(action.id, 'type', e.target.value as ActionType)
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
}

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SessionModal({ isOpen, onClose }: ModalProps) {
  const [actions, setActions] = useState<Action[]>([
    { id: '1', type: 'goto', value: '' },
    { id: '2', type: 'act', value: '' },
    { id: '3', type: 'extract', value: '' },
    { id: '4', type: 'observe', value: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleActionChange = (
    id: string,
    field: 'type' | 'value',
    newValue: string
  ) => {
    setActions(
      actions.map((action) =>
        action.id === id ? { ...action, [field]: newValue } : action
      )
    );
  };

  const handleAddAction = () => {
    const newId = String(Math.max(...actions.map((a) => Number(a.id))) + 1);
    setActions([...actions, { id: newId, type: 'act', value: '' }]);
  };

  const handleRemoveAction = (id: string) => {
    if (actions.length > 1) {
      setActions(actions.filter((action) => action.id !== id));
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setActions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const gotoAction = actions.find((a) => a.type === 'goto');
    if (!gotoAction?.value) {
      setError('Please enter a target domain in the goto field');
      return;
    }

    try {
      console.log('Actions:', actions);
      onClose();
    } catch (err) {
      setError('Failed to create session. Please try again.');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Create New Session
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={actions.map((a) => a.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {actions.map((action) => (
                          <SortableRow
                            key={action.id}
                            action={action}
                            onChangeAction={handleActionChange}
                            onRemove={handleRemoveAction}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="mt-4 inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Action
                  </button>

                  {error && (
                    <div className="mt-2 text-sm text-red-600">{error}</div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
