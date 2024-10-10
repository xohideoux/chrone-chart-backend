const Router = require('express');
const controller = require('../controllers/users-controller');
const handleAuth = require('../middleware/handle-auth');

const router = new Router();

router.post('/registration', controller.register);
router.post('/login', controller.login);
router.post('/role', controller.createRole);
router.get('/activate/:token', controller.activate);
router.get('/auth', handleAuth, controller.checkAuth);
router.get('/', controller.getAll);

module.exports = router;