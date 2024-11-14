import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';


@Injectable()
export class OrdersService {

  constructor(
    private prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const { userId, clientLastname, clientName, total, orderDetails } = createOrderDto;

      // ? Todo: USUARIO EXISTA

      // VERIFICAR QUE EL PRODUCTO EXISTA
      const productIds = orderDetails.map(item => item.productId);
      await firstValueFrom(this.client.send("validateProductsIds", productIds))


      // VERIFICAR QUE EL STOCK DEL PRODUCTO 
      const productIdsQuantities = orderDetails.map(item => {
        return { id: item.productId, quantity: item.quantity }
      })

      const updateProductsResponse = await firstValueFrom(
        this.client.send("updateProductStock", productIdsQuantities)
      );

      if (!updateProductsResponse) {
        throw new RpcException({
          message: "Stock insuficiente",
          statusCode: HttpStatus.BAD_REQUEST,
        })
      }

      // CREAR LA ORDEN
      const order = await this.prisma.order.create({
        data: {
          clientLastname,
          clientName,
          total,
          userId,
          orderDetails: {
            create: orderDetails
          }
        },
        include: {
          orderDetails: {
            select: {
              productId: true,
              productName: true,
              subTotal: true,
              quantity: true,
              productPriceSale: true
            }
          }
        }
      })


      return {
        order,
        message: "Ordern registrada con exito"
      }

    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: error.status,
      })
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, search } = paginationDto;

    if (!search) {
      const totalOrders = await this.prisma.order.count();

      const lastPage = Math.ceil(totalOrders / limit);

      const orders = await this.prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          orderDetails: true,
        }
      });

      return {
        orders,
        meta: {
          total: totalOrders,
          page,
          lastPage,
        }
      };
    }

    const totalOrders = await this.prisma.order.count({
      where: {
        OR: [
          { id: { contains: search } },
        ]
      }
    });

    const lastPage = Math.ceil(totalOrders / limit);

    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { id: { contains: search } },
        ]
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        orderDetails: true,
      }
    })


    return {
      orders,
      meta: {
        total: totalOrders,
        page,
        lastPage,
      }
    }
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id },
        ]
      },
      include: {
        orderDetails: true
      }
    })

    if (!order) {
      throw new RpcException({
        message: "No se encontro la venta",
        statusCode: HttpStatus.NOT_FOUND,
      })
    }


    return {
      order,
    };
  }

}
