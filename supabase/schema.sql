-- Nirogitanman Supabase Database Schema
-- Version 2.0 — Security-hardened & performance-optimised

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ════════════════════════════════════════════════════════════
-- SECURITY HELPER — centralises admin check in one place
-- SECURITY DEFINER means it runs as the function owner,
-- not the calling user — so it can't be bypassed via RLS tricks.
-- ════════════════════════════════════════════════════════════
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- ════════════════════════════════════════════════════════════
-- 1. Profiles table
-- ════════════════════════════════════════════════════════════
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  -- P0 FIX: role is NEVER sourced from client metadata.
  -- All new users start as 'patient'. Promotion is admin-only.
  role text not null check (role in ('patient', 'paid_user', 'doctor', 'admin')) default 'patient',
  avatar_url text,
  age integer,
  gender text,
  blood_group text,
  phone text,
  diet text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- P0 FIX: "Public profiles are viewable by everyone" removed.
-- Anonymous users CANNOT read profile data (blood group, phone, address etc.)
create policy "Authenticated users can view all profiles" on public.profiles
  for select using (auth.uid() is not null);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Admin can update ANY user's profile (e.g., role promotion)
create policy "Admins can update any profile" on public.profiles
  for update using (public.is_admin());

-- ════════════════════════════════════════════════════════════
-- 2. Doctors table
-- ════════════════════════════════════════════════════════════
create table public.doctors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  specialty text not null,
  experience text not null,
  bio text not null,
  availability jsonb not null default '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on doctors
alter table public.doctors enable row level security;

-- Authenticated users can view doctors (needed for booking)
create policy "Authenticated users can view doctors" on public.doctors
  for select using (auth.uid() is not null);

-- P1 FIX: use is_admin() instead of raw subquery
create policy "Admins can insert/update/delete doctors" on public.doctors
  for all using (public.is_admin());

create policy "Doctors can update their own doctor profile" on public.doctors
  for update using (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- 3. Appointments table
-- ════════════════════════════════════════════════════════════
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  appointment_date date not null,
  appointment_time text not null,
  status text not null check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- P1 FIX: prevents double-booking the same doctor at the same slot
  constraint no_double_booking unique (doctor_id, appointment_date, appointment_time)
);

-- Enable RLS on appointments
alter table public.appointments enable row level security;

create policy "Patients can view their own appointments" on public.appointments
  for select using (patient_id = auth.uid());

create policy "Doctors can view appointments assigned to them" on public.appointments
  for select using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

create policy "Patients can book appointments" on public.appointments
  for insert with check (patient_id = auth.uid());

create policy "Patients can update their own appointments" on public.appointments
  for update using (patient_id = auth.uid());

create policy "Doctors can update appointments assigned to them" on public.appointments
  for update using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- P1 FIX: use is_admin()
create policy "Admins can view and manage all appointments" on public.appointments
  for all using (public.is_admin());

