-- FILE CẬP NHẬT DUY NHẤT. Chạy trong Supabase: SQL Editor > New query > dán toàn bộ > Run.
-- Chạy lại nhiều lần cũng không sao, không mất dữ liệu. Đã gồm cả nội dung migration_002.sql.

-- 1) Giờ nghỉ trong ca
alter table entries add column if not exists break_minutes int not null default 0 check (break_minutes >= 0);

-- 2) Phụ cấp theo ngày
create table if not exists allowances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  amount numeric not null default 0 check (amount >= 0),
  created_at timestamptz default now()
);
create index if not exists allowances_user on allowances (user_id);
alter table allowances enable row level security;
drop policy if exists "own allowances" on allowances;
create policy "own allowances" on allowances for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 3) Lịch hằng ngày: giờ của từng việc, các cột tùy chỉnh
alter table plans add column if not exists at_time text;                       -- "HH:MM"
alter table plans add column if not exists extra jsonb not null default '{}';  -- giá trị các cột tùy chỉnh
alter table plans add column if not exists created_at timestamptz default now();
alter table settings add column if not exists plan_cols jsonb not null default '[]'; -- danh sách cột tùy chỉnh

-- 4) Quyền cho người đã đăng nhập (RLS vẫn giới hạn mỗi người chỉ thấy dữ liệu của mình)
grant usage on schema public to authenticated;
grant select, insert, update, delete on settings, entries, plans, allowances to authenticated;

-- 5) Báo PostgREST nạp lại cấu trúc bảng ngay
notify pgrst, 'reload schema';
