const express = require('express');

const userRouter = express.Router();


userRouter.post('/auth/register');
userRouter.get('/Profile');
userRouter.get('/admin/getAllUsers')
userRouter.post('/auth/login');
userRouter.put('/admin/update');
userRouter.put('/updateProfile')
userRouter.delete('/admin/delete/:id');
userRouter.delete('/delete/:id');



module.exports = userRouter;