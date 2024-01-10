import express from "express";
import { UserModel } from "../models/User";

class UserController {
  getUsers = async (request: express.Request, response: express.Response) => {
    try {
      const users = await UserModel.find();
      return response.status(200).json({ data: users });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  };

  getUser = async (request: express.Request, response: express.Response) => {
    try {
      const { id } = request.params;
      const user = await UserModel.findById(id);
      return response.status(200).json({ data: user });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  };

  createUser = async (request: express.Request, response: express.Response) => {
    try {
      const { name, email, dateofbirth } = request.body;
      const user = new UserModel({ name, email, dateofbirth });
      await user.save();
      return response
        .status(201)
        .json({ message: `User ${name} created`, data: user });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  };

  updateUser = async (request: express.Request, response: express.Response) => {
    try {
      const { id } = request.params;
      const { name, email, dateofbirth } = request.body;
      const user = await UserModel.findById(id);
      if (user) {
        user.name = name;
        user.email = email;
        user.dateofbirth = dateofbirth;
        await user.save();
        return response
          .status(200)
          .json({ message: `User ${name} updated`, data: user });
      }
      return response.status(400).json({ message: "User not found" });
    } catch (error) {
      return response.sendStatus(500).json({ error: error.message });
    }
  };

  deleteUser = async (request: express.Request, response: express.Response) => {
    try {
      const { id } = request.params;
      const user = await UserModel.findById(id);
      if (user) {
        await user.deleteOne();
        return response
          .status(200)
          .json({ message: `User ${user.name} deleted` });
      }
      return response.status(400).json({ message: "User not found" });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  };
}

export default new UserController();
