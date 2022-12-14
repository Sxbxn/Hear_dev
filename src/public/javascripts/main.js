const socket = io();

let nickname = ""; // 닉네임
let roomName = "";

// 닉네임 입력 전, 회의 버튼 숨기기
document.querySelector(".after_nick").style.display = 'none';

// 닉네임 입력 받기 기능
const nickForm = document.querySelector("#nickname");
const nickInput = document.querySelector(".input_nick");

// 코드 입력 받기 기능
const codeForm = document.querySelector("#join_m");
const codeInput = document.querySelector(".input_code");

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
    const head = (Math.floor(Math.random() * 10000) + 1000).toString();
    const center = (Math.floor(Math.random() * 10000) + 1000).toString();
    const tail = (Math.floor(Math.random() * 10000) +1000).toString();
    roomName = head + '-' + center + '-' + tail;
    socket.emit("enter_code", roomName);
    socket.on("enter_code", result => {
      if (!result) {
        const info = {
          nickname : nickname,
          roomName : roomName,
        }
        const infoString = JSON.stringify(info);
        localStorage.setItem('info', infoString);
        location.href = "/meeting";
      } else {
        // 랜덤 변수가 중복될 경우
      }
      socket.off("enter_code");
    });
  }
}

function enterCode() {
  if (roomName == "") {
    roomName = prompt('회의 참여 코드를 입력하세요', 'abcd-100');
  }
  if (roomName != "") {
    socket.emit("enter_code", roomName);
  } else {
    alert("코드를 확인해주세요");
    return;
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

function codeBtnSubmit(event) {
  event.preventDefault();
  if (nickname == "") {
    nickname = prompt('닉네임을 입력하세요', 'nickname');
    if (nickname.length > 0) {
      showBtn(nickname);
    }
    codeInput.value="";
  } else {
    roomName = codeInput.value;
    if (roomName != "") {
      enterCode();
    } else {
      alert("코드를 확인해주세요");
      return;
    }
  }
}
codeForm.addEventListener("submit", codeBtnSubmit);