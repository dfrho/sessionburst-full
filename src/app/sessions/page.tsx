import { Suspense } from 'react';
import SessionLogsTable from '@/components/SessionLogsTable';
import SessionLogsFilter from '@/components/SessionLogsFilter';

export default async function SessionLogsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Session Logs</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all sessions including their status, duration, and actions
            performed.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <SessionLogsFilter />
        <Suspense fallback={<div>Loading sessions...</div>}>
          <SessionLogsTable />
        </Suspense>
      </div>
    </div>
  );
}
