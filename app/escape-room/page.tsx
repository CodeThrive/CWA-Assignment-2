'use client';
import { useState, useEffect, useRef } from 'react';

interface Challenge {
  id: string;
  type: 'format' | 'debug' | 'generate' | 'transform' | 'logic' | 'api';
  title: string;
  description: string;
  code?: string;
  solution?: string;
}

const CHALLENGE_TEMPLATES = {
  format: {
    type: 'format' as const,
    title: 'Format the Code',
    description: 'Format this JavaScript code correctly with proper indentation.',
    code: 'function hello(){console.log("Hello");return true;}',
    solution: 'function hello() {\n  console.log("Hello");\n  return true;\n}'
  },
  debug: {
    type: 'debug' as const,
    title: 'Debug the Code',
    description: 'Fix the bug in this code. The loop should print 0 to 4.',
    code: 'for (let i = 0; i <= 5; i++) {\n  console.log(i);\n}',
    solution: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}'
  },
  generate: {
    type: 'generate' as const,
    title: 'Generate Numbers',
    description: 'Write code to generate all numbers from 0 to 1000.',
    code: '',
    solution: 'for (let i = 0; i <= 1000; i++) {\n  console.log(i);\n}'
  },
  transform: {
    type: 'transform' as const,
    title: 'Transform Data',
    description: 'Convert this CSV to JSON format: name,age\\nJohn,25\\nJane,30',
    code: '',
    solution: '[\n  {"name": "John", "age": 25},\n  {"name": "Jane", "age": 30}\n]'
  },
  logic: {
    type: 'logic' as const,
    title: 'Logic Puzzle',
    description: 'Write a function that returns true if a number is prime.',
    code: 'function isPrime(n) {\n  // Your code here\n}',
    solution: 'function isPrime(n) {\n  if (n <= 1) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}'
  },
  api: {
    type: 'api' as const,
    title: 'API Response',
    description: 'Parse this JSON and extract the user names into an array.',
    code: '',
    solution: 'const data = JSON.parse(json);\nconst names = data.users.map(u => u.name);'
  }
};

const PRESETS = {
  easy: { name: 'Easy Mode', timeLimit: 15, challenges: ['format', 'debug', 'generate'] },
  medium: { name: 'Medium Mode', timeLimit: 10, challenges: ['format', 'debug', 'generate', 'transform'] },
  hard: { name: 'Hard Mode', timeLimit: 8, challenges: ['format', 'debug', 'generate', 'transform', 'logic', 'api'] }
};

const LockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const PuzzleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19.439 15.439c.586.586.586 1.536 0 2.121l-2.122 2.122c-.585.585-1.535.585-2.121 0l-3.536-3.536c-.585-.585-.585-1.535 0-2.121l2.122-2.122c.585-.585 1.535-.585 2.121 0l3.536 3.536z"/>
    <path d="M13.5 9.5l-3-3m0 0l-3 3m3-3v12"/>
  </svg>
);

const DoorIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="16" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const CodeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const GearIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m5.5-14.5l-4 4m-3 3l-4 4m11 0l-4-4m-3-3l-4-4"/>
  </svg>
);

const getIconForType = (type: string) => {
  switch (type) {
    case 'format': return <CodeIcon />;
    case 'debug': return <PuzzleIcon />;
    case 'generate': return <GearIcon />;
    case 'transform': return <KeyIcon />;
    case 'logic': return <LockIcon />;
    case 'api': return <DoorIcon />;
    default: return <LockIcon />;
  }
};

export default function EscapeRoomPage() {
  const [mode, setMode] = useState<'setup' | 'game'>('setup');
  const [timeLimit, setTimeLimit] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [completed, setCompleted] = useState(false);
  const [output, setOutput] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['format', 'debug', 'generate']);
  const [configName, setConfigName] = useState('My Escape Room');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(t => t - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      setFeedback('Time\'s up! You didn\'t escape in time!');
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, timeRemaining]);

  const loadPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setTimeLimit(preset.timeLimit);
    setSelectedTypes(preset.challenges);
  };

  const toggleChallengeType = (type: string) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const buildChallenges = () => {
    const built = selectedTypes.map((type, index) => {
      const template = CHALLENGE_TEMPLATES[type as keyof typeof CHALLENGE_TEMPLATES];
      return {
        ...template,
        id: `${type}-${index}`
      };
    });
    setChallenges(built);
    return built;
  };

  const startGame = () => {
    const built = buildChallenges();
    setTimeRemaining(timeLimit * 60);
    setIsRunning(true);
    setCurrentStage(0);
    setUserCode(built[0].code || '');
    setFeedback('');
    setCompleted(false);
    setOutput('');
    setMode('game');
  };

  const backToSetup = () => {
    setMode('setup');
    setIsRunning(false);
    setCompleted(false);
    setFeedback('');
  };

  const checkAnswer = () => {
    const challenge = challenges[currentStage];
    const userTrimmed = userCode.trim().replace(/\s+/g, ' ');
    const solutionTrimmed = (challenge.solution || '').trim().replace(/\s+/g, ' ');

    if (userTrimmed === solutionTrimmed || userCode.includes(challenge.solution || '')) {
      setFeedback('Correct! Moving to next stage...');
      setTimeout(() => {
        if (currentStage < challenges.length - 1) {
          setCurrentStage(currentStage + 1);
          setUserCode(challenges[currentStage + 1].code || '');
          setFeedback('');
        } else {
          setCompleted(true);
          setIsRunning(false);
          setFeedback('Congratulations! You escaped the room!');
        }
      }, 1500);
    } else {
      setFeedback('Not quite right. Try again!');
    }
  };

