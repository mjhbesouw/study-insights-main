-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.submissions_turing ENABLE ROW LEVEL SECURITY;

-- 1. Allow the frontend to check if a user has already submitted (This fixes the reload unlocking bug!)
CREATE POLICY "Allow select to check submission status" 
ON public.submissions_turing 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 2. Allow the frontend to insert submissions
CREATE POLICY "Allow submission inserts" 
ON public.submissions_turing 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 3. Enforce a strict "one submission per participant" rule at the database level (This prevents duplicates!)
ALTER TABLE public.submissions_turing 
ADD CONSTRAINT submissions_turing_participant_id_key UNIQUE (participant_id);
