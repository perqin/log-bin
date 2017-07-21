const express = require('express');
const fs = require('fs');
const path = require('path');
const concat = require('concat-stream');
const config = require('./config.json');

const app = express();

app.use((req, res, next) => {
	req.pipe(concat((data) => {
		req.body = data;
		next();
	}));
});
app.use(express.static('public'));

app.get('/logs', (req, res) => {
	listFiles((err, files) => {
		if (err) {
			return res.status(400).end();
		}
		res.status(200).json(files);
	});
});

app.get('/logs/:logId', (req, res) => {
	readPlainText(req.params.logId, (err, text) => {
		if (err) {
			return res.status(404).end();
		}
		res.status(200).send(text);
	});
});

app.post('/logs', (req, res) => {
	const logId = generateLogId();
	saveOrAppendToFile(logId, req.body, (err) => {
		if (err) {
			return res.status(400).send({
				message: err.message
			});
		}
		res.status(201).end();
	});
});

app.post('/logs/:logId', (req, res) => {
	saveOrAppendToFile(req.params.logId, req.body, (err) => {
		if (err) {
			return res.status(400).send({
				message: err.message
			});
		}
		res.status(201).end();
	});
});

app.listen(config.port, () => {
	console.log('Log Bin listening on port ' + config.port + '!');
});

function generateLogId() {
	return 'log_' + Date.now().valueOf();
}

function saveOrAppendToFile(filename, data, callback) {
	const filePath = path.join(config.logDir, filename);
	console.log('saveOrAppendToFile: path = ' + filePath);
	fs.appendFile(filePath, data, callback);
}

function readPlainText(filename, callback) {
	const filePath = path.join(config.logDir, filename);
	console.log('readPlainText: path = ' + filePath);
	fs.readFile(filePath, callback);
}

function listFiles(callback) {
	const filePath = path.join(config.logDir);
	console.log('listFiles: path = ' + filePath);
	fs.readdir(filePath, (err, files) => {
		if (err) {
			return callback(err);
		}
		const theFiles = files.filter((file) => {
			try {
				return fs.statSync(path.join(config.logDir, file)).isFile();
			} catch (err) {
				log.error('Error stat file ', err);
				return false;
			}
		});
		callback(null, theFiles);
	});
}
