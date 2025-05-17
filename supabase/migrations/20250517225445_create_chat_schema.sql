-- Create conversations table for organizing chat threads
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text default 'New Conversation',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  client_id text -- For anonymous tracking
);

-- Create messages table for storing individual chat messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  type text not null check (type in ('text', 'image')),
  created_at timestamptz default now()
);

-- Create index for faster message retrieval by conversation
create index messages_conversation_id_idx on public.messages(conversation_id);

-- Create index for finding conversations by client_id
create index conversations_client_id_idx on public.conversations(client_id);

-- Add function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger to conversations table to update the updated_at column
create trigger update_conversations_updated_at
before update on public.conversations
for each row
execute function update_updated_at_column();
