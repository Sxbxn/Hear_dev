/* 소켓 설정
 * webRTC 설정
 * 버튼 기능 (화면공유, 마이크, 캠, STT, 수화인식, 종료)
 */

const socket = io();

//변수
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const videoCam = document.querySelector(".video_cam");
const peersCam = document.querySelector("#peers_cam");

const audio = document.querySelector("#mic");

const camerasSelect = document.getElementById("cameras");
const audiosSelect = document.getElementById("audios");

const camElement = document.getElementsByClassName("video_cam")[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
canvasElement.style.display = 'none';
const canvasCtx = canvasElement.getContext('2d');

let myStream;
let displayStream;
let roomName = "abcd-123";
let myPeerConnection;
let myDataChannel;


function squaredEuclidean(p, q) {
    let d = 0;
    for (let i = 0; i < p.length; i++) {
        d += (p[i] - q[i]) * (p[i] - q[i]);
    }
    return d;
}
function euclideanDistance(p, q) {
    return Math.sqrt(squaredEuclidean(p, q));
}



class KNN {
  /**
   * @param {Array} dataset
   * @param {Array} labels
   * @param {object} options
   * @param {number} [options.k=numberOfClasses + 1] - Number of neighbors to classify.
   * @param {function} [options.distance=euclideanDistance] - Distance function that takes two parameters.
   */
  constructor(dataset, labels, options = {}) {
    if (dataset === true) {
      const model = labels;
      this.kdTree = new KDTree(model.kdTree, options);
      this.k = model.k;
      this.classes = new Set(model.classes);
      this.isEuclidean = model.isEuclidean;
      return;
    }

    const classes = new Set(labels);

    const { distance = euclideanDistance, k = classes.size + 1 } = options;

    const points = new Array(dataset.length);
    for (let i = 0; i < points.length; ++i) {
      points[i] = dataset[i].slice();
    }

    for (let i = 0; i < labels.length; ++i) {
      points[i].push(labels[i]);
    }

    this.kdTree = new KDTree(points, distance);
    this.k = k;
    this.classes = classes;
    this.isEuclidean = distance === euclideanDistance;
  }

  /**
   * Create a new KNN instance with the given model.
   * @param {object} model
   * @param {function} distance=euclideanDistance - distance function must be provided if the model wasn't trained with euclidean distance.
   * @return {KNN}
   */
  static load(model, distance = euclideanDistance) {
    if (model.name !== 'KNN') {
      throw new Error(`invalid model: ${model.name}`);
    }
    if (!model.isEuclidean && distance === euclideanDistance) {
      throw new Error(
        'a custom distance function was used to create the model. Please provide it again',
      );
    }
    if (model.isEuclidean && distance !== euclideanDistance) {
      throw new Error(
        'the model was created with the default distance function. Do not load it with another one',
      );
    }
    return new KNN(true, model, distance);
  }

  /**
   * Return a JSON containing the kd-tree model.
   * @return {object} JSON KNN model.
   */
  toJSON() {
    return {
      name: 'KNN',
      kdTree: this.kdTree,
      k: this.k,
      classes: Array.from(this.classes),
      isEuclidean: this.isEuclidean,
    };
  }

  /**
   * Predicts the output given the matrix to predict.
   * @param {Array} dataset
   * @return {Array} predictions
   */
  predict(dataset) {
    if (Array.isArray(dataset)) {
      if (typeof dataset[0] === 'number') {
        return getSinglePrediction(this, dataset);
      } else if (
        Array.isArray(dataset[0]) &&
        typeof dataset[0][0] === 'number'
      ) {
        const predictions = new Array(dataset.length);
        for (let i = 0; i < dataset.length; i++) {
          predictions[i] = getSinglePrediction(this, dataset[i]);
        }
        return predictions;
      }
    }
    throw new TypeError('dataset to predict must be an array or a matrix');
  }
}

function getSinglePrediction(knn, currentCase) {
  let nearestPoints = knn.kdTree.nearest(currentCase, knn.k);
  let pointsPerClass = {};
  let predictedClass = -1;
  let maxPoints = -1;
  let lastElement = nearestPoints[0][0].length - 1;

  for (let element of knn.classes) {
    pointsPerClass[element] = 0;
  }

  for (let i = 0; i < nearestPoints.length; ++i) {
    let currentClass = nearestPoints[i][0][lastElement];
    let currentPoints = ++pointsPerClass[currentClass];
    if (currentPoints > maxPoints) {
      predictedClass = currentClass;
      maxPoints = currentPoints;
    }
  }

  return predictedClass;
}

/*
 * Original code from:
 *
 * k-d Tree JavaScript - V 1.01
 *
 * https://github.com/ubilabs/kd-tree-javascript
 *
 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

class Node {
  constructor(obj, dimension, parent) {
    this.obj = obj;
    this.left = null;
    this.right = null;
    this.parent = parent;
    this.dimension = dimension;
  }
}

class KDTree {
  constructor(points, metric) {
    // If points is not an array, assume we're loading a pre-built tree
    if (!Array.isArray(points)) {
      this.dimensions = points.dimensions;
      this.root = points;
      restoreParent(this.root);
    } else {
      this.dimensions = new Array(points[0].length);
      for (let i = 0; i < this.dimensions.length; i++) {
        this.dimensions[i] = i;
      }
      this.root = buildTree(points, 0, null, this.dimensions);
    }
    this.metric = metric;
  }

  // Convert to a JSON serializable structure; this just requires removing
  // the `parent` property
  toJSON() {
    const result = toJSONImpl(this.root, true);
    result.dimensions = this.dimensions;
    return result;
  }

  nearest(point, maxNodes, maxDistance) {
    const metric = this.metric;
    const dimensions = this.dimensions;
    let i;

    const bestNodes = new BinaryHeap((e) => -e[1]);

    function nearestSearch(node) {
      const dimension = dimensions[node.dimension];
      const ownDistance = metric(point, node.obj);
      const linearPoint = {};
      let bestChild, linearDistance, otherChild, i;

      function saveNode(node, distance) {
        bestNodes.push([node, distance]);
        if (bestNodes.size() > maxNodes) {
          bestNodes.pop();
        }
      }

      for (i = 0; i < dimensions.length; i += 1) {
        if (i === node.dimension) {
          linearPoint[dimensions[i]] = point[dimensions[i]];
        } else {
          linearPoint[dimensions[i]] = node.obj[dimensions[i]];
        }
      }

      linearDistance = metric(linearPoint, node.obj);

      if (node.right === null && node.left === null) {
        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance);
        }
        return;
      }

      if (node.right === null) {
        bestChild = node.left;
      } else if (node.left === null) {
        bestChild = node.right;
      } else {
        if (point[dimension] < node.obj[dimension]) {
          bestChild = node.left;
        } else {
          bestChild = node.right;
        }
      }

      nearestSearch(bestChild);

      if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
        saveNode(node, ownDistance);
      }

      if (
        bestNodes.size() < maxNodes ||
        Math.abs(linearDistance) < bestNodes.peek()[1]
      ) {
        if (bestChild === node.left) {
          otherChild = node.right;
        } else {
          otherChild = node.left;
        }
        if (otherChild !== null) {
          nearestSearch(otherChild);
        }
      }
    }

    if (maxDistance) {
      for (i = 0; i < maxNodes; i += 1) {
        bestNodes.push([null, maxDistance]);
      }
    }

    if (this.root) {
      nearestSearch(this.root);
    }

    const result = [];
    for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
      if (bestNodes.content[i][0]) {
        result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
      }
    }
    return result;
  }
}

function toJSONImpl(src) {
  const dest = new Node(src.obj, src.dimension, null);
  if (src.left) dest.left = toJSONImpl(src.left);
  if (src.right) dest.right = toJSONImpl(src.right);
  return dest;
}

function buildTree(points, depth, parent, dimensions) {
  const dim = depth % dimensions.length;

  if (points.length === 0) {
    return null;
  }
  if (points.length === 1) {
    return new Node(points[0], dim, parent);
  }

  points.sort((a, b) => a[dimensions[dim]] - b[dimensions[dim]]);

  const median = Math.floor(points.length / 2);
  const node = new Node(points[median], dim, parent);
  node.left = buildTree(points.slice(0, median), depth + 1, node, dimensions);
  node.right = buildTree(points.slice(median + 1), depth + 1, node, dimensions);

  return node;
}

function restoreParent(root) {
  if (root.left) {
    root.left.parent = root;
    restoreParent(root.left);
  }

  if (root.right) {
    root.right.parent = root;
    restoreParent(root.right);
  }
}

// Binary heap implementation from:
// http://eloquentjavascript.net/appendix2.html
class BinaryHeap {
  constructor(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  push(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  }

  pop() {
    // Store the first element so we can return it later.
    let result = this.content[0];
    // Get the element at the end of the array.
    let end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  peek() {
    return this.content[0];
  }

  size() {
    return this.content.length;
  }

  bubbleUp(n) {
    // Fetch the element that has to be moved.
    let element = this.content[n];
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = Math.floor((n + 1) / 2) - 1;
      const parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      } else {
        // Found a parent that is less, no need to move it further.
        break;
      }
    }
  }

  sinkDown(n) {
    // Look up the target element and its score.
    const length = this.content.length;
    const element = this.content[n];
    const elemScore = this.scoreFunction(element);

    while (true) {
      let child1Score;
      // Compute the indices of the child elements.
      const child2N = (n + 1) * 2;
      const child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      let swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        const child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        const child2 = this.content[child2N];
        const child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      } else {
        // Otherwise, we are done.
        break;
      }
    }
  }
}



let content = null;
let xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "/public/raw/dataSet.txt", false);
xmlhttp.send();
//파일 로드 성공 시 파일에서 읽은 텍스트를 content에 담음
if (xmlhttp.status == 200) {
    content = xmlhttp.responseText;
}
var file_vector = content.split("\r\n");

var angle_list = [];
var label_list = [];

for (const data of file_vector){
   angle_list.push(data.split(',').slice(undefined, 15));
   label_list.push(data.split(',').slice(15)[0]);
}

const knn = new KNN(angle_list, label_list, {k: 3});
console.log(knn);
/*
//장치 선택 (camera)
async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label == camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}

// 장치 선택 (audio)
async function getAudios() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audios = devices.filter((device) => device.kind === "audioinput");
        const currentAudio = myStream.getAudioTracks()[0];
        audios.forEach(audio => {
            const option = document.createElement("option");
            option.value = audio.deviceId;
            option.innerText = audio.label;
            if (currentAudio.label == audio.label) {
                option.selected = true;
            }
            audiosSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}
*/

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

//

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

// 화면공유 버튼 on, off
document.getElementById("screen_sharing").style.display = 'none';
function presentOnOff() {
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
        document.getElementsByClassName("video_cam").style.display = 'none';
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
        document.getElementsByClassName("video_cam").style.display = '';
        document.getElementById("third").style.display = '';
        document.getElementById("screen_sharing").style.display = 'none';
        sharingStop();
    }
}
// 화면공유 기능 on 메서드
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
// 화면공유 기능 off 메서드
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

