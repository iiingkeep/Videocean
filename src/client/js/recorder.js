const startBtn = document.getElementById('startBtn');
const video = document.getElementById("preview");

let stream;
let recorder;

const handleStop = () => {
  startBtn.innerText = 'Start Recording'
  startBtn.removeEventListener('click', handleStop);
  startBtn.addEventListener('click', handleStart);

  recorder.stop();
};

// createObjectURL: 브라우저 메모리에서만 가능한 URL 생성
// 이벤트 발생 시 얻는 video data URL을 videoFile에 할당
const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    const videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  }
  recorder.start()
};

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