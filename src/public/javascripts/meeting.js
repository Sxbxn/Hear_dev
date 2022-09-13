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