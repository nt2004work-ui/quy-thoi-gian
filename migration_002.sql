-- Chạy trong Supabase: SQL Editor > New query > Run. Chạy lại nhiều lần cũng không sao.
-- Thêm: giờ nghỉ trong ca (entries.break_minutes) và bảng phụ cấp theo ngày (allowances).

alter table entries add column if not exists break_minutes int not null default 0 check (break_minutes >= 0);

create table if not exists allowances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,                                  -- VD: Tiền cơm
  amount numeric not null default 0 check (amount >= 0), -- số tiền mỗi ngày đi làm (VND)
  created_at timestamptz default now()
);
create index if not exists allowances_user on allowances (user_id);

alter table allowances enable row level security;
drop policy if exists "own allowances" on allowances;
create policy "own allowances" on allowances for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on allowances to authenticated;
