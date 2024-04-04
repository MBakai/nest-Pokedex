import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {

      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;
      
    } catch (error) {
      this.handleExceptions( error );
    }

  }

  findAll() {
    return this.pokemonModel.find();
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;

    if( !isNaN(+term) ){
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    // mongoid
    if(!pokemon && isValidObjectId(term) ){
      pokemon = await this.pokemonModel.findById(term);
    }


    // name
    if(!pokemon ){
      pokemon = await this.pokemonModel.findOne( { name: term.toLowerCase().trim() })
    }


    if(!pokemon) throw new NotFoundException(`El pokemon  con el id, name o no "${ term }" no existe`);

    return pokemon;

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );

    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {

      await pokemon.updateOne( updatePokemonDto );
      return {...pokemon.toJSON(), ...updatePokemonDto};
      
    } catch (error) {
      this.handleExceptions( error );
    }
  }

  
  async remove(id: string) {
    // const Pokemon = await this.findOne( id );
    // await Pokemon.deleteOne();

    // const result = await this.pokemonModel.findByIdAndDelete( id );

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0){
      throw new BadRequestException(`El pokemon con el ID "${ id }" no se encuentra`);
    }
    return;
  }


  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`El pokemon ya existe en la DB ${JSON.stringify(error.keyValue )}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`No se pudo crear al pokemon - revisa el server logs `);
  }

}
