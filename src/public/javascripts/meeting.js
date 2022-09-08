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