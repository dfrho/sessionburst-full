'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/lib/types/supabase';
import { formatDistanceToNow } from 'date-fns';
import SessionModal from '@/components/SessionModal';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Immediately check auth state
    const checkAuth = async () => {
      console.log('Checking auth state...');
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();
      console.log('Auth check result:', { currentUser, error });

      if (currentUser) {
        console.log('User is authenticated:', currentUser.id);
        setUser(currentUser);
        fetchRecentSessions(currentUser.id);
      } else {
        console.log('No authenticated user found');
        setUser(null);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRecentSessions(session.user.id);
      } else {
        setRecentSessions([]);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const fetchRecentSessions = async (userId: string) => {
    console.log('Fetching sessions for user:', userId);
    try {
      const response = await fetch(`/api/sessions?limit=5&days=7`);
      console.log('Sessions API response status:', response.status);

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        return;
      }

      console.log('Parsed sessions data:', data);

      if (response.status === 401) {
        console.error('Unauthorized access to sessions');
        setRecentSessions([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }

      setRecentSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      setRecentSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-4">
        Please sign in to view your sessions.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Active Sessions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">0</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Sessions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">0</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Usage This Month
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">0%</dd>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Session
        </button>
      </div>

      {/* Recent Sessions Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Sessions
          </h3>
          <div className="mt-4">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/sessions/${session.id}`)
                    }
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Session {session.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(session.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        session.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : session.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Link
                    href="/sessions"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all sessions →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No recent sessions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new session.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Modal */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
