const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');
const textarea = form.querySelector('textarea');
const btn = form.querySelector('button');


// 댓글 폼 제출 시 보안 상 유저의 정보에 대해 프론트 코드에 적지 않는다. 세션으로 어떤 유저가 댓글을 다는지 알 수 있기 때문에 세션을 활용하여 유저를 파악한다.
const handleSubmit = (event) => {
  event.preventDefault();
  const text = textarea.value
  const video = videoContainer.dataset.id
}

form.addEventListener('submit', handleSubmit);