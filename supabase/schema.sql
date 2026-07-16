--
-- PostgreSQL database dump
--

\restrict jluaV9qdidvIOOax1oSpVq5D018sh1DjvAb74hibSAQzmWorVouSWjb0VVUMyBH

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: account_subtype; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_subtype AS ENUM (
    'bank',
    'credit_card',
    'cash',
    'receivable',
    'payable',
    'loan',
    'income',
    'expense'
);


--
-- Name: account_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_type AS ENUM (
    'asset',
    'liability',
    'income',
    'expense',
    'equity'
);


--
-- Name: entity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.entity_type AS ENUM (
    'self',
    'person',
    'company'
);


--
-- Name: txn_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.txn_action AS ENUM (
    'income',
    'expense',
    'paid_on_behalf',
    'refund_received',
    'borrowed',
    'repaid',
    'transfer'
);


--
-- Name: check_transaction_balanced(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_transaction_balanced() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  txn_id uuid;
  total_debit numeric;
  total_credit numeric;
begin
  txn_id := coalesce(new.transaction_id, old.transaction_id);

  select coalesce(sum(debit),0), coalesce(sum(credit),0)
    into total_debit, total_credit
    from transaction_lines
    where transaction_id = txn_id;

  if total_debit <> total_credit then
    raise exception 'Transaction % is not balanced: debits % != credits %',
      txn_id, total_debit, total_credit;
  end if;

  return null;
end;
$$;


--
-- Name: delete_master_table(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_master_table(tbl text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF tbl IN ('master_cards','master_programs','master_partners','master_milestones') THEN
    EXECUTE format('TRUNCATE %I CASCADE', tbl);
  END IF;
END;
$$;


--
-- Name: log_transaction_audit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_transaction_audit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_transaction_id uuid;
  v_entity_table text;
begin
  if TG_TABLE_NAME = 'transactions' then
    v_transaction_id := old.id;
    v_entity_table := 'transactions';
  else
    v_transaction_id := old.transaction_id;
    v_entity_table := 'transaction_lines';
  end if;

  insert into transaction_audit_log(user_id, transaction_id, entity_table, row_id, action, previous_data)
  values (auth.uid(), v_transaction_id, v_entity_table, old.id, lower(TG_OP), to_jsonb(old));

  return old;
end;
$$;


--
-- Name: account_balances; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.account_balances AS
SELECT
    NULL::uuid AS account_id,
    NULL::uuid AS user_id,
    NULL::text AS name,
    NULL::public.account_type AS type,
    NULL::public.account_subtype AS subtype,
    NULL::uuid AS entity_id,
    NULL::numeric AS balance;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_statements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_statements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    statement_date date,
    due_date date,
    total_due numeric(14,2),
    minimum_due numeric(14,2),
    previous_balance numeric(14,2),
    closing_balance numeric(14,2),
    source_file text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    label text,
    parsed_debits numeric,
    parsed_credits numeric,
    parsed_opening_balance numeric
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    type public.account_type NOT NULL,
    subtype public.account_subtype NOT NULL,
    entity_id uuid,
    currency text DEFAULT 'INR'::text NOT NULL,
    opening_balance numeric(14,2) DEFAULT 0 NOT NULL,
    is_archived boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_id uuid,
    linked_my_card_id uuid,
    logo_url text,
    bank_name text,
    last4 text,
    excluded_from_spend_tracker boolean DEFAULT false,
    is_favourite boolean DEFAULT false,
    CONSTRAINT entity_link_check CHECK ((((subtype = ANY (ARRAY['receivable'::public.account_subtype, 'payable'::public.account_subtype])) AND (entity_id IS NOT NULL)) OR (subtype <> ALL (ARRAY['receivable'::public.account_subtype, 'payable'::public.account_subtype])))),
    CONSTRAINT owner_required_for_personal_accounts CHECK ((((type = ANY (ARRAY['asset'::public.account_type, 'liability'::public.account_type])) AND (owner_id IS NOT NULL)) OR (type = ANY (ARRAY['income'::public.account_type, 'expense'::public.account_type, 'equity'::public.account_type]))))
);


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    owner_id uuid,
    account_type text DEFAULT 'bank'::text,
    bank_name text,
    nickname text,
    last4 text,
    currency text DEFAULT 'INR'::text,
    opening_balance numeric DEFAULT 0,
    current_balance numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: bank_statements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_statements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    account_id uuid,
    stmt_from date,
    stmt_to date,
    label text,
    file_name text,
    transaction_count integer DEFAULT 0,
    total_debits numeric DEFAULT 0,
    total_credits numeric DEFAULT 0,
    closing_balance numeric,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: bank_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    account_id uuid,
    txn_date date,
    narration text,
    amount numeric,
    balance numeric,
    txn_type text DEFAULT 'spend'::text,
    category text,
    ref_no text,
    linked_account_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    statement_id uuid
);


--
-- Name: category_budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_account_id uuid NOT NULL,
    owner_id uuid,
    monthly_amount numeric DEFAULT 0 NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: csv_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.csv_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    card_id uuid,
    date_col integer,
    desc_col integer,
    amount_col integer,
    debit_col integer,
    credit_col integer,
    amount_type text,
    date_format text,
    skip_rows integer DEFAULT 0,
    credit_ind_col integer DEFAULT '-1'::integer,
    delimiter text DEFAULT 'auto'::text,
    total_due_row integer DEFAULT 6,
    total_due_col integer DEFAULT '-1'::integer,
    opening_bal_row integer DEFAULT 13,
    opening_bal_col integer DEFAULT 0,
    user_id uuid,
    kind text DEFAULT 'cc'::text,
    balance_col integer,
    ref_col integer
);


