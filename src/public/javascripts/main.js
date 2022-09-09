// 닉네임 입력 받기 기능
const nickname = document.querySelector("#nickname");

const inputNick = nickname.querySelector(".input_nick");
const buttonNick = nickname.querySelector(".enter_nick");

function nickBtnClick() {
  console.log("hello", inputNick);
}

buttonNick.addEventListener("click", nickBtnClick);



// 오른쪽 상단, 회의 코드 입력 기능
const join_btn = document.querySelector(".button.btnBorder.btnLightGray");

join_btn.onclick = function(event) {
  let inputString = prompt('회의 참여 코드를 입력하세요', 'abcd-100');
  alert(inputString);
}