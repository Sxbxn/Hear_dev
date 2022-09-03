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
  console.log("New message: ", message.data);
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

// 현재 시각
function set_time() {
  var time = new Date();

  var year = time.getUTCFullYear();
  var month = time.getUTCMonth() + 1;
  var day = time.getUTCDate();
  var ymd = year + '-' + month + '-' + day;
    
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var hm = hours + ':' + minutes;
    
  var time_box = document.querySelector(".time_box");
  time_box.innerText = `${ymd}` + ", " + `${hm}`; 
}
set_time();
setInterval(set_time, 6000); // 1초 = 1000 => 1분 6000

// present: on, off 상태 메서드
document.getElementById("screen_sharing").style.display = 'none';
function present_onoff() {
  var present = document.querySelector("#present");
  while (present.hasChildNodes()) {	// 부모노드에 자식 노드가 있으면,
    present.removeChild(present.firstChild);
  }
  // off 상태이면,
  if (present.value === "off") {
    present.value = "on";
    const new_span = document.createElement('span');
    new_span.setAttribute("class", "material-icons");
    new_span.setAttribute("value", "on");
    const new_text = document.createTextNode('present_to_all');
    new_span.appendChild(new_text);
    present.appendChild(new_span);
    document.getElementById("video_cam").style.display = 'none';
    document.getElementById("screen_sharing").style.display = '';
    sharingStart();
  }
  // on 상태이면,
  else {
    present.value = "off";
    const new_span = document.createElement('span');
    new_span.setAttribute("class", "material-icons");
    const new_text = document.createTextNode('cancel_presentation');
    new_span.appendChild(new_text);
    present.appendChild(new_span);
    document.getElementById("video_cam").style.display = '';
    document.getElementById("screen_sharing").style.display = 'none';
    sharingStop();
  }
}

// mic: on, off 상태 메서드
function mic_onoff() {
  var mic = document.querySelector("#mic");
  while (mic.hasChildNodes()) {	// 부모노드에 자식 노드가 있으면,
    mic.removeChild(mic.firstChild);
  }
  // off 상태이면,
  if (mic.value === "off") {
    mic.value = "on";
    const new_span = document.createElement('span');
    new_span.setAttribute("class", "material-icons");
    new_span.setAttribute("value", "on");
    const new_text = document.createTextNode('mic');
    new_span.appendChild(new_text);
    mic.appendChild(new_span);
    micStart();
  }
  // on 상태이면,
  else {
    mic.value = "off";
    const new_span = document.createElement('span');
    new_span.setAttribute("class", "material-icons");
    const new_text = document.createTextNode('mic_off');
    new_span.appendChild(new_text);
    mic.appendChild(new_span);
    micStop();
  }
}

// video: on, off 상태 메서드
function video_onoff() {
  var video = document.querySelector("#video");
  while (video.hasChildNodes()) {
    video.removeChild(video.firstChild);
  }
  // off 상태이면,
  if (video.value === "off") {
    video.value = "on";
    const new_span = document.createElement('span');
    new_span.setAttribute("class", "material-icons");
    new_span.setAttribute("value", "on");
    const new_text = document.createTextNode('videocam');
    new_span.appendChild(new_text);
    video.appendChild(new_span);
    cameraStart();
  }
  // on 상태이면,
  else {
    video.value = "off";
    const new_span = document.createElement('span');
    new_span.setAttribute("class", "material-icons");
    const new_text = document.createTextNode('videocam_off');
    new_span.appendChild(new_text);
    video.appendChild(new_span);
    cameraStop();
  }
}

// 수화 인식: on, off 상태 메서드
function sl_onoff() {
  var sl = document.querySelector("#sign_language");
  while (sl.hasChildNodes()) {
    sl.removeChild(sl.firstChild);
  }
  // off 상태이면,
  if (sl.value === "off") {
    sl.value = "on";
    const new_span = document.createElement('span');
    new_span.setAttribute("class", "material-icons");
    new_span.setAttribute("value", "on");
    const new_text = document.createTextNode('sign_language');
    new_span.appendChild(new_text);
    sl.appendChild(new_span);
  }
  // on 상태이면,
  else {
    sl.value = "off";
    const new_span = document.createElement('span');
    new_span.setAttribute("class", "material-icons");
    const new_text = document.createTextNode('do_not_touch');
    new_span.appendChild(new_text);
    sl.appendChild(new_span);
  }
}

// 화면공유 on 메서드
const screen = document.getElementById("screen_sharing");
function sharingStart() {
  navigator.mediaDevices.getDisplayMedia({video: true}).then(function(stream){
    screen.srcObject = stream;
  })
  .catch(function(error){
    console.error("화면공유 실패", error);
  })
}
// 화면공유 off 메서드
function sharingStop() {
  const stream = screen.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(function(track) {
    track.stop();
  });
  screen.srcObject = null;
}

// 카메라 on 메서드
const videoCam = document.querySelector("#video_cam");
// let constraints = {video: { facingMode: "user"}, audio: false};
function cameraStart() {
  navigator.mediaDevices.getUserMedia({video: {width: 782, height: 795}, audio: false}).then(function(stream){
    videoCam.srcObject = stream;
  })
  .catch(function(error){
    console.error("카메라에 문제 있음", error);
  })
}
// 카메라 off 메서드
function cameraStop() {
  const stream = videoCam.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(function(track) {
    track.stop();
  });
  videoCam.srcObject = null;
}

// 마이크 on 메서드
const audio = document.querySelector("#mic");
function micStart() {
  navigator.mediaDevices.getUserMedia({video: false, audio : true}).then(function(stream){
      audio.srcObject = stream;
    })
    .catch(function(error){
    console.error("마이크에 문제 있음", error);
  })
}
// 마이크 off 메서드
function micStop() {
  const stream = audio.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(function(track) {
    track.stop();
  });
  audio.srcObject = null;
}