import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
// import Order from '../infra/typeorm/entities/Order';
import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

interface IOrderProducts {
  product_id: string;
  price: number;
  quantity: number;
  order_id: string;
  id: string;
  created_at: Date;
  updated_at: Date;
}

interface IOrderResponse {
  id: string;
  created_at: Date;
  updated_at: Date;
  customer: Customer;
  order_products: IOrderProducts[];
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
    products,
  }: IRequest): Promise<IOrderResponse> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer non-exist');
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (!findProducts) {
      throw new AppError('Products not found');
    }

    const orderProducts = products.map(product => {
      const { id: product_id, quantity } = product;

      if (!product_id || !quantity) {
        throw new AppError('Invalid product data');
      }

      const findProd = findProducts.find(p => p.id === product_id);

      if (!findProd || quantity > findProd.quantity) {
        throw new AppError('Product sold out');
      }

      return {
        product_id,
        price: findProd.price,
        quantity,
      };
    });

    await this.productsRepository.updateQuantity(products);

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return order;
  }
}

export default CreateOrderService;
