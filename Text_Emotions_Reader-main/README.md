# 🎤 Emoji Voice Generator - Node.js

Transform your text into speech with **perfect emoji-voice alignment** using advanced server-side text-to-speech synthesis! This Node.js application provides real-time voice generation with emotion-specific voice characteristics that perfectly match each emoji.

## ✨ Key Features

- **🎯 Perfect Emoji-Voice Alignment**: Advanced voice modulation that perfectly matches each emoji's emotional characteristics
- **🔊 Real-time Speech Synthesis**: Instant voice generation using server-side TTS
- **🎭 8 Distinct Emotions**: Happy, Sad, Shock, Angry, Sleepy, Robotic, Dramatic, and Singing
- **⚡ Socket.IO Integration**: Real-time communication between client and server
- **🎨 Modern Web Interface**: Beautiful, responsive design with live status indicators
- **🔧 Advanced Voice Settings**: Precise control over rate, pitch, volume, and modulation
- **📱 Cross-platform**: Works on Windows, macOS, and Linux

## 🎯 How It Works

1. **Enter Text**: Type or paste the text you want to convert to speech
2. **Choose Emotion**: Select an emoji that represents the emotional tone
3. **Generate Voice**: Click "Generate Voice" to create perfectly aligned speech
4. **Listen**: The text is spoken with emotion-specific voice characteristics

## 🎨 Emotion Characteristics

| Emoji | Emotion | Voice Characteristics |
|-------|---------|----------------------|
| 😊 | Happy | Higher pitch (1.3x), faster rate (1.2x), cheerful tone with exclamations |
| 😢 | Sad | Lower pitch (0.6x), slower rate (0.7x), melancholic tone with ellipsis |
| 😱 | Shock | High pitch (1.6x), fast rate (1.8x), excited tone with emphasis |
| 😠 | Angry | Higher pitch (1.5x), forceful rate (1.4x), commanding tone |
| 😴 | Sleepy | Low pitch (0.7x), slow rate (0.5x), relaxed tone with yawns |
| 🤖 | Robotic | Monotone pitch (0.9x), mechanical rate (0.9x), beep sounds |
| 🎭 | Dramatic | High pitch (1.4x), theatrical rate (0.8x), dramatic pauses |
| 🎵 | Singing | Melodic pitch (1.2x), musical rate (1.0x), melodic tone |

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 14.0.0 or higher)
- **npm** or **yarn**
- **Windows**: Microsoft Speech API (built-in)
- **macOS**: Built-in speech synthesis
- **Linux**: Festival or espeak (install separately)

### Installation

1. **Clone or download** the project files
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
4. **Open your browser** and go to `http://localhost:3000`

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## 🛠️ Technical Architecture

### Server-Side (Node.js)
- **Express.js**: Web server and API endpoints
- **Socket.IO**: Real-time bidirectional communication
- **say.js**: Cross-platform text-to-speech synthesis
- **Advanced Voice Modulation**: Emotion-specific voice processing

### Client-Side (Browser)
- **Socket.IO Client**: Real-time communication
- **Modern JavaScript**: ES6+ features and async/await
- **Responsive Design**: Mobile-first approach

### Voice Processing Pipeline

1. **Text Input** → Client validation
2. **Emotion Selection** → Voice configuration lookup
3. **Text Modification** → Emotion-specific text processing
4. **Voice Synthesis** → Server-side TTS with emotion settings
5. **Real-time Output** → Immediate speech generation

## 🔧 Voice Configuration

Each emotion has precise voice settings:

```javascript
happy: {
    rate: 1.2,        // 20% faster speech
    pitch: 1.3,       // 30% higher pitch
    volume: 1.0,      // Full volume
    modulation: {
        frequency: 1.2,
        amplitude: 1.1,
        vibrato: 0.1
    }
}
```

## 📁 Project Structure

```
emoji-voice-generator/
├── server.js              # Main Node.js server
├── package.json           # Dependencies and scripts
├── public/                # Static files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styling
│   └── script.js          # Client-side JavaScript
└── README.md              # This file
```

## 🎵 Voice Generation Process

1. **Client Input**: Text and emotion selection
2. **Socket.IO**: Real-time data transmission
3. **Server Processing**: Voice configuration and text modification
4. **TTS Synthesis**: Emotion-specific speech generation
5. **Real-time Output**: Immediate voice playback

## 🔒 Privacy & Security

- **Local Processing**: All voice synthesis happens on your local machine
- **No Data Collection**: No text or audio is sent to external servers
- **Secure Communication**: Socket.IO with CORS protection
- **Offline Capable**: Works without internet connection

## 🐛 Troubleshooting

### Common Issues

1. **No sound generated**:
   - Check system audio settings
   - Verify TTS voices are installed
   - Ensure microphone permissions

2. **Connection issues**:
   - Check if server is running on port 3000
   - Verify firewall settings
   - Check browser console for errors

3. **Voice not working**:
   - Windows: Check Speech Recognition settings
   - macOS: Verify System Preferences > Accessibility > Speech
   - Linux: Install `festival` or `espeak`

### Platform-Specific Notes

- **Windows**: Uses Microsoft Speech API (built-in)
- **macOS**: Uses built-in speech synthesis
- **Linux**: Requires Festival or espeak installation

## 🎮 Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Generate voice
- **Escape**: Clear text input
- **Tab**: Navigate between elements

## 🔧 Customization

### Adding New Emotions

1. Add emotion to `voiceSettings` in `server.js`
2. Add text modification function to `emotionModifications`
3. Add emoji button to HTML
4. Update CSS for new emotion styling

### Modifying Voice Characteristics

Edit the `voiceSettings` object in `server.js` to adjust:
- Speech rate (0.1 to 10)
- Pitch (0 to 2)
- Volume (0 to 1)
- Modulation parameters

## 📱 Browser Compatibility

- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 14+
- ✅ Edge 79+

## 🤝 Contributing

Feel free to contribute by:
- Adding new emotions or voice characteristics
- Improving voice modulation algorithms
- Enhancing the UI/UX
- Adding new features

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **say.js**: Cross-platform text-to-speech
- **Socket.IO**: Real-time communication
- **Express.js**: Web server framework
- **Microsoft Speech API**: Windows TTS capabilities

---

**Experience the perfect alignment between emojis and voice! 🎤✨**
