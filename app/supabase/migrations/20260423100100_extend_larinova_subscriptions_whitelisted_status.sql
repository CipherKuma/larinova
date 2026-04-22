-- Allow larinova_subscriptions.status = 'whitelisted' for alpha Pro doctors
-- who aren't paying through Razorpay. Upgrade path: upgradeIfWhitelisted() in
-- lib/subscription.ts upserts the row with status='whitelisted' on login.
ALTER TABLE larinova_subscriptions
  DROP CONSTRAINT IF EXISTS larinova_subscriptions_status_check;

ALTER TABLE larinova_subscriptions
  ADD CONSTRAINT larinova_subscriptions_status_check
  CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'whitelisted'));
