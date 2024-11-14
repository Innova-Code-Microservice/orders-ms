import { Type } from "class-transformer";
import { OrderDetailDto } from "./order-detail.dto";
import { ArrayMinSize, IsArray, IsNumber, IsString, ValidateNested } from "class-validator";



export class CreateOrderDto {

    @IsString()
    userId: string;
    
    @IsString()
    clientName: string;

    @IsString()
    clientLastname: string;
    
    @IsNumber()
    total: number;

    @IsArray({ message: "Debe agregar los productos" })
    @ArrayMinSize(1, { message: "Debe agregar minimo un item" })
    @ValidateNested({ each: true })
    @Type(() => OrderDetailDto)
    orderDetails: OrderDetailDto[]

}
