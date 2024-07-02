import multer from 'multer';

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = 'Wetube';
  res.locals.loggedInUser = req.session.user || {};
  console.log(res.locals);
  next();
}

// 유저가 로그인 되어 있다면 request를 계속하도록 하고, 아니라면 login페이지로 리다이렉트하는 미들웨어
export const protectorMiddleware = (req, res, next) => {
  if(req.session.loggedIn) {
    return next();
  } else {
    req.flash('error', 'Log in first');
    return res.redirect('/login');
  }
};

// 유저가 로그인되어있지 않다면 request를 계속하도록 하고, 아니라면 home 페이지로 리다이렉트하는 미들웨어
export const publicOnlyMiddleware = (req, res, next) => {
  if(!req.session.loggedIn) {
    return next();
  } else {
    req.flash('error', 'Logout first');
    return res.redirect('/');
  }
};

// 유저가 보낸 파일을 uploads 폴더에 저장하도록 설정하는 미들웨어
// avatar와 video파일 업로드 시 
export const avatarUploadMiddleware = multer({
  dest:'uploads/avatars/',
  limits: {fileSize: 3000000} // 3Mb
});
export const videoUploadMiddleware = multer({
  dest:'uploads/videos/',
  limits: {fileSize: 12000000} // 12Mb
});