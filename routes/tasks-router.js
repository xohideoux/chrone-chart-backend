const Router = require('express');
const controller = require('../controllers/tasks-controller');

const router = new Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.patch('/', controller.edit);
router.delete('/', controller.delete);

module.exports = router;