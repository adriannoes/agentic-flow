"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, Database, Key, Link2 } from "lucide-react"

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  const [supabaseKey, setSupabaseKey] = useState(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const envConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/setup/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: supabaseUrl,
          key: supabaseKey,
        }),
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error: any) {
      setTestResult({
        success: false,
        message: "Failed to connect: " + error.message,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Supabase Setup</h1>
          <p className="mt-2 text-muted-foreground">Configure and validate your Supabase connection</p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Database className="h-4 w-4" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {envConfigured ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Not Configured
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Link2 className="h-4 w-4" />
                Project URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Set
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="mr-1 h-3 w-3" />
                  Missing
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Key className="h-4 w-4" />
                API Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Set
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="mr-1 h-3 w-3" />
                  Missing
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>Follow these steps to configure Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Create Supabase Project</h3>
              <p className="text-sm text-muted-foreground">
                Go to{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  supabase.com
                </a>{" "}
                and create a new project
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">2. Run SQL Scripts</h3>
              <p className="text-sm text-muted-foreground">
                In your Supabase project, go to <strong>SQL Editor</strong> and execute the consolidated script from{" "}
                <strong>SUPABASE_SETUP.md</strong>
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/SUPABASE_SETUP.md" download>
                  Download Setup Guide
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">3. Add Environment Variables</h3>
              <p className="text-sm text-muted-foreground">
                In v0, click <strong>Vars</strong> in the sidebar and add:
              </p>
              <ul className="ml-4 list-disc text-sm text-muted-foreground">
                <li>
                  <code>NEXT_PUBLIC_SUPABASE_URL</code>
                </li>
                <li>
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Connection</CardTitle>
            <CardDescription>Verify your Supabase configuration is working</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="url">Supabase URL</Label>
                <Input
                  id="url"
                  placeholder="https://xxxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  disabled={envConfigured}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Anon Key</Label>
                <Input
                  id="key"
                  type="password"
                  placeholder="eyJ..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  disabled={envConfigured}
                />
              </div>
            </div>

            <Button onClick={testConnection} disabled={testing || (!supabaseUrl && !envConfigured)} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                <AlertDescription className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.details && (
                      <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        {testResult?.success && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600">Setup Complete!</CardTitle>
              <CardDescription>Your Supabase connection is working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">Next steps:</p>
              <ul className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>
                  <a href="/signup" className="text-primary hover:underline">
                    Create your account
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-primary hover:underline">
                    Login
                  </a>
                </li>
                <li>
                  <a href="/" className="text-primary hover:underline">
                    Start building agents
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
