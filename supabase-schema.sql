-- ChitMate Supabase schema
-- Run this file in Supabase SQL Editor after creating a project.

create extension if not exists pgcrypto;

create type public.member_status as enum ('active', 'inactive', 'pending_kyc');
create type public.chit_type as enum ('auction', 'fixed', 'committee', 'loan', 'premium');
create type public.frequency_type as enum ('daily', 'weekly', 'monthly', 'yearly');
create type public.cycle_status as enum ('open', 'closed', 'draft');
create type public.payment_status as enum ('due', 'partial', 'paid', 'advance', 'arrears');
create type public.ledger_entry_type as enum ('contribution', 'commission', 'auction_payout', 'dividend', 'loan_disbursement', 'loan_interest', 'adjustment');
create type public.auction_status as enum ('scheduled', 'open', 'settled', 'cancelled');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  phone text,
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'admin', 'staff', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.chit_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  chit_type public.chit_type not null,
  frequency public.frequency_type not null default 'monthly',
  total_value numeric(14,2) not null check (total_value > 0),
  member_count integer not null check (member_count > 0),
  installment_amount numeric(14,2) not null check (installment_amount >= 0),
  commission_rate numeric(5,2) not null default 0 check (commission_rate between 0 and 100),
  start_date date not null default current_date,
  status text not null default 'active' check (status in ('active', 'closing', 'closed')),
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  status public.member_status not null default 'pending_kyc',
  kyc_status text not null default 'pending' check (kyc_status in ('pending', 'verified', 'rejected')),
  kyc_document_path text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.chit_groups(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  joined_at date not null default current_date,
  payout_cycle integer check (payout_cycle > 0),
  is_winner boolean not null default false,
  primary key (group_id, member_id)
);

create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.chit_groups(id) on delete cascade,
  cycle_number integer not null check (cycle_number > 0),
  due_date date not null,
  status public.cycle_status not null default 'open',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  unique (group_id, cycle_number)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  payment_status public.payment_status not null default 'paid',
  payment_method text not null default 'cash' check (payment_method in ('cash', 'upi', 'bank', 'other')),
  reference_number text,
  collected_by uuid references auth.users(id) on delete set null,
  paid_at timestamptz not null default now(),
  notes text
);

create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null unique references public.cycles(id) on delete cascade,
  status public.auction_status not null default 'scheduled',
  scheduled_at timestamptz not null,
  bid_amount numeric(14,2),
  discount_amount numeric(14,2),
  commission_amount numeric(14,2),
  dividend_per_member numeric(14,2),
  winner_member_id uuid references public.members(id) on delete set null,
  settled_at timestamptz,
  notes text
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  group_id uuid references public.chit_groups(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete set null,
  member_id uuid references public.members(id) on delete set null,
  entry_type public.ledger_entry_type not null,
  description text not null,
  credit numeric(14,2) not null default 0 check (credit >= 0),
  debit numeric(14,2) not null default 0 check (debit >= 0),
  reference_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (credit > 0 or debit > 0),
  check (not (credit > 0 and debit > 0))
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete cascade,
  channel text not null default 'whatsapp' check (channel in ('sms', 'email', 'whatsapp')),
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create index payments_cycle_member_idx on public.payments(cycle_id, member_id);
create index ledger_group_created_idx on public.ledger_entries(group_id, created_at desc);
create index reminders_pending_idx on public.reminders(status, scheduled_for);

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_memberships where organization_id = target_org and user_id = auth.uid());
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_memberships where organization_id = target_org and user_id = auth.uid() and role in ('owner', 'admin'));
$$;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.chit_groups enable row level security;
alter table public.members enable row level security;
alter table public.group_members enable row level security;
alter table public.cycles enable row level security;
alter table public.payments enable row level security;
alter table public.auctions enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.reminders enable row level security;

create policy "members can view organizations" on public.organizations for select using (public.is_org_member(id));
create policy "owners create organizations" on public.organizations for insert with check (owner_id = auth.uid());
create policy "members view memberships" on public.organization_memberships for select using (public.is_org_member(organization_id));
create policy "admins manage memberships" on public.organization_memberships for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy "org members manage groups" on public.chit_groups for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "org members manage members" on public.members for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "org members manage group members" on public.group_members for all using (exists (select 1 from public.chit_groups g where g.id = group_id and public.is_org_member(g.organization_id))) with check (exists (select 1 from public.chit_groups g where g.id = group_id and public.is_org_member(g.organization_id)));
create policy "org members manage cycles" on public.cycles for all using (exists (select 1 from public.chit_groups g where g.id = group_id and public.is_org_member(g.organization_id))) with check (exists (select 1 from public.chit_groups g where g.id = group_id and public.is_org_member(g.organization_id)));
create policy "org members manage payments" on public.payments for all using (exists (select 1 from public.cycles c join public.chit_groups g on g.id = c.group_id where c.id = cycle_id and public.is_org_member(g.organization_id))) with check (exists (select 1 from public.cycles c join public.chit_groups g on g.id = c.group_id where c.id = cycle_id and public.is_org_member(g.organization_id)));
create policy "org members manage auctions" on public.auctions for all using (exists (select 1 from public.cycles c join public.chit_groups g on g.id = c.group_id where c.id = cycle_id and public.is_org_member(g.organization_id))) with check (exists (select 1 from public.cycles c join public.chit_groups g on g.id = c.group_id where c.id = cycle_id and public.is_org_member(g.organization_id)));
create policy "org members manage ledger" on public.ledger_entries for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "org members manage reminders" on public.reminders for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

-- Storage bucket for KYC documents. Keep it private and serve files with signed URLs.
insert into storage.buckets (id, name, public) values ('kyc-documents', 'kyc-documents', false) on conflict (id) do nothing;
create policy "org members upload kyc" on storage.objects for insert with check (bucket_id = 'kyc-documents' and auth.uid() is not null);
create policy "org members read kyc" on storage.objects for select using (bucket_id = 'kyc-documents' and auth.uid() is not null);
