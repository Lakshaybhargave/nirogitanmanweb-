-- Nirogitanman Supabase Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('patient', 'paid_user', 'doctor', 'admin')) default 'patient',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Doctors table
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

-- Doctors policies
create policy "Doctors are viewable by everyone" on public.doctors
  for select using (true);

create policy "Admins can insert/update/delete doctors" on public.doctors
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Doctors can update their own doctor profile" on public.doctors
  for update using (user_id = auth.uid());

-- 3. Appointments table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  appointment_date date not null,
  appointment_time text not null,
  status text not null check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on appointments
alter table public.appointments enable row level security;

-- Appointments policies
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

create policy "Admins can view and manage all appointments" on public.appointments
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 4. Consultations table
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

-- Consultations policies
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

-- 5. Medicines table
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

-- Medicines policies
create policy "Patients can view their own medicines" on public.medicines
  for select using (patient_id = auth.uid());

create policy "Doctors can manage medicines they prescribe" on public.medicines
  for all using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- 6. Diet Plans table
create table public.diet_plans (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  title text not null,
  goal text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on diet_plans
alter table public.diet_plans enable row level security;

-- Diet plans policies
create policy "Patients can view their own diet plans" on public.diet_plans
  for select using (patient_id = auth.uid());

create policy "Doctors can manage diet plans they prescribe" on public.diet_plans
  for all using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- 7. Diet Plan Items table
create table public.diet_plan_items (
  id uuid default gen_random_uuid() primary key,
  diet_plan_id uuid references public.diet_plans(id) on delete cascade not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snacks')),
  description text not null
);

-- Enable RLS on diet_plan_items
alter table public.diet_plan_items enable row level security;

-- Diet plan items policies
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

-- 8. Notifications table
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

-- Notifications policies
create policy "Users can view and update their own notifications" on public.notifications
  for all using (user_id = auth.uid());

-- 9. Chat Messages table
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  is_bot boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on chat_messages
alter table public.chat_messages enable row level security;

-- Chat messages policies
create policy "Users can view and insert their own chat messages" on public.chat_messages
  for all using (user_id = auth.uid());


-- TRIGGERS TO AUTOMATICALLY CREATE PROFILE ON SIGNUP
-- Create a trigger that maps auth.users to public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Nirogitanman User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
