import { IsDecimal, IsNumber, IsOptional, IsString } from "class-validator";



export class CreateOrderDto {

    @IsString()
    userId: string;
    
    @IsString()
    clientName: string;

    @IsString()
    clientLastname: string;

    @IsOptional()
    orderDetails?: object[];
    
    @IsNumber()
    total: number;



    // productId
    // productName
    // productPriceSale
    // subTotal
    // quantity

}
