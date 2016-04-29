#! /usr/bin/env node
/**
 * Copyright 2016 Open Permissions Platform Coalition
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var fs = require('fs');
var zlib = require('zlib');
var _ = require('lodash');
var async = require('async');
var AWS = require('aws-sdk');
var mime = require('mime');

function walkFiles(dir, fileList) {
  var files = fs.readdirSync(dir);

  return _.reduce(files, function(fileList, file) {
    if (fs.statSync(dir + file).isDirectory()) {
      fileList = walkFiles(dir + file + '/', fileList);
    }
    else {
      fileList.push(dir + file);
    }
    return fileList;
  }, fileList || []);
}

function upload(bucket, key, body, contentType, contentEncoding, callback) {
  process.stdout.write('Uploading ' + key + '..');
  var params = {Body: body, Key: key};
  if (contentType) { params.ContentType = contentType; }
  if (contentEncoding) { params.ContentEncoding = contentEncoding; }

  return bucket.upload(params, function (error, data) {
    if (error) {
      process.stdout.write('error\n' + error + '\n');
      process.exit(1);
    } else {
      process.stdout.write('done\n');
      if (callback) {
        callback();
      }
    }
  }).on('httpUploadProgress', function(e) { process.stdout.write('.'); });
}

function uploadFile(bucket, path, callback) {
  var body = fs.createReadStream(path);
  return upload(bucket, path, body, mime.lookup(path), null, callback);
}

function uploadFiles(bucket, path, callback) {
  var files = walkFiles(path);
  async.mapSeries(files, function(file, c) {
    return uploadFile(bucket, file, c);
  }, function () {
    if (callback) {
      callback();
    }
  });

}

if (process.argv.length === 3) {
  AWS.config.loadFromPath('./deploy/config.json');
  var bucket = new AWS.S3({
    params: {Bucket: process.argv.slice(2)[0]},
    endpoint: 's3-' + AWS.config.region + '.amazonaws.com'
  });
  var bundle = process.stdin.pipe(zlib.createGzip());

  async.series([
    _.partial(upload, bucket, 'scripts/bundle.js', bundle, 'application/javascript', 'gzip'),
    _.partial(uploadFile, bucket, 'index.html'),
    _.partial(uploadFiles, bucket, 'assets/')
  ]);
} else {
  console.log('Please provide a bucket name');
  process.exit(1);
}
