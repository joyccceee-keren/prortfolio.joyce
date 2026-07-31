// --- 1. NEURAL CORE PARTICLE NETWORK CANVAS ---
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 75;
const connectionDistance = 120;
let mouse = { x: null, y: null, radius: 180 };

// Auto Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Monitor Mouse Movements
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Particle Definition
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2.5 + 1;
        this.color = Math.random() > 0.5 ? '#00f2fe' : '#05f385';
    }

    update() {
        // Base Movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse Gravitational Influence
        if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // Faint pull
                let force = (mouse.radius - distance) / mouse.radius;
                this.x -= (dx / distance) * force * 0.5;
                this.y -= (dy / distance) * force * 0.5;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

// Populate Particle Array
function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}
initParticles();

// Render loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw connecting synapses lines
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                let opacity = (1 - (distance / connectionDistance)) * 0.25;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                
                // Color gradient based on nodes
                let grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                grad.addColorStop(0, particles[i].color);
                grad.addColorStop(1, particles[j].color);
                
                ctx.strokeStyle = grad;
                ctx.globalAlpha = opacity;
                ctx.lineWidth = 0.8;
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        }
    }

    requestAnimationFrame(animateParticles);
}
animateParticles();


// --- 2. GUI & TERMINAL MODE TOGGLING ---
const modeToggle = document.getElementById('mode-toggle');
const guiToggle = document.getElementById('gui-toggle');
const guiView = document.getElementById('gui-view');
const terminalView = document.getElementById('terminal-view');
const termInput = document.getElementById('terminal-input');
const termTrigger = document.querySelector('.terminal-trigger');

function switchView(mode) {
    if (mode === 'terminal') {
        document.body.classList.add('terminal-active');
        guiView.classList.remove('active');
        // Let GUI fade first, then show terminal
        setTimeout(() => {
            terminalView.classList.add('active');
            termInput.focus();
        }, 200);
    } else {
        document.body.classList.remove('terminal-active');
        terminalView.classList.remove('active');
        setTimeout(() => {
            guiView.classList.add('active');
        }, 200);
    }
}

modeToggle.addEventListener('click', () => switchView('terminal'));
guiToggle.addEventListener('click', () => switchView('gui'));
termTrigger.addEventListener('click', () => switchView('terminal'));

// Keep terminal input focused on clicks to the terminal body
const termBody = document.getElementById('terminal-body');
termBody.addEventListener('click', (e) => {
    // Only focus if user is not highlighting text
    if (window.getSelection().toString() === "") {
        termInput.focus();
    }
});


// --- 3. TERMINAL SHELL INTERPRETER ---
const termOutput = document.getElementById('terminal-output');

// Registered commands database
const COMMANDS = {
    help: () => `
Available commands:
  <span class="highlight">about</span>        - Get details about Joyce and her focus areas
  <span class="highlight">projects</span>     - Print core AI & systems engineering projects
  <span class="highlight">skills</span>       - List tech stacks, frameworks, and tools
  <span class="highlight">hackathons</span>   - Show timeline of competitive achievements
  <span class="highlight">contact</span>      - Output email, GitHub, and location links
  <span class="highlight">gui</span>          - Switch back to the graphical layout
  <span class="highlight">clear</span>        - Clear terminal logs
  <span class="highlight">matrix</span>       - Activate Matrix neural code flow rain
    `,
    about: () => `
<span class="highlight">Name:</span> Joyce Keren . K
<span class="highlight">Title:</span> Aspiring AI Engineer | Python & ML Enthusiast
<span class="highlight">Location:</span> Bengaluru, India
<span class="highlight">Focus:</span> Python, Computer Vision, security layers, bio-signal networks, and DSA.
<span class="highlight">Bio:</span> Problem-solver with an analytical focus on algorithms and ML. Successfully participates in coding initiatives and state Hackathons to design solutions.
    `,
    projects: () => `
Core Repositories:
------------------
1. <span class="highlight">Highway-speed-Estimation</span>
   - Description: Computer Vision vehicle detection & speed calculator.
   - Tech: Python, OpenCV, Tracker formulations.

2. <span class="highlight">Virtual_sterring</span>
   - Description: Touchless steering simulation mapped from hand gestures.
   - Tech: Python, OpenCV, MediaPipe hands.

3. <span class="highlight">MYS-ECG</span>
   - Description: Signal analysis model diagnosing cardiac arrhythmia signals.
   - Tech: Python, Numpy, Pandas, Signal Classifiers.

4. <span class="highlight">digital-signature & otp-login-system</span>
   - Description: RSA signature validator coupled with secure OTP entry points.
   - Tech: Python, Cryptography algorithms.
    `,
    skills: () => `
Capabilities Matrix:
--------------------
[AI & ML]          ██████████████░░░░  80%
[Python Scripting] ████████████████░░  85%
[C & DSA]          ██████████████░░░░  80%
[Frontend Dev]     ██████████░░░░░░░░  65%
[Security Layers]  ████████████░░░░░░  70%
    `,
    hackathons: () => `
Competitions timeline:
----------------------
* <span class="highlight">GeeksforGeeks Sprints:</span> cleared competitive coding architecture round (First Round Winner).
* <span class="highlight">State-Level Sprints:</span> Designed real-world prototypes inside tight 24-48h constraints at multiple college competitions.
    `,
    contact: () => `
Channels of connection:
-----------------------
- <span class="highlight">Email:</span> <a href="mailto:kerenjoyce01@gmail.com" style="color:var(--accent-green)">kerenjoyce01@gmail.com</a>
- <span class="highlight">GitHub:</span> <a href="https://github.com/joyccceee-keren" target="_blank" style="color:var(--accent-green)">github.com/joyccceee-keren</a>
- <span class="highlight">Location:</span> Bengaluru, India
    `
};

termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const fullInput = termInput.value.trim();
        const cmd = fullInput.toLowerCase();
        termInput.value = '';

        // Print input prompt in logs
        const promptLine = document.createElement('div');
        promptLine.innerHTML = `<span class="prompt-user">joyce@ai-core:~$</span> ${fullInput}`;
        termOutput.appendChild(promptLine);

        if (cmd === '') return;

        // Process Command
        const responseLine = document.createElement('div');
        
        if (cmd === 'clear') {
            termOutput.innerHTML = '';
        } else if (cmd === 'gui' || cmd === 'exit') {
            switchView('gui');
        } else if (cmd === 'matrix' || cmd === 'sudo matrix') {
            activateMatrixRain();
        } else if (COMMANDS[cmd]) {
            responseLine.innerHTML = COMMANDS[cmd]();
            termOutput.appendChild(responseLine);
        } else {
            responseLine.innerHTML = `Command not found: <span style="color:#ff5f56">${cmd}</span>. Type <span class="highlight">help</span> for guidelines.`;
            termOutput.appendChild(responseLine);
        }

        // Scroll to Bottom
        termBody.scrollTop = termBody.scrollHeight;
    }
});


// --- 4. MATRIX CODE RAIN EASTER EGG ---
function activateMatrixRain() {
    const matrixCanvas = document.createElement('canvas');
    matrixCanvas.className = 'matrix-canvas';
    document.getElementById('terminal-view').appendChild(matrixCanvas);
    
    const mctx = matrixCanvas.getContext('2d');
    
    function resizeMatrix() {
        matrixCanvas.width = matrixCanvas.parentElement.clientWidth;
        matrixCanvas.height = matrixCanvas.parentElement.clientHeight;
    }
    resizeMatrix();

    const alphabet = "01ABCDEFGHIJKLMNOPQRSTUVWXYZｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
    const fontSize = 16;
    const columns = matrixCanvas.width / fontSize;
    const rainDrops = Array.from({ length: columns }).fill(1);

    function draw() {
        mctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        mctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        
        mctx.fillStyle = '#0F0';
        mctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            mctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            
            if (rainDrops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    }

    const interval = setInterval(draw, 30);

    // Cancel Matrix Rain on click or key press
    function stopMatrix() {
        clearInterval(interval);
        matrixCanvas.remove();
        document.removeEventListener('keydown', stopMatrix);
        matrixCanvas.removeEventListener('click', stopMatrix);
        termInput.focus();
        
        // Print message to terminal returning
        const returnLine = document.createElement('div');
        returnLine.innerHTML = `<span class="system-msg">Matrix code flow decoupled. Returned to shell.</span><br>`;
        termOutput.appendChild(returnLine);
        termBody.scrollTop = termBody.scrollHeight;
    }

    // Delay listeners to avoid catching the Enter key immediately
    setTimeout(() => {
        document.addEventListener('keydown', stopMatrix);
        matrixCanvas.addEventListener('click', stopMatrix);
    }, 100);
}

// --- 5. SCROLL-DRIVEN HORIZONTAL SKILLS TRACKING ---
const scrollWrapper = document.getElementById('skills-scroll-wrapper');
const horizontalTrack = document.querySelector('.skills-horizontal-track');
const slides = document.querySelectorAll('.skills-slide');

function handleHorizontalScroll() {
    // Bypass if terminal mode is active
    if (document.body.classList.contains('terminal-active')) return;
    
    // Check screen size - only run on desktop/tablet layout (max-width: 1024px fallback matches CSS)
    if (window.innerWidth <= 1024) {
        // Activate skill fills in stack layout
        slides.forEach(s => s.classList.add('slide-active'));
        if (horizontalTrack) horizontalTrack.style.transform = '';
        return;
    }

    if (!scrollWrapper || !horizontalTrack) return;

    const rect = scrollWrapper.getBoundingClientRect();
    const stickyTop = 75; // Matches header top margin
    const totalHeight = scrollWrapper.clientHeight - window.innerHeight + stickyTop;
    const scrolled = -rect.top + stickyTop;
    
    // Calculate progress ratio (0 to 1)
    const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
    
    // Translate the track horizontally (moves up to -75vw because track has 4 slides totaling 400vw)
    const translateX = -progress * 75;
    horizontalTrack.style.transform = `translateX(${translateX}vw)`;
    
    // Determine active slide index and trigger skill animations
    const activeIndex = Math.min(3, Math.floor(progress * 4));
    slides.forEach((slide, idx) => {
        if (idx === activeIndex) {
            slide.classList.add('slide-active');
        } else {
            // Only deactivate non-intro slides
            if (idx !== 0) slide.classList.remove('slide-active');
        }
    });
}

// Attach listeners
window.addEventListener('scroll', handleHorizontalScroll);
window.addEventListener('resize', handleHorizontalScroll);
document.addEventListener('DOMContentLoaded', handleHorizontalScroll);
// Also initialize a slight timeout to catch dynamic page renders
setTimeout(handleHorizontalScroll, 300);

