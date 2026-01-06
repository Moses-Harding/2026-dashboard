/**
 * API Key Manager Component
 *
 * Displays user's API keys and allows generating new ones.
 * Shows a warning that keys are only displayed once.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ApiKey {
  id: string
  name: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

interface ApiKeyManagerProps {
  apiKeys: ApiKey[]
  userId: string
}

export function ApiKeyManager({ apiKeys, userId }: ApiKeyManagerProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showKeyDialog, setShowKeyDialog] = useState(false)
  const [generatedKey, setGeneratedKey] = useState('')
  const [keyName, setKeyName] = useState('Health Auto Export')

  async function handleGenerateKey() {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/api-keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to generate API key')
        return
      }

      // Show the generated key in a dialog
      setGeneratedKey(data.api_key)
      setShowKeyDialog(true)

      // Refresh the page to show the new key in the list
      router.refresh()
    } catch (error) {
      console.error('Error generating API key:', error)
      toast.error('Failed to generate API key')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleCopyKey() {
    navigator.clipboard.writeText(generatedKey)
    toast.success('API key copied to clipboard')
  }

  function handleCloseDialog() {
    setShowKeyDialog(false)
    setGeneratedKey('')
    setKeyName('Health Auto Export')
  }

  return (
    <div className="space-y-4">
      {/* Existing Keys */}
      {apiKeys.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Your API Keys</p>
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && (
                      <> • Last used {new Date(key.last_used_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {key.is_active ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p className="mb-2">No API keys yet</p>
          <p className="text-sm">Generate your first key to start importing health data</p>
        </div>
      )}

      {/* Generate New Key Button */}
      <Button onClick={handleGenerateKey} disabled={isGenerating} className="w-full">
        {isGenerating ? 'Generating...' : 'Generate New Key'}
      </Button>

      {/* Generated Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>
              Copy this key now - it will not be shown again for security reasons
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="api-key"
                  value={generatedKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyKey}>Copy</Button>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                Important
              </p>
              <p className="text-xs text-muted-foreground">
                Save this key in a secure location. You won't be able to see it again. If you lose
                it, you'll need to generate a new one.
              </p>
            </div>
            <Button onClick={handleCloseDialog} variant="outline" className="w-full">
              I've Saved My Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
