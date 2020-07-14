/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
} from 'typeorm';

import Order from '@modules/orders/infra/typeorm/entities/Order';
import Product from '@modules/products/infra/typeorm/entities/Product';
// @JoinColumn({ name: 'order_id' })
// @JoinColumn({ name: 'product_id' })

@Entity('orders_products')
class OrdersProducts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(type => Order, order => Order, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  order: Order;

  @Column()
  order_id: string;

  @ManyToOne(type => Product, product => Product, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  product: Product;

  @Column()
  product_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default OrdersProducts;
