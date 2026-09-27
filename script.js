// ========================================
// DOM ELEMENTS
// ========================================

const form = document.querySelector(".input-submit");
const textarea = document.querySelector(".input");
const files = document.querySelector("#files");
const submitButton = document.querySelector(".submit");
const chatWindow = document.querySelector(".chat-window");
const chatArea = chatWindow.querySelector(".chat-area");
const conversations = document.querySelector(".conversations");
const newchat = document.querySelector("#new-chat");

let currentConversationID = crypto.randomUUID();
let currentConversationTitle = null;

const userID = "7edb53d0-d73a-4600-bf6f-93929fa80ac1";


// ========================================
// CHAT UTILITIES
// ========================================

function scrollToLatestMessage() {
    chatArea.scrollTop = chatArea.scrollHeight;
}


function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    textarea.disabled = isLoading;
}


// ========================================
// MARKDOWN + CITATION RENDERING
// ========================================

function renderMarkdown(element, text) {
    const citationRegex = /\[(?:File\\?:)[^\]]+\]/g;

    // Protect citations from Markdown parsing
    const citations = [];

    const protectedText = String(text ?? "").replace(
        citationRegex,
        (citation) => {
            const index = citations.push(citation) - 1;
            return `CITATIONPLACEHOLDER${index}END`;
        }
    );

    // Render Markdown safely
    element.innerHTML = DOMPurify.sanitize(
        marked.parse(protectedText)
    );

    // Find placeholders in rendered text
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
    );

    const textNodes = [];

    while (walker.nextNode()) {
        if (
            walker.currentNode.textContent.includes(
                "CITATIONPLACEHOLDER"
            )
        ) {
            textNodes.push(walker.currentNode);
        }
    }

    // Replace placeholders with citation badges
    textNodes.forEach((node) => {
        const fragment = document.createDocumentFragment();

        const parts = node.textContent.split(
            /(CITATIONPLACEHOLDER\d+END)/g
        );

        parts.forEach((part) => {
            const match = part.match(
                /^CITATIONPLACEHOLDER(\d+)END$/
            );

            if (match) {
                const citation = document.createElement("span");

                citation.className = "citation";
                citation.textContent =
                    citations[Number(match[1])];

                citation.title = "Source citation";

                fragment.appendChild(citation);
            } else {
                fragment.appendChild(
                    document.createTextNode(part)
                );
            }
        });

        node.replaceWith(fragment);
    });
}


// ========================================
// CREATE CHAT MESSAGES
// ========================================

function createMessage(text, type) {
    const message = document.createElement("div");

    message.className = type;

    if (type === "ai-message") {
        renderMarkdown(message, text);
    } else {
        message.textContent = text;
    }

    chatArea.appendChild(message);

    scrollToLatestMessage();

    return message;
}


// ========================================
// CONVERSATION SIDEBAR
// ========================================

function addConversationToSidebar(id, title) {
    const conv = document.createElement("button");

    conv.textContent = title;
    conv.className = "conversation";
    conv.id = id;

    conversations.prepend(conv);

    conv.addEventListener("click", async () => {
        currentConversationID = conv.id;
        currentConversationTitle = conv.textContent;

        try {
            const msgs_response = await fetch(
                "http://localhost:8000/fetch_messages/" + conv.id
            );

            if (!msgs_response.ok) {
                throw new Error("Failed to fetch messages");
            }

            const msgs = await msgs_response.json();

            chatArea.innerHTML = "";

            for (let i = 0; i < msgs.length; i++) {
                if (msgs[i][0] === "user") {
                    createMessage(
                        msgs[i][1],
                        "user-message"
                    );
                }

                if (msgs[i][0] === "ai") {
                    createMessage(
                        msgs[i][1],
                        "ai-message"
                    );
                }
            }
        } catch (error) {
            console.error(
                "Error loading conversation:",
                error
            );
        }
    });
}


// ========================================
// SEND MESSAGE TO AI
// ========================================

async function sendMessage(userMessage) {
    if (submitButton.disabled) {
        return;
    }

    const trimmedMessage = String(
        userMessage || ""
    ).trim();

    if (!trimmedMessage) {
        return;
    }

    createMessage(
        trimmedMessage,
        "user-message"
    );

    textarea.value = "";

    const aiMessage = createMessage(
        "Thinking...",
        "ai-message"
    );

    setLoading(true);

    try {

        // First message in a new conversation
        if (currentConversationTitle === null) {

            const response_title = await fetch(
                "http://127.0.0.1:8000/first_chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        conversation_id: currentConversationID,
                        user_msg: trimmedMessage
                    })
                }
            );

            if (!response_title.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response_title.json();

            currentConversationTitle = data.title;

            addConversationToSidebar(
                currentConversationID,
                currentConversationTitle
            );

            renderMarkdown(
                aiMessage,
                data.result
            );

        } else {

            // Existing conversation
            const response_title = await fetch(
                "http://127.0.0.1:8000/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        conversation_id: currentConversationID,
                        input: trimmedMessage
                    })
                }
            );

            if (!response_title.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response_title.json();

            renderMarkdown(
                aiMessage,
                data
            );
        }

    } catch (error) {
        console.error("Chat error:", error);

        aiMessage.textContent =
            "Sorry, I couldn't reach the AI service. Please try again.";

    } finally {
        setLoading(false);

        scrollToLatestMessage();
    }
}


