

const CAM_NUM = 4;
const FRAME_RATE = 24;

const imgs = [];
let myImgIndex = 0;
let myCanvas;
let myStream;

let thirData;

function getParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

async function setup() {
  myCanvas = createCanvas(640, 480);

  frameRate(FRAME_RATE);
  // angleMode(DEGREES);

  // m5camera
  for (let i = 0; i < CAM_NUM; i++) {
    // const url = 'https://1.bp.blogspot.com/-l4fWuSze_MI/YHDkJRsVYzI/AAAAAAABdlM/4lid3iHq_aMFybNb9PYCOpNIEtOwgwRFwCNcBGAsYHQ/s755/hengao_mabuta_uragaesu.png';
    const url = 'http://m5camera_' + (i + 1) + '.local:81/stream';
    imgs[i] = createImg(url, '', 'Access-Control-Allow-Origin: *');
    // imgs[i].hide();
    // imgs[i].style('float:left');
    imgs[i].parent('#my-videos');
  }

  console.log(window.location);

  // skyway setup
  //Peer作成
  const peer = new Peer({
    key: "51af5899-2541-43dc-acff-95976dccb605",
    // debug: 3,
  });
  //PeerID取得
  peer.on("open", () => {
    document.getElementById("my-id").textContent = window.location.origin + "/viewer/?rid=" + peer.id;
  });
  // 発信処理
  document.getElementById("make-call").onclick = () => {
    const theirID = document.getElementById('their-id').value;
    console.log('theirID : ' + theirID);
    const mediaConnection = peer.call(theirID, myStream);
    setEventListener(mediaConnection);

    //data
    peer.connect(theirID);
  };
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
  // data
  peer.on('connection', dataConnection => {
    dataConnection.once('open', async () => {
      console.log('dataConnection open');
    });
    dataConnection.on('data', data => {
      // console.log(data);
      thirData = data;
      document.getElementById('log').innerHTML = JSON.stringify(data);
    });
    dataConnection.once('close', () => {
      console.log('dataConnection close');
    });
  });
}

function draw() {
  // background(200);

  // cvss[i].background(frameCount / 10, 0, 0);
  // myCanvas.image(imgs[myImgIndex], 0, 0, 640, 480);
  // image(myCanvas, 0, 0);
  // myCanvas.rect(mouseX, mouseY, 20, 20);
  // myCanvas.text(myImgIndex, 100, 100);

  if (thirData) {
    for (let i = 0; i < CAM_NUM; i++) {
      if (thirData.x < (i + 1) / CAM_NUM) {
        myImgIndex = i;
        break;
      }
    }
  }
  image(imgs[myImgIndex], 0, 0, 640, 480);
}

let isFirstClick = true;
function mousePressed() {

  if (isFirstClick) {
    myStream = myCanvas.elt.captureStream(FRAME_RATE);
    document.getElementById('my-video').srcObject = myStream;
    isFirstClick = false;
  }

  if (mouseX < windowWidth / 2) {
    myImgIndex = 0;
    console.log('stream 0');
  }
  else {
    myImgIndex = 1;
    console.log('stream 1');
  }
  // document.getElementById('my-video').srcObject = myStream;
}

// -----------

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

