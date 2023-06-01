import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './Permissions.service';
import { CreatePermissionDto } from './dto/create-Permission.dto';
import { UpdatePermissionDto } from './dto/update-Permission.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from '@/users/users.interface';
import { Response } from './../core/transform.interceptor';

@Controller('Permissions')
export class PermissionsController {
  constructor(private readonly PermissionsService: PermissionsService) {}

  @Post()
  @ResponseMessage('Create a new Permissions')
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @User() user: IUser,
  ) {
    return this.PermissionsService.create(createPermissionDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Fetch list Permission with paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.PermissionsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.PermissionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @User() user: IUser,
  ) {
    return this.PermissionsService.update(id, updatePermissionDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.PermissionsService.remove(id, user);
  }
}
