# Fish Audio S2-Pro Voice Demo

Try Fish Audio for free: [https://fish.audio/?fpr=sonny82](https://fish.audio/?fpr=sonny82)

## What You Can Try

- Generate text-to-speech with Fish Audio S2-Pro in Next.js
- Add the new free-form emotion tags like `[curious]`, `[excited]`, or `[whispering]`
- Upload audio and transcribe it with speech-to-text
- Search Fish Audio voices and use a voice ID for TTS
- Clone a voice from an audio sample
- Save cloned voices locally in the browser
- Stream generated speech through the browser audio player

## Tech Stack

- Next.js App Router
- React
- Fish Audio JavaScript SDK
- Local API routes for server-side Fish Audio calls

## Getting Started

Create `.env.local` in the project root:

```bash
FISH_API_KEY=your_fish_audio_api_key
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

- `POST /api/tts` - generate MP3 audio from text
- `POST /api/stt` - transcribe uploaded audio
- `GET /api/voices` - search Fish Audio voices
- `POST /api/voices/clone` - create a reusable cloned voice
- `GET /api/tts-stream` - stream realtime TTS to the browser audio player
- `POST /api/tts-stream` - test realtime streaming as an API request

## Project Notes

- `FISH_API_KEY` stays server-side and is never exposed to the browser.
- The browser calls local Next.js API routes, and those routes call Fish Audio.
- Saved cloned voices are stored locally in the browser, not in a database.
- Only clone voices you own or have permission to use.

## Useful Links

- Try Fish Audio: [https://fish.audio/?fpr=sonny82](https://fish.audio/?fpr=sonny82)
- Fish Audio docs: [https://docs.fish.audio](https://docs.fish.audio)
- JavaScript SDK reference: [https://docs.fish.audio/api-reference/sdk/javascript/api-reference](https://docs.fish.audio/api-reference/sdk/javascript/api-reference)
