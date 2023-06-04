import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-Role.dto';
import { UpdateRoleDto } from './dto/update-Role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Role } from './schemas/role.schema';
import { IUser } from '@/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private RoleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = createRoleDto;

    const isExist = await this.RoleModel.findOne({ name });

    if (isExist) {
      throw new BadRequestException(`Role với name=${name} đã tồn tại`);
    }

    const newRole = await this.RoleModel.create({
      name,
      description,
      isActive,
      permissions,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newRole?._id,
      createdAt: newRole?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.RoleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.RoleModel.find(filter)
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
      throw new BadRequestException(`Not found Role `);
    }

    return (await this.RoleModel.findById(id)).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, name: 1, method: 1 },
    });
  }

  async update(_id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`Not found Role `);
    }

    const { name, description, isActive, permissions } = updateRoleDto;
    const updated = await this.RoleModel.updateOne(
      { _id },
      {
        name,
        description,
        isActive,
        permissions,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.RoleModel.findById(id);
    if (foundRole.name === 'ADMIN') {
      throw new BadRequestException('Không thể xóa role Admin');
    }

    // update deletedBy
    await this.RoleModel.updateOne(
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

    return this.RoleModel.softDelete({
      _id: id,
    });
  }
}
