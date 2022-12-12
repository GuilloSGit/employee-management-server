import { NextFunction, Request, Response } from "express";
import Employee from "../../models/Employee";
import { comparePassword } from "./helpers/auth";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
      // check if db has employee with email
      const userCredentials = await Employee.findOne({ email });
      if (!userCredentials) {
        return res.json({
          error: "Email not found",
        });
      }

      // check if password matches encrypted password
      const match = await comparePassword(password, userCredentials.password);
      if (!match) {
        return res.json({
          error: "Wrong password",
        });
      }

      // create signed token
      const token = jwt.sign(
        { email: userCredentials.email },
        process.env.JWT_SECRET!,
        {
          expiresIn: "30d",
        }
      );

      res.json({
        token,
        email: userCredentials.email
      });
    } catch (error) {
      console.log("Sign in failed => ", error);
      return res.status(400).send({
        error: "Error. Please try again.",
      });
    }
};