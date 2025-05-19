class PomodoroTimer {
    constructor() {
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.startPauseButton = document.getElementById('startPause');
        this.resetButton = document.getElementById('reset');
        this.pomodoroButton = document.getElementById('pomodoro');
        this.breakButton = document.getElementById('break');
        this.statusText = document.getElementById('status-text');
        this.pomodoroTimeInput = document.getElementById('pomodoro-time');
        this.breakTimeInput = document.getElementById('break-time');
        this.progressRing = document.querySelector('.progress-ring-circle');
        
        // Initialize audio
        this.alarmSound = new Audio('sound/Soul Train A Comin.mp3');

        // Calculate the circumference of the circle
        const radius = this.progressRing.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;
        this.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressRing.style.strokeDashoffset = this.circumference;

        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = this.timeLeft;
        this.timerId = null;
        this.isRunning = false;

        this.initializeEventListeners();
        this.initializeTimer();
    }

    initializeEventListeners() {
        this.startPauseButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.reset());
        this.pomodoroButton.addEventListener('click', () => this.setMode('pomodoro'));
        this.breakButton.addEventListener('click', () => this.setMode('break'));
        
        // Add event listeners for time inputs
        this.pomodoroTimeInput.addEventListener('change', () => {
            if (this.pomodoroButton.classList.contains('active')) {
                this.setMode('pomodoro');
            }
        });
        
        this.breakTimeInput.addEventListener('change', () => {
            if (this.breakButton.classList.contains('active')) {
                this.setMode('break');
            }
        });
    }

    initializeTimer() {
        this.updateActiveButton('pomodoro');
        this.updateDisplay();
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        this.startPauseButton.textContent = 'Pause';
        const activeButton = document.querySelector('.mode button.active');
        if (activeButton.id === 'pomodoro') {
            this.statusText.textContent = "CONGRATULATIONS! You are focusing!";
        } else {
            this.statusText.textContent = "After you've rested, get back to work.";
        }
        this.timerId = setInterval(() => this.updateTimer(), 1000);
    }

    pause() {
        this.isRunning = false;
        this.startPauseButton.textContent = 'Start';
        clearInterval(this.timerId);
    }

    reset() {
        this.pause();
        this.alarmSound.pause();
        this.alarmSound.currentTime = 0;
        this.setMode('pomodoro');
    }

    setProgress(percent) {
        const offset = this.circumference - (percent / 100 * this.circumference);
        this.progressRing.style.strokeDashoffset = offset;
    }

    setMode(mode) {
        this.pause();
        this.updateActiveButton(mode);
        
        switch(mode) {
            case 'pomodoro':
                this.timeLeft = parseInt(this.pomodoroTimeInput.value) * 60;
                break;
            case 'break':
                this.timeLeft = parseInt(this.breakTimeInput.value) * 60;
                break;
        }
        
        this.totalTime = this.timeLeft;
        this.setProgress(0);
        this.updateDisplay();
    }

    updateActiveButton(mode) {
        [this.pomodoroButton, this.breakButton].forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(mode).classList.add('active');
    }

    updateTimer() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            // Update progress ring
            const percent = (this.timeLeft / this.totalTime) * 100;
            this.setProgress(percent);
        } else {
            this.playAlarm();
            this.pause();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.minutesElement.textContent = minutes.toString().padStart(2, '0');
        this.secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // Update the document title with the timer
        document.title = `${timeString} - Pomodoro Timer`;
    }

    playAlarm() {
        // Play the MP3 sound
        this.alarmSound.currentTime = 0; // Reset to start of sound
        this.alarmSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });

        const activeButton = document.querySelector('.mode button.active');
        const isBreak = activeButton.id === 'break';

        try {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;

            if (isBreak) {
                // Snow animation for break ending
                const defaults = {
                    startVelocity: 30,
                    spread: 360,
                    ticks: 100,
                    zIndex: 999,
                    colors: ['#ffffff', '#e0e0e0', '#f0f0f0'], // White and light gray colors for snow
                    shapes: ['circle'], // Only circular particles for snow
                    gravity: 0.5, // Slower falling speed
                    scalar: 1.2 // Slightly larger particles
                };

                function randomInRange(min, max) {
                    return Math.random() * (max - min) + min;
                }

                // Initial burst of snow
                confetti({
                    ...defaults,
                    particleCount: 100,
                    origin: { x: 0.5, y: 0.1 }
                });

                const interval = setInterval(function() {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    
                    // Snow from top
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: randomInRange(0.1, 0.9), y: 0.1 }
                    });
                }, 250);
            } else {
                // Original confetti animation for pomodoro ending
                const defaults = {
                    startVelocity: 50,
                    spread: 360,
                    ticks: 100,
                    zIndex: 999,
                    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
                };

                // Initial burst of confetti
                confetti({
                    ...defaults,
                    particleCount: 100,
                    origin: { x: 0.5, y: 0.5 }
                });

                const interval = setInterval(function() {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 100 * (timeLeft / duration);
                    
                    // Confetti from left
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: 0.1, y: 0.5 }
                    });
                    
                    // Confetti from right
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: 0.9, y: 0.5 }
                    });
                    
                    // Confetti from center
                    confetti({
                        ...defaults,
                        particleCount: particleCount / 2,
                        origin: { x: 0.5, y: 0.5 }
                    });
                }, 250);
            }
        } catch (error) {
            console.error('Animation failed:', error);
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
}); 