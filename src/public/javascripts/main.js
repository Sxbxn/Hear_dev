// const start = document.querySelector(".start");
const join_btn = document.querySelector(".button.btnBorder.btnLightGray");
// join_btn.onclick = function(event) {

//   start.style.marginLeft = "66%";

//   join_btn.style.display = "none";

//   let f = document.createElement('form');
//   f.setAttribute('class', 'join_meet1');

//   let i = document.createElement('input');
//   i.setAttribute('type', 'text');
//   i.setAttribute('placeholder', '회의 코드 입력');
//   i.setAttribute('required', 'required');
//   i.setAttribute('class', 'input_code');

//   // let b = document.createElement('button');
//   // b.setAttribute('class', 'code_join1');

//   let sp = document.createElement('span');
//   sp.setAttribute('class', 'material-icons');
//   sp.innerText = "check_circle_outline"

//   start.prepend(f);
//   f.appendChild(i);
//   // f.appendChild(b);
//   b.appendChild(sp);
// }

join_btn.onclick = function(event) {
  let inputString = prompt('회의 참여 코드를 입력하세요', 'abcd-100');
  alert(inputString);
}