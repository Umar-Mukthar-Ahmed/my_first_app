const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controller/authController');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');


//register
router.post('/register', authController.register);
//login
router.post('/login', authController.login);

//logout
router.post('/logout', auth, authController.logout);

//refresh
router.get('/refresh', authController.refresh);



//blog operations
//create blog
router.post('/blog', blogController.create);

//getall
router.get('/blog/all', blogController.getAll);

//getbyId
router.get('/blog/:id', blogController.getById);

//update
router.put('/blog', blogController.update);

//delete
router.delete('/blog/:id', blogController.delete);



//comment opereations

//create comment
router.post('/comment', auth, commentController.create);

//get
router.get('/comment/:id', auth, commentController.getById);

module.exports = router;
