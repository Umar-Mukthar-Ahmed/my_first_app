import * as yup from "yup";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,32}$/;

const erroMessage = "use lowercase, uppercase and digits";

const loginSchema = yup.object().shape({
  username: yup.string().min(5).max(30).required("username is required"),
  password: yup
    .string()
    .min(8)
    .max(25)
    .matches(passwordPattern, { message: erroMessage })
    .required(),
});

export default loginSchema;
