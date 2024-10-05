const Router = require('express');
const controller = require('../controllers/users-controller');
const handleAuth = require('../middleware/handle-auth');

const router = new Router();

router.post('/registration', controller.register);
router.post('/login', controller.login);
router.get('/auth', handleAuth, controller.checkAuth);
router.get('/', controller.getAll);
router.get('/:id/', controller.getOne);

module.exports = router;