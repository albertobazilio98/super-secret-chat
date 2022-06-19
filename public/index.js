let socket
let port
let address
let username
let secretKey

const setup = () => {
  document.getElementById('username').value = `anon-${Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)}`

  document.getElementById('message-body').addEventListener('keypress', (e) => {
    if (e.key == 'Enter') sendMessage()
  })
}

const setupConnection = () => {
  address = document.getElementById('address').value
  port = document.getElementById('port').value
  username = document.getElementById('username').value
  secretKey = document.getElementById('secret-key').value

  document.getElementById('message-body').disabled = false
  document.getElementById('send').disabled = false
  socket = new WebSocket(`ws://${address}:${port}`)
  socket.onmessage = recieveMessage
}

const calculateLRC = (message) => {
  var bytes = [];
  var lrc = 0;
  for (var i = 0; i < message.length; i++) {
      bytes.push(message.charCodeAt(i));
  }
  for (var i = 0; i < message.length; i++) {
      lrc ^= bytes[i];
  }
  return lrc;
}

const checkLRC = (message, LRC) => {
  const result = LRC == calculateLRC(message)
  if (!result) alert('Integrity error!')
  return result
}

const encryptMessage = (message) => {
  const encMessage = CryptoJS.AES.encrypt(JSON.stringify(message), secretKey).toString();
  return encMessage
}

const decryptMessage = (encMessage) => {
  const message = CryptoJS.AES.decrypt(encMessage, secretKey).toString(CryptoJS.enc.Utf8)
  if (!message) alert('Decriptation error!')
  return JSON.parse(message)
}

const createMessageElement = (message) => {
  const messageTemplate = document.querySelector('.message-container.hidden')
  const newMessage = messageTemplate.cloneNode(true)
  newMessage.querySelector('.body').textContent = message.body
  newMessage.querySelector('.username').textContent = message.username
  newMessage.classList.remove('hidden')
  return newMessage
}

const addMessage = (message) => {
  const newMessage = createMessageElement(message)
  if (message.username != username) {
    newMessage.classList.add('other')
  }
  // const messageDiv = document.createElement('div')
  // messageDiv.classList.add('chat-message')
  // messageDiv.textContent = `${message.username}: ${message.body}`
  const chat = document.getElementById('chat')
  chat.appendChild(newMessage)
}

const recieveMessage = (res) => {
  const message = res.data
  const separator = message.lastIndexOf('-')
  const LRC = parseInt(message.slice(separator + 1))
  const encMessage = message.slice(0, separator)

  if (!checkLRC(encMessage, LRC)) return

  addMessage(decryptMessage(encMessage))
}

const sendMessage = () => {
  if (!socket) return
  const bodyInput = document.getElementById('message-body')
  const body = bodyInput.value
  const message = {
    body, username,
  }
  const encMessage = encryptMessage(message)
  const encMessageWithLCR = `${encMessage}-${calculateLRC(encMessage)}`
  socket.send(encMessageWithLCR)
  bodyInput.value = ''
}