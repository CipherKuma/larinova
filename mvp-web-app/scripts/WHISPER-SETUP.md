# Local Whisper Server for Arabic Transcription

## Quick Start (3 steps)

### 1. Install Dependencies
```bash
pip3 install -r scripts/requirements-whisper.txt
```

### 2. Start Whisper Server
```bash
python3 scripts/whisper-server.py
```

You should see:
```
🎤 Whisper Server Starting...
📝 Language: Arabic (ar)
🌐 Server: http://localhost:5001
```

### 3. Use in App
- Navigate to consultation page
- Click "START RECORDING"
- Speak in Arabic
- Transcripts appear in real-time every 5 seconds!

## Features
✅ **100% Offline** - No internet needed
✅ **Free** - Completely free, no API costs
✅ **Arabic Support** - Native Arabic transcription
✅ **Auto-saves** - Transcripts saved to database
✅ **Privacy** - Audio never leaves your machine

## Troubleshooting

**Error: "LOCAL WHISPER SERVER NOT RUNNING"**
- Make sure you started the server: `python3 scripts/whisper-server.py`
- Check server is on port 5001

**Slow transcription?**
- Default uses `base` model (good balance)
- For faster: Change to `tiny` model in whisper-server.py
- For better quality: Change to `medium` or `large`

**Want different language?**
- Edit `whisper-server.py` line 35: `language='ar'` to `language='en'` for English

## Model Sizes
- `tiny` - Fastest, less accurate (~1GB RAM)
- `base` - Good balance (~1.5GB RAM) ✅ Default
- `small` - Better quality (~2.5GB RAM)
- `medium` - High quality (~5GB RAM)
- `large` - Best quality (~10GB RAM)
