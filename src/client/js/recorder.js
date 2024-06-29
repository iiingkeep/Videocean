import {  FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const startBtn = document.getElementById('startBtn');
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = async() => {
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  const ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => {
    console.log(message);
    });
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  await ffmpeg.writeFile('recording.webm', await fetchFile(videoFile)); // 가상 컴퓨터에 파일 생성
  // input으로 recording.webm파일을 받아 output으로 output.mp4로 변환. (recording.webm => output.mp4)
  // -r, 60: 영상을 초당 60프레임으로 인코딩하여 더 빠르게 영상 인코딩
  await ffmpeg.exec(['-i', 'recording.webm', '-r', '60', 'output.mp4']);
  // 영상의 첫 번째 프레임(=00:00:01초)의 스크린샷을 1번 찍음
  await ffmpeg.exec(['-i', 'recording.webm', '-ss', '00:00:01', '-frames:v', '1', 'thumbnail.jpg']);
  

  const mp4File = await ffmpeg.readFile('output.mp4');
  const thumbFile = await ffmpeg.readFile('thumbnail.jpg')

  const mp4Blob = new Blob([mp4File.buffer], {type: 'video/mp4'});
  const thumbBlob = new Blob([thumbFile.buffer], {type: 'image/jpg'});
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  const a = document.createElement('a');
  a.href = mp4Url;
  a.download = 'MyRecording.mp4';
  document.body.appendChild(a);
  a.click();
  const thumbA = document.createElement('a');
  thumbA.href = thumbUrl;
  thumbA.download = 'MyThumbnail.jpg';
  document.body.appendChild(thumbA);
  thumbA.click();

  await ffmpeg.deleteFile('recording.webm');
  await ffmpeg.deleteFile('output.mp4');
  await ffmpeg.deleteFile('thumbnail.jpg');

  URL.revokeObjectURL(videoFile);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
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