const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
require('../models/index');
const Idea = mongoose.model('Ideas');
const {ensureAuthenticated} = require('../helpers/auth')


router.get('/',ensureAuthenticated, (req, res) => {
     var user = req.user;
    Idea.find({userID : user._id})
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        })
})

router.get('/add',ensureAuthenticated, (req, res) => {
    
    res.render('ideas/add')
})

router.get('/edit/:id',ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            res.render('ideas/edit', {
                idea: idea
            })
            console.log(idea.title, idea.details)
        })

})
router.post('/',ensureAuthenticated, (req, res) => {
    // checking empty field on server side
    var user = req.user;
    let errors = [];
    if (!req.body.title) {
        errors.push({ text: 'Please add a title' })

    }
    let str = req.body.details.length == 0 ? true : false;
    console.log(str)
    if (str) {
        errors.push({ text: 'Please add details' });

    }
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors :errors,
            title:req.body.title,
            details:req.body.details
        });
    }
    else {
        const newIdea = {
            title: req.body.title,
            details: req.body.details,
            userID : user._id
        }
        new Idea(newIdea)
            .save()
            .then(idea => {
                req.flash('success_msg',"New Video Idea added")
                res.redirect('/ideas');
            })
    }

})
router.put('/:id',ensureAuthenticated, (req, res) => {
    let errors = [];
    let str = req.body.details.length == 0 ? true : false;
    console.log(str)
    if (!req.body.title) {
        errors.push({ text: 'Please add a title' })
    }
    if (str) {
        errors.push({ text: 'Please add details' });
    }
    if (errors.length > 0) {
        Idea.findOne({
            _id: req.params.id
        })
            .then(idea => {
                res.render('ideas/edit', {
                    idea: idea,
                    errors: errors,
                })

            })
    }
    else {
        Idea.updateOne({ _id: req.params.id }, {
            $set: {
                title: req.body.title,
                details: req.body.details
            }
        }, { 'overwrite': true })
            .then(() => {
                console.log('Succesfully Updated')
                req.flash('success_msg',"Video Idea Updated ed")
                res.redirect('/ideas')
               
            })
    }
})
router.delete('/:id',ensureAuthenticated, (req, res) => {
    Idea.deleteOne({ _id: req.params.id })
        .then(() => {
            req.flash('success_msg' ,"Video idea removed");
            res.redirect('/ideas')
        })
})

module.exports = router;