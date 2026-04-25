-- Overwrite the existing function to add the @neu.edu.ph domain bouncer
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Reject any non-NEU emails at the database level
  IF right(new.email, 11) != '@neu.edu.ph' THEN
    RAISE EXCEPTION 'Access Denied: Only @neu.edu.ph institutional emails are permitted.';
  END IF;

  -- Insert into profiles (role defaults to 'student')
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  RETURN new;
END;
$function$;