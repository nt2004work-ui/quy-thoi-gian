-- Chạy file này trong Supabase: SQL Editor > New query > Run

create table if not exists settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  monthly_salary numeric not null default 0,   -- lương nhận mỗi tháng (VND)
  work_days int not null default 22,           -- số ngày công chuẩn / tháng
  hours_per_day numeric not null default 8,    -- số giờ chuẩn / ngày
  deduction_pct numeric not null default 10    -- % khấu trừ (BHXH, thuế...) áp dụng cho lương chính
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('main','side')),  -- main = việc chính, side = việc phụ
  title text not null,
  work_date date not null default current_date,
  minutes int not null check (minutes > 0),
  income numeric,                                      -- tiền nhận (chỉ dùng cho việc phụ)
  created_at timestamptz default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  plan_date date not null,
  title text not null,
  done boolean not null default false
);

create index if not exists entries_user_date on entries (user_id, work_date);
create index if not exists plans_user_date on plans (user_id, plan_date);

alter table settings enable row level security;
alter table entries enable row level security;
alter table plans enable row level security;

create policy "own settings" on settings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own entries" on entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own plans" on plans for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