// 마이크 on, off
function micOnOff() {
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
    }
    // on 상태이면,
    else {
        mic.value = "off";
        const new_span = document.createElement('span');
        new_span.setAttribute("class", "material-icons");
        const new_text = document.createTextNode('mic_off');
        new_span.appendChild(new_text);
        mic.appendChild(new_span);
    }
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
}

// 캠 on, off
function videoOnOff() {
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
    }
    // on 상태이면,
    else {
        video.value = "off";
        const new_span = document.createElement('span');
        new_span.setAttribute("class", "material-icons");
        const new_text = document.createTextNode('videocam_off');
        new_span.appendChild(new_text);
        video.appendChild(new_span);
    }
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
}

function onResults(results) {
  canvasElement.style.display = 'inline';
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    var i = 0
    for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                      {color: '#00FF00', lineWidth: 5});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});

        const v = [[landmarks[1]['x'] - landmarks[0]['x'], landmarks[1]['y'] - landmarks[0]['y'], landmarks[1]['z'] - landmarks[0]['z']],
                   [landmarks[2]['x'] - landmarks[1]['x'], landmarks[2]['y'] - landmarks[1]['y'], landmarks[2]['z'] - landmarks[1]['z']],
                   [landmarks[3]['x'] - landmarks[2]['x'], landmarks[3]['y'] - landmarks[2]['y'], landmarks[3]['z'] - landmarks[2]['z']],
                   [landmarks[4]['x'] - landmarks[3]['x'], landmarks[4]['y'] - landmarks[3]['y'], landmarks[4]['z'] - landmarks[3]['z']],
                   [landmarks[5]['x'] - landmarks[0]['x'], landmarks[5]['y'] - landmarks[0]['y'], landmarks[5]['z'] - landmarks[0]['z']],
                   [landmarks[6]['x'] - landmarks[5]['x'], landmarks[6]['y'] - landmarks[5]['y'], landmarks[6]['z'] - landmarks[5]['z']],
                   [landmarks[7]['x'] - landmarks[6]['x'], landmarks[7]['y'] - landmarks[6]['y'], landmarks[7]['z'] - landmarks[6]['z']],
                   [landmarks[8]['x'] - landmarks[7]['x'], landmarks[8]['y'] - landmarks[7]['y'], landmarks[8]['z'] - landmarks[7]['z']],
                   [landmarks[9]['x'] - landmarks[0]['x'], landmarks[9]['y'] - landmarks[0]['y'], landmarks[9]['z'] - landmarks[0]['z']],
                   [landmarks[10]['x'] - landmarks[9]['x'], landmarks[10]['y'] - landmarks[9]['y'], landmarks[10]['z'] - landmarks[9]['z']],
                   [landmarks[11]['x'] - landmarks[10]['x'], landmarks[11]['y'] - landmarks[10]['y'], landmarks[11]['z'] - landmarks[10]['z']],
                   [landmarks[12]['x'] - landmarks[11]['x'], landmarks[12]['y'] - landmarks[11]['y'], landmarks[12]['z'] - landmarks[11]['z']],
                   [landmarks[13]['x'] - landmarks[0]['x'], landmarks[13]['y'] - landmarks[0]['y'], landmarks[13]['z'] - landmarks[0]['z']],
                   [landmarks[14]['x'] - landmarks[13]['x'], landmarks[14]['y'] - landmarks[13]['y'], landmarks[14]['z'] - landmarks[13]['z']],
                   [landmarks[15]['x'] - landmarks[14]['x'], landmarks[15]['y'] - landmarks[14]['y'], landmarks[15]['z'] - landmarks[14]['z']],
                   [landmarks[16]['x'] - landmarks[15]['x'], landmarks[16]['y'] - landmarks[15]['y'], landmarks[16]['z'] - landmarks[15]['z']],
                   [landmarks[17]['x'] - landmarks[0]['x'], landmarks[17]['y'] - landmarks[0]['y'], landmarks[17]['z'] - landmarks[0]['z']],
                   [landmarks[18]['x'] - landmarks[17]['x'], landmarks[18]['y'] - landmarks[17]['y'], landmarks[18]['z'] - landmarks[17]['z']],
                   [landmarks[19]['x'] - landmarks[18]['x'], landmarks[19]['y'] - landmarks[18]['y'], landmarks[19]['z'] - landmarks[18]['z']],
                   [landmarks[20]['x'] - landmarks[19]['x'], landmarks[20]['y'] - landmarks[19]['y'], landmarks[20]['z'] - landmarks[19]['z']]];

        var v_norm = [];

        for (let i = 0; i < v.length; i++){
            var norm = Math.sqrt(v[i][0] ** 2 + v[i][1] ** 2 + v[i][2] ** 2);
            var div_norm = [v[i][0] / norm, v[i][1] / norm, v[i][2] / norm];
            v_norm[i] = div_norm;
        }

        var v_inner = [];

        var compareV1 = [v_norm[0], v_norm[1], v_norm[2], v_norm[4], v_norm[5], v_norm[6],
                         v_norm[7], v_norm[8], v_norm[9], v_norm[10], v_norm[12], v_norm[13],
                         v_norm[14], v_norm[16], v_norm[17]];
        var compareV2 = [v_norm[1], v_norm[2], v_norm[3], v_norm[5], v_norm[6], v_norm[7],
                         v_norm[9], v_norm[10], v_norm[11], v_norm[13], v_norm[14], v_norm[15],
                         v_norm[17], v_norm[18], v_norm[19]];

        for (let i = 0; i < compareV1.length; i++){
            var sum = 0;
            for (let j = 0; j < 3; j++){
                sum += compareV1[i][j] * compareV2[i][j];
            }
            v_inner.push(sum);
        }

        var angle = [];

        for (let i = 0; i < v_inner.length; i++){
            angle.push(Math.acos(v_inner[i]));
        }

        var ans = knn.predict(angle);
        console.log(ans);

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

    camElement.style.display = 'none';

    const hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});

    hands.setOptions({
        maxNumHands: 2,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        modelComplexity: 1
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
    camElement.style.display = 'inline';
    canvasElement.style.display = 'none';
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
// stt 버튼 on, off
function sttOnOff() {
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

// 수화 인식 버튼 on, off
function slOnOff() {
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

// 종료 버튼
function exitMeeting() {
    window.location.href = "/"
}
