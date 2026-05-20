import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    }

    // 1. Initialize admin client with service role key
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // 2. Validate caller's identity using the passed Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Create client using caller's JWT to inspect their credentials
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 3. Query PostgreSQL to verify if this user has the 'admin' role
    const { data: perfil, error: perfilError } = await adminClient
      .from("usuarios")
      .select("activo, roles ( nombre )")
      .eq("auth_user_id", user.id)
      .single()

    if (perfilError || !perfil) {
      return new Response(JSON.stringify({ error: "Unauthorized: User profile not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (!perfil.activo) {
      return new Response(JSON.stringify({ error: "Unauthorized: User is inactive" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const userRole = perfil.roles?.nombre
    if (userRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Only administrators can create users" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 4. Parse payload
    const { email, password, nombre, apellido, rol_id } = await req.json()

    if (!email || !password || !nombre || !apellido || !rol_id) {
      throw new Error("Missing required fields: email, password, nombre, apellido, rol_id")
    }

    // 5. Create user in Supabase Auth
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      throw createError
    }

    const newUserId = createData.user?.id
    if (!newUserId) {
      throw new Error("Could not retrieve created user ID")
    }

    // 6. Insert profile record in 'usuarios' table
    const { error: insertError } = await adminClient
      .from("usuarios")
      .insert({
        auth_user_id: newUserId,
        email: email,
        nombre: nombre,
        apellido: apellido,
        rol_id: parseInt(rol_id),
        activo: true,
      })

    if (insertError) {
      // Rollback: Delete the Auth user to prevent a dangling un-profiled account
      await adminClient.auth.admin.deleteUser(newUserId)
      throw new Error("Auth account created, but profile insertion failed: " + insertError.message)
    }

    // 7. Return success response
    return new Response(JSON.stringify({ success: true, user: createData.user }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
