import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const report = payload.record

    if (!report || !report.post_id) {
      return new Response("Invalid payload", { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({ is_flagged: true })
      .eq('id', report.post_id)

    if (updateError) throw updateError

    const { data: admins, error: adminsError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (adminsError) throw adminsError

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'moderation_alert',
        content: `A post has been flagged for reason: ${report.reason}. Please review.`
      }))

      const { error: notifyError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications)

      if (notifyError) throw notifyError
    }

    return new Response(
      JSON.stringify({ success: true, message: "Post flagged and admins notified." }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Error in moderate-post:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
})