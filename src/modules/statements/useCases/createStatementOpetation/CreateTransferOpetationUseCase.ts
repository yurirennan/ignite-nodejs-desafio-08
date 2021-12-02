import { container, inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateTransferDTO } from "./CreateTransferOperationDTO";

@injectable()
export class CreateTransferOperationUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ sender_id, receiver_id, amount, description }: CreateTransferDTO) {
    if (amount < 0) throw new AppError("Amount must be greater than 0")

    const receiverUser = this.usersRepository.findById(receiver_id);

    if(!receiverUser) {
      throw new AppError("Receiver user not found");
    }

    const senderUser = await this.usersRepository.findById(sender_id);

    if (!senderUser) {
      throw new AppError("Sender user not found");
    }

    const createStatementUseCase = container.resolve(CreateStatementUseCase);

    await createStatementUseCase.execute({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: sender_id
    });
  }
}
