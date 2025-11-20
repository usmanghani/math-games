# Gemini Flash Cards Game

An interactive educational flash cards game for kids to learn numbers and letters using voice recognition powered by Google Gemini AI.

## Features

- **Voice Recognition**: Uses Google Gemini AI API for accurate speech-to-text recognition
- **Three Game Modes**:
  - Numbers (0-9)
  - Alphabet (A-Z)
  - Mixed (numbers and letters)
- **Interactive Feedback**:
  - Text-to-speech pronunciation
  - Visual feedback for correct/incorrect answers
  - Confetti animations on correct answers
- **Score Tracking**: Keep track of correct answers
- **Mobile-Friendly**: Responsive design works on all devices

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Get API Key" or "Create API Key"
   - Copy your API key

3. **Configure the App**
   - Run the app: `npm run dev`
   - Click the settings icon (⚙️) in the top-right corner
   - Paste your Gemini API key
   - The key is stored securely in your browser's local storage

4. **Start Playing**
   - Choose a game mode
   - Click the microphone button to record your answer
   - Speak the letter or number shown on the card
   - Get instant feedback!

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Google Gemini AI** - Speech recognition
- **Web Speech API** - Text-to-speech

## Privacy & Security

- Your Gemini API key is stored locally in your browser only
- Audio recordings are sent only to Google's Gemini API for processing
- No data is stored or sent to any other servers

## Browser Compatibility

Works best on:
- Chrome (desktop and mobile)
- Safari (iOS and desktop)
- Edge

Requires microphone access permission.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```
