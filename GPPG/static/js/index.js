function prefetchPage(url) {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  document.head.appendChild(link);
}

window.onload = function () {
  window.scrollTo(0, 0);
};

//Chatbot

function chatBot() {
  const chatWindow = document.getElementById("chat-window");
  const chatIcon = document.getElementById("chat-icon");
  const closeIcon = document.getElementById("close-icon");
  const chatToggle = document.getElementById("chat-toggle");
  const chatMessages = document.getElementById("chat-messages");

  return {
    messages: [],
    botTyping: false,
    isChatActive: false,
    csrfToken: "{{ csrf_token }}",

    toggleChat() {
      // Add click scale effect
      chatToggle.classList.add("scale-90");

      setTimeout(() => {
        chatToggle.classList.remove("scale-90");
      }, 150);

      if (!this.isChatActive) {
        // Opening chat
        this.isChatActive = true;
        chatWindow.style.display = "block";

        // Trigger animation after display is set
        setTimeout(() => {
          chatWindow.classList.remove("opacity-0", "scale-0", "bottom-0");
          chatWindow.classList.add("opacity-100", "scale-100", "bottom-16");
        }, 50);

        chatIcon.classList.add("hidden");
        closeIcon.classList.remove("hidden");
        closeIcon.style.transform = "rotate(0deg)";

        // Start chat if it's the first time
        if (this.messages.length === 0) {
          this.startChat();
        }
      } else {
        // Closing chat
        this.isChatActive = false;
        chatWindow.classList.remove("opacity-100", "scale-100", "bottom-16");
        chatWindow.classList.add("opacity-0", "scale-0", "bottom-0");

        // Hide after animation completes
        setTimeout(() => {
          chatWindow.style.display = "none";
        }, 300);

        // Switch icons back
        chatIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
        closeIcon.style.transform = "rotate(180deg)";
      }
    },

    startChat() {
      this.messages = [];
      this.messages.push({
        from: "bot",
        text: "Hi! I'm PangoBot Ask me anything about the Palawan Pangolin!",
        timestamp: new Date().getTime(),
      });
      this.updateScroll();
    },

    formatMessage(text) {
      return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
    },

    updateScroll() {
      setTimeout(() => {
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 100);
    },

    async updateChat(inputElement) {
      const messageText = inputElement.value;
      if (messageText.trim() !== "") {
        // Add user message
        this.messages.push({
          from: "user",
          text: messageText,
          timestamp: new Date().getTime(),
        });

        inputElement.value = "";
        this.botTyping = true;
        this.updateScroll();

        try {
          const response = await fetch("/chat/send_message/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": this.csrfToken,
            },
            body: JSON.stringify({ message: messageText }),
          });

          const data = await response.json();

          if (data && data.status === "success" && data.response) {
            this.messages.push({
              from: "bot",
              text: data.response,
              timestamp: new Date().getTime(),
            });
          } else {
            this.messages.push({
              from: "bot",
              text: "Sorry, something went wrong. Please try again.",
              timestamp: new Date().getTime(),
            });
          }
        } catch (error) {
          console.error("Error:", error);
          this.messages.push({
            from: "bot",
            text: "Sorry, something went wrong. Please try again.",
            timestamp: new Date().getTime(),
          });
        }

        this.botTyping = false;
        this.updateScroll();
      }
    },

    renderMessages() {
      chatMessages.innerHTML = "";

      this.messages.forEach((message) => {
        const messageDiv = document.createElement("div");
        const messageContent = document.createElement("div");

        messageDiv.className = `flex ${message.from === "bot" ? "justify-start" : "justify-end"}`;
        messageContent.className = `max-w-[80%] p-3 rounded-lg ${message.from === "bot" ? "bg-gray-100 text-gray-800" : "bg-[rgb(63,7,3)] text-white"}`;

        const formattedText = this.formatMessage(message.text);
        const parser = new DOMParser();
        const doc = parser.parseFromString(formattedText, "text/html");
        messageContent.appendChild(doc.body.firstChild || doc.createTextNode(formattedText));

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
      });

      if (this.botTyping) {
        const typingDiv = document.createElement("div");
        const typingContent = document.createElement("div");

        typingDiv.className = "flex justify-start";
        typingContent.className = "max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800";
        typingContent.textContent = "Typing...";

        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);
      }
    },
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const chatBotInstance = chatBot();

  const chatToggle = document.getElementById("chat-toggle");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  chatToggle.addEventListener("click", () => {
    chatBotInstance.toggleChat();
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    chatBotInstance.updateChat(chatInput);
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatBotInstance.updateChat(chatInput);
    }
  });
  function adjustHeight() {
    chatInput.style.height = "40px";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + "px";
  }

  chatInput.addEventListener("input", adjustHeight);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatBotInstance.updateChat(chatInput);
    }
  });

  // Set up message rendering
  setInterval(() => {
    chatBotInstance.renderMessages();
  }, 100);
});
//################################################################

// Images
function openModal(image) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modalImg.src = image.src;
  modal.classList.remove("hidden");
}

function closeModal(event) {
  const modal = document.getElementById("imageModal");
  if (event.target === modal || event.type === "click") {
    modal.classList.add("hidden");
  }
}
// ################################################################

//Videos
function closeModals() {
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  modalVideo.pause();
  modalVideo.src = ""; // Stop the video from playing
  modal.classList.add("hidden");
}

function openFullScreen(videoElement) {
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  modalVideo.src = videoElement.src;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modalVideo.play();
}

function closeModalsOnClickOutside(event) {
  const modal = document.getElementById("videoModal");
  const videoContainer = modal.querySelector(".relative");
  if (!videoContainer.contains(event.target)) {
    closeModals();
  }
}
// ################################################################
document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("animated-number");
  element.classList.add("animate-slide-from-up");

  setTimeout(() => {
    element.classList.remove("animate-slide-from-up");
  }, 1000);
});

var typed = new Typed("#typing", {
  strings: ["Guardians of the Palawan Pangolin Guild", "GPPG"],
  typeSpeed: 50,
  backSpeed: 50,
  backDelay: 1000,
  loop: true,
  cursorChar: "",
  autoInsertCss: true,
  startDelay: 0,
  smartBackspace: true,
});
