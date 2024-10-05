const Router = require('express');
const controller = require('../controllers/tasks-controller');
const checkRole = require('../middleware/check-role');
const { ADMIN_CODE } = require('../constants/');

const router = new Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.patch('/', controller.edit);
router.delete('/', checkRole(ADMIN_CODE), controller.delete);

module.exports = router;