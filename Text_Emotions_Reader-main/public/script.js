class VoiceEmotionStudio {
    constructor() {
        this.selectedEmotion = 'happy';
        this.selectedEmoji = '😊';
        this.intensity = 3;
        this.socket = null;
        this.isConnected = false;
        this.isProcessing = false;
        this.analytics = this.loadAnalytics();
        this.settings = this.loadSettings();
        this.serverTTSDisabled = false;
        this.lastVoiceConfig = null;
        this.init();
    }

    init() {
        this.fetchConfig();
        this.setupSocketConnection();
        this.setupEventListeners();
        this.setupNavigation();
        this.selectDefaultEmotion();
        this.updateAnalyticsDisplay();
        this.applySettings();
    }

    async fetchConfig() {
        try {
            const res = await fetch('/api/config');
            if (res.ok) {
                const data = await res.json();
                this.serverTTSDisabled = !!data.serverTTSDisabled;
            }
        } catch (_e) {
            // ignore, default to false
        }
    }

    setupSocketConnection() {
        this.socket = io();

        this.socket.on('connect', () => {
            this.isConnected = true;
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            this.updateConnectionStatus(false);
        });

        this.socket.on('voiceConfig', (config) => {
            this.lastVoiceConfig = config;
            this.displayVoiceConfig(config);
        });

        this.socket.on('voiceGenerated', (result) => {
            this.handleVoiceGenerated(result);
            if (this.serverTTSDisabled && this.lastVoiceConfig) {
                this.speakInBrowser(this.lastVoiceConfig);
            }
        });

        this.socket.on('error', (error) => {
            this.showNotification(error, 'error');
        });
    }

    updateConnectionStatus(connected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        const generateBtn = document.getElementById('generateBtn');

        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'Connected';
            generateBtn.disabled = false;
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Disconnected';
            generateBtn.disabled = true;
        }
    }

    setupEventListeners() {
        // Emotion selection
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectEmotion(e));
        });

        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => this.generateVoice());

        // Text input validation and character counter
        document.getElementById('textInput').addEventListener('input', (e) => this.handleTextInput(e));

        // Intensity slider
        document.getElementById('intensitySlider').addEventListener('input', (e) => {
            this.intensity = parseInt(e.target.value);
        });

        // Output panel controls
        document.getElementById('closeOutput').addEventListener('click', () => this.closeOutput());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());

        // Settings
        document.getElementById('defaultVoice').addEventListener('change', (e) => this.updateSetting('defaultVoice', e.target.value));
        document.getElementById('trackAnalytics').addEventListener('change', (e) => this.updateSetting('trackAnalytics', e.target.checked));
        document.getElementById('themeSelect').addEventListener('change', (e) => this.updateSetting('theme', e.target.value));
        document.getElementById('showNotifications').addEventListener('change', (e) => this.updateSetting('showNotifications', e.target.checked));
    }

    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Show selected section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
    }

    selectDefaultEmotion() {
        const defaultBtn = document.querySelector('[data-emotion="happy"]');
        if (defaultBtn) {
            this.selectEmotion({ target: defaultBtn });
        }
    }

    selectEmotion(event) {
        // Remove previous selection
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection to clicked button
        const btn = event.target.closest('.emotion-btn');
        btn.classList.add('selected');

        // Update selected emotion and emoji
        this.selectedEmotion = btn.dataset.emotion;
        this.selectedEmoji = btn.dataset.emoji;

        // Update display
        document.getElementById('selectedEmotion').textContent = `${this.selectedEmoji} ${btn.querySelector('.emotion-name').textContent}`;
    }

    handleTextInput(event) {
        const text = event.target.value;
        const charCount = text.length;
        const maxChars = 500;
        
        // Update character counter
        document.getElementById('charCount').textContent = charCount;
        
        // Update generate button state
        const generateBtn = document.getElementById('generateBtn');
        if (charCount > 0 && charCount <= maxChars && this.isConnected) {
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

        if (!this.isConnected) {
            this.showNotification('Not connected to server. Please wait...', 'error');
            return;
        }

        if (this.isProcessing) {
            this.showNotification('Already processing. Please wait...', 'info');
            return;
        }

        this.setProcessingState(true);
        
        try {
            // Send voice generation request to server
            this.socket.emit('generateVoice', {
                text: text,
                emotion: this.selectedEmotion,
                intensity: this.intensity
            });

            this.showNotification('Generating voice...', 'info');
            
        } catch (error) {
            this.showNotification('Failed to generate voice. Please try again.', 'error');
            this.setProcessingState(false);
        }
    }

    handleVoiceGenerated(result) {
        this.setProcessingState(false);
        
        if (result.success) {
            this.showNotification(`Voice generated with ${result.emotion} emotion!`, 'success');
            
            // Track analytics if enabled
            if (this.settings.trackAnalytics) {
                this.trackVoiceGeneration(result);
            }
            
            // Show output panel
            this.showOutput(result);
            
        } else {
            this.showNotification('Failed to generate voice', 'error');
        }
    }

    displayVoiceConfig(config) {
        this.showOutput({
            emotion: this.selectedEmotion,
            intensity: this.intensity,
            originalText: document.getElementById('textInput').value,
            modifiedText: config.text
        });
    }

    showOutput(result) {
        const outputPanel = document.getElementById('outputPanel');
        
        // Update output content
        document.getElementById('outputEmotion').textContent = `${this.selectedEmoji} ${this.selectedEmotion.charAt(0).toUpperCase() + this.selectedEmotion.slice(1)}`;
        document.getElementById('outputIntensity').textContent = this.getIntensityLabel(this.intensity);
        document.getElementById('originalText').textContent = result.originalText;
        document.getElementById('modifiedText').textContent = result.modifiedText;
        
        // Show panel
        outputPanel.style.display = 'block';
        
        // Scroll to output
        outputPanel.scrollIntoView({ behavior: 'smooth' });
    }

    closeOutput() {
        document.getElementById('outputPanel').style.display = 'none';
    }

    playAgain() {
        // Re-generate the voice with same settings
        const text = document.getElementById('originalText').textContent;
        if (!text) return;
        if (this.serverTTSDisabled && this.lastVoiceConfig) {
            this.speakInBrowser(this.lastVoiceConfig);
            return;
        }
        document.getElementById('textInput').value = text;
        this.generateVoice();
    }

    // Analytics tracking
    trackVoiceGeneration(result) {
        const today = new Date().toDateString();
        
        // Update total voices
        this.analytics.totalVoices++;
        
        // Update today's voices
        if (!this.analytics.dailyStats[today]) {
            this.analytics.dailyStats[today] = 0;
        }
        this.analytics.dailyStats[today]++;
        
        // Update character count
        this.analytics.totalCharacters += result.originalText.length;
        
        // Update emotion stats
        if (!this.analytics.emotions[result.emotion]) {
            this.analytics.emotions[result.emotion] = 0;
        }
        this.analytics.emotions[result.emotion]++;
        
        // Update intensity stats
        if (!this.analytics.intensities[result.intensity]) {
            this.analytics.intensities[result.intensity] = 0;
        }
        this.analytics.intensities[result.intensity]++;
        
        // Add to recent activity
        this.analytics.recentActivity.unshift({
            emotion: result.emotion,
            intensity: result.intensity,
            text: result.originalText.substring(0, 50) + (result.originalText.length > 50 ? '...' : ''),
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 activities
        if (this.analytics.recentActivity.length > 10) {
            this.analytics.recentActivity = this.analytics.recentActivity.slice(0, 10);
        }
        
        this.saveAnalytics();
        this.updateAnalyticsDisplay();
    }

    loadAnalytics() {
        const defaultAnalytics = {
            totalVoices: 0,
            totalCharacters: 0,
            dailyStats: {},
            emotions: {},
            intensities: {},
            recentActivity: []
        };
        
        const saved = localStorage.getItem('voiceAnalytics');
        return saved ? { ...defaultAnalytics, ...JSON.parse(saved) } : defaultAnalytics;
    }

    saveAnalytics() {
        localStorage.setItem('voiceAnalytics', JSON.stringify(this.analytics));
    }

    updateAnalyticsDisplay() {
        // Update usage statistics
        document.getElementById('totalVoices').textContent = this.analytics.totalVoices;
        document.getElementById('totalCharacters').textContent = this.analytics.totalCharacters.toLocaleString();
        
        const today = new Date().toDateString();
        const todayVoices = this.analytics.dailyStats[today] || 0;
        document.getElementById('todayVoices').textContent = todayVoices;
        
        const avgLength = this.analytics.totalVoices > 0 ? Math.round(this.analytics.totalCharacters / this.analytics.totalVoices) : 0;
        document.getElementById('avgLength').textContent = avgLength;
        
        // Update emotion distribution
        const totalEmotions = Object.values(this.analytics.emotions).reduce((a, b) => a + b, 0);
        const emotionElements = document.querySelectorAll('.emotion-stat');
        
        emotionElements.forEach(element => {
            const emotionName = element.querySelector('.emotion-name').textContent.toLowerCase();
            const count = this.analytics.emotions[emotionName] || 0;
            const percentage = totalEmotions > 0 ? (count / totalEmotions) * 100 : 0;
            
            element.querySelector('.emotion-count').textContent = count;
            element.querySelector('.emotion-fill').style.width = `${percentage}%`;
        });
        
        // Update intensity trends
        const totalIntensities = Object.values(this.analytics.intensities).reduce((a, b) => a + b, 0);
        const intensityElements = document.querySelectorAll('.intensity-stat');
        const intensityLabels = ['Subtle', 'Light', 'Moderate', 'Strong', 'Intense'];
        
        intensityElements.forEach((element, index) => {
            const intensity = index + 1;
            const count = this.analytics.intensities[intensity] || 0;
            const percentage = totalIntensities > 0 ? (count / totalIntensities) * 100 : 0;
            
            element.querySelector('.intensity-count').textContent = count;
            element.querySelector('.intensity-fill').style.width = `${percentage}%`;
        });
        
        // Update recent activity
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const recentActivity = document.getElementById('recentActivity');
        
        if (this.analytics.recentActivity.length === 0) {
            recentActivity.innerHTML = '<div class="activity-empty"><p>No recent activity</p></div>';
            return;
        }
        
        recentActivity.innerHTML = this.analytics.recentActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-header">
                    <span class="activity-emotion">${this.getEmojiForEmotion(activity.emotion)} ${activity.emotion}</span>
                    <span class="activity-intensity">${this.getIntensityLabel(activity.intensity)}</span>
                </div>
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
            </div>
        `).join('');
    }

    setProcessingState(processing) {
        this.isProcessing = processing;
        const generateBtn = document.getElementById('generateBtn');
        
        if (processing) {
            generateBtn.classList.add('processing');
            generateBtn.disabled = true;
        } else {
            generateBtn.classList.remove('processing');
            generateBtn.disabled = false;
        }
    }

    getIntensityLabel(intensity) {
        const labels = ['Subtle', 'Light', 'Moderate', 'Strong', 'Intense'];
        return labels[intensity - 1] || 'Moderate';
    }

    getEmojiForEmotion(emotion) {
        const emojis = {
            happy: '😊',
            sad: '😢',
            shock: '😱',
            angry: '😠',
            sleepy: '😴',
            thoughtful: '🤔'
        };
        return emojis[emotion] || '😊';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    // Settings management
    loadSettings() {
        const defaultSettings = {
            defaultVoice: 'Microsoft David Desktop',
            trackAnalytics: true,
            theme: 'dark',
            showNotifications: true
        };
        
        const saved = localStorage.getItem('voiceSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('voiceSettings', JSON.stringify(this.settings));
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        // Apply theme
        document.body.className = this.settings.theme;
        
        // Apply other settings
        document.getElementById('defaultVoice').value = this.settings.defaultVoice;
        document.getElementById('trackAnalytics').checked = this.settings.trackAnalytics;
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('showNotifications').checked = this.settings.showNotifications;
    }

    showNotification(message, type = 'info') {
        if (!this.settings.showNotifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Browser speech synthesis fallback when server-side TTS is disabled
    async speakInBrowser(voiceConfig) {
        try {
            if (!('speechSynthesis' in window)) {
                this.showNotification('Browser speech synthesis not supported', 'error');
                return;
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(voiceConfig.text);
            // Clamp values to Web Speech ranges
            utterance.rate = Math.max(0.1, Math.min(10, voiceConfig.rate || 1));
            utterance.pitch = Math.max(0, Math.min(2, voiceConfig.pitch || 1));
            utterance.volume = Math.max(0, Math.min(1, voiceConfig.volume != null ? voiceConfig.volume : 1));

            // Pick an English voice if available
            const voices = await new Promise((resolve) => {
                const list = window.speechSynthesis.getVoices();
                if (list && list.length) return resolve(list);
                window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
            });
            const preferred = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) || voices[0];
            if (preferred) utterance.voice = preferred;

            window.speechSynthesis.speak(utterance);
        } catch (_err) {
            this.showNotification('Unable to play voice in browser', 'error');
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VoiceEmotionStudio();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to generate voice
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            app.generateVoice();
        }
        
        // Escape to close output or clear text
        if (e.key === 'Escape') {
            const outputPanel = document.getElementById('outputPanel');
            if (outputPanel.style.display !== 'none') {
                app.closeOutput();
            } else {
                document.getElementById('textInput').value = '';
                app.handleTextInput({ target: document.getElementById('textInput') });
            }
        }
    });
});
