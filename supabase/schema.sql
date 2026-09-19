-- Supabase SQL schema untuk DinoyoCraft
-- Run ini di Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  role text check (role in ('user', 'admin', 'artisan')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Schedules table
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  start_time time not null,
  end_time time not null,
  max_capacity int not null default 20,
  current_bookings int not null default 0,
  is_locked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  schedule_id uuid references public.schedules(id) on delete cascade not null,
  group_name text not null,
  participant_count int not null,
  phone text not null,
  booking_code text unique not null default 'BK' || upper(substr(md5(random()::text), 1, 8)),
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  attended boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Participants table
create table public.participants (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  amount numeric(10,2) not null,
  payment_method text check (payment_method in ('transfer', 'va', 'ewallet', 'qris')) not null,
  status text check (status in ('pending', 'confirmed', 'failed')) default 'pending',
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Artworks table
create table public.artworks (
  id uuid default uuid_generate_v4() primary key,
  artisan_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric(10,2) not null,
  image_url text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Custom orders table
create table public.custom_orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  artisan_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  budget numeric(10,2) not null,
  status text check (status in ('draft', 'submitted', 'quoted', 'accepted', 'completed')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat messages table
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  is_from_admin boolean default false,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Alley map table
create table public.alley_map (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  latitude numeric(10,8) not null,
  longitude numeric(11,8) not null,
  artisan_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Financial reports table
create table public.financial_reports (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  booking_revenue numeric(12,2) default 0,
  custom_order_revenue numeric(12,2) default 0,
  total_revenue numeric(12,2) default 0,
  total_expenses numeric(12,2) default 0,
  profit numeric(12,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.schedules enable row level security;
alter table public.bookings enable row level security;
alter table public.participants enable row level security;
alter table public.payments enable row level security;
alter table public.artworks enable row level security;
alter table public.custom_orders enable row level security;
alter table public.chat_messages enable row level security;
alter table public.alley_map enable row level security;
alter table public.financial_reports enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Schedules policies
create policy "Schedules viewable by everyone"
  on schedules for select using (true);

create policy "Only admins can manage schedules"
  on schedules for all using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Bookings policies
create policy "Users can view own bookings"
  on bookings for select using (auth.uid() = user_id);

create policy "Admins can view all bookings"
  on bookings for select using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create own bookings"
  on bookings for insert with check (auth.uid() = user_id);

create policy "Admins can update bookings"
  on bookings for update using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Participants policies
create policy "Users can view participants for own bookings"
  on participants for select using (
    exists (
      select 1 from bookings 
      where bookings.id = participants.booking_id 
      and bookings.user_id = auth.uid()
    )
  );

create policy "Users can insert participants for own bookings"
  on participants for insert with check (
    exists (
      select 1 from bookings 
      where bookings.id = participants.booking_id 
      and bookings.user_id = auth.uid()
    )
  );

-- Payments policies
create policy "Users can view payments for own bookings"
  on payments for select using (
    exists (
      select 1 from bookings 
      where bookings.id = payments.booking_id 
      and bookings.user_id = auth.uid()
    )
  );

-- Artworks policies
create policy "Artworks viewable by everyone"
  on artworks for select using (true);

create policy "Artisans can manage own artworks"
  on artworks for all using (auth.uid() = artisan_id);

-- Custom orders policies
create policy "Users can view own custom orders"
  on custom_orders for select using (auth.uid() = user_id);

create policy "Artisans can view assigned orders"
  on custom_orders for select using (auth.uid() = artisan_id);

create policy "Users can create custom orders"
  on custom_orders for insert with check (auth.uid() = user_id);

-- Chat policies
create policy "Users can view own messages"
  on chat_messages for select using (
    auth.uid() = sender_id or auth.uid() = recipient_id
  );

create policy "Users can send messages"
  on chat_messages for insert with check (auth.uid() = sender_id);

-- Alley map policies
create policy "Alley map viewable by everyone"
  on alley_map for select using (true);

-- Financial reports policies
create policy "Only admins can view financial reports"
  on financial_reports for select using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Functions

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger schedules_updated_at before update on public.schedules
  for each row execute procedure public.handle_updated_at();

create trigger bookings_updated_at before update on public.bookings
  for each row execute procedure public.handle_updated_at();

create trigger payments_updated_at before update on public.payments
  for each row execute procedure public.handle_updated_at();

create trigger artworks_updated_at before update on public.artworks
  for each row execute procedure public.handle_updated_at();

create trigger custom_orders_updated_at before update on public.custom_orders
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ADDITIONS — run these if schema was already applied before
-- ============================================================

-- Add attended column to participants (if not exists)
alter table public.participants
  add column if not exists attended boolean default false;

-- ============================================================
-- Atomic RPC: increment_bookings
-- Prevents race condition when multiple users book simultaneously
-- ============================================================
create or replace function public.increment_bookings(
  schedule_id uuid,
  increment_by int
)
returns void as $$
begin
  update public.schedules
  set current_bookings = current_bookings + increment_by,
      updated_at = now()
  where id = schedule_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Additional policies for admin
-- ============================================================

-- Allow admins to update participants (mark attendance)
create policy "Admins can update participants"
  on participants for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to view all participants
create policy "Admins can view all participants"
  on participants for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to insert chat messages (reply to users)
create policy "Admins can send messages"
  on chat_messages for insert with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to update chat messages (mark as read)
create policy "Admins can update chat messages"
  on chat_messages for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to view all chat messages
create policy "Admins can view all chat messages"
  on chat_messages for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to manage alley map
create policy "Admins can manage alley map"
  on alley_map for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to manage financial reports
create policy "Only admins can insert financial reports"
  on financial_reports for insert with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Grant execute on RPC to authenticated users
grant execute on function public.increment_bookings(uuid, int) to authenticated;

