const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');
const deleteCommentBtn = document.getElementsByClassName('video__comment-delete-btn');

// watch.pug에서 보여주는 것과 같은 댓글창 ui를 똑같이 js로 구현
// 댓글을 등록하면 그 댓글의 text를 받아 댓글 ul의 가장 최신 li로 추가해 실시간으로 댓글이 등록되어 보이는 것 처럼 만듦
const addComment = (text, id) => {
  const videoComments = document.querySelector('.video__comments ul');
  const newComment = document.createElement('li');
  newComment.dataset.id = id;
  newComment.className = 'video__comment';
  const icon = document.createElement('i');
  icon.className = 'fa-solid fa-comment';
  const span = document.createElement('span');
  span.innerText = ` ${text}`
  const span2 = document.createElement("span");
  span2.innerText = " ❌";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
}



// 댓글 폼 제출 시 보안 상 유저의 정보에 대해 프론트 코드에 적지 않는다. 세션으로 어떤 유저가 댓글을 다는지 알 수 있기 때문에 세션을 활용하여 유저를 파악한다.
const handleSubmit = async(event) => {
  event.preventDefault();
  const textarea = form.querySelector('textarea');
  const text = textarea.value
  const videoId = videoContainer.dataset.id;
  // textarea에 아무 내용도 적지 않고 submit 시 return
  if(text === "") {
    return;
  }
  
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({text}),
  });
  
  if(response.status === 201) {
    textarea.value = '';
    const {newCommentId} = await response.json();
    addComment(text, newCommentId);
  }
};

const handleDelete = async (event) => {
  const btn = event.target;
  // 가장 가까운 video__comment 클래스 찾기
  const commentElement = btn.closest('.video__comment'); 
  const commentId = commentElement.dataset.id;

  const confirmDelete = confirm('댓글을 삭제하시겠습니까?');

  if (confirmDelete) 
    try {
      const response = await fetch(`comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        commentElement.remove();
      } else {
        console.error('댓글 삭제 실패');
      }
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
    }
  else {
    return;
  }
};

// deleteCommentBtn이라는 클래스를 가진 요소가 존재할 경우에만 이벤트 리스너를 추가
if (deleteCommentBtn.length > 0) {
  Array.from(deleteCommentBtn).forEach(btn => {
    btn.addEventListener('click', handleDelete);
  });
}

if(form) {
  form.addEventListener('submit', handleSubmit);
};
