'use client'

import { useState, useEffect, FormEvent } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { AvatarPicker } from './AvatarPicker'

interface ProfileFormProps {
  userId: string
  userEmail: string
}

export function ProfileForm({ userId, userEmail }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState('👤')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load profile on mount
  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadProfile = async () => {
    if (!isSupabaseConfigured()) {
      setError('Profile features require Supabase configuration')
      setLoading(false)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        // Profile doesn't exist yet, create it
        if (fetchError.code === 'PGRST116') {
          await createProfile()
        } else {
          console.error('Error loading profile:', fetchError)
          setError('Failed to load profile')
        }
      } else if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = data as any
        setDisplayName(profile.display_name || '')
        setAvatarEmoji(profile.avatar_emoji || '👤')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: createError } = await (supabase as any)
        .from('profiles')
        .insert([
          {
            id: userId,
            display_name: null,
            avatar_emoji: '👤',
          },
        ])

      if (createError) {
        console.error('Error creating profile:', createError)
        setError('Failed to create profile')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to create profile')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    if (!isSupabaseConfigured()) {
      setError('Profile features require Supabase configuration')
      setSaving(false)
      return
    }

    // Validation
    if (!displayName.trim()) {
      setError('Display name is required')
      setSaving(false)
      return
    }

    if (displayName.length > 50) {
      setError('Display name must be 50 characters or less')
      setSaving(false)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          avatar_emoji: avatarEmoji,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        setError('Failed to save profile')
      } else {
        setSuccess('Profile saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed from this page
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Display Name *
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            maxLength={50}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={saving}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {displayName.length}/50 characters
          </p>
        </div>

        {/* Avatar Emoji */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avatar
          </label>
          <AvatarPicker
            selectedEmoji={avatarEmoji}
            onSelect={setAvatarEmoji}
            disabled={saving}
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving || !displayName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
