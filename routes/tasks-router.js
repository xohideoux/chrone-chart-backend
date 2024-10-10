const Router = require('express');
const controller = require('../controllers/tasks-controller');
const checkRole = require('../middleware/check-role');
const handleAuth = require('../middleware/handle-auth');
const { ADMIN_CODE } = require('../constants/');

const router = new Router();

router.get('/', controller.getAll);
router.get('/get/:id', controller.getOne);
router.get('/report', controller.getReport);
router.post('/create', handleAuth, controller.create);
router.patch('/edit/:id', controller.edit);
router.delete('/delete/:id', checkRole(ADMIN_CODE), controller.delete);
router.get('/statuses/', controller.getStatuses);

module.exports = router;