--
-- Name: entities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    type public.entity_type DEFAULT 'person'::public.entity_type NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_id uuid NOT NULL,
    is_favourite boolean DEFAULT false
);


--
-- Name: entity_balances; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.entity_balances AS
SELECT
    NULL::uuid AS entity_id,
    NULL::uuid AS user_id,
    NULL::text AS name,
    NULL::public.entity_type AS type,
    NULL::numeric AS net_balance;


--
-- Name: ledger_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ledger_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    person_id uuid NOT NULL,
    direction text NOT NULL,
    amount numeric NOT NULL,
    description text,
    entry_date date NOT NULL,
    entry_type text DEFAULT 'manual'::text,
    transaction_id uuid,
    payment_method text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: loan_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loan_id uuid NOT NULL,
    transaction_id uuid,
    payment_date date NOT NULL,
    principal_component numeric(14,2) DEFAULT 0 NOT NULL,
    interest_component numeric(14,2) DEFAULT 0 NOT NULL
);


--
-- Name: loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    principal numeric(14,2) NOT NULL,
    interest_rate numeric(6,3),
    start_date date NOT NULL,
    tenure_months integer,
    notes text,
    emi_amount numeric(14,2),
    emi_date integer,
    lender_name text
);


--
-- Name: master_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    bank text,
    network text DEFAULT 'Visa'::text,
    logo_url text,
    points_currency text DEFAULT 'pts'::text,
    inr_per_point numeric DEFAULT 0,
    annual_fee numeric DEFAULT 0,
    color text DEFAULT '#c49a3c'::text,
    created_at timestamp with time zone DEFAULT now(),
    fee_waiver_amt numeric DEFAULT 0,
    fee_waiver_cycle text DEFAULT 'calendar'::text,
    billing_year_start text,
    fee_charge_date text,
    auto_transfer_to uuid,
    auto_transfer_ratio_from numeric DEFAULT 1,
    auto_transfer_ratio_to numeric DEFAULT 1,
    user_id uuid
);


--
-- Name: master_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    master_card_id uuid,
    spend_threshold numeric NOT NULL,
    cycle_type text NOT NULL,
    benefit_type text NOT NULL,
    benefit_points numeric,
    benefit_value text,
    stackable boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    notes text,
    user_id uuid
);


--
-- Name: master_partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_partners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_id uuid NOT NULL,
    from_type text NOT NULL,
    to_id uuid NOT NULL,
    to_type text NOT NULL,
    ratio_from numeric DEFAULT 1,
    ratio_to numeric DEFAULT 1,
    min_transfer integer,
    max_monthly integer,
    transfer_time text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    has_reverse boolean DEFAULT false,
    reverse_ratio_from numeric DEFAULT 1,
    reverse_ratio_to numeric DEFAULT 1,
    user_id uuid
);


