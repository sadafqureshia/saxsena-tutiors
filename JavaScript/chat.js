// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, set, get, remove } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDFALXYnCFdYZ6d1Dg11AikCtk784af7oM",
    authDomain: "chat-app-10e53.firebaseapp.com",
    projectId: "chat-app-10e53",
    storageBucket: "chat-app-10e53.firebasestorage.app",
    messagingSenderId: "1095696556888",
    appId: "1:1095696556888:web:5dac587fd62a5998a0fb2d",
    databaseURL: "https://chat-app-10e53-default-rtdb.firebaseio.com/",
};

// Initialize Firebase only if it's not already initialized
if (!getApps().length) {
    initializeApp(firebaseConfig);
} else {
    getApp(); // If already initialized, use the default app
}

const auth = getAuth();
const database = getDatabase();

let currentUser = null;
let selectedUser = null;

// DOM elements
const userListContent = document.getElementById('userListContent');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const signOutButton = document.getElementById('signOutButton');
const popupChat = document.getElementById('popupChat');
const popupRecipient = document.getElementById('popupRecipient');
const popupMessages = document.getElementById('popupMessages');
const popupMessageInput = document.getElementById('popupMessageInput');
const popupSendButton = document.getElementById('popupSendButton');
const closePopup = document.getElementById('closePopup');
const toggleUserList = document.getElementById('toggleUserList');
const userList = document.getElementById('userList');

// Long press duration in milliseconds
const longPressDuration = 1000; // 1 second
const deleteAfterDuration = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

// Allowed email addresses for sending messages
const allowedEmails = ['manavsaxena999@gmail.com', 'sadafqureshi78@gmail.com'];

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        updateUserStatus(user.uid, user.email);
        loadMessages();
        loadUsers();
        setInterval(checkMessagesForAutoDelete, 3600000); // Run check every hour
        // Check if the current user is allowed to send messages
        if (!allowedEmails.includes(user.email)) {
            messageInput.disabled = true; // Disable message input for users not allowed to send messages
            sendButton.disabled = true;   // Disable send button for users not allowed to send messages
        }
    } 
    // else {
    //     window.location.href = 'login.html'; // Redirect to login page if not authenticated
    // }
});

// // Update user status
// function updateUserStatus(userId, email) {
//     const userRef = ref(database, `users/${userId}`);
//     set(userRef, {
//         email: email,
//         lastSeen: Date.now()
//     });
// }
// Check authentication state

onAuthStateChanged(auth, (user) => {
    const chatInputSection = document.getElementById('chatInputSection');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // Check if user is authenticated
    if (user) {
        currentUser = user;

        console.log('User logged in:', user.email); // Log current user email

        // Update UI based on user role (admin or not)
        if (allowedEmails.includes(user.email)) {
            console.log('Admin access granted');
            chatInputSection.style.display = 'flex'; // Show chat input section for admins
            messageInput.disabled = false;  // Enable message input
            sendButton.disabled = false;   // Enable send button

            // Add event listener for sending messages
            sendButton.addEventListener('click', () => {
                const messageText = messageInput.value.trim();
                if (messageText) {
                    console.log('Message to send:', messageText); // Debugging: Log the message

                    const messagesRef = ref(database, 'messages');

                    // Push the message to Firebase
                    push(messagesRef, {
                        userId: currentUser.uid,
                        username: currentUser.email,
                        text: messageText,
                        timestamp: serverTimestamp(), // Add server timestamp
                    })
                    .then(() => {
                        console.log('Message sent successfully');
                        messageInput.value = ''; // Clear the input field after sending
                    })
                    .catch((error) => {
                        console.error('Error sending message:', error); // Log any Firebase errors
                    });
                } else {
                    console.warn('Message input is empty'); // Debugging: Handle empty message case
                }
            });
        } else {
            console.log('Non-admin user');
            chatInputSection.style.display = 'none'; // Hide input section for non-admins
        }

        // Set up auto-delete checks (optional feature)
        setInterval(checkMessagesForAutoDelete, 3600000); // Every hour

    } else {
        // If no user is logged in, hide the chat input section and disable the buttons
        console.log('No user logged in');
        currentUser = null;
        chatInputSection.style.display = 'none'; // Hide input section
        messageInput.disabled = true; // Disable message input
        sendButton.disabled = true;  // Disable send button
    }
});





// Load messages for everyone (authenticated or not)
loadMessages();

// Load messages
function loadMessages() {
    const messagesRef = ref(database, 'messages');
    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message, chatMessages, snapshot.key);
    });
}

// Display a message
function displayMessage(message, container, messageId) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(message.userId === (currentUser?.uid || '') ? 'sent' : 'received');

    const senderElement = document.createElement('div');
    senderElement.classList.add('sender');
    senderElement.textContent = message.username;

    const textElement = document.createElement('div');
    textElement.textContent = message.text;

    const timestampElement = document.createElement('div');
    timestampElement.classList.add('timestamp');
    timestampElement.textContent = new Date(message.timestamp).toLocaleString();

    messageElement.appendChild(senderElement);
    messageElement.appendChild(textElement);
    messageElement.appendChild(timestampElement);

    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;

    
    // Add long press functionality to delete the message
    addLongPressToDelete(messageElement, messageId);

    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

// Add long press to delete functionality
function addLongPressToDelete(messageElement, messageId) {
    let pressTimer;

    messageElement.addEventListener('mousedown', (e) => {
        // Start timer for long press
        pressTimer = setTimeout(() => {
            deleteMessage(messageId);  // Delete message after long press
        }, longPressDuration);
    });

    messageElement.addEventListener('mouseup', () => {
        // Clear timer if user releases before long press duration
        clearTimeout(pressTimer);
    });

    messageElement.addEventListener('mouseleave', () => {
        // Clear timer if the user moves the mouse away before long press
        clearTimeout(pressTimer);
    });

    // For mobile support (touch events)
    messageElement.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            deleteMessage(messageId);  // Delete message after long press
        }, longPressDuration);
    });

    messageElement.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
    });
}

// Delete message from Firebase
function deleteMessage(messageId) {
    const messageRef = ref(database, `messages/${messageId}`);
    set(messageRef, null);  // Delete the message by setting it to null
}

// Check for messages older than 48 hours and delete them
function checkMessagesForAutoDelete() {
    const messagesRef = ref(database, 'messages');
    get(messagesRef).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            const messageTimestamp = message.timestamp;
            const currentTime = Date.now();

            // If the message is older than 48 hours, delete it
            if (currentTime - messageTimestamp > deleteAfterDuration) {
                deleteMessage(childSnapshot.key);
            }
        });
    });
}

// Load users
function loadUsers() {
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
        userListContent.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const userId = childSnapshot.key;
            const userData = childSnapshot.val();
            if (userId !== currentUser.uid) {
                const userElement = document.createElement('div');
                userElement.classList.add('user-item');
                userElement.textContent = userData.email;
                userElement.addEventListener('click', () => openPopupChat(userId, userData.email));
                userListContent.appendChild(userElement);
            }
        });
    });
}

// Send message
function sendMessage(text, recipient = null) {
    if (text && currentUser) {
        const messagesRef = ref(database, 'messages');
        push(messagesRef, {
            userId: currentUser.uid,
            username: currentUser.email,
            text: text,
            timestamp: Date.now(),
            recipient: recipient
        });
    }
}

sendButton.addEventListener('click', () => {
    sendMessage(messageInput.value.trim());
    messageInput.value = '';
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(messageInput.value.trim());
        messageInput.value = '';
    }
});