// ========================================
// CHAT FORM SUBMISSION
// ========================================

form.addEventListener("submit", (event) => {
    event.preventDefault();

    sendMessage(textarea.value);
});


// ========================================
// FETCH CONVERSATION TITLES
// ========================================

async function getConversationTitles() {
    const response = await fetch(
        "http://127.0.0.1:8000/fetch_title"
    );

    if (!response.ok) {
        throw new Error("Failed to fetch conversation titles");
    }

    const data = await response.json();

    return data;
}


// ========================================
// DISPLAY CONVERSATIONS
// ========================================

async function displayConversations() {
    const data = await getConversationTitles();

    for (let i = 0; i < data.length; i++) {
        const conv = document.createElement("button");

        conv.textContent = data[i][1];
        conv.className = "conversation";
        conv.id = data[i][0];

        conversations.appendChild(conv);
    }
}


// ========================================
// LOAD CHAT HISTORY
// ========================================

async function display_chat_history() {
    try {
        await displayConversations();

        const conversation =
            conversations.querySelectorAll(".conversation");

        conversation.forEach((button) => {

            button.addEventListener(
                "click",
                async () => {

                    currentConversationID = button.id;

                    currentConversationTitle =
                        button.textContent;

                    try {
                        const msgs_response = await fetch(
                            "http://localhost:8000/fetch_messages/" +
                            button.id
                        );

                        if (!msgs_response.ok) {
                            throw new Error(
                                "Failed to fetch messages"
                            );
                        }

                        const msgs =
                            await msgs_response.json();

                        chatArea.innerHTML = "";

                        for (
                            let i = 0;
                            i < msgs.length;
                            i++
                        ) {
                            if (msgs[i][0] === "user") {
                                createMessage(
                                    msgs[i][1],
                                    "user-message"
                                );
                            }

                            if (msgs[i][0] === "ai") {
                                createMessage(
                                    msgs[i][1],
                                    "ai-message"
                                );
                            }
                        }

                    } catch (error) {
                        console.error(
                            "Error loading chat history:",
                            error
                        );
                    }
                }
            );
        });

    } catch (error) {
        console.error(
            "Error loading conversations:",
            error
        );
    }
}


// ========================================
// INITIALIZE CHAT HISTORY
// ========================================

display_chat_history();


// ========================================
// NEW CHAT BUTTON
// ========================================

newchat.addEventListener("click", () => {
    currentConversationID = crypto.randomUUID();

    currentConversationTitle = null;

    chatArea.innerHTML = "";

    textarea.value = "";
});


// ========================================
// RESPONSIVE SIDEBAR TOGGLE
// ========================================

(() => {

    const sidebar = document.querySelector("#app-sidebar");

    const toggle = document.querySelector("#sidebar-toggle");

    if (!sidebar || !toggle) {
        return;
    }

    const mobileQuery = window.matchMedia(
        "(max-width: 700px)"
    );


    // Update the toggle button appearance
    function syncSidebarState() {

        const isMobile = mobileQuery.matches;

        const isOpen = isMobile
            ? document.body.classList.contains("sidebar-open")
            : !document.body.classList.contains(
                "sidebar-collapsed"
            );

        toggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        toggle.setAttribute(
            "aria-label",
            isOpen
                ? "Collapse sidebar"
                : "Expand sidebar"
        );

        toggle.title = isOpen
            ? "Collapse sidebar"
            : "Expand sidebar";

        toggle.textContent = isOpen
            ? "✕"
            : "☰";
    }


    // Toggle sidebar
    toggle.addEventListener("click", () => {

        if (mobileQuery.matches) {

            document.body.classList.toggle(
                "sidebar-open"
            );

        } else {

            document.body.classList.toggle(
                "sidebar-collapsed"
            );
        }

        syncSidebarState();
    });


    // Close mobile sidebar after selecting a conversation
    // or clicking New Chat
    document.addEventListener("click", (event) => {

        if (
            mobileQuery.matches &&
            (
                event.target.closest(".conversation") ||
                event.target.closest("#new-chat")
            )
        ) {

            document.body.classList.remove(
                "sidebar-open"
            );

            syncSidebarState();
        }
    });


    // Close sidebar when clicking outside it
    document.addEventListener("click", (event) => {

        if (
            mobileQuery.matches &&
            document.body.classList.contains("sidebar-open") &&
            !sidebar.contains(event.target) &&
            !toggle.contains(event.target)
        ) {

            document.body.classList.remove(
                "sidebar-open"
            );

            syncSidebarState();
        }
    });


    // Reset sidebar state when switching screen sizes
    mobileQuery.addEventListener("change", () => {

        document.body.classList.remove(
            "sidebar-open"
        );

        document.body.classList.remove(
            "sidebar-collapsed"
        );

        syncSidebarState();
    });


    // Initialize button state
    syncSidebarState();

})();
