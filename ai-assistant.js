// AI Assistant Logic for Election Website

document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('ai-chat-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const listeningIndicator = document.getElementById('listening-indicator');
    const micBtn = document.getElementById('mic-btn');
    const voiceToggle = document.getElementById('voice-toggle');

    let isVoiceEnabled = true;
    let recognition;

    // Speech Recognition Setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
            listeningIndicator.style.display = 'block';
            micBtn.classList.add('listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            processUserMessage(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopListening();
        };

        recognition.onend = () => {
            stopListening();
        };
    }

    function stopListening() {
        listeningIndicator.style.display = 'none';
        micBtn.classList.remove('listening');
        if (recognition) recognition.stop();
    }

    micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('listening')) {
            stopListening();
        } else {
            if (recognition) {
                recognition.start();
            } else {
                alert('Speech recognition is not supported in this browser.');
            }
        }
    });

    voiceToggle.addEventListener('click', () => {
        isVoiceEnabled = !isVoiceEnabled;
        voiceToggle.classList.toggle('off', !isVoiceEnabled);
        voiceToggle.textContent = isVoiceEnabled ? '🔊' : '🔇';
    });

    function speakResponse(text) {
        if (!isVoiceEnabled) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
    }

    // Toggle Chat Window
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
        }
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        window.speechSynthesis.cancel();
    });

    // Handle Chat Submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            processUserMessage(message);
        }
    });

    // Global function for Quick Actions and External Calls
    window.askAI = (message) => {
        if (!chatWindow.classList.contains('active')) {
            chatWindow.classList.add('active');
        }
        processUserMessage(message);
    };

    function processUserMessage(message) {
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Show thinking animation
        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate AI thinking and response
        setTimeout(() => {
            typingIndicator.style.display = 'none';
            const response = getAIResponse(message);
            addMessage(response, 'ai');
            speakResponse(response.replace(/[✅🗳️👤📋]/g, ''));
        }, 1000); 
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        // Format structured response
        if (sender === 'ai' && text.includes('1.')) {
            const lines = text.split('\n');
            msgDiv.innerHTML = lines.map(line => line.trim() ? `<p>${line}</p>` : '<br>').join('');
        } else {
            msgDiv.textContent = text;
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Personalized Flow Logic
    window.setVoterType = (type) => {
        let message = "";
        if (type === 'first-time') {
            message = "I'm a first-time voter. Can you guide me through the registration process?";
        } else if (type === 'registered') {
            message = "I'm already registered. How can I check my polling booth and status?";
        }
        
        if (message) {
            window.askAI(message);
            if (window.innerWidth < 768) {
                document.getElementById('ai-chat-widget').scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    function getAIResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('register') || lowerQuery.includes('registration') || lowerQuery.includes('voter id')) {
            return "To register to vote in India, follow these steps:\n1. Visit voters.eci.gov.in (NVSP portal).\n2. Create an account or login.\n3. Fill Form 6 for fresh registration.\n4. Upload age proof and address proof.\n5. Submit and track your application.";
        }
        if (lowerQuery.includes('how to vote') || lowerQuery.includes('process')) {
            return "The voting process at the booth:\n1. First Polling Officer checks your ID and name.\n2. Second Polling Officer inks your finger and takes signature.\n3. Third Polling Officer enables the EVM machine.\n4. You press the button of your candidate in the compartment.";
        }
        if (lowerQuery.includes('eligibility') || lowerQuery.includes('can i vote')) {
            return "Eligibility Criteria:\n1. Must be an Indian Citizen.\n2. Must be 18 years or older on qualifying date.\n3. Must be an ordinary resident of the polling area.\n4. Must not be disqualified by any law.";
        }
        if (lowerQuery.includes('id') || lowerQuery.includes('document') || lowerQuery.includes('epic')) {
            return "Approved ID Documents:\n1. EPIC (Voter ID Card)\n2. Aadhaar Card\n3. PAN Card\n4. Driving License\n5. Passport";
        }
        
        if (lowerQuery.includes('date') || lowerQuery.includes('when')) {
            return "The next General Elections in India are expected in 2026. Keep checking eci.gov.in for specific state dates.";
        }
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            return "Namaste! I'm your AI Election Assistant. I can help with registration, voting process, and eligibility. How can I assist you today?";
        }
        
        return "I'm sorry, I couldn't find specific info on that. For official queries, please visit the Election Commission of India website at eci.gov.in. Jai Hind!";
    }

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});
