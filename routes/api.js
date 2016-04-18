var express = require('express');
var router = express.Router();
var path = require('path');
var Q = require('q');
var url = require('url');

var _ = require('lodash');
var request = require('request');

// Setup some data we'll need from FB
initData();

router.post('/test/:thing', function(req,res) {
 res.status(200).json('OK: ' + req.thing);
});

module.exports = router;

function initData() {
  return;
}


