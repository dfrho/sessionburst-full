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
  DragEndEvent,
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
import { generateUtm } from '@/lib/utils/generateUtm';

type ActionType = 'goto' | 'act' | 'extract' | 'observe';
type Action = {
  id: string;
  type: ActionType;
  value: string;
};

function ActionRow({
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

      <div className="text-gray-700">
        <select
          value={action.type}
          onChange={(e) =>
            onChangeAction(action.id, 'type', e.target.value as ActionType)
          }
          className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm text-gray-700 bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="goto">goto</option>
          <option value="act">act</option>
          <option value="extract">extract</option>
          <option value="observe">observe</option>
        </select>
      </div>

      <input
        type="text"
        value={action.value}
        onChange={(e) => onChangeAction(action.id, 'value', e.target.value)}
        placeholder={
          action.type === 'goto'
            ? 'https://example.com'
            : action.type === 'act'
            ? 'click login button'
            : action.type === 'extract'
            ? 'user profile data'
            : 'wait for element to appear'
        }
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-700 bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
  onSessionsCreated?: () => void;
};

export default function SessionModal({
  isOpen,
  onClose,
  onSessionsCreated,
}: ModalProps) {
  const [actions, setActions] = useState<Action[]>([
    { id: '1', type: 'goto', value: '' },
    { id: '2', type: 'act', value: '' },
  ]);
  const [sessionCount, setSessionCount] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const validateActions = () => {
    // Check if any action is empty
    const emptyActions = actions.filter((action) => !action.value.trim());
    if (emptyActions.length > 0) {
      return 'All actions must have a value';
    }

    // Make sure at least one "goto" action exists
    const hasGoto = actions.some((action) => action.type === 'goto');
    if (!hasGoto) {
      return 'At least one "goto" action is required';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate actions before submitting
    const validationError = validateActions();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);

    try {
      // Format actions for the API
      const formattedActions = actions.map(({ type, value }) => ({
        type,
        value,
      }));

      const sessionData = {
        actions: formattedActions,
        options: {
          browser: 'chromium',
          device: 'desktop',
          utm_params: generateUtm(),
        },
      };

      // Create one session first to test
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const data = await response.json();
      console.log('First session created:', data);

      // If first one succeeds and user requested multiple sessions, create the rest
      if (sessionCount > 1) {
        console.log(`Creating ${sessionCount - 1} additional sessions...`);

        const remainingPromises = Array.from({ length: sessionCount - 1 }, () =>
          fetch('/api/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...sessionData,
              options: {
                ...sessionData.options,
                utm_params: generateUtm(), // Generate unique UTM params for each session
              },
            }),
          }).then(async (response) => {
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to create session');
            }
            return response.json();
          })
        );

        await Promise.all(remainingPromises);
      }

      // Notify parent component of successful session creation
      if (onSessionsCreated) {
        onSessionsCreated();
      }

      // Close the modal
      onClose();
    } catch (err) {
      console.error('Session creation error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create sessions. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setActions([
      { id: '1', type: 'goto', value: '' },
      { id: '2', type: 'act', value: '' },
    ]);
    setSessionCount(1);
    setError(null);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          if (!isCreating) onClose();
        }}
      >
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
                  Create New Session Burst
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mb-4">
                    <label
                      htmlFor="sessionCount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Number of Sessions
                    </label>
                    <input
                      type="number"
                      id="sessionCount"
                      min="1"
                      max="50"
                      value={sessionCount}
                      onChange={(e) =>
                        setSessionCount(
                          Math.min(
                            50,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      disabled={isCreating}
                    />
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-gray-500">
                      Add at least one &apos;goto&apos; action followed by other
                      actions to simulate a user session.
                    </p>
                  </div>

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
                          <ActionRow
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
                    disabled={isCreating}
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
                      onClick={() => {
                        resetForm();
                        onClose();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create'}
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
