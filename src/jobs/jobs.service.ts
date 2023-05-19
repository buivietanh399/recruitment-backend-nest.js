import { Inject, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-Job.dto';
import { UpdateJobDto } from './dto/update-Job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { JobDocument } from './schemas/Job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job } from './schemas/Job.schema';
import { IUser } from '@/users/users.interface';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private JobModel: SoftDeleteModel<JobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name,
      skills,
      company,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
    } = createJobDto;

    let newJob = await this.JobModel.create({
      name,
      skills,
      company,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newJob?._id,
      createdAt: newJob?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.JobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.JobModel.find(filter)
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

  findOne(id: string) {
    return `This action returns a #${id} Job`;
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    return await this.JobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    // update deletedBy
    await this.JobModel.updateOne(
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

    return this.JobModel.softDelete({
      _id: id,
    });
  }
}
