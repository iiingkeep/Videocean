const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const muteBtn = document.getElementById('mute');
const volumRange = document.getElementById('volume');
const currenTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const timeline = document.getElementById('timeline');
const fullScreenBtn = document.getElementById('fullScreen');
const videoContainer = document.getElementById('videoContainer')


let volumeValue = 0.5;
video.volume = volumeValue;

// video가 멈춰있을 때 클릭하면 play, 재생중일 때 클릭하면 pause
const handlePlayClick = (e) => {
  if(video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.play ? 'Pause' : 'Play'
};

const handleMuteClick = (e) => {
  if(video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (e) => {
  const {target: {value},} = e;
  if(video.muted) {
    video.muted = false;
    muteBtn.innerText = 'Mute';
  }
  volumeValue = Number(value);
  video.volume = value;

  if (volumeValue === 0) {
    video.muted = true;
    muteBtn.innerText = "Unmute";
    }
  }

// 영상의 시간을 00:00:00 의 형태로 포맷하기 위한 함수
// new Date(밀리초)을 사용하면 반환되는 데이터에서 시간 부분만 가져와 사용하는 방법
const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(11,19);

// metadata: 비디오를 제외한 모든 부가적인 것 (시간, 크기 등 )
// 영상의 전체 재생시간 로딩
const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
}

// 영상에서 현재 재생되고있는 부분의 시간 로딩
const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
}

const handleTimelineChange = (e) => {
  const {target: {value}} = e;
  video.currentTime = value;
}

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtn.innerText = 'Enter Full Screen'
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerText = 'Exit Full Screen'
  }
}

playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMuteClick);
volumRange.addEventListener('input', handleVolumeChange);
video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
timeline.addEventListener('input', handleTimelineChange);
fullScreenBtn.addEventListener('click', handleFullscreen);