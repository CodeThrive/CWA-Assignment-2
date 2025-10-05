'use client';
import { useState, useEffect, useRef } from 'react';

interface Challenge {
  id: number;
  type: 'format' | 'debug' | 'generate' | 'transform';
  title: string;
  description: string;
  code?: string;
  solution?: string;
  icon: string; // you can swap emojis for inline SVG later
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    type: 'format',
    title: 'Format the Code',
    description: 'Format this JavaScript code correctly with proper indentation.',
    code: 'function hello(){console.log("Hello");return true;}',
    solution: 'function hello() {\n  console.log("Hello");\n  return true;\n}',
    icon: '📝',
  },
  {
    id: 2,
    type: 'debug',
    title: 'Debug the Code',
    description: 'Fix the bug in this code. The loop should print 0 to 4.',
    code: 'for (let i = 0; i <= 5; i++) {\n  console.log(i);\n}',
    solution: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
    icon: '🐛',
  },
  {
    id: 3,
    type: 'generate',
    title: 'Generate Numbers',
    description: 'Write code to generate all numbers from 0 to 1000.',
    solution: 'for (let i = 0; i <= 1000; i++) {\n  console.log(i);\n}',
    icon: '🔢',
  },
  {
    id: 4,
    type: 'transform',
    title: 'Transform Data',
    description: 'Convert this CSV to JSON format: name,age\\nJohn,25\\nJane,30',
    solution:
      '[\n  {"name": "John", "age": 25},\n  {"name": "Jane", "age": 30}\n]',
    icon: '🔄',
  },
];

