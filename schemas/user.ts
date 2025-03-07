import { z } from "zod";

export const UserSignUpSchema = z
  .object({
    email: z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email(),
    name: z.string().min(1, {
      message: "Name is required",
    }),
    password: z
      .string()
      .min(6, { message: "Minimum 6 characters requried" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message:
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      }),
    confirmPassword: z.string().min(1, {
      message: "Confirm Password is required",
    }),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const ManagerSignUpSchema = z
  .object({
    email: z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email(),
    name: z.string().min(1, {
      message: "Name is required",
    }),
    bakery: z.string().min(1, {
      message: "Bakery is required",
    }),
    password: z
      .string()
      .min(6, { message: "Minimum 6 characters requried" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message:
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      }),
    confirmPassword: z.string().min(1, {
      message: "Confirm Password is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const EmployeeRegisterSchema = z
  .object({
    email: z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email(),
    name: z.string().min(1, {
      message: "Name is required",
    }),
    bakery_id: z.string().min(1, {
      message: "Bakery is required",
    }),
    password: z
      .string()
      .min(6, { message: "Minimum 6 characters requried" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message:
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      }),
    confirmPassword: z.string().min(1, {
      message: "Confirm Password is required",
    }),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