--
-- Name: master_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text DEFAULT 'Airline'::text,
    logo_url text,
    inr_per_point numeric DEFAULT 0,
    expiry_rule text,
    color text DEFAULT '#c49a3c'::text,
    created_at timestamp with time zone DEFAULT now(),
    points_currency text DEFAULT 'pts'::text,
    user_id uuid
);


--
-- Name: merchant_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.merchant_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keyword text NOT NULL,
    category text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: my_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.my_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    master_id uuid,
    owner_id uuid,
    nickname text,
    last4 text,
    opening_balance bigint DEFAULT 0,
    points_balance bigint DEFAULT 0,
    stmt_date integer,
    card_expiry text,
    fee_override boolean DEFAULT false,
    fee_override_value numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    billing_year_start text,
    fee_charge_date text,
    linked_program_id uuid,
    hidden_in_spend boolean DEFAULT false,
    user_id uuid,
    due_date_day integer,
    is_favourite boolean DEFAULT false
);


--
-- Name: my_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.my_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    master_id uuid,
    owner_id uuid,
    nickname text,
    membership_number text,
    tier text,
    opening_balance bigint DEFAULT 0,
    points_balance bigint DEFAULT 0,
    expiry_date date,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    is_favourite boolean DEFAULT false
);


--
-- Name: owners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.people (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    user_id uuid
);


--
-- Name: point_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.point_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    points bigint NOT NULL,
    description text,
    txn_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    kind text,
    earn_type text,
    source text DEFAULT 'manual'::text,
    transfer_pair_id uuid,
    original_kind text,
    import_batch_id uuid,
    import_batch_name text
);


--
-- Name: transaction_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_lines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id uuid NOT NULL,
    account_id uuid NOT NULL,
    debit numeric(14,2) DEFAULT 0 NOT NULL,
    credit numeric(14,2) DEFAULT 0 NOT NULL,
    memo text,
    CONSTRAINT one_side_only CHECK ((((debit > (0)::numeric) AND (credit = (0)::numeric)) OR ((credit > (0)::numeric) AND (debit = (0)::numeric))))
);


--
-- Name: profit_and_loss; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.profit_and_loss AS
 SELECT a.user_id,
    a.type,
    a.name AS category,
    (COALESCE(sum(tl.credit), (0)::numeric) - COALESCE(sum(tl.debit), (0)::numeric)) AS amount
   FROM (public.accounts a
     JOIN public.transaction_lines tl ON ((tl.account_id = a.id)))
  WHERE (a.type = ANY (ARRAY['income'::public.account_type, 'expense'::public.account_type]))
  GROUP BY a.user_id, a.type, a.name;


--
-- Name: redemption_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redemption_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    point_transaction_id uuid NOT NULL,
    points numeric NOT NULL,
    redemption_type text,
    description text,
    notes text,
    redeemed_value_inr numeric,
    txn_date date,
    user_id uuid NOT NULL
);


--
-- Name: spend_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spend_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: spend_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spend_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    card_id uuid,
    txn_date date NOT NULL,
    description text,
    amount numeric NOT NULL,
    category text DEFAULT 'Other'::text,
    is_reimbursable boolean DEFAULT false,
    person_id uuid,
    split_details jsonb,
    imported_from text,
    raw_description text,
    statement_month text,
    statement_id uuid,
    user_id uuid
);


--
-- Name: staged_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staged_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    source_account_id uuid NOT NULL,
    txn_date date NOT NULL,
    raw_description text NOT NULL,
    amount numeric(14,2) NOT NULL,
    is_reconciled boolean DEFAULT false NOT NULL,
    resulting_transaction_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    statement_id uuid,
    source text
);


--
-- Name: statements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.statements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    card_id uuid,
    statement_month text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now(),
    transaction_count integer DEFAULT 0,
    total_spend numeric DEFAULT 0,
    file_name text,
    total_due numeric DEFAULT 0,
    opening_balance numeric DEFAULT 0,
    finance_charges numeric DEFAULT 0,
    user_id uuid
);


