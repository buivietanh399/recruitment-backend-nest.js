import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import mongoose from 'mongoose';

//data transfer object // class = { }
export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'idActive không được để trống' })
  @IsBoolean({ message: 'isActive có giá trị boolean' })
  isActive: boolean;

  @IsNotEmpty({ message: 'Logo không được để trống' })
  @IsMongoId({ each: true, message: 'each permission is mongo object id' })
  @IsArray({ message: 'permission có định dạng là array' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
