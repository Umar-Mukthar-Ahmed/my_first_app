const Joi = require('joi');
const Blog = require('../models/blog');
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const { BACKEND_SERVER_PATH } = require('../config/index');
const fs = require('fs');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-details');
const Comment = require('../models/comment');
// const storagePath = 'storage';
const blogController = {

    async create(req, res, next) {
        const createBlogSchema = Joi.object({

            title: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            content: Joi.string().required(),
            photopath: Joi.string().required()

        });

        const { error } = createBlogSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        const { title, author, content, photopath } = req.body;


        //read as buffer
        const buffer = Buffer.from(photopath.replace(/data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

        //allot a name
        const imagePath = `${Date.now()}-${author}.png`;
        //save locally
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        }
        catch (error) {
            return next(error);
        }

        //save the blog in database
        let newBlog;
        try {
            newBlog = new Blog({
                title,
                author,
                content,
                photopath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            });
            await newBlog.save();
        } catch (error) {
            return next(error);
        }

        const blogDto = new BlogDTO(newBlog);
        return res.status(201).json({ blog: blogDto });


    },



    async getAll(req, res, next) {
        try {
            const blogs = await Blog.find({});
            const blogsDTO = [];

            for (let i = 0; i < blogs.length; i++) {
                const dto = new BlogDTO(blogs[i]);
                blogsDTO.push(dto);
            }

            return res.status(200).json({ blogs: blogsDTO });
        } catch (error) {
            return next(error);
        }
    },

    async getById(req, res, next) {
        //validate id and send the response

        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = getByIdSchema.validate(req.params);

        if (error) {
            return next(error); // Pass error to the next middleware
        }

        let blog;
        try {
            blog = await Blog.findOne({ _id: req.params.id }).populate('author'); // Use await for the promise
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' }); // Handle case if blog is not found
            }
        } catch (error) {
            return next(error); // Pass error to the next middleware
        }

        const blogDto = new BlogDetailsDTO(blog); // Transform blog data to DTO
        return res.status(200).json({ blog: blogDto }); // Send the response with the blog DTO
    }
    ,

    async update(req, res, next) {
        // Define a schema for validating the request body
        const updateBlogSchema = Joi.object({
            title: Joi.string().required(), // Title is required
            content: Joi.string().required(), // Content is required
            author: Joi.string().regex(mongodbIdPattern).required(), // Author must match MongoDB ID format
            blogId: Joi.string().regex(mongodbIdPattern).required(), // Blog ID must match MongoDB ID format
            photo: Joi.string() // Photo is optional
        });

        // Validate the incoming request body
        const { error } = updateBlogSchema.validate(req.body);
        if (error) {
            return next(error); // Pass validation errors to error-handling middleware
        }

        // Destructure request body
        const { title, content, author, blogId, photo } = req.body;

        // Find the blog by ID
        let blog;
        try {
            blog = await Blog.findOne({ _id: blogId });
        } catch (error) {
            return next(error); // Pass database errors to error-handling middleware
        }

        // If a new photo is provided, update the photo
        if (photo) {
            // Get the previous photo path
            let previousPhoto = blog.photopath;
            previousPhoto = previousPhoto.split('/').at(-1);

            // Delete the previous photo from local storage
            try {
                fs.unlinkSync(`storage/${previousPhoto}`);
            } catch (fsError) {
                return next(fsError); // Handle file system errors
            }

            // Convert the base64 photo string to a buffer
            const buffer = Buffer.from(photo.replace(/data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

            // Generate a new image name
            const imagePath = `${Date.now()}-${author}.png`;

            // Save the new photo to local storage
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error); // Handle file write errors
            }

            // Update the blog with the new photo path and other fields
            await Blog.updateOne(
                { _id: blogId },
                {
                    title,
                    content,
                    photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
                }
            );
        } else {
            // If no photo is provided, only update the title and content
            try {
                await Blog.updateOne(
                    { _id: blogId },
                    { title, content }
                );
            } catch (error) {
                return next(error); // Handle database update errors
            }
        }

        // Send a success response
        return res.status(200).json({ message: 'Blog updated!' });
    }
    ,

    async delete(req, res, next) {
        // Validate the blog ID using Joi schema ,delete blog and delete respective comments
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        // Validate the `req.params` against the schema
        const { error } = deleteBlogSchema.validate(req.params);

        if (error) {
            return next(error);
        }

        const { id } = req.params;


        try {
            // Delete the blog with the specified ID
            await Blog.deleteOne({ _id: id });

            // Delete all comments associated with the blog
            await Comment.deleteMany({ blog: id });
        } catch (error) {
            return next(error);
        }

        // Send a success response
        return res.status(200).json({ message: 'Blog deleted' });



    }
}

module.exports = blogController;