--
-- Name: transaction_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    transaction_id uuid NOT NULL,
    entity_table text NOT NULL,
    row_id uuid NOT NULL,
    action text NOT NULL,
    previous_data jsonb NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transaction_audit_log_action_check CHECK ((action = ANY (ARRAY['update'::text, 'delete'::text]))),
    CONSTRAINT transaction_audit_log_entity_table_check CHECK ((entity_table = ANY (ARRAY['transactions'::text, 'transaction_lines'::text])))
);


--
-- Name: transaction_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    point_transaction_id uuid NOT NULL,
    note text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: transaction_splits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_splits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id uuid,
    person_id uuid,
    amount numeric NOT NULL,
    is_personal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    txn_date date NOT NULL,
    description text,
    action public.txn_action NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL,
    import_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vouchers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid,
    program text NOT NULL,
    description text,
    value text,
    expiry_date date,
    redeemed boolean DEFAULT false,
    voucher_code text,
    voucher_pin text,
    received_from text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: bank_statements bank_statements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_statements
    ADD CONSTRAINT bank_statements_pkey PRIMARY KEY (id);


--
-- Name: bank_transactions bank_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);


--
-- Name: category_budgets category_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_budgets
    ADD CONSTRAINT category_budgets_pkey PRIMARY KEY (id);


--
-- Name: account_statements cc_statements_account_id_period_start_period_end_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_statements
    ADD CONSTRAINT cc_statements_account_id_period_start_period_end_key UNIQUE (account_id, period_start, period_end);


--
-- Name: account_statements cc_statements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_statements
    ADD CONSTRAINT cc_statements_pkey PRIMARY KEY (id);


--
-- Name: csv_mappings csv_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.csv_mappings
    ADD CONSTRAINT csv_mappings_pkey PRIMARY KEY (id);


--
-- Name: entities entities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);


--
-- Name: entities entities_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_user_id_name_key UNIQUE (user_id, name);


--
-- Name: ledger_entries ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (id);


