const socket = io();

let nickname = ""; // 닉네임
let roomName = "";

// 닉네임 입력 전, 회의 버튼 숨기기
document.querySelector(".after_nick").style.display = 'none';

// 닉네임 입력 받기 기능
const nickForm = document.querySelector("#nickname");
const nickInput = document.querySelector(".input_nick");

function nickBtnSubmit(event) {
  event.preventDefault();
  nickname = nickInput.value;
  console.log(nickname);

  showBtn(nickname);
  return nickname;
}
nickForm.addEventListener("submit", nickBtnSubmit);

// 닉네임 입력 후, 회의 버튼 보이기 + 메인 컨텐츠의 회의 버튼 활성화
function showBtn(nickname) {
  if (nickname != "") {
    document.querySelector(".nickname").style.display = 'none';
    document.querySelector(".after_nick").style.display = 'flex';

    const myNick = document.querySelector(".my_nick");
    let helloText = `${nickname}님 안녕하세요!`
    myNick.innerHTML = helloText;

    //const startMeeting = document.querySelector(".start_meeting");
    //startMeeting.classList.remove('disable')    
  }
}

function startMeeting() {
  if (nickname == "") {
    nickname = prompt('닉네임을 입력하세요', 'nickname');
    if (nickname.length > 0) {
      showBtn(nickname);
    }
  } else {
    roomName = (Math.floor(Math.random() * 1000000)).toString();
    const info = {
      nickname : nickname,
      roomName : roomName,
    }
    const infoString = JSON.stringify(info);
    localStorage.setItem('info', infoString);
    location.href = "/meeting";
  }
}

function enterCode() {
  roomName = prompt('회의 참여 코드를 입력하세요', 'abcd-100');
  if (roomName != "") {
    socket.emit("enter_code", roomName);
  } else {
    alert("코드를 확인해주세요");
  }
  socket.on("enter_code", result => {
    if (result) {
      const info = {
        nickname : nickname,
        roomName : roomName,
      }
      const infoString = JSON.stringify(info);
      localStorage.setItem('info', infoString);
      location.href = "/meeting";
    } else {
      alert("코드를 확인해주세요");
    }
    socket.off("enter_code");
  });
}