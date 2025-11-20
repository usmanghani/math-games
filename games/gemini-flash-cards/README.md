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
- **No API Key Required**: Users don't need their own API key - it's handled on the backend

## Setup for Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Get API Key" or "Create API Key"
   - Copy your API key

3. **Configure Environment Variables**
   ```bash
   # Create a .env file in the root directory
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

4. **Run the Development Servers**
   ```bash
   # Terminal 1: Start the frontend
   npm run dev

   # Terminal 2: Start the backend API
   npm run dev:api
   ```

5. **Start Playing**
   - Open http://localhost:5173 in your browser
   - Choose a game mode
   - Click the microphone button to record your answer
   - Speak the letter or number shown on the card
   - Get instant feedback!

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Web Speech API** - Text-to-speech

### Backend
- **Express** - API server
- **Google Gemini AI** - Speech recognition
- **Multer** - File upload handling

## Architecture

The app uses a client-server architecture:
- **Frontend**: React app that captures audio and displays the game
- **Backend API**: Express server that proxies requests to Gemini AI
- Users don't need to manage API keys - the backend handles all Gemini API calls

## Privacy & Security

- API keys are stored securely on the server (not exposed to users)
- Audio recordings are sent to the backend, which forwards them to Google's Gemini API
- No user data is stored permanently
- Audio is processed in real-time and discarded after transcription

## Browser Compatibility

Works best on:
- Chrome (desktop and mobile)
- Safari (iOS and desktop)
- Edge

Requires microphone access permission.

## Development

```bash
# Start frontend dev server
npm run dev

# Start backend API server
npm run dev:api

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment

### Vercel Deployment

1. **Set Environment Variable**
   - Go to your Vercel project settings
   - Add environment variable: `GEMINI_API_KEY=your_api_key_here`

2. **Deploy**
   ```bash
   vercel --prod
   ```

The `vercel.json` configuration handles both frontend and backend deployment automatically.

### Manual Deployment

For other hosting platforms:
- Build the frontend: `npm run build`
- Deploy the `dist` folder as static files
- Deploy the `api` folder as serverless functions or Node.js server
- Set the `GEMINI_API_KEY` environment variable on your server