--
-- Name: loan_payments loan_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_pkey PRIMARY KEY (id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: master_cards master_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_cards
    ADD CONSTRAINT master_cards_pkey PRIMARY KEY (id);


--
-- Name: master_milestones master_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_milestones
    ADD CONSTRAINT master_milestones_pkey PRIMARY KEY (id);


--
-- Name: master_partners master_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_partners
    ADD CONSTRAINT master_partners_pkey PRIMARY KEY (id);


--
-- Name: master_programs master_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_programs
    ADD CONSTRAINT master_programs_pkey PRIMARY KEY (id);


--
-- Name: merchant_rules merchant_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.merchant_rules
    ADD CONSTRAINT merchant_rules_pkey PRIMARY KEY (id);


--
-- Name: my_cards my_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_cards
    ADD CONSTRAINT my_cards_pkey PRIMARY KEY (id);


--
-- Name: my_programs my_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_programs
    ADD CONSTRAINT my_programs_pkey PRIMARY KEY (id);


--
-- Name: owners owners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_pkey PRIMARY KEY (id);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- Name: point_transactions point_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_transactions
    ADD CONSTRAINT point_transactions_pkey PRIMARY KEY (id);


--
-- Name: redemption_details redemption_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_details
    ADD CONSTRAINT redemption_details_pkey PRIMARY KEY (id);


--
-- Name: spend_categories spend_categories_name_user_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spend_categories
    ADD CONSTRAINT spend_categories_name_user_key UNIQUE (name, user_id);


--
-- Name: spend_categories spend_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spend_categories
    ADD CONSTRAINT spend_categories_pkey PRIMARY KEY (id);


--
-- Name: spend_transactions spend_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spend_transactions
    ADD CONSTRAINT spend_transactions_pkey PRIMARY KEY (id);


--
-- Name: staged_transactions staged_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staged_transactions
    ADD CONSTRAINT staged_transactions_pkey PRIMARY KEY (id);


--
-- Name: statements statements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statements
    ADD CONSTRAINT statements_pkey PRIMARY KEY (id);


--
-- Name: transaction_audit_log transaction_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_audit_log
    ADD CONSTRAINT transaction_audit_log_pkey PRIMARY KEY (id);


--
-- Name: transaction_lines transaction_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_lines
    ADD CONSTRAINT transaction_lines_pkey PRIMARY KEY (id);


--
-- Name: transaction_notes transaction_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_notes
    ADD CONSTRAINT transaction_notes_pkey PRIMARY KEY (id);


--
-- Name: transaction_splits transaction_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_splits
    ADD CONSTRAINT transaction_splits_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: idx_accounts_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_entity ON public.accounts USING btree (entity_id);


--
-- Name: idx_accounts_linked_card; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_linked_card ON public.accounts USING btree (linked_my_card_id);


--
-- Name: idx_accounts_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_owner ON public.accounts USING btree (owner_id);


--
-- Name: idx_accounts_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_user ON public.accounts USING btree (user_id);


--
-- Name: idx_audit_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_transaction ON public.transaction_audit_log USING btree (transaction_id);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_user ON public.transaction_audit_log USING btree (user_id);


--
-- Name: idx_ccstatements_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ccstatements_account ON public.account_statements USING btree (account_id);


--
-- Name: idx_ccstatements_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ccstatements_user ON public.account_statements USING btree (user_id);


--
-- Name: idx_entities_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_entities_owner ON public.entities USING btree (owner_id);


--
-- Name: idx_lines_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lines_account ON public.transaction_lines USING btree (account_id);


--
-- Name: idx_lines_txn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lines_txn ON public.transaction_lines USING btree (transaction_id);


--
-- Name: idx_staged_statement; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staged_statement ON public.staged_transactions USING btree (statement_id);


--
-- Name: idx_staged_unreconciled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staged_unreconciled ON public.staged_transactions USING btree (user_id, is_reconciled);


--
-- Name: idx_staged_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staged_user ON public.staged_transactions USING btree (user_id);


--
-- Name: account_balances _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.account_balances AS
 SELECT a.id AS account_id,
    a.user_id,
    a.name,
    a.type,
    a.subtype,
    a.entity_id,
    ((a.opening_balance + COALESCE(sum(tl.debit), (0)::numeric)) - COALESCE(sum(tl.credit), (0)::numeric)) AS balance
   FROM (public.accounts a
     LEFT JOIN public.transaction_lines tl ON ((tl.account_id = a.id)))
  GROUP BY a.id;


--
-- Name: entity_balances _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.entity_balances AS
 SELECT e.id AS entity_id,
    e.user_id,
    e.name,
    e.type,
    (COALESCE(sum(
        CASE
            WHEN (a.subtype = 'receivable'::public.account_subtype) THEN ab.balance
            ELSE (0)::numeric
        END), (0)::numeric) - COALESCE(sum(
        CASE
            WHEN (a.subtype = 'payable'::public.account_subtype) THEN ab.balance
            ELSE (0)::numeric
        END), (0)::numeric)) AS net_balance
   FROM ((public.entities e
     LEFT JOIN public.accounts a ON ((a.entity_id = e.id)))
     LEFT JOIN public.account_balances ab ON ((ab.account_id = a.id)))
  GROUP BY e.id;


--
-- Name: transaction_lines trg_audit_transaction_lines; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_audit_transaction_lines BEFORE DELETE OR UPDATE ON public.transaction_lines FOR EACH ROW EXECUTE FUNCTION public.log_transaction_audit();


--
-- Name: transactions trg_audit_transactions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_audit_transactions BEFORE DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.log_transaction_audit();


--
-- Name: transaction_lines trg_balanced_txn; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER trg_balanced_txn AFTER INSERT OR DELETE OR UPDATE ON public.transaction_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.check_transaction_balanced();


--
-- Name: accounts accounts_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id);


--
-- Name: accounts accounts_linked_my_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_linked_my_card_id_fkey FOREIGN KEY (linked_my_card_id) REFERENCES public.my_cards(id);


--
-- Name: accounts accounts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: bank_accounts bank_accounts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: bank_accounts bank_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bank_statements bank_statements_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_statements
    ADD CONSTRAINT bank_statements_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.bank_accounts(id) ON DELETE CASCADE;


