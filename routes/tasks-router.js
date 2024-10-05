const Router = require('express');
const controller = require('../controllers/tasks-controller');
const checkRole = require('../middleware/check-role');
const handleAuth = require('../middleware/handle-auth');
const { ADMIN_CODE } = require('../constants/');

const router = new Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/create', handleAuth, controller.create);
router.patch('/edit/:id', controller.edit);
router.delete('/delete/:id', checkRole(ADMIN_CODE), controller.delete);

module.exports = router;