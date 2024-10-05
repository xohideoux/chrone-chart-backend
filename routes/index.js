const Router = require('express');
const usersRouter = require('./users-router');
const tasksRouter = require('./tasks-router');

const router = new Router();

router.use('/users', usersRouter);
router.use('/tasks', tasksRouter);

module.exports = router;