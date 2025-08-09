const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const say = require('say');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Disable server-side TTS in environments where audio is not available (e.g., Render)
const isServerTTSDisabled =
    process.env.DISABLE_SERVER_TTS === '1' ||
    process.env.RENDER === 'true' ||
    process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Voice settings for different emotions with intensity support
const voiceSettings = {
    happy: {
        base: {
            rate: 1.2,
            pitch: 1.3,
            volume: 1.0,
            voice: 'Microsoft David Desktop'
        },
        intensity: {
            1: { rate: 1.0, pitch: 1.1, volume: 0.8 },
            2: { rate: 1.1, pitch: 1.2, volume: 0.9 },
            3: { rate: 1.2, pitch: 1.3, volume: 1.0 },
            4: { rate: 1.3, pitch: 1.4, volume: 1.1 },
            5: { rate: 1.4, pitch: 1.5, volume: 1.2 }
        }
    },
    sad: {
        base: {
            rate: 0.7,
            pitch: 0.6,
            volume: 0.8,
            voice: 'Microsoft David Desktop'
        },
        intensity: {
            1: { rate: 0.8, pitch: 0.7, volume: 0.9 },
            2: { rate: 0.75, pitch: 0.65, volume: 0.85 },
            3: { rate: 0.7, pitch: 0.6, volume: 0.8 },
            4: { rate: 0.65, pitch: 0.55, volume: 0.75 },
            5: { rate: 0.6, pitch: 0.5, volume: 0.7 }
        }
    },
    shock: {
        base: {
            rate: 1.8,
            pitch: 1.6,
            volume: 1.2,
            voice: 'Microsoft David Desktop'
        },
        intensity: {
            1: { rate: 1.4, pitch: 1.3, volume: 1.0 },
            2: { rate: 1.6, pitch: 1.4, volume: 1.1 },
            3: { rate: 1.8, pitch: 1.6, volume: 1.2 },
            4: { rate: 2.0, pitch: 1.8, volume: 1.3 },
            5: { rate: 2.2, pitch: 2.0, volume: 1.4 }
        }
    },
    angry: {
        base: {
            rate: 1.4,
            pitch: 1.5,
            volume: 1.1,
            voice: 'Microsoft David Desktop'
        },
        intensity: {
            1: { rate: 1.2, pitch: 1.3, volume: 1.0 },
            2: { rate: 1.3, pitch: 1.4, volume: 1.05 },
            3: { rate: 1.4, pitch: 1.5, volume: 1.1 },
            4: { rate: 1.5, pitch: 1.6, volume: 1.15 },
            5: { rate: 1.6, pitch: 1.7, volume: 1.2 }
        }
    },
    sleepy: {
        base: {
            rate: 0.5,
            pitch: 0.7,
            volume: 0.6,
            voice: 'Microsoft David Desktop'
        },
        intensity: {
            1: { rate: 0.7, pitch: 0.8, volume: 0.8 },
            2: { rate: 0.6, pitch: 0.75, volume: 0.7 },
            3: { rate: 0.5, pitch: 0.7, volume: 0.6 },
            4: { rate: 0.4, pitch: 0.65, volume: 0.5 },
            5: { rate: 0.3, pitch: 0.6, volume: 0.4 }
        }
    },
    thoughtful: {
        base: {
            rate: 0.9,
            pitch: 0.9,
            volume: 0.9,
            voice: 'Microsoft David Desktop'
        },
        intensity: {
            1: { rate: 1.0, pitch: 1.0, volume: 1.0 },
            2: { rate: 0.95, pitch: 0.95, volume: 0.95 },
            3: { rate: 0.9, pitch: 0.9, volume: 0.9 },
            4: { rate: 0.85, pitch: 0.85, volume: 0.85 },
            5: { rate: 0.8, pitch: 0.8, volume: 0.8 }
        }
    }
};

