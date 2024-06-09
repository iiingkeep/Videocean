const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');

// 댓글 폼 제출 시 보안 상 유저의 정보에 대해 프론트 코드에 적지 않는다. 세션으로 어떤 유저가 댓글을 다는지 알 수 있기 때문에 세션을 활용하여 유저를 파악한다.
const handleSubmit = (event) => {
  event.preventDefault();
  const textarea = form.querySelector('textarea');
  const text = textarea.value
  const videoId = videoContainer.dataset.id;
  // textarea에 아무 내용도 적지 않고 submit 시 return
  if(trim(text) === "") {
    return;
  }
  fetch(`/api/videos/${videoId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text
    },
    )
  })
};

if(form) {
  form.addEventListener('submit', handleSubmit);
};
