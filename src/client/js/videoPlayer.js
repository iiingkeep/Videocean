const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const muteBtn = document.getElementById('mute');
const time = document.getElementById('time');
const volumRange = document.getElementById('volume');

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


playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMuteClick);
volumRange.addEventListener('input', handleVolumeChange);