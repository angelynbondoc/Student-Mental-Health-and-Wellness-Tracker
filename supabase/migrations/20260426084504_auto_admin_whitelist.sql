-- 1. Create the Whitelist Table
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
    email TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'superadmin'))
);

-- 2. RLS Policy to restrict access to the whitelist only to Superadmins
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only superadmins can view the whitelist" 
    ON public.admin_whitelist
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
        )
    );

-- 3. Seed the initial admins
INSERT INTO public.admin_whitelist (email, role)
VALUES
    ( 'seanbooker.orioque@neu.edu.ph', 'superadmin' ),
    ( 'tricia.labbao@neu.edu.ph', 'superadmin' ),
    ( 'klynezyro.reyes@neu.edu.ph', 'superadmin' ),
    ( 'jcezperanza@neu.edu.ph', 'superadmin' ),
    ( 'angelyn.bondoc@neu.edu.ph', 'superadmin' ),
    ( 'micolekurt.gonda@neu.edu.ph', 'superadmin' ),
    ( 'aletheosmikael.penarubia@neu.edu.ph', 'superadmin' )
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- 4. Overwrite the Trigger Function to automate role assignment based on the whitelist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    assigned_role TEXT;
BEGIN
    -- Security Check: Reject non-NEU emails
    IF NEW.email NOT LIKE '%@neu.edu.ph' THEN
        RAISE EXCEPTION 'Unauthorized domain. Only @neu.edu.ph emails are allowed.';
    END IF;

    -- Check the whitelist for the incoming admin email
    SELECT role INTO assigned_role
    FROM public.admin_whitelist
    WHERE email = NEW.email;

    -- If they aren't on the list, make them a student by default
    IF assigned_role IS NULL THEN
        assigned_role := 'student';
    END IF;

    -- Insert the profile
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, assigned_role);

    RETURN NEW;
END;
$$;