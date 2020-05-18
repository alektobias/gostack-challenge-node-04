import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Order from '../infra/typeorm/entities/Order';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }

    const productsFound = await this.productsRepository.findAllById(products);

    if (productsFound.length !== products.length) {
      throw new AppError("There's one or more products that were not found.");
    }

    if (
      productsFound.some(productFound => {
        const findProductOutOfStock = products.find(
          orderedProduct =>
            orderedProduct.id === productFound.id &&
            orderedProduct.quantity > productFound.quantity,
        );
        return findProductOutOfStock;
      })
    ) {
      throw new AppError("There's one or more products out of stock.");
    }

    const orderedProducts = productsFound.map(productFound => {
      const orderedProduct = products.find(
        product => product.id === productFound.id,
      );

      return {
        product_id: productFound.id,
        quantity: orderedProduct?.quantity || 0,
        price: productFound.price,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orderedProducts,
    });

    await this.productsRepository.updateQuantity(products);
    return order;
  }
}

export default CreateProductService;
