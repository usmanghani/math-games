'use client'

interface AvatarPickerProps {
  selectedEmoji: string
  onSelect: (emoji: string) => void
  disabled?: boolean
}

const AVAILABLE_AVATARS = [
  // People & Faces
  '👤', '😀', '😃', '😄', '😁', '😊', '🙂', '😇',
  '🥰', '😍', '🤩', '😎', '🤓', '🧐', '🤔', '🤗',

  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🦆', '🦉', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',

  // Food & Nature
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒',
  '🌸', '🌻', '🌺', '🌹', '🌷', '🌼', '🏵️', '🌲',
  '🌟', '⭐', '✨', '🌈', '🔥', '💧', '⚡', '☀️',

  // Objects & Symbols
  '🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🏆', '🥇',
  '💎', '👑', '🎓', '📚', '🚀', '🛸', '🎸', '🎹',
]

export function AvatarPicker({ selectedEmoji, onSelect, disabled = false }: AvatarPickerProps) {
  return (
    <div className="space-y-3">
      {/* Current Selection Display */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-5xl">{selectedEmoji}</div>
        <div>
          <p className="text-sm font-medium text-gray-700">Current Avatar</p>
          <p className="text-xs text-gray-500">Click an emoji below to change</p>
        </div>
      </div>

      {/* Emoji Grid */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
          {AVAILABLE_AVATARS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => !disabled && onSelect(emoji)}
              disabled={disabled}
              className={`
                text-3xl p-2 rounded-lg transition-all
                ${selectedEmoji === emoji
                  ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                  : 'hover:bg-gray-100 hover:scale-110'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={`Select ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Choose an emoji that represents you!
      </p>
    </div>
  )
}
