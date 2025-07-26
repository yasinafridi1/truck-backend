import Joi from "joi";

const phoneSchema = Joi.string().pattern(/^\d+$/).required().messages({
  "string.pattern.base": "Phone number must contain only digits.",
  "string.empty": "Phone number is required.",
  "any.required": "Phone number is required.",
});

const emailSchema = Joi.string()
  .email({ tlds: { allow: true } }) // Disable strict TLD validation
  .required()
  .messages({
    "string.email": "Please enter a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  });

const passwordSchema = Joi.string()
  .pattern(
    new RegExp(
      '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,15}$'
    )
  )
  .required()
  .messages({
    "string.pattern.base":
      "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be 8-15 characters long",
  });

const stringValidation = (fieldName) =>
  Joi.string()
    .required()
    .messages({
      "string.empty": `${fieldName} is required.`,
      "any.required": `${fieldName} is required.`,
    });

const fullNameSchema = Joi.string().required().max(70);

export const loginSchema = Joi.object({
  email: Joi.string().email().required(), // or your own emailSchema
  password: Joi.string().required(),
});

export const signupSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

export const addUpdateTruckSchema = Joi.object({
  numberPlate: stringValidation("Number Plate"),
  chesosNumber: stringValidation("Chesos Number"),
});

export const addUpdateSparePartSchema = Joi.object({
  name: stringValidation("Spare Part Name"),
  price: Joi.number().required().min(0).messages({
    "number.base": "Price must be a number.",
    "number.min": "Price cannot be negative.",
    "any.required": "Price is required.",
  }),
  quantity: Joi.number().required().min(1).messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be atleast 1.",
    "any.required": "Quantity is required.",
  }),
});
