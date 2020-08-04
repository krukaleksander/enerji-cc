const socket = io('http://localhost:5010');

const chatContainer = document.querySelector('.chat-container__message-container');
const messageForm = document.querySelector('.send-container');
const messageInput = document.querySelector('.send-container__input');

let name = "";

fetch(`${window.location}/get-chat-name`)
    .then(response => response.json())
    .then(data => name = data.userName);


socket.emit('new-user', name);

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});

messageForm.addEventListener('submit', e => {


    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`${name}: ${message}`);
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});

function appendMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.setAttribute('class', `chat-container__message--${name}`);
    messageEl.innerText = `${createDate()} ${message}`;
    chatContainer.append(messageEl);
};

function createDate() {
    const date = new Date;
    // const dateInCalendar = date.toLocaleDateString("pl-PL");
    const dateInCalendar = '';
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hour = date.getHours();
    const fullDate = `${dateInCalendar} ${hour < 10 ? 0 + hour.toString() : hour}:${minutes < 10 ? 0 + minutes.toString() : minutes}:${seconds < 10 ? 0 + seconds.toString() : seconds}`;
    return fullDate;
}