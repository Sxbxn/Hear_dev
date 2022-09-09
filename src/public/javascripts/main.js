let nickname = ""; // 닉네임

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

    const startMeeting = document.querySelector(".start_meeting");
    //startMeeting.classList.remove('disable')    
  }
}

function startMeeting() {
  if (nickname == "") {
    console.log("11");
    nickname = prompt('닉네임을 입력하세요', 'nickname');
  } else {
    const info = {
      nickname : nickname,
      roomName : "abcd-123",
    }
    const infoString = JSON.stringify(info);
    localStorage.setItem('info', infoString);
    location.href = "/meeting";
  }
  if (nickname.length > 0) {
    showBtn(nickname);
  }

}

// 오른쪽 상단, 회의 코드 입력 기능
const join_btn = document.querySelector(".button.btnBorder.btnLightGray");
join_btn.onclick = function(event) {
  console.log(nickname);

  let inputString = prompt('회의 참여 코드를 입력하세요', 'abcd-100');
  alert(inputString);
}