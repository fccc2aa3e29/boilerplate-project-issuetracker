/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
    
    .get(function (req, res, next){
      
    var project = req.params.project;
    
    if (req.query._id) {req.query._id = new ObjectId(req.query.id);}
    if (req.query.open) {req.query.open = req.query.open.toLowerCase() == 'true';}
    
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      
      db.collection(project).find(req.query).toArray((err, results) => {
        if (err) return next(err);
        res.send(results);
      
      });
    });
  })
    
    .post(function (req, res, next){
    
    var project = req.params.project;
    if (req.body.issue_title && req.body.issue_text && req.body.created_by){
      const date = new Date();
      MongoClient.connect(CONNECTION_STRING, function(err, db){
        db.collection(project).insertOne({...req.body, created_on: date, updated_on: date, open: true}, (err, data) => {
          if (err) return next(err);
          res.json(data.ops[0]);
        });
      });
    }
    else{
     res.send('missing required fields'); 
    }
  })
    
    .put(function (req, res){
      
    var project = req.params.project;
    const id = req.body._id;
    delete req.body._id;
    if (req.body.issue_title || req.body.issue_text || req.body.created_by || req.body.assigned_to || req.body.status_text || req.body.open){
      
      MongoClient.connect(CONNECTION_STRING, function(err, db){
        req.body.open = !req.body.open;
        db.collection(project).updateOne({_id: new ObjectId(id)}, {$set: {...req.body, updated_on: new Date()}}, (err, result) => {
          if (err){
            res.send("could not update" + id);
          }
          res.send("successfully updated");
        });
      });
    }
    else{
      res.send('no updated field sent');
    }
  })
    
    .delete(function (req, res){
      
    var project = req.params.project;
    const id = req.body._id;
    if (!id){
      res.send("_id error");
    }
    else{
    
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      
      db.collection(project).deleteOne({_id: new ObjectId(id)}, (err, result) => {
        if (err) res.send("could not delete" + id);
        res.send("deleted " + id);
      });
    });
    }
  });
};
