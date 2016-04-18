var express = require('express');
var router = express.Router();
var util = require('util');
var path = require('path');
var Q = require('q');

var fb = require('ncfirebase');
var tracking = require('nctracking');

var utils = require('utils');
var moment = require('moment');
var _ = require('lodash');
var request = require('request');

var guidesStatusData = {};

var divisions = {};
initData();


// Landing page. 
// Get list of guides available
router.get('/guides/:division/:email', function(req, res, next) {
  // console.log(req.params.division);
  // console.log(req.params.email);

  // Get session params from click redirect
  console.log("clickTrack: ", req.session.clickTrack);

  var divisionPrefix = req.params.division;
  var email = req.params.email;
  var statusRef = fb.divisionsRef.child(divisionPrefix + '/status');

  // TODO: Check for cookie/local storage

  // Tracking payload
  var payload={};
  payload.division = divisions[divisionPrefix].name;
  payload.division_id = divisions[divisionPrefix].key;
  payload.division_prefix = divisionPrefix;
  payload.email = email;

  var clickTrack = req.session.clickTrack;
  // console.log('CLICKTRACK: ', clickTrack);
  // res.send('Testing');
  // return;


//  CLICKTRACK:  { 
//   guide_id: '-K31J6f21I4u6mRJAMEh',
//   guide_name: 'Form Tool Solutions',
//   guide_revision: '20151209-205417453',
//   guide_published: '1449712457',
//   guide_filename: 'ag-cdr-mamc.pdf',
//   email_uuid: 'e569c137-dfe9-46e1-acfd-c02f11b86a73',
//   email_name: 'Dave Q. Salesperson',
//   r: 'http://localhost:3000/team/guides/cdr/dave@netcrafters.com' }

  if(clickTrack) {
//    req.session.clickTrack=null;
    payload.guide_id = clickTrack.guide_id;
    payload.guide_name = clickTrack.guide_name;
    payload.guide_revision = clickTrack.guide_revision;
    payload.guide_published = clickTrack.guide_published;
    payload.guide_filename = clickTrack.guide_filename;

    payload.email_uuid = clickTrack.email_uuid;
    payload.email_name = clickTrack.email_name;    
  } else {
    payload.clickTrack = false;
  }


//  res.render('guides');

  console.log("PAYLOAD: ", payload);

  checkForContactInDivision(divisionPrefix,email).then(
    function(data) {
      tracking.track({group: 'listing', payload: payload});
      res.render('guides',{contact: data.contact, division: data.division, divisionPrefix: req.params.division, apiUrl: process.env.GUIDES_API_URL});
    }, function(err) {
      res.status(403).send("Invalid Email Provided - Please Contact Your Manager.");
    }
  );

});

router.get('/download/:division/:email/:key/:revision', function(req,res) {

  var divisionPrefix = req.params.division;
  var email = req.params.email;
  var guideKey = req.params.key;
  var revision = req.params.revision;
  var statusRef = fb.divisionsRef.child(divisionPrefix + '/status');

  var safe_email = email.replace('.',',');

  // Tracking payload
  var payload={};
  payload.division = divisions[divisionPrefix].name;
  payload.division_id = divisions[divisionPrefix].key;
  payload.division_prefix = divisionPrefix;
  payload.email = email;

  var clickTrack = req.session.clickTrack;

  if(clickTrack) {
    payload.guide_id = clickTrack.guide_id;
    payload.guide_name = clickTrack.guide_name;
    payload.guide_revision = clickTrack.guide_revision;
    payload.guide_published = clickTrack.guide_published;
    payload.guide_filename = clickTrack.guide_filename;

    payload.email_uuid = clickTrack.email_uuid;
    payload.email_name = clickTrack.email_name;    
  } else {
    payload.clickTrack = false;
  }

  
  checkForContactInDivision(divisionPrefix,email).then(
    function(data) {
//      console.log("Found contact in Division");
      var locationRef = statusRef.child(guideKey);
      locationRef.once('value',function(snap) {
        if(snap.exists()) {
          
//          console.log("Got status");
          var guideStatus = snap.val();
//          console.log(guideStatus);

          payload.downloaded = utils.getTimeStamp();

          tracking.track({
            group: 'internalDownload',
            payload: payload
          });          

          // STAT
          res.redirect(guideStatus.location);

          // NOTE: This is not sending a proper pdf. For some reason the PDF is empty.
          //
          // STAT - Contact Download PDF (Revision) - Attempt
          // var pdf = request.get(guideStatus.location, function(err,response,body) {
          //   // console.log("Trying to fetch: " +  guideStatus.location);
          //   // console.log(response.statusCode);
          //   if(!err && response.statusCode == 200) {
          //     //console.log(body);
          //     res.type('application/pdf')
          //     res.set('Content-Disposition', 'attachment; filename=' + guideStatus.filename);
          //     res.send(body);

          //     // STAT - Contact Downloaded PDF (Revision) - Completed
          //     var downloadData={downloaded: moment().unix() * 1000};
          //     fb.divisionsRef.child(divisionPrefix + '/downloads').child(safe_email).child(guideKey).child(revision).set(downloadData);
          //     console.log(downloadData);

          //   } else {
          //     res.status(500).send('Can Not Read PDF');
          //   }
          // });

        } else {
          res.status(404).send("Can Not Locate File");
        }
      })
    },
    function(err) {
      res.status(403).send("Invalid Email Provided - Please Contact Your Manager.")
    }
  );

});



module.exports = router;

function initData() {
  // Get division data (note: Logo not walked like wh.js)
  fb.whDivisionsRef.on('value',function(snap) {
    var dData = snap.val();
    _.forEach(dData, function(v,k) {
      v.key=k;
      divisions[v.sku_prefix]=v;
    });
  });
}

function checkForContactInDivision(divisionPrefix,email) {
  console.log('In checkForContactInDivision...');
  var deferred = Q.defer();
  // Go get the divisions' contacts
  fb.whDivisionsRef.once('value', function(snap) {
    if(snap.exists()) {
      var divisions = snap.val();
      _.forEach(divisions,function(v,k,i) {
        console.log("Found Division: ", k);
        // Found division
        if(v.sku_prefix == divisionPrefix) {
          if(v.contacts) {
            v.contacts.forEach(function(c) {
              if(c.email == email) {
                c.decoded_email = email.replace('@','%40');
                console.log("Resolving...");
                deferred.resolve({contact:c,division:v});
              }
            });
          }
        }
      });
      deferred.reject();
    } else {
      deferred.reject();
    }
  });
  return deferred.promise;
}