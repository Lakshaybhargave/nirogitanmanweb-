-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  email text not null,
  role text default 'patient' check (role in ('patient', 'doctor', 'paid_user', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Doctors Table
create table public.doctors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  specialty text,
  experience text,
  bio text,
  availability jsonb default '["Monday", "Wednesday", "Friday"]'::jsonb,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Appointments Table
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  appointment_date date not null,
  appointment_time text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Consultations Table
create table public.consultations (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  notes text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Medicines Table
create table public.medicines (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  name text not null,
  instructions text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Diet Plans Table
create table public.diet_plans (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  title text not null,
  goal text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Diet Plan Items Table
create table public.diet_plan_items (
  id uuid default uuid_generate_v4() primary key,
  diet_plan_id uuid references public.diet_plans(id) on delete cascade not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snacks')),
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.consultations enable row level security;
alter table public.medicines enable row level security;
alter table public.diet_plans enable row level security;
alter table public.diet_plan_items enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Policies for Doctors
create policy "Doctors are viewable by everyone" on doctors for select using (true);
create policy "Doctors can insert their own profile" on doctors for insert with check (auth.uid() = user_id);
create policy "Doctors can update their own profile" on doctors for update using (auth.uid() = user_id);

-- Policies for Appointments
create policy "Patients can view own appointments" on appointments for select using (auth.uid() = patient_id);
create policy "Doctors can view assigned appointments" on appointments for select using (
  exists (select 1 from doctors where user_id = auth.uid() and id = appointments.doctor_id)
);
create policy "Patients can book appointments" on appointments for insert with check (auth.uid() = patient_id);
create policy "Doctors can update assigned appointments" on appointments for update using (
  exists (select 1 from doctors where user_id = auth.uid() and id = appointments.doctor_id)
);
create policy "Patients can cancel own appointments" on appointments for update using (auth.uid() = patient_id);

-- Policies for Consultations
create policy "Patients can view own consultations" on consultations for select using (auth.uid() = patient_id);
create policy "Doctors can view and create assigned consultations" on consultations for select using (
  exists (select 1 from doctors where user_id = auth.uid() and id = consultations.doctor_id)
);
create policy "Doctors can insert assigned consultations" on consultations for insert with check (
  exists (select 1 from doctors where user_id = auth.uid() and id = consultations.doctor_id)
);

-- Policies for Medicines
create policy "Patients can view own medicines" on medicines for select using (auth.uid() = patient_id);
create policy "Doctors can view and prescribe medicines" on medicines for select using (
  exists (select 1 from doctors where user_id = auth.uid() and id = medicines.doctor_id)
);
create policy "Doctors can insert medicines" on medicines for insert with check (
  exists (select 1 from doctors where user_id = auth.uid() and id = medicines.doctor_id)
);

-- Policies for Diet Plans & Items
create policy "Patients can view own diet plans" on diet_plans for select using (auth.uid() = patient_id);
create policy "Doctors can view and create diet plans" on diet_plans for select using (
  exists (select 1 from doctors where user_id = auth.uid() and id = diet_plans.doctor_id)
);
create policy "Doctors can insert diet plans" on diet_plans for insert with check (
  exists (select 1 from doctors where user_id = auth.uid() and id = diet_plans.doctor_id)
);

create policy "Patients can view own diet plan items" on diet_plan_items for select using (
  exists (select 1 from diet_plans where id = diet_plan_items.diet_plan_id and patient_id = auth.uid())
);
create policy "Doctors can view and create diet plan items" on diet_plan_items for select using (
  exists (select 1 from diet_plans where id = diet_plan_items.diet_plan_id and exists (
    select 1 from doctors where user_id = auth.uid() and id = diet_plans.doctor_id
  ))
);
create policy "Doctors can insert diet plan items" on diet_plan_items for insert with check (
  exists (select 1 from diet_plans where id = diet_plan_items.diet_plan_id and exists (
    select 1 from doctors where user_id = auth.uid() and id = diet_plans.doctor_id
  ))
);

-- Admins get full access to everything
create policy "Admins have full access to profiles" on profiles for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to doctors" on doctors for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to appointments" on appointments for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to consultations" on consultations for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to medicines" on medicines for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to diet plans" on diet_plans for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to diet plan items" on diet_plan_items for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- Database Function & Trigger to automatically create a profile on user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'patient')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error if re-running
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
