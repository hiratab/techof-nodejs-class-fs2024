const express = require('express');

const { signUp, login, getUsers } = require('../services/userService');
const { sendForgotPasswordEmail } = require('../services/sendMailService')
const {
  verifyAuthorizationHeaderMiddleware,
  validateAccessTokenMiddleware,
  getUserMiddleware,
  getUserByEmailMiddleware,
  validateUserPermissionMiddleware,
} = require('../middlewares');

const userRouter = express.Router();

userRouter.post('/sign-up', async (req, res, next) => {
  const {
    email,
    password,
    firstName,
    lastName,
    photo
  } = req.body;

  try {
    const user = await signUp({
      email,
      password,
      firstName,
      lastName,
      photo
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      "success": false,
      "message": error
    })
  }
});

userRouter.post('/login', async (req, res, next) => {
  try {
    const {
      email,
      password
    } = req.body;

    const { user, accessToken } = await login({
      email,
      password
    });

    res
      .setHeader(
        'Set-Cookie',
        `accessToken=${accessToken}; Max-Age=3600; HttpOnly`
      )
      .json({
        success: true,
        user,
        accessToken
      })

  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized'
    })
  }
});

userRouter.post('/reset-password',
  getUserByEmailMiddleware,
  (req, res, next) => {
    if (!req.user) {
      return res.json({
        success: true,
        message: 'E-mail enviado com sucesso'
      })
    }

    next();
  },
  async (req, res, next) => {
    await sendForgotPasswordEmail({
      resetPasswordToken: 123,
      email: 'bruno@bruno.brn'
    });

    res.json({
      success: true,
      message: 'E-mail enviado com sucesso'
    })
  }
)

userRouter.get('',
  verifyAuthorizationHeaderMiddleware,
  validateAccessTokenMiddleware,
  getUserMiddleware,
  validateUserPermissionMiddleware('user'),
  async (req, res, next) => {
    try {
      const users = await getUsers();

      return res.send({
        success: true,
        users
      })
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        error
      })
    }
  }
);

module.exports = userRouter;
