import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const userExists = await this.customersRepository.findByEmail(email);

    if (userExists) throw new AppError('User already exists', 400);

    const costumer = await this.customersRepository.create({ name, email });

    return costumer;
  }
}

export default CreateCustomerService;
