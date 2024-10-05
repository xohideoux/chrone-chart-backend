const { Op } = require('sequelize');
const { Task } = require('../models/');
const ApiError = require('../handlers/api-error');

class TaskController {
  async getAll(req, res, next) {
    let { status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    let offset = (page - 1) * limit;

    let where = {};

    if (status) {
      where.status = status;
    }

    try {
      if (dateFrom) {
        const startDate = new Date(dateFrom);
        if (isNaN(startDate.getTime())) {
          return next(ApiError.badRequest("Invalid dateFrom format"));
        }
        where.createdAt = { ...where.createdAt, [Op.gte]: startDate };
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        if (isNaN(endDate.getTime())) {
          return next(ApiError.badRequest("Invalid dateTo format"));
        }
        where.createdAt = { ...where.createdAt, [Op.lte]: endDate };
      }

      const tasks = await Task.findAndCountAll({ where, limit, offset });

      return res.json(tasks);
    } catch (error) {
      return next(ApiError.internal("Error receiving tasks"));
    }
  }

  async getOne(req, res, next) {
    const { id } = req.params;

    try {
      const task = await Task.findByPk(id);

      if (!task) {
        return next(ApiError.badRequest('Task not found'));
      }

      return res.json({ task });
    } catch (err) {
      return next(ApiError.internal('Error receiving task'));
    }
  }

  async create(req, res, next) {
    const title = req.body.title;
    const creator = req.user.id;

    if (!title) {
      return next(ApiError.badRequest('Title is required'));
    }

    try {
      const newTask = { ...req.body, creator }
      const task = await Task.create(newTask);

      return res.json({ task });
    } catch (err) {
      return next(ApiError.internal('Error creating task'));
    }
  }

  async edit(req, res, next) {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return next(ApiError.badRequest('Task not found'));
    }

    try {
      await task.update(req.body);
      return res.json({ task });
    } catch (err) {
      return next(ApiError.internal('Error updating task'));
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return next(ApiError.badRequest('Task not found'));
    }

    try {
      await task.destroy();
      return res.json({message: "Task deleted"})
    } catch (err) {
      return next(ApiError.internal('Error deleting task'));
    }
  }
}

module.exports = new TaskController();