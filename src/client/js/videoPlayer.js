const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const muteBtn = document.getElementById('mute');
const time = document.getElementById('time');
const volume = document.getElementById('volume');

// video가 멈춰있을 때 클릭하면 play, 재생중일 때 클릭하면 pause
const handlePlayClick = (e) => {
  if(video.paused) {
    video.play();
  } else {
    video.pause();
  }
};
const handlePause = () => {playBtn.innerText = 'Play';}
const handlePlay = () => {playBtn.innerText = 'Pause';}

const handleMute = (e) => {
};




playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMute);
video.addEventListener('pause', handlePause);
video.addEventListener('play', handlePlay);