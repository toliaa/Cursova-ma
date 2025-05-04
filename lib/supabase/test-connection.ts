"use client"

import { createClient } from "./client"

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()

    // Try a simple query to test the connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Connection successful",
    }
  } catch (error: any) {
    console.error("Error testing Supabase connection:", error)
    return {
      success: false,
      error: error.message || "Failed to connect to Supabase",
    }
  }
}
