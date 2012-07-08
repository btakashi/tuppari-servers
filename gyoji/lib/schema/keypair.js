var Schema = require('./schema'),
  util = require('util'),
  uuid = require('node-uuid')
;

/**
 * Keypair table.
 *
 * @constructor
 */
var Keypair = module.exports = function (db, tableName) {
  Schema.call(this, db, tableName, {
    applicationId: String,
    accessKeyId: String
  });
};
util.inherits(Keypair, Schema);

/**
 * Create a new keypair.
 *
 * @param {String} applicationId The owner application ID of the keypair
 * @param {Function} callback
 */
Keypair.prototype.create = function (applicationId, callback) {
  var now = Date.now();

  var keypair = {
    applicationId: applicationId,
    accessKeyId: uuid.v1(),
    accessSecretKey: uuid.v1(),
    createdAt: now,
    updatedAt: now
  };

  this.table.put(keypair).save(function (err) {
    if (err) return callback(err);
    callback(null, keypair);
  });
};

/**
 * Find keypair by applicationId and accessKeyId
 *
 * @param {String} applicationId The owner application ID of the keypair
 * @param {String} accessKeyId The access key id
 * @param {Function(err, keypair)}callback
 */
Keypair.prototype.find = function (applicationId, accessKeyId, callback) {
  var key = {
    applicationId: applicationId,
    accessKeyId: accessKeyId
  };
  return this.findByKey(key, callback);
};