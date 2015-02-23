/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao FileUtil
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var fs = require('fs');

var FileUtil = {};

FileUtil.readFileSync = function(path) {
	return fs.readFileSync(path).toString();
}

/**
 * FileUtil readDirSync
 
 * @param  {String}  path 
 * @return {Array}   file paths.
 */
FileUtil.readDirSync = function(path) {
	var files = fs.readdirSync(path);
	return files;
}

/**
 * FileUtil Check isFile
 
 * @param  {String}  path 
 * @return {Boolean} true|false.
 */
FileUtil.isFile = function(path) {
	if (fs.existsSync(path)) {
		return fs.statSync(path).isFile();
	}
};

/**
 * FileUtil Check isDir
 
 * @param  {String}  path 
 * @return {Boolean} true|false.
 */
FileUtil.isDir = function(path) {
	if (fs.existsSync(path)) {
		return fs.statSync(path).isDirectory();
	}
};

FileUtil.mkDirSync = function(path) {
	return fs.mkdirSync(path);
}

FileUtil.readDirFiles = function(fpath, results) {
	var files = fs.readdirSync(fpath);

	for (var i = 0; i < files.length; i++) {
		var filepath = fpath + '/' + files[i];

		if (this.isDir(filepath)) {
			this.readDirFiles(filepath, results);
		}

		if (this.isFile(filepath)) {
			results.push(filepath);
		}
	}
}

/**
 * FileUtil Check file suffix
 
 * @param {String} fn file name
 * @param {String} suffix suffix string, such as .js, etc.
 */
FileUtil.checkFileType = function(fn, suffix) {
	if (suffix.charAt(0) !== '.') {
		suffix = '.' + suffix;
	}

	if (fn.length <= suffix.length) {
		return false;
	}

	var str = fn.substring(fn.length - suffix.length).toLowerCase();
	suffix = suffix.toLowerCase();
	return str === suffix;
};

/**
 * FileUtil Check file exists
 
 * @param {String}  file path
 * @param {Boolean} true|false.
 */
FileUtil.existsSync = function(path) {
	return fs.existsSync(path);
}

module.exports = FileUtil;