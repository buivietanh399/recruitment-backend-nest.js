import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { UpdateDatabaseDto } from './dto/update-database.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/decorator/customize';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UserDocument } from '../../dist/users/schemas/user.schema';
import {
  Permission,
  PermissionDocument,
} from '@/permissions/schemas/permission.schema';
import { RoleDocument } from '@/roles/schemas/role.schema';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';

@Injectable()
export class DatabasesService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    @InjectModel(User.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService,
    private userService: UsersService,
  ) {}

  onModuleInit() {
    console.log('The module has been initialized');
  }
}
