const startBtn = document.getElementById('startBtn');
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
  const a = document.createElement('a');
  a.href = videoFile;
  a.download = 'MyRecording.webm';
  document.body.appendChild(a);
  a.click();
}

const handleStop = () => {
  startBtn.innerText = 'Download Recording'
  startBtn.removeEventListener('click', handleStop);
  startBtn.addEventListener('click', handleDownload);
  recorder.stop();
};

// createObjectURL: 브라우저 메모리에서만 가능한 URL 생성
// 이벤트 발생 시 얻는 video data URL을 videoFile에 할당
const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, {mimeType: 'video/webm'});
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  }
  recorder.start()
};


// mediaDevices: 마이크, 카메라와 같은 미디어 장비들에 접근
// stream의 사용을 위해 src가 아닌 srcObject 사용(실시간)
const init = async() => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: { width: 200, height: 100},
  });
  video.srcObject = stream;
  video.play();
}

init();

startBtn.addEventListener('click', handleStart);