--
-- Name: bank_statements bank_statements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_statements
    ADD CONSTRAINT bank_statements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bank_transactions bank_transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.bank_accounts(id) ON DELETE CASCADE;


--
-- Name: bank_transactions bank_transactions_linked_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_linked_account_id_fkey FOREIGN KEY (linked_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: bank_transactions bank_transactions_statement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_statement_id_fkey FOREIGN KEY (statement_id) REFERENCES public.bank_statements(id);


--
-- Name: bank_transactions bank_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: account_statements cc_statements_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_statements
    ADD CONSTRAINT cc_statements_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: account_statements cc_statements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_statements
    ADD CONSTRAINT cc_statements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: csv_mappings csv_mappings_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.csv_mappings
    ADD CONSTRAINT csv_mappings_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.my_cards(id);


--
-- Name: csv_mappings csv_mappings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.csv_mappings
    ADD CONSTRAINT csv_mappings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: entities entities_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: entities entities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: staged_transactions fk_resulting_txn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staged_transactions
    ADD CONSTRAINT fk_resulting_txn FOREIGN KEY (resulting_transaction_id) REFERENCES public.transactions(id);


--
-- Name: ledger_entries ledger_entries_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);


--
-- Name: ledger_entries ledger_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: loan_payments loan_payments_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


--
-- Name: loan_payments loan_payments_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: loans loans_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: loans loans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: master_cards master_cards_auto_transfer_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_cards
    ADD CONSTRAINT master_cards_auto_transfer_to_fkey FOREIGN KEY (auto_transfer_to) REFERENCES public.master_programs(id);


--
-- Name: master_cards master_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_cards
    ADD CONSTRAINT master_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: master_milestones master_milestones_master_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_milestones
    ADD CONSTRAINT master_milestones_master_card_id_fkey FOREIGN KEY (master_card_id) REFERENCES public.master_cards(id) ON DELETE CASCADE;


--
-- Name: master_milestones master_milestones_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_milestones
    ADD CONSTRAINT master_milestones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: master_partners master_partners_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_partners
    ADD CONSTRAINT master_partners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: master_programs master_programs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_programs
    ADD CONSTRAINT master_programs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: merchant_rules merchant_rules_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.merchant_rules
    ADD CONSTRAINT merchant_rules_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: my_cards my_cards_linked_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_cards
    ADD CONSTRAINT my_cards_linked_program_id_fkey FOREIGN KEY (linked_program_id) REFERENCES public.my_programs(id);


--
-- Name: my_cards my_cards_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_cards
    ADD CONSTRAINT my_cards_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.master_cards(id);


--
-- Name: my_cards my_cards_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_cards
    ADD CONSTRAINT my_cards_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: my_cards my_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_cards
    ADD CONSTRAINT my_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: my_programs my_programs_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_programs
    ADD CONSTRAINT my_programs_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.master_programs(id);


--
-- Name: my_programs my_programs_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_programs
    ADD CONSTRAINT my_programs_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: my_programs my_programs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.my_programs
    ADD CONSTRAINT my_programs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: owners owners_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: people people_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: point_transactions point_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.point_transactions
    ADD CONSTRAINT point_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: redemption_details redemption_details_point_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_details
    ADD CONSTRAINT redemption_details_point_transaction_id_fkey FOREIGN KEY (point_transaction_id) REFERENCES public.point_transactions(id) ON DELETE CASCADE;


--
-- Name: spend_categories spend_categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spend_categories
    ADD CONSTRAINT spend_categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: spend_transactions spend_transactions_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spend_transactions
    ADD CONSTRAINT spend_transactions_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.my_cards(id);


--
-- Name: spend_transactions spend_transactions_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spend_transactions
    ADD CONSTRAINT spend_transactions_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);


--
-- Name: spend_transactions spend_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spend_transactions
    ADD CONSTRAINT spend_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: staged_transactions staged_transactions_source_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staged_transactions
    ADD CONSTRAINT staged_transactions_source_account_id_fkey FOREIGN KEY (source_account_id) REFERENCES public.accounts(id);


--
-- Name: staged_transactions staged_transactions_statement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staged_transactions
    ADD CONSTRAINT staged_transactions_statement_id_fkey FOREIGN KEY (statement_id) REFERENCES public.account_statements(id);


