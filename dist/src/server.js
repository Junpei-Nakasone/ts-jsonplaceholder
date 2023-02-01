"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_config_1 = __importDefault(require("./config/database.config"));
const uuid_1 = require("uuid");
const model_1 = require("./model");
const validator_1 = __importDefault(require("./validator"));
const express_validator_1 = require("express-validator");
const middleware_1 = __importDefault(require("./middleware"));
database_config_1.default.sync().then(() => {
    console.log('connect to DB');
});
const app = (0, express_1.default)();
const port = 9000;
app.use(express_1.default.json());
app.post('/create', validator_1.default.checkCreateTodo(), middleware_1.default.handleValidationError, (req, res, next) => {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.json(error);
    }
    next();
}, async (req, res) => {
    const id = (0, uuid_1.v4)();
    try {
        const record = await model_1.TodoInstance.create({ ...req.body, id });
        return res.json({ record, msg: 'Successfully create todo' });
    }
    catch (e) {
        return res.json({ msg: 'fail to create', status: 500, route: '/create' });
    }
});
app.get('/read', validator_1.default.checkReadTodo(), middleware_1.default.handleValidationError);
app.get('/read/:id', validator_1.default.checkIdParam(), middleware_1.default.handleValidationError, async (req, res) => {
    try {
        const { id } = req.params;
        const records = await model_1.TodoInstance.findOne({ where: { id } });
        return res.json(records);
    }
    catch (e) {
        return res.json({ msg: 'fail to read', status: 500, route: 'read/:id' });
    }
});
app.put('/update/:id', validator_1.default.checkIdParam(), middleware_1.default.handleValidationError, async (req, res) => {
    try {
        const { id } = req.params;
        const record = await model_1.TodoInstance.findOne({ where: { id } });
        if (!record) {
            return res.json({ msg: 'Can not find existing record' });
        }
        const updatedRecord = await record.update({
            completed: !record.getDataValue('completed')
        });
        return res.json({ record: updatedRecord });
    }
    catch (e) {
        return res.json({ msg: 'fail to read', status: 500, route: '/update/:id' });
    }
});
app.delete('/delete/:id', validator_1.default.checkIdParam(), middleware_1.default.handleValidationError, async (req, res) => {
    try {
        const { id } = req.params;
        const record = await model_1.TodoInstance.findOne({ where: { id } });
        if (!record) {
            return res.json({ msg: 'Can not find existing record' });
        }
        const deletedRecord = await record.destroy();
        return res.json({ deletedRecord });
    }
    catch (e) {
        return res.json({ msg: 'fail to read', status: 500, route: '/delete/:id' });
    }
});
app.listen(port, () => {
    console.log('server is running on port ' + port);
});
