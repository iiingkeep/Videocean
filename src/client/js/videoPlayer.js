const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const playBtnIcon = playBtn.querySelector('i');
const muteBtn = document.getElementById('mute');
const muteBtnIcon = muteBtn.querySelector('i');
const volumRange = document.getElementById('volume');
const currenTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const timeline = document.getElementById('timeline');
const fullScreenBtn = document.getElementById('fullScreen');
const fullScreenBtnIcon = fullScreenBtn.querySelector('i');
const videoContainer = document.getElementById('videoContainer');
const videoControls = document.getElementById('videoControls');

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;


// video가 멈춰있을 때 클릭하면 play, 재생중일 때 클릭하면 pause
const handlePlayClick = () => {
  if(video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.className = video.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
};

// video가 음소거 상태일 때 mute버튼을 클릭하면 소리가 나도록, 한번 더 누르면 음소거로 바뀌도록 기능과 텍스트 설정
const handleMuteClick = (e) => {
  if(video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.className = video.muted ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
  volumRange.value = video.muted ? 0 : volumeValue;
};

// volume range bar와 video의 volume을 연결
// volume range bar를 움직여 mute/unmute일 때 상태와 버튼 텍스트 설정
const handleVolumeChange = (e) => {
  const {target: {value},} = e;
  if(video.muted) {
    video.muted = false;
    muteBtnIcon.className = 'fa-solid fa-volume-xmark';
  }
  volumeValue = Number(value);
  video.volume = value;

  if (volumeValue === 0) {
    video.muted = true;
    muteBtnIcon.className = "fa-solid fa-volume-high";
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
};

const handleTimelineChange = (e) => {
  const {target: {value}} = e;
  video.currentTime = value;
};

const handleFullscreen = () => {
  // fullscreen mode라면 해당 element 반환, 아니라면 null반환.
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtnIcon.className = 'fa-solid fa-expand'
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtnIcon.className = 'fa-solid fa-compress'
  }
};

const hideControls = () => videoControls.classList.remove('showing')

const handleMouseMove = () => {
  // video 밖으로 마우스가 나갔다가 다시 들어오면 handleMouseLeave 함수의 setTimeout이 실행되지 않아야 하므로 setTimeout을 지워주고 null로 다시 설정
  if(controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  // 마우스를 계속 움직인다면 아래 설정한 setTimeout을 계속 삭제함으로써 컨트롤이 사라지지 않게 유지함
  if(controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  // video 안에서 마우스 움직이면 showing class를 추가하고 컨트롤을 3초뒤에 숨김
  videoControls.classList.add('showing');
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

// video 밖으로 마우스가 나가면 3초 뒤 컨트롤 안보이도록 클래스 제거 설정
const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

// video control과 관련한 단축키 설정
const handleKeydown = (event) => {
  if (event.code === "Space") {
    handlePlayClick();
  }
  if (event.code === "KeyM") {
    handleMuteClick();
  }
  if (event.code === "KeyF") {
    handleFullscreen ();
  }
};

// fetch(apiUrl)를 이용해 video 재생이 끝나면 해당 url로 POST 요청을 보냄
// dataset: videoContainer에 부여한 'data- attribute' 반환
const handleEnded = () => {
  const {id} = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: 'POST',
  });
}

video.addEventListener('click', handlePlayClick);
playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMuteClick);
volumRange.addEventListener('input', handleVolumeChange);
video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
video.addEventListener('ended', handleEnded);
timeline.addEventListener('input', handleTimelineChange);
fullScreenBtn.addEventListener('click', handleFullscreen);
videoContainer.addEventListener('mousemove', handleMouseMove);
videoContainer.addEventListener('mouseleave', handleMouseLeave);
document.addEventListener('keydown', handleKeydown);