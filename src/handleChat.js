const fs = require('fs');
const path = require('path');

// Read the flow.json file
const flowData = JSON.parse(fs.readFileSync(path.join(__dirname, 'flow.json'), 'utf8'));

const generateBotReply = async (userInput, messageType, session = {}) => {
    console.log('Processing:', messageType, userInput);

    try {
        if (messageType === 'button') {
            return handleButtonClick(userInput, session);
        } else if (messageType === 'text') {
            return handleTextInput(userInput, session);
        } else {
            throw new Error("Invalid message type");
        }
    } catch (error) {
        console.error('Error in generating reply:', error);
        return { text: "Something went wrong. Please try again." };
    }
};

const handleButtonClick = (payload, session = {}) => {
    console.log("Button clicked:", payload);
    console.log("Session state:", session);

    if (payload === 'NAME_EMAIL_CONTACT') {
        session.userDetails = { step: 'name' };
        console.log("Set session userDetails:", session.userDetails);
        return {
            text: "Great! Let's start with your name. What's your full name?",
            showInput: true,
            inputPrompt: "Enter your full name"
        };
    }
    //else if (payload === 'CONNECT_GURU') {
    //     return {
    //         text: "<a href='https://brownstone.co.uk/#/edi'>Click Here</a>",
    //         showInput: false,
    //         inputPrompt: " "
    //     };
    // }
    else {
        return flowData[payload] || flowData.FALLBACK;
    }
};


const handleTextInput = (message, session = {}) => {
    console.log("Text input received:", message);
    console.log("Session state:", session); // Add this
    if (session.userDetails) {
        return handleUserDetails(message, session);
    }
    else {
        console.log("No session.userDetails found"); // Add this
        return flowData.FALLBACK;
    }
};

const handleUserDetails = (message, session) => {
    console.log("Processing user details:", session.userDetails); // Add this
    switch (session.userDetails.step) {
        case 'name':
            if (isValidName(message)) {
                session.userDetails.name = message;
                session.userDetails.step = 'email';
                return {
                    text: `Nice to meet you, ${message}! Now, what's your email address?`,
                    showInput: true,
                    inputPrompt: "Enter your email address"
                };
            } else {
                return {
                    text: "Please enter a valid name (only letters and spaces).",
                    showInput: true,
                    inputPrompt: "Enter your full name"
                };
            }
        case 'email':
            if (isValidEmail(message)) {
                session.userDetails.email = message;
                session.userDetails.step = 'contact';
                return {
                    text: "Great! Lastly, what's your contact number?",
                    showInput: true,
                    inputPrompt: "Enter your contact number"
                };
            } else {
                return {
                    text: "Please enter a valid email address.",
                    showInput: true,
                    inputPrompt: "Enter your email address"
                };
            }
        case 'contact':
            if (isValidContact(message)) {
                session.userDetails.contact = message;
                session.userDetails.step = 'completed';
                return {
                    text: `Thank you, ${session.userDetails.name}! lovely to meet you. What's happening with you and  how can we help?`,
                    buttons: [
                        { payload: "DISCRIMINATION", title: "Discrimination" },
                        { payload: "INTERSECTIONALITY", title: "Intersectionality" },
                        { payload: "NEURODIVERSITY", title: "Neurodiversity" },
                        { payload: "RACISM", title: "Racism" },
                        { payload: "SOCIAL MOBILITY", title: "Social Mobility" },
                        { payload: "MONEY & PAY", title: "Money & Pay" },
                    ],
                    showInput: false,
                    inputPrompt: "Select a topic or type your question"
                };
            } else {
                return {
                    text: "Please enter a valid contact number.",
                    showInput: true,
                    inputPrompt: "Enter your contact number"
                };
            }
    }
};

// Validation functions using regex
const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidContact = (contact) => /^\+?[\d\s-]{10,15}$/.test(contact);

module.exports = { generateBotReply };
