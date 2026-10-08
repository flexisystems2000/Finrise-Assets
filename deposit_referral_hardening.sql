-- Finrise Assets: harden user-created deposit requests.
-- Users may submit requests, but they may never choose an approved/rejected status.
DROP POLICY IF EXISTS "deposit owner insert" ON public.deposits;
CREATE POLICY "deposit owner insert"
ON public.deposits
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND currency = 'NGN'
  AND amount > 0
  AND method IN ('crypto','usdt','bank')
);
