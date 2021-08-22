let faceapi;
let faceapiResult;

let m5cameraIndex;
let myStream;
let dataConnection;

const sendXfilter = [0, 0, 0, 0, 0];

function getParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// skyway setup
//Peer作成
const peer = new Peer({
  key: "51af5899-2541-43dc-acff-95976dccb605",
  debug: 3,
});
//PeerID取得
peer.on("open", () => {
  // document.getElementById("my-id").textContent = "RoomID: " + peer.id;
});
// 発信処理
document.getElementById("make-call").onclick = makeCall;
// イベントリスナを設置する関数
const setEventListener = (mediaConnection) => {
  mediaConnection.on("stream", (stream) => {
    // video要素にカメラ映像をセットして再生
    const videoElm = document.getElementById('their-video');
    videoElm.srcObject = stream;
  });
};
//着信処理
peer.on("call", (mediaConnection) => {
  mediaConnection.answer(myStream);
  setEventListener(mediaConnection);
});
// data 相手から接続しにきた
peer.on('connection', _dataConnection => {
  console.log('dataConnection connection');
  dataConnection = _dataConnection;
  // dataConnection.once('open', async () => {
  // });
  // dataConnection.on('data', data => {
  //   console.log(data);
  // });
  // dataConnection.once('close', () => {
  //   console.log('dataConnection close');
  // });
});
function makeCall() {
  const theirID = document.getElementById('their-id').value;
  console.log('theirID : ' + theirID);
  const mediaConnection = peer.call(theirID, myStream);
  setEventListener(mediaConnection);

  // 自分から接続しにいく
  dataConnection = peer.connect(theirID);
}

// p5 ml5
async function setup() {
  const capture = await createCapture(VIDEO);
  myStream = capture.elt.srcObject;

  // capture.size(width, height);
  // capture.hide(); // Hide the video element, and just show the canvas
  faceapi = ml5.faceApi(capture, {
    withLandmarks: true,
    withDescriptors: false,
  }, () => {
    console.log('model ready');
    faceapi.detect(gotResults);

    // たぶんモデルの準備のほうが遅い予想
    const rid = getParam('rid');
    if (rid) {
      document.getElementById('their-id').value = rid;
      makeCall();
    }
  });
  function gotResults(err, res) {
    if (err) {
      console.log(err);
      faceapi.detect(gotResults);
    }
    faceapiResult = res;

    if (peer.id && dataConnection) {
      if (faceapiResult && faceapiResult[0]) {
        const faceCener = faceapiResult[0].parts['nose'][0];
        const sendX = map(faceCener.x, 0, 640, 0, 1);
        // console.log(sendX);
        // sendXfilter
        const sendData = { x: sendX };
        // console.log(sendData);
        dataConnection.send(sendData);
      }
    }

    faceapi.detect(gotResults);
  }
}

function draw() {

}

function getFaceRotate(face) {
  // const box = face.
}

function drawBox(detections) {
  for (let i = 0; i < detections.length; i += 1) {
    const alignedRect = detections[i].alignedRect;
    const x = alignedRect._box._x;
    const y = alignedRect._box._y;
    const boxWidth = alignedRect._box._width;
    const boxHeight = alignedRect._box._height;

    noFill();
    stroke(161, 95, 251);
    strokeWeight(2);
    rect(x, y, boxWidth, boxHeight);
  }
}

function drawPart(feature, closed) {
  beginShape();
  for (let i = 0; i < feature.length; i += 1) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    vertex(x, y);
  }

  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