const generateHTML = () => {
  const svgIcons: Record<string, string> = {
    format: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    debug: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.439 15.439c.586.586.586 1.536 0 2.121l-2.122 2.122c-.585.585-1.535.585-2.121 0l-3.536-3.536c-.585-.585-.585-1.535 0-2.121l2.122-2.122c.585-.585 1.535-.585 2.121 0l3.536 3.536z"/></svg>',
    generate: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.5-14.5l-4 4m-3 3l-4 4m11 0l-4-4m-3-3l-4-4"/></svg>',
    transform: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    logic: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    api: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="16" cy="12" r="1" fill="currentColor"/></svg>'
  };

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const challengesHTML = challenges.map((ch, i) => {
    const solutionBase64 = btoa(unescape(encodeURIComponent(ch.solution || '')));
    return `
    <div id="stage${i}" data-solution="${solutionBase64}" style="display:${i === 0 ? 'block' : 'none'};padding:30px;background:linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);border:3px solid #ffd700;border-radius:12px;margin:20px 0;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
      <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;">
        <div style="color:#ffd700;">${svgIcons[ch.type] || svgIcons.format}</div>
        <h3 style="color:#ffd700;font-size:24px;margin:0;">${escapeHtml(ch.title)}</h3>
      </div>
      <p style="color:#ffffff;font-size:16px;margin-bottom:20px;">${escapeHtml(ch.description)}</p>
      <textarea id="code${i}" rows="8" style="width:100%;font-family:'Courier New',monospace;padding:12px;font-size:14px;border:2px solid #ffd700;border-radius:8px;background:#1a1a2e;color:#00ff00;resize:vertical;">${escapeHtml(ch.code || '')}</textarea>
      <br/><br/>
      <button onclick="checkStage(${i})" style="padding:12px 30px;background:linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);color:#1a1a2e;border:none;border-radius:8px;cursor:pointer;font-size:18px;font-weight:bold;box-shadow:0 4px 15px rgba(255,215,0,0.4);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Submit Answer</button>
      <p id="feedback${i}" style="margin-top:15px;font-weight:bold;font-size:18px;"></p>
    </div>
  `;
  }).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(configName)}</title>
<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  min-height: 100vh;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  border: 2px solid #ffd700;
}
h1 {
  text-align: center;
  color: #ffd700;
  margin-bottom: 30px;
  font-size: 36px;
  text-shadow: 0 0 20px rgba(255,215,0,0.5);
}
#timer {
  text-align: center;
  font-size: 64px;
  font-weight: bold;
  color: #ffd700;
  margin: 30px 0;
  padding: 30px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 15px;
  border: 3px solid #ffd700;
  box-shadow: 0 0 30px rgba(255,215,0,0.3);
  text-shadow: 0 0 20px rgba(255,215,0,0.8);
}
#message {
  text-align: center;
  font-size: 28px;
  color: #ffd700;
  margin: 30px 0;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255,215,0,0.5);
}
</style>
</head>
<body>
<div class="container">
  <h1>${escapeHtml(configName).toUpperCase()}</h1>
  <div id="timer">Loading...</div>
  <div id="message"></div>
  <div id="stages">
    ${challengesHTML}
  </div>
</div>
<script>
var currentStage = 0;
var totalStages = ${challenges.length};
var startTime = Date.now();
var timeLimit = ${timeLimit} * 60 * 1000;
var timerRunning = true;

