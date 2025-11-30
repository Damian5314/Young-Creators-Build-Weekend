-- Add video credits system for restaurant owners

-- Add video_credits column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS video_credits INTEGER DEFAULT 0;

-- Create payments table to track purchases
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  credits_purchased INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, failed, cancelled, refunded
  mollie_payment_id VARCHAR(255),
  mollie_checkout_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_mollie_payment_id ON payments(mollie_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payments table
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own payment records
CREATE POLICY "Users can create own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only system/service can update payment status (via service key)
CREATE POLICY "Service can update payments"
  ON payments FOR UPDATE
  USING (true);

-- Function to increment user credits
CREATE OR REPLACE FUNCTION increment_user_credits(p_user_id UUID, p_credits INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET video_credits = COALESCE(video_credits, 0) + p_credits
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement credits when a video is uploaded
CREATE OR REPLACE FUNCTION decrement_credits_on_video_upload()
RETURNS TRIGGER AS $$
DECLARE
  owner_id UUID;
  current_credits INTEGER;
BEGIN
  -- Get the owner_id from the restaurant
  SELECT r.owner_id INTO owner_id
  FROM restaurants r
  WHERE r.id = NEW.restaurant_id;

  -- Check if owner exists and get current credits
  IF owner_id IS NOT NULL THEN
    SELECT video_credits INTO current_credits
    FROM profiles
    WHERE id = owner_id;

    -- Only decrement if user has credits
    IF current_credits > 0 THEN
      UPDATE profiles
      SET video_credits = video_credits - 1
      WHERE id = owner_id;
    ELSE
      RAISE EXCEPTION 'Insufficient video credits';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for video uploads
DROP TRIGGER IF EXISTS trigger_decrement_credits_on_video_upload ON videos;
CREATE TRIGGER trigger_decrement_credits_on_video_upload
  AFTER INSERT ON videos
  FOR EACH ROW
  EXECUTE FUNCTION decrement_credits_on_video_upload();

-- Comment on table
COMMENT ON TABLE payments IS 'Tracks video credit purchases via Mollie';
COMMENT ON COLUMN profiles.video_credits IS 'Number of videos the restaurant owner can upload';
