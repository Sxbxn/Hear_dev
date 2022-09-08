const socket = io();

//변수
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const videoCam = document.querySelector("#video_cam");
const peersCam = document.querySelector("#peers_cam");

const audio = document.querySelector("#mic");

const camerasSelect = document.getElementById("cameras");
const audiosSelect = document.getElementById("audios");

let myStream;
let displayStream;
let roomName = "abcd-123";
let myPeerConnection;
let myDataChannel;

// 장치 가져오기 (defult = audio 기본, video = 셀캠)
async function getMedia(deviceId, kind) {
    let audioConstraints = true;
    let cameraConstraints = { facingMode: "user" };
    if (deviceId) {
        if (kind === 'audio') {
            audioConstraints = { deviceId: { exact: deviceId } };
        } else {
            cameraConstraints = { deviceId: { exact: deviceId } };
        }
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: cameraConstraints,
        });
        videoCam.srcObject = myStream;
        if (!deviceId) {
            //await getCameras();
            //await getAudios();
            myStream.getAudioTracks().forEach((track) => (track.enabled = false));
            myStream.getVideoTracks().forEach((track) => (track.enabled = false));
        }
        
    } catch (e) {
        console.log(e);
    }
}


/* 장치 설정 부분
// 캠 변경
async function handleCameraChange() {
    await getMedia(camerasSelect.value, 'camera');
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}

// 오디오 변경
async function handleAudioChange() {
    await getMedia(audiosSelect.value, 'audio');
    if (myPeerConnection) {
        const audioTrack = myStream.getAudioTracks()[0];
        const audioSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === "audio");
        audioSender.replaceTrack(audioTrack);
    }
}


// 버튼 리스너 => onclick 메소드로 바꼈으니까 ... 흠 일단 
camerasSelect.addEventListener("input", handleCameraChange);
audiosSelect.addEventListener("input", handleAudioChange);
*/

async function initCall() {
    await getMedia();
    makeConnection();
    socket.emit("join_room", "abcd-123");
}

// 페이지 들어옴 !
initCall();



// Socket Code

socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    messageForm.addEventListener("submit", handleSubmit);
    myDataChannel.addEventListener("message", (event) => {
        const li = document.createElement("li");
        li.innerText = "yourID : " + event.data;
        messageList.append(li);
    });
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
    console.log("send offer");
});

socket.on("offer", async (offer) => {
    console.log("recive offer");
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        messageForm.addEventListener("submit", handleSubmit);
        myDataChannel.addEventListener("message", (event) => {
            const li = document.createElement("li");
            li.innerText = "yourID : " + event.data;
            messageList.append(li);
        });
    });
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("send answer");
});

socket.on("answer", answer => {
    console.log("recive answer");
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", ice => {
    myPeerConnection.addIceCandidate(ice);
});

// RTC Code

const peerConnectionConfig = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

function makeConnection() {
    myPeerConnection = new RTCPeerConnection(peerConnectionConfig);
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    socket.emit("ice", data.candidate, roomName);
    console.log("send ice");
}

function handleAddStream(data) {
    peersCam.srcObject = data.stream;
}

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    myDataChannel.send(input.value);
    const li = document.createElement("li");
    li.innerText = "myID : " + input.value;
    messageList.append(li);
    input.value = "";
}


// start

// 현재 시각
function set_time() {
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
set_time();
setInterval(set_time, 6000); // 1초 = 1000 => 1분 6000

// 회의 코드 복사
function copy_code() {
    const code = document.querySelector(".join_code");

    window.navigator.clipboard.writeText(code.textContent).then(() => {
      alert('회의 코드 복사 완료!');
    });
};

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
        document.getElementById("third").style.display = 'none';
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
        document.getElementById("third").style.display = '';
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
    // myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
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
    // myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
}

// stt: on, off 상태 메서드
function stt_onoff() {
    var stt = document.querySelector("#stt");
    while (stt.hasChildNodes()) {
        stt.removeChild(stt.firstChild);
    }
    // off 상태이면,
    if (stt.value === "off") {
        stt.value = "on";
        const new_span = document.createElement('span');
        new_span.setAttribute("class", "material-icons");
        new_span.setAttribute("value", "on");
        const new_text = document.createTextNode('speaker_notes');
        new_span.appendChild(new_text);
        stt.appendChild(new_span);
    }
    // on 상태이면,
    else {
        stt.value = "off";
        const new_span = document.createElement('span');
        new_span.setAttribute("class", "material-icons");
        const new_text = document.createTextNode('speaker_notes_off');
        new_span.appendChild(new_text);
        stt.appendChild(new_span);
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
async function sharingStart() {
    try {
        displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screen.srcObject = displayStream;
        if (myPeerConnection) {
            const displayTrack = displayStream.getVideoTracks()[0];
            const displaySender = myPeerConnection
                .getSenders()
                .find(sender => sender.track.kind === "video");
            displaySender.replaceTrack(displayTrack);
        }
    } catch (e) {
        console.log(e);
    }
}
// 화면공유 off 메서드
function sharingStop() {
    const stream = screen.srcObject;
    if (tracks = stream.getTracks()) {
        tracks.forEach(function (track) {
            track.stop();
        });
    }
    screen.srcObject = null;
    if (myPeerConnection) {
        const prevTrack = myStream.getVideoTracks()[0];
        const prevSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === "video");
        prevSender.replaceTrack(prevTrack);
    }
}

// 카메라 on 메서드
// let constraints = {video: { facingMode: "user"}, audio: false};
function cameraStart() {
then(function(stream){
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

// 종료 버튼
function exit_meeting() {
  window.location.href = "/"
}