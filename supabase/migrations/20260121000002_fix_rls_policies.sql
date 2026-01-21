-- ============================================
-- FIX RLS POLICIES - Infinite Recursion Fix
-- ============================================

-- Create helper function to check admin status (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND is_admin = true
  );
END;
$$;

-- ============================================
-- UPDATE USER_PROFILES POLICY (add WITH CHECK)
-- ============================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FIX ADMIN POLICIES (use is_admin function)
-- ============================================

-- User roles policies
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (
  public.is_admin(auth.uid())
);

-- Reading plans policies
DROP POLICY IF EXISTS "Only admins can manage plans" ON public.reading_plans;
CREATE POLICY "Only admins can manage plans" ON public.reading_plans FOR ALL USING (
  public.is_admin(auth.uid())
);

-- Plan days policies
DROP POLICY IF EXISTS "Only admins can manage plan days" ON public.plan_days;
CREATE POLICY "Only admins can manage plan days" ON public.plan_days FOR ALL USING (
  public.is_admin(auth.uid())
);

-- Meetings policies
DROP POLICY IF EXISTS "Only admins can manage meetings" ON public.meetings;
CREATE POLICY "Only admins can manage meetings" ON public.meetings FOR ALL USING (
  public.is_admin(auth.uid())
);
