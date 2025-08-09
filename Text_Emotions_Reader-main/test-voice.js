const say = require('say');

console.log('🎤 Testing Emoji Voice Generator...\n');

// Test different emotions
const testCases = [
    { text: 'Hello world', emotion: 'happy' },
    { text: 'I am feeling sad', emotion: 'sad' },
    { text: 'What a surprise', emotion: 'shock' },
    { text: 'I am angry', emotion: 'angry' },
    { text: 'I am tired', emotion: 'sleepy' },
    { text: 'I am a robot', emotion: 'robotic' },
    { text: 'This is dramatic', emotion: 'dramatic' },
    { text: 'I am singing', emotion: 'singing' }
];

let currentTest = 0;

function runTest() {
    if (currentTest >= testCases.length) {
        console.log('✅ All tests completed!');
        process.exit(0);
    }

    const test = testCases[currentTest];
    console.log(`🎭 Testing ${test.emotion} emotion: "${test.text}"`);
    
    // Apply emotion modifications
    let modifiedText = test.text;
    switch (test.emotion) {
        case 'happy':
            if (!modifiedText.endsWith('!')) modifiedText += '!';
            break;
        case 'sad':
            if (!modifiedText.endsWith('...')) modifiedText += '...';
            break;
        case 'shock':
            modifiedText = `Oh my! ${modifiedText}! Wow!`;
            break;
        case 'angry':
            modifiedText = `Listen! ${modifiedText}! Now!`;
            break;
        case 'sleepy':
            modifiedText = `Yawn... ${modifiedText}... zzz...`;
            break;
        case 'robotic':
            modifiedText = `Beep. ${modifiedText}. Beep. Processing complete.`;
            break;
        case 'dramatic':
            modifiedText = `*dramatic pause* ${modifiedText} *dramatic pause*`;
            break;
        case 'singing':
            modifiedText = `🎵 ${modifiedText} 🎵 La la la!`;
            break;
    }

    console.log(`📝 Modified text: "${modifiedText}"`);
    
    // Speak the text
    say.speak(modifiedText, 'Microsoft David Desktop', 1.0, (err) => {
        if (err) {
            console.error(`❌ Error with ${test.emotion}:`, err);
        } else {
            console.log(`✅ ${test.emotion} test completed\n`);
        }
        
        currentTest++;
        setTimeout(runTest, 2000); // Wait 2 seconds between tests
    });
}

// Start testing
console.log('🚀 Starting voice tests...\n');
setTimeout(runTest, 1000);
