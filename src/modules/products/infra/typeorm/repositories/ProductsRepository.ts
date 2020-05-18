import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({ name, quantity, price });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const idsList = products.map(product => product.id);

    const produtcsList = this.ormRepository.findByIds(idsList);
    return produtcsList;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    await Promise.all(
      products.map(async product => {
        const findProduct = await this.ormRepository.findOne(product.id);
        if (findProduct) {
          findProduct.quantity -= product.quantity;
          await this.ormRepository.save(findProduct);
        }
      }),
    );

    const productsUpdate = this.findAllById(products);
    return productsUpdate;
  }
}

export default ProductsRepository;
