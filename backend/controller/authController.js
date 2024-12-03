const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,32}$/;

const authController = {

    //1.validate user input
    async register(req, res, next) {
        const userRegistrationSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });

        const { error } = userRegistrationSchema.validate(req.body);




        //2.if there is error in validaion -> send error through middleware 
        if (error) {
            return next(error);
        }



        //3.if email or username already exist -> return an error
        const { username, name, email, password } = req.body;
        //check if the email and username already exists
        try {
            const usernameInUse = await User.exists({ username });
            const emailInUse = await User.exists({ email });

            if (usernameInUse) {
                const error = {
                    status: 409,
                    message: 'username not available,use different username!'
                }
                return next(error);
            }

            if (emailInUse) {
                const error = {
                    status: 409,
                    message: 'email already registered,use different email!'
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }



        //4.hash the password
        const hashedPassword = await bcrypt.hash(password, 10);


        //5.store user data into the datbase
        const userToRegister = new User({
            username,
            email,
            name,
            password: hashedPassword
        })
        const user = await userToRegister.save();



        //6.update the response
        return res.status(201).json(user);
    },


    async login(req, res, next) {
        //1. validate user input
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern).required()
        });

        const { error } = userLoginSchema.validate(req.body);

        //2.if validation error->retrun error
        if (error) {
            return next(error);
        }

        //3.match username and password
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        try {
            //match username

            if (!user) {
                const error = {
                    status: 401,
                    message: 'Invalid UserName'
                }
                return next(error);

            }

            //match password
            //req.body.password ->hash -> match
            const match = await bcrypt.compare(password, user.password)

            if (!match) {
                const error = {
                    status: 401,
                    message: 'Invalid Password'
                }
                return next(error);

            }
        } catch (error) {
            return next(error);
        }

        //4.return response
        return res.status(200).json(user);

    }
};

module.exports = authController;