/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao CountDownLatch
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'CountDownLatch');

/**
 * CountDownLatch Count down to zero and invoke cb finally.
 *
 * @param  {Number}   count count down number
 * @param  {Function} cb callback function
 * @api public
 */
var CountDownLatch = function(count, cb) {
  this.count = count;
  this.cb = cb;
};

/**
 * CountDownLatch Call when a task finish to count down, when err latch done to 0.
 *
 * @param  {Object}  err
 * @api public
 */
CountDownLatch.prototype.done = function(err) {
  if (this.count < 0) {
    logger.error('illegal state.');
    return;
  }

  if (err) {
    this.count = 0;
    this.cb(err);
    return;
  }

  this.count--;
  if (this.count === 0) {
    this.cb();
  }
};

/**
 * CountDownLatch create a count down latch
 *
 * @param  {Number}   count count down number
 * @param  {Function} cb callback function
 * @api public
 */
module.exports.createCountDownLatch = function(count, cb) {
  if (!count || count <= 0) {
    logger.error('count should be positive.');
    return;
  }
  if (typeof cb !== 'function') {
    logger.error('cb should be a function.');
    return;
  }

  return new CountDownLatch(count, cb);
};