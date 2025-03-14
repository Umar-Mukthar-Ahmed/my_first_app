const Joi = require('joi');
const Blog = require('../models/blog');
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const { BACKEND_SERVER_PATH } = require('../config/index');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-details');
const Comment = require('../models/comment');
const storagePath = 'storage';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


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

        // Remove the base64 prefix and prepare the image buffer
        const buffer = Buffer.from(photopath.replace(/data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

        // Upload the image to Cloudinary
        const cloudinaryResponse = await new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'image', public_id: `${Date.now()}-${author}` },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        // Save the blog in the database with the URL of the image from Cloudinary
        let newBlog;
        try {
            newBlog = new Blog({
                title,
                author,
                content,
                photopath: cloudinaryResponse.secure_url
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
            const blogs = await Blog.find().sort({ createdAt: -1 }); // Newest first


            if (blogs.length === 0) {
                return res.status(200).json({ blogs: null }); // Return null instead of an empty array
            }

            const blogsDTO = blogs.map(blog => new BlogDTO(blog));

            return res.status(200).json({ blogs: blogsDTO });
        } catch (error) {
            return next(error);
        }
    }
    ,

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
        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blogId: Joi.string().regex(mongodbIdPattern).required(),
            photo: Joi.string() // Photo is optional
        });

        const { error } = updateBlogSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        const { title, content, author, blogId, photo } = req.body;

        let blog;
        try {
            blog = await Blog.findOne({ _id: blogId });
        } catch (error) {
            return next(error);
        }

        // If a new photo is provided, update the photo
        if (photo) {
            // Remove the base64 prefix and prepare the image buffer
            const buffer = Buffer.from(photo.replace(/data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

            // Upload the new image to Cloudinary
            let cloudinaryResponse;
            try {
                cloudinaryResponse = await cloudinary.uploader.upload_stream(
                    { resource_type: 'image', public_id: `${Date.now()}-${author}` },
                    (error, result) => {
                        if (error) {
                            throw error;
                        }
                        return result;
                    }
                );
            } catch (error) {
                return next(error);
            }

            // Delete the previous image from Cloudinary
            const previousImagePublicId = blog.photopath.split('/').at(-1).split('.')[0];
            try {
                await cloudinary.uploader.destroy(previousImagePublicId);
            } catch (error) {
                return next(error);
            }

            // Update the blog with the new image URL
            await Blog.updateOne(
                { _id: blogId },
                {
                    title,
                    content,
                    photopath: cloudinaryResponse.secure_url // Updated Cloudinary URL
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
                return next(error);
            }
        }

        return res.status(200).json({ message: 'Blog updated!' });
    },


    async delete(req, res, next) {
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = deleteBlogSchema.validate(req.params);
        if (error) {
            return next(error);
        }

        const { id } = req.params;

        let blog;
        try {
            blog = await Blog.findOne({ _id: id });
        } catch (error) {
            return next(error);
        }

        // Extract the public ID from the Cloudinary URL to delete the image
        const imagePublicId = blog.photopath.split('/').at(-1).split('.')[0];

        try {
            // Delete the blog
            await Blog.deleteOne({ _id: id });

            // Delete the image from Cloudinary
            await cloudinary.uploader.destroy(imagePublicId);

            // Delete all associated comments
            await Comment.deleteMany({ blog: id });
        } catch (error) {
            return next(error);
        }

        return res.status(200).json({ message: 'Blog deleted' });
    }

}

module.exports = blogController;