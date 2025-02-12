-- Create sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  stagehand_session_id text not null,
  actions jsonb not null,
  options jsonb,
  status text default 'created' check (status in ('created', 'running', 'completed', 'failed')),
  results jsonb,
  error text
);

-- Enable RLS (Row Level Security)
alter table public.sessions enable row level security;

-- Create policy to allow users to read their own sessions
create policy "Users can view their own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

-- Create policy to allow users to create their own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- Create index for faster queries
create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_created_at_idx on public.sessions(created_at); 