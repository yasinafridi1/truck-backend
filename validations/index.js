import Joi from "joi";
import { PAYMENT_OPTIONS, USER_STATUS } from "../config/Constants.js";

const phoneSchema = Joi.string()
  .pattern(/^\+(92\d{10}|966\d{9})$/)
  .length(13)
  .required()
  .messages({
    "string.pattern.base": "Phone number must start with +92 or +966",
    "string.empty": "Phone number is required.",
    "string.length": "Phone number must be exactly 13 characters long.",
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
  phone: phoneSchema,
  fullName: fullNameSchema,
  status: Joi.string()
    .valid(...Object.values(USER_STATUS))
    .required()
    .messages({
      "any.only": `Status must be one of ${Object.values(USER_STATUS).join(
        ", "
      )}`,
      "string.empty": "Status is required",
      "any.required": "Status is required",
    }),
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
  fileRemoved: Joi.boolean().optional().messages({
    "boolean.base": "fileRemoved must be true or false.",
  }),
});

export const addUpdateUsedPartSchema = Joi.object({
  partId: Joi.number().required().min(1).messages({
    "number.base": "Part id must be a number.",
    "number.min": "Part id must be atleast 1.",
    "any.required": "Part id is required.",
  }),
  truckId: Joi.number().required().min(1).messages({
    "number.base": "Truck id must be a number.",
    "number.min": "Truck id must be atleast 1.",
    "any.required": "Truck id is required.",
  }),
  quantityUsed: Joi.number().required().min(1).messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be atleast 1.",
    "any.required": "Quantity is required.",
  }),
});

export const addEditLoadSchema = Joi.object({
  date: Joi.date().iso().required().messages({
    "date.format": "Date must be in ISO format (YYYY-MM-DD).",
    "any.required": "Date is required.",
  }),
  truckId: Joi.number().required().min(1).messages({
    "number.base": "Truck id must be a number.",
    "number.min": "Truck id must be atleast 1.",
    "any.required": "Truck id is required.",
  }),
  amount: Joi.number().required().min(0).messages({
    "number.base": "Amount must be a number.",
    "number.min": "Amount cannot be negative.",
    "any.required": "Amount is required.",
  }),
  tripMoney: Joi.number().required().min(0).messages({
    "number.base": "Trip money must be a number.",
    "number.min": "Trip money cannot be negative.",
    "any.required": "Trip money is required.",
  }),
  driverIqamaNumber: Joi.string()
    .pattern(/^\d{9,15}$/)
    .required()
    .messages({
      "string.empty": "Iqama number is required",
      "string.pattern.base": "Iqama number must be between 9 and 15 digits",
    }),
  payment: Joi.string()
    .valid(...Object.values(PAYMENT_OPTIONS))
    .required()
    .messages({
      "any.only": `Payment method must be one of ${Object.values(
        PAYMENT_OPTIONS
      ).join(", ")}`,
      "string.empty": "Payment method is required",
      "any.required": "Payment method is required",
    }),
  from: stringValidation("From"),
  to: stringValidation("To"),
  fileRemoved: Joi.boolean().optional().messages({
    "boolean.base": "fileRemoved must be true or false.",
  }),
});
