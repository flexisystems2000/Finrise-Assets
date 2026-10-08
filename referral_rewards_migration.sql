-- FINRISE ASSET
-- Referral rewards: 10% of each approved deposit made by a referred user.
-- The reward is credited immediately to the referrer's NGN wallet.

alter table public.referral_rewards
  add column if not exists deposit_id uuid references public.deposits(id);

create unique index if not exists referral_rewards_deposit_once
  on public.referral_rewards(deposit_id)
  where deposit_id is not null;

create or replace function public.admin_approve_deposit(p_deposit_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  d deposits%rowtype;
  w wallets%rowtype;
  ref referrals%rowtype;
  ref_wallet wallets%rowtype;
  reward_amount numeric;
  reward_id uuid;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Admin access required';
  end if;

  select * into d from deposits where id=p_deposit_id for update;
  if not found or d.status<>'pending' then
    raise exception 'Deposit is not pending';
  end if;

  select * into w from wallets where user_id=d.user_id for update;
  if not found then raise exception 'Wallet not found'; end if;

  update wallets
  set available_balance=available_balance+d.amount, updated_at=now()
  where id=w.id;

  update deposits
  set status='approved', approved_at=now(), approved_by=auth.uid()
  where id=d.id;

  insert into ledger_entries(
    user_id,wallet_id,entry_type,amount,currency,reference_type,reference_id,
    balance_before,balance_after,metadata
  ) values(
    d.user_id,w.id,'deposit',d.amount,d.currency,'deposit',d.id,
    w.available_balance,w.available_balance+d.amount,'{}'::jsonb
  );

  select * into ref from referrals
  where referred_user_id=d.user_id
  limit 1;

  if found then
    reward_amount := round((d.amount * 0.10)::numeric, 2);

    if reward_amount > 0 then
      select * into ref_wallet from wallets
      where user_id=ref.referrer_id for update;

      if found then
        insert into referral_rewards(
          user_id,source_user_id,amount,status,paid_at,deposit_id
        ) values(
          ref.referrer_id,d.user_id,reward_amount,'paid',now(),d.id
        )
        on conflict (deposit_id) where deposit_id is not null
        do nothing
        returning id into reward_id;

        if reward_id is not null then
          update wallets
          set available_balance=available_balance+reward_amount,
              updated_at=now()
          where id=ref_wallet.id;

          insert into ledger_entries(
            user_id,wallet_id,entry_type,amount,currency,reference_type,reference_id,
            balance_before,balance_after,metadata
          ) values(
            ref.referrer_id,ref_wallet.id,'referral_bonus',reward_amount,
            ref_wallet.currency,'referral_reward',reward_id,
            ref_wallet.available_balance,ref_wallet.available_balance+reward_amount,
            jsonb_build_object(
              'source_user_id',d.user_id,
              'deposit_id',d.id,
              'rate_percentage',10
            )
          );
        end if;
      end if;
    end if;
  end if;

  return true;
end;
$function$;