export default function EscapeRoomPage() {
  const [timeLimit, setTimeLimit] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [completed, setCompleted] = useState(false);
  const [output, setOutput] = useState('');

  // ✅ Use the browser-safe timer type instead of NodeJS.Timeout
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // start ticking when running and there’s time left
    if (isRunning && timeRemaining > 0) {
      const id = setTimeout(() => {
        setTimeRemaining((t) => t - 1);
      }, 1000);
      timerRef.current = id;
    } else if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      setFeedback("⏰ Time's up! You didn't escape in time!");
    }

    // ✅ Always return a cleanup function that returns void
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);

  const startGame = () => {
    setTimeRemaining(timeLimit * 60);
    setIsRunning(true);
    setCurrentStage(0);
    setUserCode(CHALLENGES[0].code || '');
    setFeedback('');
    setCompleted(false);
    setOutput('');
  };

  const checkAnswer = () => {
    const challenge = CHALLENGES[currentStage];
    const userTrimmed = (userCode ?? '').trim().replace(/\s+/g, ' ');
    const solutionTrimmed = (challenge.solution ?? '').trim().replace(/\s+/g, ' ');

    if (
      (challenge.solution && userTrimmed === solutionTrimmed) ||
      (challenge.solution && userCode.includes(challenge.solution))
    ) {
      setFeedback('✅ Correct! Moving to next stage...');
      setTimeout(() => {
        if (currentStage < CHALLENGES.length - 1) {
          const next = currentStage + 1;
          setCurrentStage(next);
          setUserCode(CHALLENGES[next].code || '');
          setFeedback('');
        } else {
          setCompleted(true);
          setIsRunning(false);
          setFeedback('🎉 Congratulations! You escaped the room!');
        }
      }, 1200);
    } else {
      setFeedback('❌ Not quite right. Try again!');
    }
  };

  const generateHTML = () => {
    const esc = (s: string) =>
      (s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const challengesHTML = CHALLENGES.map((ch, i) => {
      const starter = ch.code ? esc(ch.code) : '';
      return `
      <div id="stage${i}" style="display:${i === 0 ? 'block' : 'none'};padding:30px;background:linear-gradient(135deg,#1e3c72 0%,#2a5298 100%);border:3px solid #ffd700;border-radius:12px;margin:20px 0;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
        <h3 style="color:#ffd700;font-size:24px;margin-bottom:15px;">${esc(ch.icon)} ${esc(ch.title)}</h3>
        <p style="color:#ffffff;font-size:16px;margin-bottom:20px;">${esc(ch.description)}</p>
        <textarea id="code${i}" rows="8" style="width:100%;font-family:'Courier New',monospace;padding:12px;font-size:14px;border:2px solid #ffd700;border-radius:8px;background:#1a1a2e;color:#00ff00;resize:vertical;">${starter}</textarea>
        <br/><br/>
        <button onclick="checkStage(${i})" style="padding:12px 30px;background:linear-gradient(135deg,#ffd700 0%,#ffed4e 100%);color:#1a1a2e;border:none;border-radius:8px;cursor:pointer;font-size:18px;font-weight:bold;box-shadow:0 4px 15px rgba(255,215,0,0.4);transition:transform .2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Submit Answer</button>
        <p id="feedback${i}" style="margin-top:15px;font-weight:bold;font-size:18px;"></p>
      </div>`;
    }).join('');

    const solutions = CHALLENGES.map((ch) => `'${esc(ch.solution || '')}'`).join(',');

    const script = `
<script>
var currentStage = 0;
var solutions = [${solutions}];
var startTime = Date.now();
var timeLimit = ${timeLimit} * 60 * 1000;

function updateTimer() {
  var elapsed = Date.now() - startTime;
  var remaining = Math.max(0, timeLimit - elapsed);
  var minutes = Math.floor(remaining / 60000);
  var seconds = Math.floor((remaining % 60000) / 1000);
  document.getElementById('timer').innerText = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  if (remaining > 0) {
    setTimeout(updateTimer, 1000);
  } else {
    document.getElementById('message').innerText = '⏰ Time is up! You did not escape!';
    document.getElementById('message').style.color = '#ff4444';
    var stages = document.getElementById('stages');
    if (stages) stages.style.opacity = '0.5';
  }
}

function checkStage(stage) {
  var userCodeEl = document.getElementById('code' + stage);
  var feedback = document.getElementById('feedback' + stage);
  if (!userCodeEl || !feedback) return;

  var userCode = String(userCodeEl.value || '').trim().replace(/\\s+/g, ' ');
  var solution = String(solutions[stage] || '').trim().replace(/\\s+/g, ' ');

  if (!solution) {
    feedback.innerText = '(No solution set — auto pass)';
    feedback.style.color = '#00ff00';
    advance(stage);
    return;
  }

  if (userCode === solution || userCode.indexOf(solution) !== -1) {
    feedback.innerText = '✅ Correct!';
    feedback.style.color = '#00ff00';
    setTimeout(function(){ advance(stage); }, 900);
  } else {
    feedback.innerText = '❌ Not quite right. Try again!';
    feedback.style.color = '#ff4444';
  }
}

function advance(stage) {
  var cur = document.getElementById('stage' + stage);
  var next = document.getElementById('stage' + (stage + 1));
  if (cur) cur.style.display = 'none';
  if (next) next.style.display = 'block';
  else {
    document.getElementById('message').innerText = '🎉 Congratulations! You escaped the room in time!';
    document.getElementById('message').style.color = '#ffd700';
    var stages = document.getElementById('stages');
    if (stages) stages.style.display = 'none';
  }
}

updateTimer();
</script>`;

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Escape Room Challenge</title>
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
  <h1>🔐 ESCAPE ROOM CHALLENGE 🔐</h1>
  <div id="timer">Loading...</div>
  <div id="message"></div>
  <div id="stages">
    ${challengesHTML}
  </div>
</div>
${script}
</body>
</html>`;

    setOutput(html);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentStage + 1) / CHALLENGES.length) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          border: '2px solid rgba(255,255,255,0.1)',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: 'white',
            fontSize: '2rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          🔐 Escape Room Challenge
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          Code your way out before time runs out!
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: completed ? '1fr 1fr' : '1fr',
          gap: '1.5rem',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Game Area */}
        <div
          style={{
            border: '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: 12,
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          {/* Timer and Controls */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              padding: '1.5rem',
              borderRadius: 12,
              border: '2px solid #ffd700',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                ⏱️ Time Limit (minutes):
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  disabled={isRunning}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '8px 12px',
                    background: '#1a1a2e',
                    color: '#ffd700',
                    border: '2px solid #ffd700',
                    borderRadius: 6,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    width: '80px',
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: timeRemaining < 60 ? '#ff4444' : '#ffd700',
                  textShadow: `0 0 20px ${
                    timeRemaining < 60 ? 'rgba(255,68,68,0.8)' : 'rgba(255,215,0,0.8)'
                  }`,
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                {formatTime(timeRemaining)}
              </div>

              <button
                onClick={startGame}
                disabled={isRunning}
                style={{
                  padding: '12px 24px',
                  background: isRunning ? '#555' : 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: isRunning ? '#999' : '#1a1a2e',
                  border: 'none',
                  borderRadius: 8,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: isRunning ? 'none' : '0 4px 15px rgba(255, 215, 0, 0.4)',
                  transition: 'transform 0.2s',
                  transform: isRunning ? 'none' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isRunning) e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isRunning) e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isRunning ? '🎮 Game Running...' : '🚀 Start Game'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 10,
                padding: '1rem',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--fg)' }}>Progress</span>
                <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                  Stage {currentStage + 1} of {CHALLENGES.length}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    transition: 'width 0.3s ease',
                    boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Challenge Area */}
          {isRunning && !completed && (
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '2rem',
                borderRadius: 12,
                border: '3px solid #ffd700',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{CHALLENGES[currentStage].icon}</span>
                <h3
                  style={{
                    margin: 0,
                    color: '#ffd700',
                    fontSize: '1.8rem',
                    textShadow: '0 0 10px rgba(255,215,0,0.5)',
                  }}
                >
                  {CHALLENGES[currentStage].title}
                </h3>
              </div>
              <p style={{ color: 'white', fontSize: '1.1rem', margin: 0 }}>{CHALLENGES[currentStage].description}</p>

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
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
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
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                ✓ Submit Answer
              </button>

              {feedback && (
                <div
                  style={{
                    padding: '1rem',
                    background: feedback.includes('✅') ? 'rgba(0,255,0,0.1)' : 'rgba(255,68,68,0.1)',
                    border: `2px solid ${feedback.includes('✅') ? '#00ff00' : '#ff4444'}`,
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 'bold',
                      fontSize: '1.3rem',
                      color: feedback.includes('✅') ? '#00ff00' : '#ff4444',
                      textShadow: `0 0 10px ${
                        feedback.includes('✅') ? 'rgba(0,255,0,0.5)' : 'rgba(255,68,68,0.5)'
                      }`,
                    }}
                  >
                    {feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {completed && (
            <div
              style={{
                background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
                color: 'white',
                padding: '3rem',
                borderRadius: 12,
                textAlign: 'center',
                border: '3px solid #ffd700',
                boxShadow: '0 8px 32px rgba(0,200,83,0.4)',
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                Congratulations!
              </div>
              <div style={{ fontSize: '1.3rem' }}>
                You escaped in {formatTime(timeLimit * 60 - timeRemaining)}!
              </div>
            </div>
          )}

          {!isRunning && !completed && (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                border: '2px dashed rgba(102, 126, 234, 0.3)',
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
              <p style={{ fontSize: '1.2rem', color: 'var(--fg)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Ready to Escape?
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--fg)', opacity: 0.8 }}>
                Set your time limit and click "Start Game" to begin!
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--fg)', opacity: 0.6, marginTop: '1rem' }}>
                Complete {CHALLENGES.length} coding challenges before time runs out.
              </p>
            </div>
          )}
        </div>

        {/* Output Generator - Only shown when completed */}
        {completed && (
          <div
            style={{
              border: '2px solid rgba(102, 126, 234, 0.3)',
              borderRadius: 12,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--fg)' }}>📄 HTML Output</h3>
              <p style={{ fontSize: '0.95rem', margin: '0.5rem 0 0 0', opacity: 0.8 }}>
                Generate standalone HTML file with all challenges
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
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ⚡ Generate Code
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
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
              }}
              rows={16}
              placeholder="Click 'Generate Code' to create HTML output..."
            />

            {output && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  alert('✅ Code copied to clipboard!');
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
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                📋 Copy to Clipboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
