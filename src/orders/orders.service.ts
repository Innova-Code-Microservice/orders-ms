import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';


@Injectable()
export class OrdersService {

  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto) {
    const { userId, clientLastname, clientName, total, orderDetails } = createOrderDto;
    // ? Todo: USUARIO EXISTA

    // VERIFICAR QUE EL PRODUCTO EXISTA 

    // VERIFICAR QUE EL STOCK DEL PRODUCTO 

    // CREAR LA ORDEN
    const order = await this.prisma.order.create({
      data: {
        clientLastname,
        clientName,
        total,
        userId
      }
    })


    return {
      order,
      message: "Ordern registrada con exito"
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
