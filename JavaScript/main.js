// Chat Functionality
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-message');

// Function to simulate sending a message (use your own sendMessage implementation)
const sendMessage = (message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
};

// Send message function
const sendMessageHandler = () => {
    const message = messageInput.value.trim();
    if (message) {
        sendMessage(message);
        messageInput.value = ''; // Clear input after sending
    }
};

// Event listeners for sending messages
sendButton.addEventListener('click', sendMessageHandler);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessageHandler();
});

// Example loadMessages function (use your own loadMessages implementation)
const loadMessages = (chatMessages) => {
    // Example: Preload some messages
    chatMessages.innerHTML = '<div class="message">Welcome to the chat!</div>';
};

// Load existing messages
loadMessages(chatMessages);

// Form Submission (using async and fetch API for form submission)
const tutorRequestForm = document.getElementById('tutor-request-form');

// Submit form handler
const submitFormHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData(tutorRequestForm);
    const data = Object.fromEntries(formData.entries());
    
    try {
        // Example submission logic
        const response = await fetch('/submit-form', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json(); // Assuming response is JSON
        alert(result.success ? 'Request submitted successfully!' : 'Failed to submit request.');
        
        if (result.success) tutorRequestForm.reset();
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your request.');
    }
};

tutorRequestForm.addEventListener('submit', submitFormHandler);

// Scroll-to-top Button
const scrollToTopButton = document.querySelector('.scroll-to-top');

// Toggle scroll-to-top button visibility based on scroll position
window.addEventListener('scroll', () => {
    scrollToTopButton.classList.toggle('visible', window.pageYOffset > 100);
});

// Scroll to top on click
scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Smooth Scroll for Navbar Links
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    });
});

// Fade-In Animations using Intersection Observer
const fadeElems = document.querySelectorAll('.fade-in');

const fadeInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

fadeElems.forEach(elem => fadeInObserver.observe(elem));

// Scroll Animations using Intersection Observer
const scrollAnimationElems = document.querySelectorAll('.scroll-animation');

const scrollAnimObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

scrollAnimationElems.forEach(elem => scrollAnimObserver.observe(elem));

// Smooth Tap Animation for Navbar Links
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transition = 'transform 0.3s ease-in-out';
        link.style.transform = 'scale(1.1)';
    });

    link.addEventListener('mouseleave', () => {
        link.style.transition = 'transform 0.3s ease-in-out';
        link.style.transform = 'scale(1)';
    });
});

// Drawer Menu for Small Screens
const hamburgerMenu = document.getElementById('hamburger-menu');
const drawer = document.getElementById('drawer');
const closeBtn = document.getElementById('close-btn');

// Open Drawer
const openDrawer = () => drawer.style.left = '0'; // Slide in the drawer

// Close Drawer
const closeDrawer = () => drawer.style.left = '-250px'; // Slide out the drawer

// Event listener for hamburger menu
hamburgerMenu.addEventListener('click', openDrawer);

// Event listener for close button in drawer
closeBtn.addEventListener('click', closeDrawer);

// Close drawer if clicking outside of it
document.body.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !hamburgerMenu.contains(e.target)) {
        closeDrawer();
    }
});
