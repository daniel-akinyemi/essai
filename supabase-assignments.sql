-- Supabase Assignments Feature Schema & RLS Policies

-- 1. Classrooms Table
create table if not exists classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid references auth.users(id) not null
);

-- 2. Classroom Members Table
create table if not exists classroom_members (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid references classrooms(id) not null,
  user_id uuid references auth.users(id) not null,
  role text check (role in ('student', 'teacher')) not null
);

-- 3. Assignments Table
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid references classrooms(id) not null,
  title text not null,
  instructions text not null,
  assigned_by uuid references auth.users(id) not null,
  due_date timestamp with time zone not null,
  allow_resubmission boolean default false
);

-- 4. Submissions Table
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) not null,
  student_id uuid references auth.users(id) not null,
  essay text not null,
  submitted_at timestamp with time zone default now(),
  feedback text,
  status text check (status in ('submitted', 'late')) default 'submitted',
  resubmitted boolean default false
);

-- 5. RLS Policies
-- Enable RLS
alter table classrooms enable row level security;
alter table classroom_members enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;

-- Policy: Students can see classrooms they are a member of
create policy "Students can view their classrooms" on classrooms
  for select using (exists (
    select 1 from classroom_members m where m.classroom_id = id and m.user_id = auth.uid()
  ));

-- Policy: Students can see their classroom memberships
create policy "Students can view their classroom memberships" on classroom_members
  for select using (user_id = auth.uid());

-- Policy: Students can see assignments for their classrooms
create policy "Students can view assignments for their classrooms" on assignments
  for select using (exists (
    select 1 from classroom_members m where m.classroom_id = classroom_id and m.user_id = auth.uid()
  ));

-- Policy: Students can select their own submissions
create policy "Students can select their own submissions" on submissions
  for select using (student_id = auth.uid());

-- Policy: Students can insert their own submissions
create policy "Students can insert their own submissions" on submissions
  for insert with check (student_id = auth.uid());

-- Policy: Students can update their own submissions
create policy "Students can update their own submissions" on submissions
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Policy: Students can only insert submissions for assignments in their classrooms
create policy "Students can submit to assignments in their classrooms" on submissions
  for insert with check (exists (
    select 1 from assignments a
    join classroom_members m on a.classroom_id = m.classroom_id
    where a.id = assignment_id and m.user_id = auth.uid()
  )); 