const socket = io('http://localhost:5010');

const chatContainer = document.querySelector('.chat-container');
const messageForm = document.querySelector('.send-container');
const messageInput = document.querySelector('.send-container__input');

const name = 'Lucjusz';
appendMessage('Połączono');
socket.emit('new-user', name);

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});
socket.on('user-connected', name => {
    appendMessage(`${name} dołączył/-a`);
});
socket.on('user-disconnected', name => {
    appendMessage(`${name} opuścił/-a chat`);
});
messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`Ty: ${message}`);
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});

function appendMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.innerText = message;
    chatContainer.append(messageEl);
};