const { Op } = require('sequelize');
const { Task, TaskStatus, User } = require('../models/');
const { Parser } = require('json2csv');
const ApiError = require('../handlers/api-error');

class TaskController {
  async getAll(req, res, next) {
    let { status, dateFrom, dateTo, assignee, page = 1, limit = 12 } = req.query;
    let offset = (page - 1) * limit; // Calculate offset for pagination

    let where = {};

    if (status) {
      where.status = status;
    }

    if (assignee) {
      where.assignee = assignee;
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
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);

        if (isNaN(endDate.getTime())) {
          return next(ApiError.badRequest("Invalid dateTo format"));
        }
        where.createdAt = { ...where.createdAt, [Op.lte]: endDate };
      }

      // Fetch tasks with specified filters and pagination
      const tasks = await Task.findAndCountAll({
        where,
        limit,
        offset,
        attributes: ['id', 'title', 'description', 'deadline'], // Specify fields to retrieve
        include: [
          {
            model: TaskStatus,
            attributes: ['id', 'label'], // Include status
          },
          {
            model: User,
            as: 'creatorUser',
            attributes: ['id', 'email'], // Include creator
          },
          {
            model: User,
            as: 'assigneeUser',
            attributes: ['id', 'email'], // Include assignee
          },
        ],
      });

      return res.json(tasks);
    } catch (error) {
      console.log(error);
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
    const creator = req.user.id; // Get creator's user ID from the authenticated user
    const status = req.body.status || 1; // Status = new if not provided
    const assignee = req.body.assignee || req.user.id; // Creator as assignee if not provided

    if (!title) {
      return next(ApiError.badRequest('Title is required'));
    }

    try {
      const newTask = { ...req.body, creator, assignee, status }
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
      return res.json({ message: "Task deleted" })
    } catch (err) {
      return next(ApiError.internal('Error deleting task'));
    }
  }

  async getReport(req, res, next) {
    let { dateFrom, dateTo, format = 'json' } = req.query;

    // Filter Tasks
    let where = {};

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

    try {
      const tasks = await Task.findAll({ where });
      const reportData = tasks.map(task => ({
        title: task.title,
        deadline: task.deadline,
        status: task.status,
        creator: task.creator
      }));

      // Return report in requested format (JSON or CSV)
      if (format === 'json') {
        return res.json(reportData);
      }

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(reportData); // Convert report data to CSV

      res.header('Content-Type', 'text/csv');
      res.attachment('tasks_report.csv'); // Set filename for download
      return res.send(csv);

    } catch (error) {
      return next(ApiError.internal("Error generating report"));
    }
  }

  async getStatuses(req, res, next) {
    try {
      const statuses = await TaskStatus.findAll();
      return res.json(statuses);

    } catch (error) {
      console.log(error);
      return next(ApiError.internal("Error receiving statuses"));
    }
  }

  async createStatus(req, res, next) {
    const title = req.body.label;

    if (!title) {
      return next(ApiError.badRequest('Title is required'));
    }

    try {
      const status = await TaskStatus.create(req.body);

      return res.json({ status });
    } catch (err) {
      return next(ApiError.internal('Error creating status'));
    }
  }
}

module.exports = new TaskController();