--
-- Name: staged_transactions staged_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staged_transactions
    ADD CONSTRAINT staged_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: statements statements_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statements
    ADD CONSTRAINT statements_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.my_cards(id);


--
-- Name: statements statements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statements
    ADD CONSTRAINT statements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transaction_audit_log transaction_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_audit_log
    ADD CONSTRAINT transaction_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: transaction_lines transaction_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_lines
    ADD CONSTRAINT transaction_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: transaction_lines transaction_lines_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_lines
    ADD CONSTRAINT transaction_lines_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;


--
-- Name: transaction_notes transaction_notes_point_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_notes
    ADD CONSTRAINT transaction_notes_point_transaction_id_fkey FOREIGN KEY (point_transaction_id) REFERENCES public.point_transactions(id) ON DELETE CASCADE;


--
-- Name: transaction_splits transaction_splits_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_splits
    ADD CONSTRAINT transaction_splits_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);


--
-- Name: transaction_splits transaction_splits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_splits
    ADD CONSTRAINT transaction_splits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_import_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_import_id_fkey FOREIGN KEY (import_id) REFERENCES public.staged_transactions(id);


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: vouchers vouchers_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: vouchers vouchers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: category_budgets Users can delete their own budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own budgets" ON public.category_budgets FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: category_budgets Users can insert their own budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own budgets" ON public.category_budgets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: category_budgets Users can update their own budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own budgets" ON public.category_budgets FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: category_budgets Users can view their own budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own budgets" ON public.category_budgets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: redemption_details Users manage own redemption details; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own redemption details" ON public.redemption_details USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: transaction_notes Users manage own transaction notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own transaction notes" ON public.transaction_notes USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: account_statements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.account_statements ENABLE ROW LEVEL SECURITY;

--
-- Name: accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: accounts accounts_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accounts_delete_own ON public.accounts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: accounts accounts_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accounts_insert_own ON public.accounts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: accounts accounts_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accounts_select_own ON public.accounts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: accounts accounts_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accounts_update_own ON public.accounts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: transaction_audit_log audit_log_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY audit_log_insert_own ON public.transaction_audit_log FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: transaction_audit_log audit_log_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY audit_log_select_own ON public.transaction_audit_log FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: bank_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: bank_statements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;

--
-- Name: bank_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: category_budgets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: account_statements cc_statements_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cc_statements_delete_own ON public.account_statements FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: account_statements cc_statements_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cc_statements_insert_own ON public.account_statements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: account_statements cc_statements_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cc_statements_select_own ON public.account_statements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: account_statements cc_statements_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cc_statements_update_own ON public.account_statements FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: csv_mappings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.csv_mappings ENABLE ROW LEVEL SECURITY;

--
-- Name: csv_mappings csv_mappings_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY csv_mappings_user_isolation ON public.csv_mappings USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: entities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

--
-- Name: entities entities_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY entities_delete_own ON public.entities FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: entities entities_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY entities_insert_own ON public.entities FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: entities entities_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY entities_select_own ON public.entities FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: entities entities_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY entities_update_own ON public.entities FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ledger_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: ledger_entries ledger_entries_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ledger_entries_user_isolation ON public.ledger_entries USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: transaction_lines lines_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lines_delete_own ON public.transaction_lines FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.transactions t
  WHERE ((t.id = transaction_lines.transaction_id) AND (t.user_id = auth.uid())))));


--
-- Name: transaction_lines lines_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lines_insert_own ON public.transaction_lines FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.transactions t
  WHERE ((t.id = transaction_lines.transaction_id) AND (t.user_id = auth.uid())))));


--
-- Name: transaction_lines lines_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lines_select_own ON public.transaction_lines FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.transactions t
  WHERE ((t.id = transaction_lines.transaction_id) AND (t.user_id = auth.uid())))));


--
-- Name: transaction_lines lines_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lines_update_own ON public.transaction_lines FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.transactions t
  WHERE ((t.id = transaction_lines.transaction_id) AND (t.user_id = auth.uid())))));


