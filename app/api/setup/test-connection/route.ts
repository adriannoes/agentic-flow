import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { url, key } = await request.json()

    // Use provided credentials or env vars
    const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Supabase URL or API key",
        },
        { status: 400 },
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Check if we can connect
    const { error: connectionError } = await supabase.from("profiles").select("count").limit(0)

    if (connectionError) {
      // Check if it's a table not found error (meaning DB is connected but not set up)
      if (connectionError.message.includes("relation") && connectionError.message.includes("does not exist")) {
        return NextResponse.json({
          success: false,
          message: "Database connected but tables not created. Please run the SQL setup script.",
          details: {
            error: connectionError.message,
            hint: "Go to SQL Editor in Supabase and run the script from SUPABASE_SETUP.md",
          },
        })
      }

      return NextResponse.json({
        success: false,
        message: "Failed to connect to Supabase",
        details: { error: connectionError.message },
      })
    }

    // Test 2: Check if required tables exist
    const requiredTables = ["profiles", "workspaces", "agents", "workflows", "connectors"]
    const tableChecks = await Promise.all(
      requiredTables.map(async (table) => {
        const { error } = await supabase.from(table).select("count").limit(0)
        return { table, exists: !error }
      }),
    )

    const missingTables = tableChecks.filter((check) => !check.exists)

    if (missingTables.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Some tables are missing from the database",
        details: {
          missingTables: missingTables.map((t) => t.table),
          hint: "Please run the complete SQL setup script from SUPABASE_SETUP.md",
        },
      })
    }

    // Test 3: Check if connectors are seeded
    const { data: connectors, error: connectorsError } = await supabase.from("connectors").select("count")

    if (connectorsError) {
      return NextResponse.json({
        success: false,
        message: "Tables exist but seed data is missing",
        details: {
          error: connectorsError.message,
          hint: "Please run the complete SQL setup script including seed data",
        },
      })
    }

    // All checks passed!
    return NextResponse.json({
      success: true,
      message: "Connection successful! All tables and seed data are in place.",
      details: {
        url: supabaseUrl,
        tablesFound: requiredTables.length,
        connectorsCount: connectors?.length || 0,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error during connection test",
        details: { error: error.message },
      },
      { status: 500 },
    )
  }
}
