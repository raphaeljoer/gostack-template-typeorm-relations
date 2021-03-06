import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

interface IRequest {
  id: string;
}

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;
      const orderId: IRequest = { id };
      const findOrder = container.resolve(FindOrderService);
      const order = await findOrder.execute(orderId);
      return response.status(200).json(order);
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }
  }

  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { customer_id, products } = request.body;
      const createOrder = container.resolve(CreateOrderService);
      const order = await createOrder.execute({ customer_id, products });
      return response.status(200).json(order);
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }
  }
}
