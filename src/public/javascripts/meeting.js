//서버로의 연결
const socket = new WebSocket(`ws://${window.location.host}`);

// 변수
const messageList = document.querySelector("ui");
const messageForm = document.querySelector("form");


//socket이 open되면 로그 출력
socket.addEventListener("open", () => {
  console.log("Connected to Server,  ✅ ");
});

//서버와 연결이 끊어진 경우 로그 출력
socket.addEventListener("close", () => {
  console.log("Disconnected from Server, ❌ ");
});

//서버로부터 받은 메세지 출력
// socket.addEventListener("message", (message) => {
//   console.log("New message: ", message.data);
// });

// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }

socket.addEventListener("message", (message) => {
  console.log("New message: ", message);
  // const li = document.createElement("li");
  // li.innerText = message.data;
  // messageList.append(li);
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  // console.log(input.value);
  socket.send(input.value); // 백엔드로 보내주기
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);