
const form = document.querySelector(".input-submit");
const textarea= document.querySelector(".input");
const files=document.querySelector("#files")
const submitButton=document.querySelector(".submit");
const chatWindow=document.querySelector(".chat-window");
const chatArea= chatWindow.querySelector(".chat-area");
const conversations= document.querySelector(".conversations");
let currentConversationID = crypto.randomUUID();
let currentConversationTitle= null;
const userID= "7edb53d0-d73a-4600-bf6f-93929fa80ac1"
const newchat=document.querySelector("#new-chat")
function scrollToLatestMessage() {
    chatArea.scrollTop = chatArea.scrollHeight;
}
      
function createMessage(text, type) {
    const message = document.createElement("div");
    message.className = type;
    message.textContent = text;
    chatArea.appendChild(message);
    scrollToLatestMessage();
    return message;
}

function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    textarea.disabled = isLoading;
}


function addConversationToSidebar(id, title) {
    const conv = document.createElement("button");

    conv.textContent = title;
    conv.className = "conversation";
    conv.id = id;

    conversations.prepend(conv);

    conv.addEventListener("click", async () => {
        currentConversationID = conv.id;
        currentConversationTitle = conv.textContent;
        const msgs_response = await fetch(
            "http://localhost:8000/fetch_messages/" + conv.id
        );
        
        const msgs = await msgs_response.json();

        chatArea.innerHTML = "";

        for (let i = 0; i < msgs.length; i++) {
            if (msgs[i][0] === "user") {
                createMessage(msgs[i][1], "user-message");
            }

            if (msgs[i][0] === "ai") {
                createMessage(msgs[i][1], "ai-message");
            }
        }
    });
}
async function sendMessage(userMessage) {
    if (submitButton.disabled) {
        return;
    }
    const trimmedMessage = String(userMessage || "").trim();
    if (!trimmedMessage) {
        return;
    }
    
    createMessage(trimmedMessage, "user-message");

    textarea.value = "";
    
    const aiMessage = createMessage("Thinking...", "ai-message");

    setLoading(true);

    try {
      
      if (currentConversationTitle === null){
        const response_title = await fetch("http://127.0.0.1:8000/first_chat",{
          method:"POST",
          headers: {
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            conversation_id:currentConversationID,
            user_msg: trimmedMessage
          })
        });
        const data= await response_title.json();
        currentConversationTitle=data.title;
        addConversationToSidebar(
          currentConversationID,
          currentConversationTitle
        );
        aiMessage.textContent= data.result
      }
      else{
        const response_title = await fetch("http://127.0.0.1:8000/chat",{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            conversation_id:currentConversationID,
            input:trimmedMessage
          })
        })
        const data= await response_title.json();
        aiMessage.textContent=data
      }

    } catch (error) {
      aiMessage.textContent =
      "Sorry, I couldn't reach the AI service. Please try again.";
    } finally {
      setLoading(false);
      scrollToLatestMessage();
    }
}
form.addEventListener("submit",async (event) => {
    event.preventDefault();
    sendMessage(textarea.value);
});


async function getConversationTitles() {
    const response = await fetch(
        "http://127.0.0.1:8000/fetch_title"
    );
    const data = await response.json();
    return data;
}

async function displayConversations() {
    const data = await getConversationTitles();
    for (let i = 0; i < data.length; i++) {
      const conv= document.createElement("button");
      conv.textContent=data[i][1];
      conv.className='conversation';
      conv.id=data[i][0];
      conversations.appendChild(conv);
    };
    
}

async function display_chat_history() {
    await displayConversations();

    const conversation = conversations.querySelectorAll(".conversation");

    conversation.forEach((button) => {
        button.addEventListener("click", async (event) => {
          currentConversationID=button.id;
          currentConversationTitle= button.textContent;
          const msgs_response= await fetch("http://localhost:8000/fetch_messages/"+button.id);
          const msgs = await msgs_response.json(); 
          chatArea.innerHTML = "";
          for (let i=0; i< msgs.length; i++) {
            if (msgs[i][0] === "user") {
              createMessage(msgs[i][1],"user-message")
            }
            if (msgs[i][0] === "ai") {
              createMessage(msgs[i][1],"ai-message")
            }
          }
  
        })
    });
}
display_chat_history();
newchat.addEventListener("click",() =>{
  currentConversationID = crypto.randomUUID();
  currentConversationTitle=null;
  chatArea.innerHTML="";
})