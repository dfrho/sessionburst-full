'use client';

import { useState } from 'react';
import SessionModal from '@/components/SessionModal';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Sessions</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Usage This Month
          </h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">0%</p>
        </div>
      </div>

      {/* Create Session Button */}
      <div className="mt-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Session
        </button>
      </div>

      {/* Recent Sessions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Sessions</h2>
        <div className="mt-4 bg-white shadow rounded-lg">
          <div className="p-6 text-center text-gray-500">
            No sessions created yet
          </div>
        </div>
      </div>

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
