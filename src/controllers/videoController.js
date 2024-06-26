import Video from '../models/Video';
import User from "../models/User";
import Comment from "../models/Comment";

// export const home =(req,res) => {
//   Video.find({}, (error, videos) => {
//   if(error) {
//   return res.render('server-error');
//   }
//     return res.render('home', {pageTitle: 'Home', videos});
//   })
//   };

// export const home = (req,res) => {
//   Video.find({})
//   .then((videos) => {
//     console.log('videos', videos);
//     return res.render('home', {pageTitle: 'Home', videos: [] });
//   })
//   .catch((error) => {
//     console.log('error', error);
//   })
// }
export const home = async(req,res) => {
  const videos = await Video.find({}).sort({createdAt: 'desc'}).populate('owner')
    return res.render('home', {pageTitle: 'Home', videos});
}

export const watch = async(req, res) => {
  const {id} = req.params;
  const video = await Video.findById(id).populate('owner').populate('comments');
  if(video) {
    return res.render('watch', {pageTitle: video.title, video });
  }
  return res.render('404', {pageTitle: 'Video not found'});
}

export const getEdit = async(req,res) => {
  const {
    user: { _id},
  } = req.session;
  const {id} = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render('404', {pageTitle: 'Video not found'});
  };
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect('/'); //Forbidden
  }
  return res.render('edit', {pageTitle: `Edit ${video.title}`, video});
}

export const postEdit = async(req,res) => {
  const {
    user: { _id},
  } = req.session;
  const {id} = req.params;
  const {title, description, hashtags} = req.body;
  const video = await Video.exists({_id: id});
  if(!video) {
    return res.render('404', {pageTitle: 'Video not found'});
  };
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect('/'); //Forbidden
  };
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  })
  return res.redirect(`/videos/${id}`);
}

export const getUpload = (req,res) => {
  return res.render('upload', {pageTitle: 'Upload Video'});
}
export const postUpload = async(req,res) => {
  const {
    user: { _id },
  } = req.session;
  const { path: fileUrl } = req.file;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.unshift(newVideo._id);
    
    user.save();
    return res.redirect('/');
  } catch(error) {
    return res.status(400).render('upload', {
      pageTitle: "Upload Video", 
      errorMessage: error._message,});
  }
}

export const deleteVideo = async(req,res) => {
  const {
    user: { _id},
  } = req.session;
  const {id} = req.params;
  const video = await Video.findById(id);
  if(!video) {
    return res.render('404', {pageTitle: 'Video not found'});
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect('/'); //Forbidden
  };
  await Video.findByIdAndDelete(id);
  return res.redirect('/');
}

export const search = async(req,res) => {
  const {keyword} = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, 'i') //keyword를 포함하는 title을 검색
      },
    }).populate("owner");
  }
  return res.render('search', {pageTitle:'Search', videos});
};

// videoPlayer.js의 handleEnded 이벤트로인해 POST요청을 받으면 다음의 함수를 실행하여 video의 조회수를 1 증가시킨다.
// sendStatus(codenumber): 상태코드를 보내고 연결을 끊는다.
// status(codenumber): 상태코드를 보내기만 하여 pending 상태가 된다. render나 redirect등으로 응답하여 연결을 끊어줘야 한다.
export const registerView = async(req,res) => {
  const {id} = req.params;
  const video = await Video.findById(id);
  if(!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

// 유저가 댓글 등록 시 DB에 데이터 저장
export const createComment = async(req,res) => {
  const {
    params: {id},
    body: {text},
    session: {user},
  } = req;
  const video = await Video.findById(id);
  if(!video) {
    return res.sendStatus(404);
  };
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({newCommentId: comment._id});
};

export const deleteComment = async(req,res) => {
  const {
    user: { _id},
  } = req.session;
  const {id} = req.params;
  const comment = await Comment.findById(id);
  console.log(comment)
  if(!comment) {
    return res.render('404', {pageTitle: 'comment not found'});
  }
  if (String(comment.owner) !== String(_id)) {
    return res.status(403).redirect('/'); //Forbidden
  };
  await Comment.findByIdAndDelete(id);
  return res.sendStatus(201);
};