function updateTimer() {
  if (!timerRunning) return;
  
  var elapsed = Date.now() - startTime;
  var remaining = Math.max(0, timeLimit - elapsed);
  var minutes = Math.floor(remaining / 60000);
  var seconds = Math.floor((remaining % 60000) / 1000);
  document.getElementById('timer').innerText = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  if (remaining < 60000) {
    document.getElementById('timer').style.color = '#ff4444';
  }
  if (remaining > 0) {
    setTimeout(updateTimer, 1000);
  } else {
    timerRunning = false;
    document.getElementById('message').innerText = 'Time is up! You did not escape!';
    document.getElementById('message').style.color = '#ff4444';
  }
}

function checkStage(stage) {
  var stageDiv = document.getElementById('stage' + stage);
  var solutionBase64 = stageDiv.getAttribute('data-solution');
  var solution = decodeURIComponent(escape(atob(solutionBase64)));
  
  var userCode = document.getElementById('code' + stage).value.trim().replace(/\\s+/g, ' ');
  var solutionTrimmed = solution.trim().replace(/\\s+/g, ' ');
  var feedback = document.getElementById('feedback' + stage);
  
  if (userCode === solutionTrimmed || userCode.indexOf(solutionTrimmed) !== -1) {
    feedback.innerText = 'Correct!';
    feedback.style.color = '#00ff00';
    if (stage < totalStages - 1) {
      setTimeout(function() {
        document.getElementById('stage' + stage).style.display = 'none';
        document.getElementById('stage' + (stage + 1)).style.display = 'block';
        currentStage = stage + 1;
      }, 1500);
    } else {
      setTimeout(function() {
        timerRunning = false;
        document.getElementById('message').innerText = 'Congratulations! You escaped the room in time!';
        document.getElementById('message').style.color = '#ffd700';
        document.getElementById('stages').style.display = 'none';
      }, 1500);
    }
  } else {
    feedback.innerText = 'Not quite right. Try again!';
    feedback.style.color = '#ff4444';
  }
}