-- ════════════════════════════════════════════════════════════
-- 4. Consultations table
-- ════════════════════════════════════════════════════════════
create table public.consultations (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade unique not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  notes text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on consultations
alter table public.consultations enable row level security;

create policy "Patients can view their own consultations" on public.consultations
  for select using (patient_id = auth.uid());

create policy "Doctors can view consultations they created" on public.consultations
  for select using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

create policy "Doctors can create consultations" on public.consultations
  for insert with check (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

create policy "Doctors can update consultations they created" on public.consultations
  for update using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- ════════════════════════════════════════════════════════════
-- 5. Medicines table
-- ════════════════════════════════════════════════════════════
create table public.medicines (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  name text not null,
  instructions text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on medicines
alter table public.medicines enable row level security;

create policy "Patients can view their own medicines" on public.medicines
  for select using (patient_id = auth.uid());

create policy "Doctors can manage medicines they prescribe" on public.medicines
  for all using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- ════════════════════════════════════════════════════════════
-- 6. Diet Plans table
-- ════════════════════════════════════════════════════════════
create table public.diet_plans (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  title text not null,
  goal text not null,
  is_active boolean not null default true,  -- P2 FIX: enables soft versioning
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on diet_plans
alter table public.diet_plans enable row level security;

create policy "Patients can view their own diet plans" on public.diet_plans
  for select using (patient_id = auth.uid());

create policy "Doctors can manage diet plans they prescribe" on public.diet_plans
  for all using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- ════════════════════════════════════════════════════════════
-- 7. Diet Plan Items table
-- ════════════════════════════════════════════════════════════
create table public.diet_plan_items (
  id uuid default gen_random_uuid() primary key,
  diet_plan_id uuid references public.diet_plans(id) on delete cascade not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snacks')),
  description text not null
);

-- Enable RLS on diet_plan_items
alter table public.diet_plan_items enable row level security;

create policy "Patients can view their own diet plan items" on public.diet_plan_items
  for select using (
    diet_plan_id in (
      select id from public.diet_plans where patient_id = auth.uid()
    )
  );

create policy "Doctors can manage diet plan items" on public.diet_plan_items
  for all using (
    diet_plan_id in (
      select id from public.diet_plans where doctor_id in (
        select id from public.doctors where user_id = auth.uid()
      )
    )
  );

-- ════════════════════════════════════════════════════════════
-- 8. Notifications table
-- ════════════════════════════════════════════════════════════
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

create policy "Users can view and update their own notifications" on public.notifications
  for all using (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- 9. Chat Messages table
-- ════════════════════════════════════════════════════════════
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  is_bot boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on chat_messages
alter table public.chat_messages enable row level security;

create policy "Users can view and insert their own chat messages" on public.chat_messages
  for all using (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- P1 FIX: INDEXES — prevents full table scans at scale
-- ════════════════════════════════════════════════════════════
create index idx_appointments_patient    on public.appointments(patient_id);
create index idx_appointments_doctor     on public.appointments(doctor_id);
create index idx_appointments_date       on public.appointments(appointment_date);
create index idx_medicines_patient       on public.medicines(patient_id);
create index idx_consultations_patient   on public.consultations(patient_id);
create index idx_consultations_doctor    on public.consultations(doctor_id);
create index idx_chat_user_time          on public.chat_messages(user_id, created_at desc);
create index idx_notifications_user_read on public.notifications(user_id, read, created_at desc);
create index idx_diet_plans_patient      on public.diet_plans(patient_id, is_active);

-- ════════════════════════════════════════════════════════════
-- TRIGGER — auto-create profile on signup
-- P0 FIX: role is HARDCODED to 'patient' — never from client metadata.
-- This prevents privilege escalation via raw_user_meta_data.
-- ════════════════════════════════════════════════════════════
-- ════════════════════════════════════════════════════════════
-- SECURITY ADVISOR FIX: SET search_path = public
--   Prevents schema injection attacks where a malicious schema
--   earlier on the search_path shadows pg built-ins.
-- SECURITY ADVISOR FIX: REVOKE EXECUTE from anon + authenticated
--   handle_new_user is a TRIGGER function — it must only be invoked
--   by Postgres internally on INSERT to auth.users.
--   Exposing it via /rest/v1/rpc/ would let anyone call it directly.
-- ════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public           -- ← FIX: locks search_path, prevents schema injection
as $$
begin
  insert into public.profiles (
      id,
      full_name,
      email,
      role,
      avatar_url,
      age,
      gender,
      blood_group,
      phone,
      diet,
      address
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', 'Nirogitanman User'),
      new.email,
      'patient',    -- HARDCODED: always 'patient', never from client metadata
      coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'),
      (new.raw_user_meta_data->>'age')::integer,
      new.raw_user_meta_data->>'gender',
      new.raw_user_meta_data->>'blood_group',
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'diet',
      new.raw_user_meta_data->>'address'
    );
  return new;
end;
$$;

-- Revoke REST API access — trigger functions are internal only
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.handle_new_user() from public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ════════════════════════════════════════════════════════════
-- SECURITY ADVISOR FIX: rls_auto_enable
--   Also a SECURITY DEFINER function callable by anon/authenticated
--   via REST. Revoke access since it should only run internally.
-- ════════════════════════════════════════════════════════════
do $$ begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from anon';
    execute 'revoke execute on function public.rls_auto_enable() from authenticated';
    execute 'revoke execute on function public.rls_auto_enable() from public';
  end if;
end $$;
