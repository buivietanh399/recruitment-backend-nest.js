import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-Permission.dto';
import { UpdatePermissionDto } from './dto/update-Permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PermissionDocument } from './schemas/Permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission } from './schemas/Permission.schema';
import { IUser } from '@/users/users.interface';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';
@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { name, apiPath, method, module } = createPermissionDto;

    const isExist = await this.permissionModel.findOne({ apiPath, method });

    if (isExist) {
      throw new BadRequestException(
        `Permission với apiPath=${apiPath}, method=${method} đã tồn tại`,
      );
    }

    const newPermission = await this.permissionModel.create({
      name,
      apiPath,
      method,
      module,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newPermission?._id,
      createdAt: newPermission?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, // trang hiện tại
        pageSize: limit, // số lượng bản ghi đã lấy
        pages: totalPages, // tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, // kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found Permission `);
    }

    return await this.permissionModel.findById(id);
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Not found Permission `);
    }

    const { module, method, apiPath, name } = updatePermissionDto;
    const updated = await this.permissionModel.updateOne(
      { _id: id },
      {
        module,
        method,
        apiPath,
        name,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    // update deletedBy
    await this.permissionModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.permissionModel.softDelete({
      _id: id,
    });
  }
}