// Emotion-specific text modifications (no repetition)
const emotionModifications = {
    happy: (text, intensity) => {
        let modifiedText = text;
        if (!modifiedText.endsWith('!')) modifiedText += '!';
        return modifiedText.replace(/\./g, '!').replace(/,/g, '!');
    },
    sad: (text, intensity) => {
        let modifiedText = text;
        if (!modifiedText.endsWith('...')) modifiedText += '...';
        return modifiedText.replace(/!/g, '...').replace(/\./g, '...');
    },
    shock: (text, intensity) => {
        return `Oh my! ${text}! Wow!`;
    },
    angry: (text, intensity) => {
        return `Listen! ${text}! Now!`;
    },
    sleepy: (text, intensity) => {
        return `Yawn... ${text}... zzz...`;
    },
    thoughtful: (text, intensity) => {
        return `Hmm... ${text}... I think...`;
    }
};

// Advanced voice modulation function with intensity
function applyVoiceModulation(text, emotion, intensity = 3) {
    const settings = voiceSettings[emotion];
    const intensitySettings = settings.intensity[intensity] || settings.intensity[3];
    const modifiedText = emotionModifications[emotion](text, intensity);
    
    return {
        text: modifiedText,
        rate: intensitySettings.rate,
        pitch: intensitySettings.pitch,
        volume: intensitySettings.volume,
        voice: settings.base.voice,
        intensity: intensity
    };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    socket.on('generateVoice', async (data) => {
        try {
            const { text, emotion, intensity = 3 } = data;
            
            if (!text || !emotion) {
                socket.emit('error', 'Text and emotion are required');
                return;
            }

            // Apply emotion-based modifications with intensity
            const voiceConfig = applyVoiceModulation(text, emotion, intensity);
            
            // Emit voice configuration to client
            socket.emit('voiceConfig', voiceConfig);
            
            // Generate and speak the text
            await speakWithEmotion(voiceConfig, emotion);
            
            socket.emit('voiceGenerated', {
                success: true,
                emotion: emotion,
                intensity: intensity,
                originalText: text,
                modifiedText: voiceConfig.text
            });

        } catch (error) {
            socket.emit('error', 'Failed to generate voice');
        }
    });

    socket.on('disconnect', () => {
        // Connection closed
    });
});

// Advanced speech synthesis with emotion
async function speakWithEmotion(voiceConfig, emotion) {
    if (isServerTTSDisabled) {
        // Skip server-side speaking in production/Render; UI still receives config
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        try {
            // Apply additional emotion-specific processing
            let finalText = voiceConfig.text;
            
            // Add emotion-specific pauses and emphasis
            switch (emotion) {
                case 'happy':
                    finalText = finalText.replace(/!/g, ' ! ');
                    break;
                case 'sad':
                    finalText = finalText.replace(/\.\.\./g, ' ... ');
                    break;
                case 'shock':
                    finalText = finalText.replace(/!/g, ' !!! ');
                    break;
                case 'angry':
                    finalText = finalText.replace(/!/g, ' ! ');
                    break;
                case 'sleepy':
                    finalText = finalText.replace(/\.\.\./g, ' ... ');
                    break;
                case 'thoughtful':
                    finalText = finalText.replace(/\.\.\./g, ' ... ');
                    break;
            }

            // Speak the text with emotion (local/dev only)
            say.speak(finalText, voiceConfig.voice, voiceConfig.rate, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });

        } catch (error) {
            reject(error);
        }
    });
}

// API Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for Render
app.get('/healthz', (_req, res) => {
    res.status(200).send('ok');
});

app.get('/api/emotions', (req, res) => {
    res.json(Object.keys(voiceSettings));
});

// Public configuration so the client can decide whether to use browser TTS
app.get('/api/config', (_req, res) => {
    res.json({
        serverTTSDisabled: isServerTTSDisabled
    });
});

app.post('/api/speak', async (req, res) => {
    try {
        const { text, emotion, intensity = 3 } = req.body;
        
        if (!text || !emotion) {
            return res.status(400).json({ error: 'Text and emotion are required' });
        }

        const voiceConfig = applyVoiceModulation(text, emotion, intensity);
        
        // Speak the text
        await speakWithEmotion(voiceConfig, emotion);
        
        res.json({
            success: true,
            emotion: emotion,
            intensity: intensity,
            originalText: text,
            modifiedText: voiceConfig.text
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to generate voice' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`🎤 Voice Emotion Studio server running on http://${HOST}:${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    server.close(() => {
        process.exit(0);
    });
});
