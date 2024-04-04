import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";


export class CreatePokemonDto {

    // Instalar las dependencias de validator y transformer 

    @IsInt()
    @IsPositive()
    @Min(1)
    no: number;

    @IsString()
    @MinLength(1)
    name: string;

}
