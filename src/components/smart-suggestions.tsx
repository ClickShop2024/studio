"use client"

import { useEffect, useState } from 'react'
import { Wand2 } from 'lucide-react'
import { suggestProducts } from '@/ai/flows/smart-catalog-suggestions'
import { useAuth } from '@/hooks/use-auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import type { Gender } from '@/lib/types'

export function SmartSuggestions() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === 'Customer' && user.size && user.gender) {
      const fetchSuggestions = async () => {
        setLoading(true)
        setError(null)
        try {
          const result = await suggestProducts({
            size: user.size!,
            gender: user.gender as Gender,
          })
          setSuggestions(result.suggestedProducts)
        } catch (e) {
          setError('No se pudieron cargar las sugerencias.')
          console.error(e)
        } finally {
          setLoading(false)
        }
      }
      fetchSuggestions()
    } else {
        setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <Alert>
        <Wand2 className="h-4 w-4" />
        <AlertTitle>Buscando sugerencias para ti...</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </AlertDescription>
      </Alert>
    )
  }

  if (error || suggestions.length === 0 || !user?.size || !user?.gender) {
    return null
  }

  return (
    <Alert className="bg-primary/10 border-primary/20">
      <Wand2 className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary">Sugerencias para ti</AlertTitle>
      <AlertDescription>
        Basado en tu perfil, ¡creemos que esto te encantará! {suggestions.join(', ')}
      </AlertDescription>
    </Alert>
  )
}
