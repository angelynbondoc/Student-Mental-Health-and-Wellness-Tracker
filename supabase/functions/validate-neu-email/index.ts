import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required." }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (!email.endsWith("@neu.edu.ph")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Only @neu.edu.ph institutional emails are allowed." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true 
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, user: data.user, message: "VIP Access Granted. Account Created." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    console.error("Signup Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})