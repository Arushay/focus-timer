
        // ============================================
        // FOCUS TIMER - PROFESSIONAL EDITION
        // Clean variable names, organized code, fully functional
        // ============================================

        // ---------- STATE VARIABLES ----------
        let remainingSeconds = 25 * 60;    // Current time left in seconds
        let countdownId = null;             // Stores setInterval ID
        let isTimerActive = false;          // Whether timer is running
        
        // Statistics
        let completedSessions = 0;
        let totalFocusMinutes = 0;
        let sessionHistory = [];             // Array of {date, minutes, timestamp}
        
        // ---------- DOM ELEMENTS ----------
        const timerDisplay = document.getElementById('timerDisplay');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const add1MinBtn = document.getElementById('add1MinBtn');
        const add5MinBtn = document.getElementById('add5MinBtn');
        const sessionCountSpan = document.getElementById('sessionCount');
        const totalMinutesSpan = document.getElementById('totalMinutes');
        const historyListDiv = document.getElementById('historyList');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // ========== HELPER FUNCTIONS ==========
        
        // Format seconds to MM:SS
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Update the big timer display
        function updateDisplay() {
            timerDisplay.textContent = formatTime(remainingSeconds);
        }
        
        // Update stats UI
        function updateStatsUI() {
            sessionCountSpan.textContent = completedSessions;
            totalMinutesSpan.textContent = totalFocusMinutes;
        }
        
        // Display session history
        function updateHistoryUI() {
            if (sessionHistory.length === 0) {
                historyListDiv.innerHTML = '<div class="empty-history">✨ No sessions yet. Complete a focus block!</div>';
                return;
            }
            
            let html = '';
            // Show most recent first
            [...sessionHistory].reverse().forEach(item => {
                html += `
                    <div class="history-item">
                        <span class="history-date">🍅 ${item.date}</span>
                        <span class="history-minutes">${item.minutes} min</span>
                    </div>
                `;
            });
            historyListDiv.innerHTML = html;
        }
        
        // ========== CORE TIMER FUNCTIONS ==========
        
        // Start the countdown
        function startTimer() {
            // Don't start if already running
            if (isTimerActive) return;
            
            // If timer is at zero, reset to 25 minutes first
            if (remainingSeconds <= 0) {
                resetTimer();
            }
            
            // Safety check
            if (remainingSeconds <= 0) return;
            
            isTimerActive = true;
            countdownId = setInterval(() => {
                if (remainingSeconds > 0) {
                    remainingSeconds--;
                    updateDisplay();
                    saveToLocalStorage();
                    
                    // Timer reached zero!
                    if (remainingSeconds === 0) {
                        completeTimer();
                    }
                }
            }, 1000);
            
            saveToLocalStorage();
        }
        
        // Pause the countdown
        function pauseTimer() {
            if (countdownId) {
                clearInterval(countdownId);
                countdownId = null;
            }
            isTimerActive = false;
            saveToLocalStorage();
        }
        
        // Reset timer to 25:00
        function resetTimer() {
            if (countdownId) {
                clearInterval(countdownId);
                countdownId = null;
            }
            isTimerActive = false;
            remainingSeconds = 25 * 60;
            updateDisplay();
            saveToLocalStorage();
        }
        
        // Add minutes to current timer
        function addMinutes(minutes) {
            if (minutes <= 0) return;
            remainingSeconds += minutes * 60;
            // Optional: Cap at 99 hours (reasonable limit)
            if (remainingSeconds > 99 * 3600) remainingSeconds = 99 * 3600;
            updateDisplay();
            saveToLocalStorage();
        }
        
        // Handle timer completion (reached 00:00)
        function completeTimer() {
            // Stop the timer
            if (countdownId) {
                clearInterval(countdownId);
                countdownId = null;
            }
            isTimerActive = false;
            
            // Alert user
            alert("🎉 Time's up! Great focus session! 🎉");
            
            // Update statistics (25 minutes per session)
            completedSessions++;
            totalFocusMinutes += 25;
            
            // Add to history
            const now = new Date();
            const dateStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
            sessionHistory.push({
                date: dateStr,
                minutes: 25,
                timestamp: now.getTime()
            });
            
            // Keep history manageable (max 50 entries)
            if (sessionHistory.length > 50) sessionHistory.shift();
            
            // Reset timer for next session
            remainingSeconds = 25 * 60;
            updateDisplay();
            updateStatsUI();
            updateHistoryUI();
            saveToLocalStorage();
        }
        
        // ========== STORAGE FUNCTIONS ==========
        
        // Save all app state to localStorage
        function saveToLocalStorage() {
            const appState = {
                completedSessions: completedSessions,
                totalFocusMinutes: totalFocusMinutes,
                sessionHistory: sessionHistory,
                remainingSeconds: remainingSeconds,
                isTimerActive: isTimerActive     // Saved but not auto-restored
            };
            localStorage.setItem('focusTimerApp', JSON.stringify(appState));
        }
        
        // Load all app state from localStorage
        function loadFromLocalStorage() {
            const savedData = localStorage.getItem('focusTimerApp');
            if (!savedData) return;
            
            try {
                const state = JSON.parse(savedData);
                completedSessions = state.completedSessions || 0;
                totalFocusMinutes = state.totalFocusMinutes || 0;
                sessionHistory = state.sessionHistory || [];
                remainingSeconds = state.remainingSeconds || (25 * 60);
                // Don't auto-start timer even if it was running
                isTimerActive = false;
                countdownId = null;
                
                // Validate remainingSeconds (can't be negative or zero)
                if (remainingSeconds <= 0) remainingSeconds = 25 * 60;
                
                updateDisplay();
                updateStatsUI();
                updateHistoryUI();
            } catch (e) {
                console.warn("Failed to load saved data");
            }
        }
        
        // Clear all history and reset stats
        function clearAllHistory() {
            const confirmClear = confirm("⚠️ Are you sure? This will delete ALL session history and statistics.");
            if (!confirmClear) return;
            
            completedSessions = 0;
            totalFocusMinutes = 0;
            sessionHistory = [];
            
            updateStatsUI();
            updateHistoryUI();
            saveToLocalStorage();
            
            // Brief feedback
            historyListDiv.innerHTML = '<div class="empty-history">✅ History cleared! Start fresh!</div>';
            setTimeout(() => updateHistoryUI(), 1500);
        }
        
        // ========== INITIALIZATION ==========
        
        // Set up event listeners
        function setupEventListeners() {
            startBtn.addEventListener('click', startTimer);
            pauseBtn.addEventListener('click', pauseTimer);
            resetBtn.addEventListener('click', resetTimer);
            add1MinBtn.addEventListener('click', () => addMinutes(1));
            add5MinBtn.addEventListener('click', () => addMinutes(5));
            clearHistoryBtn.addEventListener('click', clearAllHistory);
        }
        
        // Initialize the app
        function init() {
            setupEventListeners();
            loadFromLocalStorage();
            // Ensure display is correct
            updateDisplay();
        }
        
        // Start the app!
        init();
  