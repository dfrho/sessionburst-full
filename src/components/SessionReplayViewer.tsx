'use client';

import { useState } from 'react';
import { Session, ReplayEvent } from '@/types/session';
import {
  ArrowTopRightOnSquareIcon,
  CursorClickIcon,
  PencilSquareIcon,
  ArrowsUpDownIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

interface SessionReplayViewerProps {
  session: Session;
}

export default function SessionReplayViewer({
  session,
}: SessionReplayViewerProps) {
  const [activeTab, setActiveTab] = useState<'viewer' | 'timeline'>('viewer');

  // If we have neither replay data nor URL, show placeholder
  if (!session.replay && !session.replay_url) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>No replay available for this session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('viewer')}
            className={`${
              activeTab === 'viewer'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
          >
            Replay Viewer
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
          >
            Timeline
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'viewer' && session.replay_url ? (
          <div className="aspect-video">
            <iframe
              src={session.replay_url}
              className="w-full h-full border-0 rounded"
              allow="fullscreen"
            />
          </div>
        ) : activeTab === 'timeline' && session.replay ? (
          <Timeline events={session.replay.events} />
        ) : (
          <div className="text-center text-gray-500">
            <p>
              No {activeTab === 'viewer' ? 'replay viewer' : 'timeline'}{' '}
              available
            </p>
          </div>
        )}

        {/* Metadata */}
        {session.replay?.metadata && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">
              Session Details
            </h4>
            <dl className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="text-sm text-gray-900">
                  {session.replay.metadata.duration}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Browser</dt>
                <dd className="text-sm text-gray-900">
                  {session.replay.metadata.browser}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Viewport</dt>
                <dd className="text-sm text-gray-900">
                  {session.replay.metadata.viewport}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function Timeline({ events }: { events: ReplayEvent[] }) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={eventIdx}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    {getEventIcon(event.type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {getEventDescription(event)}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getEventIcon(type: string) {
  const className = 'h-5 w-5 text-gray-500';

  switch (type) {
    case 'navigation':
      return <ArrowTopRightOnSquareIcon className={className} />;
    case 'click':
      return <CursorClickIcon className={className} />;
    case 'input':
      return <PencilSquareIcon className={className} />;
    case 'scroll':
      return <ArrowsUpDownIcon className={className} />;
    default:
      return <QuestionMarkCircleIcon className={className} />;
  }
}

function getEventDescription(event: ReplayEvent) {
  switch (event.type) {
    case 'navigation':
      return `Navigated to ${event.data.url}`;
    case 'click':
      return `Clicked ${event.data.selector}`;
    case 'input':
      return `Entered text in ${event.data.selector}`;
    case 'scroll':
      return 'Scrolled page';
    default:
      return `${event.type} event`;
  }
}
