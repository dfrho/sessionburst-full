'use client';

import { useState } from 'react';

export default function SessionLogsFilter() {
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '7d',
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      >
        <option value="all">All Status</option>
        <option value="completed">Completed</option>
        <option value="running">Running</option>
        <option value="failed">Failed</option>
        <option value="created">Created</option>
      </select>

      <select
        value={filters.dateRange}
        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      >
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="all">All time</option>
      </select>

      <button
        onClick={() => setFilters({ status: 'all', dateRange: '7d' })}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Reset Filters
      </button>
    </div>
  );
}
