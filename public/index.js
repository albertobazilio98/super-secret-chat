let socket
let port
let address
let username
let secretKey

const addMessage = (message) => {
  console.log(message)
  const messageDiv = document.createElement('div')
  messageDiv.classList.add('chat-message')
  messageDiv.textContent = `${message.username}: ${message.body}`
  const chat = document.getElementById('chat')
  chat.appendChild(messageDiv)
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
  console.log(LRC, message, calculateLRC(message))
  const result = LRC == calculateLRC(message)
  if (!result) {
    alert('integridade falhou!')
  }
  return result
}

const encryptMessage = (message) => {
  const encMessage = CryptoJS.AES.encrypt(message, secretKey).toString();
  return encMessage
}

const decryptMessage = (encMessage) => {
  const message = CryptoJS.AES.decrypt(encMessage, secretKey).toString(CryptoJS.enc.Utf8)
  return message
}

const recieveMessage = (res) => {
  const message = res.data
  console.log(message)
  const separator = message.lastIndexOf('-')
  const LRC = parseInt(message.slice(separator + 1))
  const encMessage = message.slice(0, separator)

  if (!checkLRC(encMessage, LRC)) return
  console.log(decryptMessage(encMessage))
  addMessage(JSON.parse(decryptMessage(encMessage)))
}

const setupConnection = () => {
  address = document.getElementById('address').value
  port = document.getElementById('port').value
  username = document.getElementById('username').value
  secretKey = document.getElementById('secret-key').value

  document.getElementById('send').disabled = false
  socket = new WebSocket(`ws://${address}:${port}`)
  socket.onmessage = recieveMessage
}

const sendMessage = () => {
  if (!socket) return

  const body = document.getElementById('message-body').value
  const message = {
    body, username,
  }
  const encMessage = encryptMessage(JSON.stringify(message))
  const encMessageWithLCR = `${encMessage}-${calculateLRC(encMessage)}`
  console.log(encMessageWithLCR)
  socket.send(encMessageWithLCR)
}