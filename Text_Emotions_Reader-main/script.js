class EmojiVoiceGenerator {
    constructor() {
        this.selectedEmotion = 'happy';
        this.selectedEmoji = '😊';
        this.audioBlob = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceSettings();
        this.selectDefaultEmoji();
    }

    setupEventListeners() {
        // Emoji selection
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectEmoji(e));
        });

        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => this.generateVoice());

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadAudio());

        // Share button
        document.getElementById('shareBtn').addEventListener('click', () => this.shareAudio());

        // Text input validation
        document.getElementById('textInput').addEventListener('input', (e) => this.validateInput(e));
    }

    setupVoiceSettings() {
        // Voice characteristics for different emotions
        this.voiceSettings = {
            happy: {
                rate: 1.1,
                pitch: 1.2,
                volume: 1.0,
                voice: 'en-US',
                style: 'cheerful'
            },
            sad: {
                rate: 0.8,
                pitch: 0.7,
                volume: 0.8,
                voice: 'en-US',
                style: 'melancholic'
            },
            shock: {
                rate: 1.5,
                pitch: 1.5,
                volume: 1.2,
                voice: 'en-US',
                style: 'excited'
            },
            angry: {
                rate: 1.3,
                pitch: 1.4,
                volume: 1.1,
                voice: 'en-US',
                style: 'forceful'
            },
            sleepy: {
                rate: 0.6,
                pitch: 0.8,
                volume: 0.7,
                voice: 'en-US',
                style: 'relaxed'
            },
            robotic: {
                rate: 0.9,
                pitch: 0.9,
                volume: 1.0,
                voice: 'en-US',
                style: 'monotone'
            },
            dramatic: {
                rate: 0.8,
                pitch: 1.3,
                volume: 1.0,
                voice: 'en-US',
                style: 'theatrical'
            },
            singing: {
                rate: 1.0,
                pitch: 1.1,
                volume: 1.0,
                voice: 'en-US',
                style: 'melodic'
            }
        };
    }

    selectDefaultEmoji() {
        const defaultBtn = document.querySelector('[data-emotion="happy"]');
        if (defaultBtn) {
            this.selectEmoji({ target: defaultBtn });
        }
    }

    selectEmoji(event) {
        // Remove previous selection
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection to clicked button
        const btn = event.target.closest('.emoji-btn');
        btn.classList.add('selected');

        // Update selected emotion and emoji
        this.selectedEmotion = btn.dataset.emotion;
        this.selectedEmoji = btn.dataset.emoji;

        // Update display
        document.getElementById('selectedEmoji').textContent = this.selectedEmoji;
    }

    validateInput(event) {
        const text = event.target.value.trim();
        const generateBtn = document.getElementById('generateBtn');
        
        if (text.length > 0) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    }

    async generateVoice() {
        const text = document.getElementById('textInput').value.trim();
        
        if (!text) {
            this.showNotification('Please enter some text first!', 'error');
            return;
        }

        this.showLoading(true);
        
        try {
            // Check if browser supports speech synthesis
            if (!window.speechSynthesis) {
                throw new Error('Speech synthesis not supported in this browser');
            }

            // Get available voices
            const voices = await this.getVoices();
            
            // Generate speech with selected emotion
            const audioBlob = await this.synthesizeSpeech(text, voices);
            
            // Display the result
            this.displayAudio(audioBlob);
            
            this.showNotification('Voice generated successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.showNotification('Failed to generate voice. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    getVoices() {
        return new Promise((resolve) => {
            let voices = speechSynthesis.getVoices();
            
            if (voices.length > 0) {
                resolve(voices);
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    voices = speechSynthesis.getVoices();
                    resolve(voices);
                };
            }
        });
    }

    async synthesizeSpeech(text, voices) {
        return new Promise((resolve, reject) => {
            try {
                // Cancel any ongoing speech
                speechSynthesis.cancel();

                // Create utterance
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Apply voice settings based on emotion
                const settings = this.voiceSettings[this.selectedEmotion];
                utterance.rate = settings.rate;
                utterance.pitch = settings.pitch;
                utterance.volume = settings.volume;
                
                // Select appropriate voice
                const preferredVoice = voices.find(voice => 
                    voice.lang.startsWith('en') && voice.localService
                ) || voices.find(voice => 
                    voice.lang.startsWith('en')
                ) || voices[0];
                
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }

                // Apply emotion-specific modifications
                this.applyEmotionModifications(utterance, settings);

                // Create audio context for processing
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const mediaStreamDestination = audioContext.createMediaStreamDestination();
                
                // Create a simple audio source (we'll use Web Speech API for now)
                // In a real implementation, you might want to use a more sophisticated TTS service
                
                utterance.onend = () => {
                    // For demo purposes, we'll create a simple audio blob
                    // In a real app, you'd capture the actual audio stream
                    this.createDemoAudioBlob(text, settings).then(resolve).catch(reject);
                };

                utterance.onerror = (event) => {
                    reject(new Error(`Speech synthesis error: ${event.error}`));
                };

                // Start speaking
                speechSynthesis.speak(utterance);

            } catch (error) {
                reject(error);
            }
        });
    }

    applyEmotionModifications(utterance, settings) {
        // Add emotion-specific text modifications
        let modifiedText = utterance.text;
        
        switch (this.selectedEmotion) {
            case 'happy':
                // Add some exclamation marks for happiness
                if (!modifiedText.endsWith('!')) {
                    modifiedText += '!';
                }
                break;
            case 'sad':
                // Add ellipsis for sadness
                if (!modifiedText.endsWith('...')) {
                    modifiedText += '...';
                }
                break;
            case 'shock':
                // Add emphasis for shock
                modifiedText = `Oh my! ${modifiedText}!`;
                break;
            case 'angry':
                // Add emphasis for anger
                modifiedText = `Listen! ${modifiedText}!`;
                break;
            case 'sleepy':
                // Add yawn-like sounds
                modifiedText = `Yawn... ${modifiedText}...`;
                break;
            case 'robotic':
                // Add robotic prefixes
                modifiedText = `Beep. ${modifiedText}. Beep.`;
                break;
            case 'dramatic':
                // Add dramatic pauses
                modifiedText = `*dramatic pause* ${modifiedText} *dramatic pause*`;
                break;
            case 'singing':
                // Add musical notes
                modifiedText = `🎵 ${modifiedText} 🎵`;
                break;
        }
        
        utterance.text = modifiedText;
    }

    async createDemoAudioBlob(text, settings) {
        // This is a simplified demo implementation
        // In a real application, you would capture the actual speech synthesis audio
        
        // Create a simple audio waveform based on the emotion
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;
        const duration = Math.max(1, text.length * 0.1); // Rough estimate
        const frameCount = sampleRate * duration;
        
        const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        // Generate a simple tone that varies based on emotion
        const frequency = 220 + (settings.pitch - 1) * 100; // Base frequency modified by pitch
        
        for (let i = 0; i < frameCount; i++) {
            const time = i / sampleRate;
            let amplitude = 0.3 * settings.volume;
            
            // Add emotion-specific modulation
            switch (this.selectedEmotion) {
                case 'happy':
                    amplitude *= 1 + 0.2 * Math.sin(time * 10);
                    break;
                case 'sad':
                    amplitude *= 0.5 + 0.3 * Math.sin(time * 2);
                    break;
                case 'shock':
                    amplitude *= 1 + 0.5 * Math.sin(time * 20);
                    break;
                case 'angry':
                    amplitude *= 1 + 0.3 * Math.sin(time * 15);
                    break;
                case 'sleepy':
                    amplitude *= 0.3 + 0.2 * Math.sin(time * 1);
                    break;
                case 'robotic':
                    amplitude *= 0.8 + 0.2 * Math.sin(time * 50);
                    break;
                case 'dramatic':
                    amplitude *= 0.7 + 0.4 * Math.sin(time * 5);
                    break;
                case 'singing':
                    amplitude *= 0.9 + 0.3 * Math.sin(time * 8);
                    break;
            }
            
            channelData[i] = amplitude * Math.sin(2 * Math.PI * frequency * time);
        }
        
        // Convert to blob
        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(mediaStreamDestination);
        source.start();
        
        return new Promise((resolve) => {
            const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                resolve(blob);
            };
            
            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
                source.stop();
            }, duration * 1000);
        });
    }

    displayAudio(audioBlob) {
        this.audioBlob = audioBlob;
        
        // Create audio URL
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Set audio source
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = audioUrl;
        
        // Show output section
        document.getElementById('outputSection').style.display = 'block';
        
        // Scroll to output
        document.getElementById('outputSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    downloadAudio() {
        if (!this.audioBlob) {
            this.showNotification('No audio to download!', 'error');
            return;
        }

        const url = URL.createObjectURL(this.audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emoji-voice-${this.selectedEmotion}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Audio downloaded successfully!', 'success');
    }

    shareAudio() {
        if (!this.audioBlob) {
            this.showNotification('No audio to share!', 'error');
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: 'My Emoji Voice',
                text: `Check out this ${this.selectedEmotion} voice I created!`,
                files: [new File([this.audioBlob], `emoji-voice-${this.selectedEmotion}.wav`, { type: 'audio/wav' })]
            }).catch(error => {
                console.log('Error sharing:', error);
                this.showNotification('Sharing failed. Try downloading instead.', 'error');
            });
        } else {
            this.showNotification('Sharing not supported in this browser. Try downloading instead.', 'info');
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const generateBtn = document.getElementById('generateBtn');
        
        if (show) {
            loading.style.display = 'flex';
            generateBtn.disabled = true;
        } else {
            loading.style.display = 'none';
            generateBtn.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'info':
                notification.style.backgroundColor = '#3b82f6';
                break;
            default:
                notification.style.backgroundColor = '#6b7280';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmojiVoiceGenerator();
});
