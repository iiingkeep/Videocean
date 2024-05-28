import express from "express";
import { logout, see, startGithubLogin, finishGithubLogin, getEdit, postEdit, getChangePassword, postChangePassword } from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware, avatarUploadMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get('/logout',protectorMiddleware, logout);
userRouter.route('/edit')
.all(protectorMiddleware)
.get(getEdit)
.post(avatarUploadMiddleware.single('avatar'), postEdit);
userRouter.route('/change-password').all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get('/github/start', publicOnlyMiddleware ,startGithubLogin);
userRouter.get('/github/finish', publicOnlyMiddleware ,finishGithubLogin);
userRouter.get('/:id([0-9a-f]{24})', see)
export default userRouter;