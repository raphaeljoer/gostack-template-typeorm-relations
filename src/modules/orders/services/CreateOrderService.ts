import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({
    customer_id,
    products: orderProducts,
  }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not exists');
    }

    const productsInStock = await this.productsRepository.findAllById(
      orderProducts,
    );

    if (!productsInStock) {
      throw new AppError('Products not found');
    }

    const orderProductsBuilder = orderProducts.map(orderProduct => {
      if (!orderProduct.id || !orderProduct.quantity) {
        throw new AppError('Invalid products');
      }

      const productItemFounded = productsInStock.find(
        item => item.id === orderProduct.id,
      );

      if (!productItemFounded) {
        throw new AppError('Product item not found');
      }

      if (productItemFounded.quantity < orderProduct.quantity) {
        throw new AppError(`${productItemFounded.name} product sold out.`);
      }

      return {
        product_id: productItemFounded.id,
        price: productItemFounded.price,
        quantity: orderProduct.quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orderProductsBuilder,
    });

    await this.productsRepository.updateQuantity(orderProducts);

    return order;
  }
}

export default CreateOrderService;
