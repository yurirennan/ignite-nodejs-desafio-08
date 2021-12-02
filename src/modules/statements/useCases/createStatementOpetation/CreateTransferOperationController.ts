import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferOperationUseCase } from "./createTransferOpetationUseCase";


export class CreateTransferOperationController{
  async execute(request: Request, response: Response): Promise<Response> {
    const sender_id = request.user.id;
    const { user_id }  = request.params;
    const { amount, description } = request.body;

    const createTransferUseCase = container.resolve(CreateTransferOperationUseCase);

    createTransferUseCase.execute({
      amount,
      description,
      sender_id,
      receiver_id: user_id
    });


    return response.json({ Message: "Success"})
  }
};
