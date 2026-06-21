-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run

create extension if not exists "pgcrypto";

create table classes (
  id uuid primary key default gen_random_uuid(),
  class_date date not null,
  day_label text not null,
  time text not null,
  duration int not null default 45,
  name text not null,
  description text not null default '',
  price int not null default 10,
  places int not null default 5,
  is_formule boolean not null default false,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  status text not null default 'nouveau',
  created_at timestamptz not null default now()
);

-- Sécurité (Row Level Security)
alter table classes enable row level security;
alter table bookings enable row level security;

-- Tout le monde peut voir le planning
create policy "public read classes" on classes
  for select using (true);

-- Seule une personne connectée (Āki) peut ajouter/modifier/supprimer des cours
create policy "auth write classes" on classes
  for insert with check (auth.uid() is not null);
create policy "auth update classes" on classes
  for update using (auth.uid() is not null);
create policy "auth delete classes" on classes
  for delete using (auth.uid() is not null);

-- N'importe qui peut envoyer une demande de réservation
create policy "public insert bookings" on bookings
  for insert with check (true);

-- Seule une personne connectée peut lire/gérer les demandes reçues
create policy "auth read bookings" on bookings
  for select using (auth.uid() is not null);
create policy "auth update bookings" on bookings
  for update using (auth.uid() is not null);
create policy "auth delete bookings" on bookings
  for delete using (auth.uid() is not null);

-- Quelques cours de démonstration (à supprimer ou modifier depuis l'admin)
insert into classes (class_date, day_label, time, duration, name, description, price, places, is_formule) values
  (current_date + 1, 'À venir', '09:00', 45, 'Pilates Reformer', 'Studio Villelongue · niveau débutant', 10, 5, false),
  (current_date + 1, 'À venir', '10:00', 60, 'Pilates & petit-déj', 'Cours + petit-déj convivial ensuite', 20, 6, true),
  (current_date + 1, 'À venir', '12:15', 45, 'Pilates Sol', 'Studio Villelongue · tous niveaux', 10, 5, false);