updateTimer();
</script>
</body>
</html>`;

  setOutput(html);
};

  const saveToDatabase = async () => {
    if (!output) {
      setSaveMessage('Please generate HTML output first!');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/escape-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configName,
          timeLimit,
          challenges: selectedTypes,
          htmlOutput: output,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSaveMessage(`Saved successfully! ID: ${data.id}`);
      } else {
        setSaveMessage('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('Error saving to database.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = challenges.length > 0 ? ((currentStage + 1) / challenges.length) * 100 : 0;

  if (mode === 'setup') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          border: '2px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '2rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Escape Room Builder
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            Customize your escape room configuration
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          flex: 1
        }}>
          <div style={{
            border: '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: 12,
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>Configuration</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Room Name:
                </label>
                <input
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Time Limit (minutes):
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>Quick Presets:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => loadPreset(key as keyof typeof PRESETS)}
                      style={{
                        padding: '10px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {preset.name} ({preset.timeLimit}min, {preset.challenges.length} challenges)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 'auto',
              padding: '1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Current Configuration:
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Time: {timeLimit} minutes<br/>
                Challenges: {selectedTypes.length}<br/>
                Types: {selectedTypes.join(', ')}
              </div>
            </div>
          </div>

          <div style={{
            border: '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: 12,
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Select Challenges</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Choose which challenge types to include (min. 1)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {Object.entries(CHALLENGE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => toggleChallengeType(key)}
                  style={{
                    padding: '1rem',
                    background: selectedTypes.includes(key)
                      ? 'linear-gradient(135deg, #00c853 0%, #00e676 100%)'
                      : 'rgba(0,0,0,0.1)',
                    color: selectedTypes.includes(key) ? 'white' : 'var(--fg)',
                    border: `2px solid ${selectedTypes.includes(key) ? '#00c853' : 'rgba(102, 126, 234, 0.3)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedTypes.includes(key)) {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedTypes.includes(key)) {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  <div style={{ opacity: selectedTypes.includes(key) ? 1 : 0.5 }}>
                    {getIconForType(key)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {template.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {template.description.substring(0, 50)}...
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>
                    {selectedTypes.includes(key) ? '✓' : '○'}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              disabled={selectedTypes.length === 0}
              style={{
                padding: '1rem 2rem',
                background: selectedTypes.length > 0
                  ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                  : '#ccc',
                color: selectedTypes.length > 0 ? '#1a1a2e' : '#666',
                border: 'none',
                borderRadius: 8,
                cursor: selectedTypes.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                boxShadow: selectedTypes.length > 0 ? '0 4px 15px rgba(255, 215, 0, 0.4)' : 'none',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => selectedTypes.length > 0 && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => selectedTypes.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
            >
              Start Escape Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        border: '2px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, color: 'white', fontSize: '2rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {configName}
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            Code your way out before time runs out!
          </p>
        </div>
        <button
          onClick={backToSetup}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          Back to Setup
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: completed ? '1fr 1fr' : '1fr',
        gap: '1.5rem',
        flex: 1,
        minHeight: 0
      }}>
        <div style={{
          border: '2px solid rgba(102, 126, 234, 0.3)',
          borderRadius: 12,
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            padding: '1.5rem',
            borderRadius: 12,
            border: '2px solid #ffd700',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: timeRemaining < 60 ? '#ff4444' : '#ffd700',
                textShadow: `0 0 20px ${timeRemaining < 60 ? 'rgba(255,68,68,0.8)' : 'rgba(255,215,0,0.8)'}`,
                flex: 1,
                textAlign: 'center'
              }}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {isRunning && (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 10,
              padding: '1rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--fg)' }}>Progress</span>
                <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                  Stage {currentStage + 1} of {challenges.length}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
                }} />
              </div>
            </div>
          )}

          {isRunning && !completed && (
            <div style={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              padding: '2rem',
              borderRadius: 12,
              border: '3px solid #ffd700',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: '#ffd700' }}>
                  {getIconForType(challenges[currentStage].type)}
                </div>
                <h3 style={{ margin: 0, color: '#ffd700', fontSize: '1.8rem', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                  {challenges[currentStage].title}
                </h3>
              </div>
              <p style={{ color: 'white', fontSize: '1.1rem', margin: 0 }}>
                {challenges[currentStage].description}
              </p>
              
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                style={{
                  flex: 1,
                  fontFamily: '"Courier New", monospace',
                  padding: '12px',
                  background: '#1a1a2e',
                  color: '#00ff00',
                  border: '2px solid #ffd700',
                  borderRadius: 8,
                  resize: 'vertical',
                  minHeight: '180px',
                  fontSize: '1rem',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)'
                }}
              />
              
              <button
                onClick={checkAnswer}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#1a1a2e',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Submit Answer
              </button>
              
              {feedback && (
                <div style={{
                  padding: '1rem',
                  background: feedback.includes('Correct') ? 'rgba(0,255,0,0.1)' : 'rgba(255,68,68,0.1)',
                  border: `2px solid ${feedback.includes('Correct') ? '#00ff00' : '#ff4444'}`,
                  borderRadius: 8,
                  textAlign: 'center'
                }}>
                  <p style={{
                    margin: 0,
                    fontWeight: 'bold',
                    fontSize: '1.3rem',
                    color: feedback.includes('Correct') ? '#00ff00' : '#ff4444',
                    textShadow: `0 0 10px ${feedback.includes('Correct') ? 'rgba(0,255,0,0.5)' : 'rgba(255,68,68,0.5)'}`
                  }}>
                    {feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {completed && (
            <div style={{
              background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
              color: 'white',
              padding: '3rem',
              borderRadius: 12,
              textAlign: 'center',
              border: '3px solid #ffd700',
              boxShadow: '0 8px 32px rgba(0,200,83,0.4)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                Congratulations!
              </div>
              <div style={{ fontSize: '1.3rem' }}>
                You escaped in {formatTime(timeLimit * 60 - timeRemaining)}!
              </div>
            </div>
          )}
        </div>

        {completed && (
          <div style={{
            border: '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: 12,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--fg)' }}>HTML Output</h3>
              <p style={{ fontSize: '0.95rem', margin: '0.5rem 0 0 0', opacity: 0.8 }}>
                Generate standalone HTML file with your custom configuration
              </p>
            </div>
            
            <button
              onClick={generateHTML}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Generate Code
            </button>
            
            <textarea
              readOnly
              value={output}
              style={{
                flex: 1,
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                padding: '12px',
                background: 'var(--bg)',
                color: 'var(--fg)',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: 8,
                resize: 'none',
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflow: 'auto',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
              }}
              placeholder="Click 'Generate Code' to create HTML output..."
            />
            
            {output && (
              <>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    alert('Code copied to clipboard!');
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(0,200,83,0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Copy to Clipboard
                </button>

                <button
                  onClick={saveToDatabase}
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    background: saving ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: saving ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => !saving && (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => !saving && (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {saving ? 'Saving...' : 'Save to Database'}
                </button>

                {saveMessage && (
                  <div style={{
                    padding: '10px',
                    background: saveMessage.includes('successfully') ? 'rgba(0,200,83,0.1)' : 'rgba(255,68,68,0.1)',
                    border: `2px solid ${saveMessage.includes('successfully') ? '#00c853' : '#ff4444'}`,
                    borderRadius: 8,
                    color: saveMessage.includes('successfully') ? '#00c853' : '#ff4444',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}>
                    {saveMessage}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}