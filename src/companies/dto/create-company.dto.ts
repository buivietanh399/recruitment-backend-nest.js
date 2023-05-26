import { IsEmail, IsNotEmpty } from 'class-validator';

//data transfer object // class = { }
export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  address: string;

  @IsNotEmpty({ message: 'Description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'Logo không được để trống' })
  logo: string;
}
