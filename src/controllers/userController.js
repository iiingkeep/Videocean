import User from '../models/User';
import bcrypt from 'bcrypt';

export const getJoin = (req,res) => res.render('Join', {pageTitle: 'Create Account'});

export const postJoin = async(req,res) => {
  const {name, username, email, password,password2, location} = req.body;
  const pageTitle = 'Join';
  if(password !== password2) {
    return res.status(400).render('join', {
      pageTitle,
      errorMessage: 'Password confimation does not match.',
    })
  }
  const exists = await User.exists({$or: [{username}, {email}]});
  if (exists) {
    return res.status(400).render('join', {
      pageTitle,
      errorMessage: 'This username/email is already taken',
    });
  }
  try{
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect('/login');
  } catch (error) {
    return res.status(400).render('join', {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    })
  }
  
}

export const getLogin = (req,res) => res.render('login', {pageTitle: 'Login'});

export const postLogin = async(req,res) => {
  const { username, password } = req.body;
  const pageTitle = 'Login'
  // 입력한 username을 가지는 데이터가 있는지 db에서 확인
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  // 유저가 form에 입력한 password를 bcrypt.compare를 이용해 db에 저장된 해당 username이 등록한 password와 일치하는지 확인
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) {
    return res.status(400).render('login', {
      pageTitle,
      errorMessage: 'Wrong password',
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect('/');
};

// 깃허브를 통한 소셜로그인 진행 시 리다이렉트 할 github url 설정
// github에서 제공하는 baseUrl에 필수 파라미터인 client_id와 추가하고자 하는 다른 파라미터를 쿼리 스트링으로 추가할 수 있도록 입력
export const startGithubLogin = (req,res) => {
  const baseUrl = 'https://github.com/login/oauth/authorize'
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: 'read:user user:email',
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};


// 유저가 정보제공을 동의하며 github로 로그인 할 것을 승인한다면 access_token을 받아 headers에 넣어 필요한 데이터에 접근 가능한 api url에서 유저 정보 받아옴
export const finishGithubLogin = async (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/access_token';
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
  ).json();
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = 'https://api.github.com';
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // 깃허브로 로그인하려고 할 때 verified된 이메일이 없다면 우리는 그 정보를 신뢰할 수 없으니 verified된 이메일이 없다거나 인증이 필요하다는 알림을 줘야 한다.
      // set notification
      return res.redirect('/login');
    }
    // 이미 해당 email을 가진 유저가 존재한다면 로그인 시켜주고 홈으로 리다이렉트
    // 이메일이 없다면 계정 생성. 소셜로그인 했음을 알기 위해 socialOnly: true 추가
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: '',
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    return res.redirect('/login');
  }
};


export const getEdit = (req, res) => {
  return res.render('edit-profile', {pageTitle: 'Edit Profile'})
};

export const postEdit = async(req, res) => {
  // const id = req.session.user.id;와
  // const {name, email, username, location} = req.body;
  // 위의 두 줄을 합쳐서 다음과 같이 적을 수 있다.
  const {
    session: {
      user: {_id, email: sessionEmail, username: sessionUsername, avatarUrl},
    },
    body: {
      name, email, username, location
    },
    file,
  } = req;
  console.log('파일:', file);
  // 유저가 이미 등록된 email이나 username으로 업데이트를 시도하면?
  // 유저가 변경하려는 정보가 무엇인지 body의 데이터와 session의 데이터를 비교해 확인한다.
  // req.body의 정보와 mongoDB에 있는 정보를 비교한다.
  // 같은 email 또는 username이 존재하면 에러메세지와 함께 페이지를 리다이렉트한다.
  const usernameExists =
    username != sessionUsername ? await User.exists({ username }) : undefined;
  const emailExists =
    email != sessionEmail ? await User.exists({ email }) : undefined;
  if (usernameExists || emailExists) {
    return res.status(400).render("edit-profile", {
      pageTitle: "Edit Profile",
      usernameErrorMessage: usernameExists
        ? "This username is already taken"
        : 0,
      emailErrorMessage: emailExists ? "This email is already taken" : 0,
    });
  }
  // 같은 email 또는 username이 존재하지 않으면 정보 수정을 완료
  // findByIdAndUpdate함수에 아래의 세 가지 파라미터 전달.
  // 찾으려는 _id / 업데이트 할 항목 / 업데이트 후 가장 최신 사항을 반영할 것(new: true)
  const updatedUser = await User.findByIdAndUpdate(
    _id, 
    {
      // 유저가 avatar를 변경하려고 파일을 추가하면 file.path가 생긴다(uploads/filename) 하지만 avatar 변경을 하지 않고 다른 정보만 변경한다면 file자체는 undefined가 된다.
      // 그렇기에 파일을 업로드 할 때만 그 파일의 file.path를 avatarUrl에 업데이트하고, 아니라면 session에 있는 기존 aratarUrl 사용
    avatarUrl: file ? file.path : avatarUrl,
    name,
    email,
    username,
    location,
    },
    {new: true});
    req.session.user = updatedUser;
  return res.redirect('/users/edit');
};


export const logout = (req,res) => {
  req.session.user = null;
  res.locals.loggedInUser = req.session.user;
  req.session.loggedIn = false;
  req.flash('info', 'Bye Bye');
  return res.redirect('/')
};

// 패스워드 변경 페이지 렌더링
// 깃허브로 로그인 한 유저의 경우 패스워드가 없으므로 이 페이지에 접근X
export const getChangePassword = (req,res) => {
  if(req.session.user.socialOnly === true) {
    req.flash('error', "Can't change password. ");
    return res.redirect('/');
  }
  return res.render('users/change-password', {pageTitle: 'Change Password'});
}

export const postChangePassword = async(req,res) => {
  const {
    session: {
      user: {_id, password},
    },
    body: {
      oldPassword, 
      newPassword,
      newPassword2
    },
  } = req;
  // 기존의 비밀번호가 맞는지 확인
  const oldPasswordConfirmation = await bcrypt.compare(oldPassword, password);
  if(!oldPasswordConfirmation) {
    return res.status(400).render('users/change-password', {
      pageTitle: 'Change Password',
      errorMessage: 'The current password is incorrect',
    });
  }
  // 새로 입력한 password와 password comfirmation 일치여부 확인
  if(newPassword !== newPassword2) {
    return res.status(400).render('users/change-password', {
      pageTitle: 'Change Password',
      errorMessage: 'The Password does not match',
    });
  }
  // 입력한 password가 모두 일치할 경우 해당 유저의 id로 유저 정보를 찾아 DB에 패스워드 변경하여 저장. 단, save()를 통해 새 password를 해시 후 저장.
  // 세션의 password 데이터도 업데이트 해준 뒤 새로운 password로 로그인 하도록 로그아웃 조치
  const user = await User.findById('_id');
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;
  req.flash('info', 'Password Update')
  return res.redirect('/logout');
}

// 유저의 profile페이지 렌더링.
// 이 페이지는 누구나 접근 가능해야 한다 = id를 params에서 가져와야 한다.
export const see = async(req,res) => {
  const {id} = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if(!user) {
    return res.status(404).render('404', {pageTitle: 'User not found'})
  };
  return res.render('users/profile', {
    pageTitle: `${user.name}'s Profile`,
    user
  });
};