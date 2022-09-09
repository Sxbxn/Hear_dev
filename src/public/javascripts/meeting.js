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

// 회의 코드 복사 기능
function copyCode() {
  const code = document.querySelector(".join_code");

  window.navigator.clipboard.writeText(code.textContent).then(() => {
    alert('회의 코드 복사 완료!');
  });
};

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