--
-- Name: loan_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: loan_payments loan_payments_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loan_payments_delete_own ON public.loan_payments FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.loans l
  WHERE ((l.id = loan_payments.loan_id) AND (l.user_id = auth.uid())))));


--
-- Name: loan_payments loan_payments_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loan_payments_insert_own ON public.loan_payments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.loans l
  WHERE ((l.id = loan_payments.loan_id) AND (l.user_id = auth.uid())))));


--
-- Name: loan_payments loan_payments_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loan_payments_select_own ON public.loan_payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.loans l
  WHERE ((l.id = loan_payments.loan_id) AND (l.user_id = auth.uid())))));


--
-- Name: loan_payments loan_payments_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loan_payments_update_own ON public.loan_payments FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.loans l
  WHERE ((l.id = loan_payments.loan_id) AND (l.user_id = auth.uid())))));


--
-- Name: loans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

--
-- Name: loans loans_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loans_delete_own ON public.loans FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: loans loans_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loans_insert_own ON public.loans FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: loans loans_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loans_select_own ON public.loans FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: loans loans_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loans_update_own ON public.loans FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: master_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: master_cards master_cards_user; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY master_cards_user ON public.master_cards USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: master_milestones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_milestones ENABLE ROW LEVEL SECURITY;

--
-- Name: master_milestones master_milestones_user; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY master_milestones_user ON public.master_milestones USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: master_partners; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_partners ENABLE ROW LEVEL SECURITY;

--
-- Name: master_partners master_partners_user; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY master_partners_user ON public.master_partners USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: master_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: master_programs master_programs_user; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY master_programs_user ON public.master_programs USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: merchant_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.merchant_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: merchant_rules merchant_rules_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY merchant_rules_user_isolation ON public.merchant_rules USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: my_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.my_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: my_cards my_cards_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY my_cards_user_isolation ON public.my_cards USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: my_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.my_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: my_programs my_programs_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY my_programs_user_isolation ON public.my_programs USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: owners; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

--
-- Name: owners owners_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY owners_user_isolation ON public.owners USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: people; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

--
-- Name: people people_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY people_user_isolation ON public.people USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: point_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: point_transactions point_transactions_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY point_transactions_user_isolation ON public.point_transactions USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: redemption_details; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.redemption_details ENABLE ROW LEVEL SECURITY;

--
-- Name: spend_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.spend_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: spend_categories spend_categories_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY spend_categories_user_isolation ON public.spend_categories USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: spend_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.spend_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: spend_transactions spend_transactions_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY spend_transactions_user_isolation ON public.spend_transactions USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: staged_transactions staged_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staged_delete_own ON public.staged_transactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: staged_transactions staged_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staged_insert_own ON public.staged_transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: staged_transactions staged_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staged_select_own ON public.staged_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: staged_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staged_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: staged_transactions staged_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staged_update_own ON public.staged_transactions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: statements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;

--
-- Name: statements statements_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY statements_user_isolation ON public.statements USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: transaction_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transaction_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: transaction_lines; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transaction_lines ENABLE ROW LEVEL SECURITY;

--
-- Name: transaction_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transaction_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: transaction_splits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transaction_splits ENABLE ROW LEVEL SECURITY;

--
-- Name: transaction_splits transaction_splits_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transaction_splits_user_isolation ON public.transaction_splits USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions transactions_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transactions_delete_own ON public.transactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: transactions transactions_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transactions_insert_own ON public.transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: transactions transactions_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transactions_select_own ON public.transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: transactions transactions_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transactions_update_own ON public.transactions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: bank_accounts user_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_own ON public.bank_accounts USING ((user_id = auth.uid()));


--
-- Name: bank_statements user_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_own ON public.bank_statements USING ((user_id = auth.uid()));


--
-- Name: bank_transactions user_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_own ON public.bank_transactions USING ((user_id = auth.uid()));


--
-- Name: vouchers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

--
-- Name: vouchers vouchers_user_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vouchers_user_isolation ON public.vouchers USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- PostgreSQL database dump complete
--

\unrestrict jluaV9qdidvIOOax1oSpVq5D018sh1DjvAb74hibSAQzmWorVouSWjb0VVUMyBH

