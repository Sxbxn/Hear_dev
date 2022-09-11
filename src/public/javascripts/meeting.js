//그 외 기능들

// 현재 시각
function setTime() {
  var time = new Date();

  var year = time.getUTCFullYear();
  var month = ('0' + (time.getUTCMonth() + 1)).slice(-2);
  var day = ('0' + time.getUTCDate()).slice(-2);
  var ymd = month + '/' + day + '/' + year;
  var hours = ('0' + time.getHours()).slice(-2);
  var minutes = ('0' + time.getMinutes()).slice(-2);
  var hm = hours + ':' + minutes;

  var time_box = document.querySelector(".time_box");
  time_box.innerText = `${ymd}` + ", " + `${hm}`;
}
setTime();
setInterval(setTime, 6000); // 1초 = 1000 => 1분 6000

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                     {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }
  canvasCtx.restore();
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

    const camElement = document.getElementsByClassName("video_cam")[0];
    const canvasElement = document.getElementsByClassName('output_canvas')[0];
    const canvasCtx = canvasElement.getContext('2d');

    const hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});

    hands.setOptions({
        maxNumHands: 2,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    hands.onResults(onResults);

    const camera = new Camera(camElement, {
        onFrame: async () => {
        await hands.send({image: camElement});
    },
        width: 782,
        height: 795
    });
    camera.start();
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
const screen = document.getElementsByClassName("screen_sharing");
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
// 회의 코드 복사 기능
function copyCode() {
  const code = document.querySelector(".join_code");

  window.navigator.clipboard.writeText(code.textContent).then(() => {
    alert('회의 코드 복사 완료!');
  });
};

// 카메라 on 메서드
const videoCam = document.querySelector(".video_cam");
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
// 채팅창 스크롤 최하단 이동
let chatForm = document.querySelector('.chat_form');

function prepareScroll() {
  window.setTimeout(scrollUl, 50);
}
function scrollUl() { 
  let chatUl = document.querySelector('.chat_ul');
  let h = chatUl.lastChild.offsetHeight; // 새로 추가된 li(가장 마지막 채팅)의 높이
  // console.log(`h값: ${h}`); 

  // console.log(chatUl.scrollTop); // 현재 스크롤의 위치, 내리지 않았을 경우 0 (최상단)
  // console.log(chatUl.scrollHeight); // 스크롤의 전체 길이
  chatUl.scrollTop = chatUl.scrollHeight + h; // 스크롤의 위치를 최하단으로
}
chatForm.addEventListener('submit', prepareScroll);