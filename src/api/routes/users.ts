import { Router, Request, Response, NextFunction } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import Logger from '../../loaders/logger';
import { IUserforSignUp, IUserInfo } from '../../interfaces/user';
import {
  createUser,
  getAllUser,
  getUserByUserInfo,
  deleteUser,
} from '../../services/user';
import {
  SIGN_UP_SUCCESS,
  EXIST_USER,
  GET_ALL_USER_SUCCESS,
  GET_ONE_USER_SUCCESS,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,
} from '../../util/response/message';
import response from '../../util/response';

const userRouter = Router();

userRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      userId: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, userId } = req.body;
    try {
      const existUser = await getUserByUserInfo({ email, userId });
      if (existUser) {
        return res.status(409).json(response.response409(EXIST_USER));
      }
      await createUser(req.body as IUserforSignUp);
      return res.status(200).json(response.response200(SIGN_UP_SUCCESS));
    } catch (err) {
      Logger.error('🔥 error %o', err);
      return next(err);
    }
  },
);

userRouter.get(
  '/',
  celebrate({
    [Segments.QUERY]: {
      id: Joi.number().integer(),
      email: Joi.string().email(),
      userId: Joi.string(),
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, email, userId } = req.query;
    try {
      if (!id && !email && !userId) {
        const allUser = await getAllUser();
        return res
          .status(200)
          .json(response.response200(GET_ALL_USER_SUCCESS, allUser));
      }
      const user = await getUserByUserInfo(req.query as IUserInfo);
      if (user) {
        return res
          .status(200)
          .json(response.response200(GET_ONE_USER_SUCCESS, user));
      }
      return res.status(204).end();
    } catch (err) {
      Logger.error('🔥 error %o', err);
      return next(err);
    }
  },
);

userRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.number().integer().required(),
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    try {
      const deletedUser = await deleteUser(id);
      if (deletedUser) {
        return res
          .status(200)
          .json(response.response200(DELETE_USER_SUCCESS, deletedUser));
      }
      return res.status(400).json(response.response400(DELETE_USER_FAIL));
    } catch (err) {
      Logger.error('🔥 error %o', err);
      return next(err);
    }
  },
);

export default userRouter;
