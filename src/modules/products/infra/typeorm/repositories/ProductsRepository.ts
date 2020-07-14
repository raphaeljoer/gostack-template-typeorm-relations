import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
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
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: { name },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const orderProducts = products;
    const productsInStock = await this.ormRepository.findByIds(orderProducts);

    if (!productsInStock) {
      throw new AppError('Products not found');
    }

    if (productsInStock.length < orderProducts.length) {
      throw new AppError('Missing products');
    }

    return productsInStock;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const orderProducts = products;
    const productsInStock = await this.findAllById(orderProducts);

    if (!productsInStock) {
      throw new AppError('Products not found');
    }

    const updateProductsQuantity = orderProducts.map(orderProduct => {
      const productItemFounded = productsInStock.find(
        prod => prod.id === orderProduct.id,
      );

      if (!productItemFounded) {
        throw new AppError('Product not found');
      }

      if (productItemFounded.quantity < orderProduct.quantity) {
        throw new AppError(`Product sold out, id: ${productItemFounded.id}`);
      }

      productItemFounded.quantity -= orderProduct.quantity;
      return productItemFounded;
    });

    await this.ormRepository.save(updateProductsQuantity);

    const productsUpdated = await this.findAllById(products);
    return productsUpdated;
  }
}

export default ProductsRepository;
