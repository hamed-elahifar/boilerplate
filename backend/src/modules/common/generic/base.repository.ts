import {
  Document,
  FilterQuery,
  isValidObjectId,
  Model,
  Query,
  UpdateQuery,
  mongo,
} from 'mongoose';
import { ConflictException } from '@nestjs/common';
import { t } from '../utils/i18n';

interface MongoErrorWithKeyPattern extends mongo.MongoError {
  keyPattern: Record<string, number>;
  keyValue: Record<string, any>;
}

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly entityModel: Model<T>) {}

  async create(createEntityData: Record<string, any>): Promise<T> {
    try {
      const entity = new this.entityModel(createEntityData) as T;
      return await entity.save();
    } catch (error) {
      if (error instanceof mongo.MongoError && error.code === 11000) {
        const mongoError = error as MongoErrorWithKeyPattern;
        const field = Object.keys(mongoError.keyPattern)[0];
        const value: string = Object.values(mongoError.keyValue)[0] as string;
        throw new ConflictException(t('errors.duplicate', { value, field }));
      } else {
        throw error;
      }
    }
  }

  async findOne(
    entityFilterQuery: FilterQuery<T>,
    projection?: string[],
  ): Promise<T | null> {
    let query: Query<T | null, T>;

    query = this.entityModel.findOne(entityFilterQuery);

    if (projection) {
      query = query.select(projection) as Query<T | null, T>;
    }

    return query.exec();
  }

  async findAll(
    entityFilterQuery: FilterQuery<T> = {},
    projection?: string[],
    pagination?: { limit?: number; offset?: number },
  ): Promise<T[] | null> {
    let query: Query<T[] | null, T>;

    query = this.entityModel.find(entityFilterQuery);

    if (projection) {
      query = query.select(projection) as Query<T[] | null, T>;
    }

    if (pagination?.limit) {
      query = query.limit(pagination.limit);
    }

    if (pagination?.offset) {
      query = query.skip(pagination.offset);
    }

    return query.exec();
  }

  /** `null` for a malformed id instead of a CastError. */
  async findById(id: string): Promise<T | null> {
    return isValidObjectId(id) ? this.entityModel.findById(id).exec() : null;
  }

  async page(
    filter: FilterQuery<T>,
    sort: Record<string, 1 | -1>,
    offset: number,
    limit: number,
  ) {
    const [items, total] = await Promise.all([
      this.entityModel.find(filter).sort(sort).skip(offset).limit(limit),
      this.entityModel.countDocuments(filter),
    ]);
    return { items, total };
  }

  count(filter: FilterQuery<T> = {}) {
    return this.entityModel.countDocuments(filter);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    return !!(await this.entityModel.exists(filter));
  }

  async existsById(id: string) {
    return (
      isValidObjectId(id) && !!(await this.entityModel.exists({ _id: id }))
    );
  }

  async update(
    entityFilterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<T>,
  ): Promise<T | null> {
    return this.entityModel.findOneAndUpdate(
      entityFilterQuery,
      updateEntityData,
      {
        new: true,
      },
    );
  }

  async delete(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    const result = await this.entityModel.deleteMany(entityFilterQuery);
    return result.deletedCount >= 1;
  }

  /** Id-scoped, unlike `delete`: it can only ever remove one document. */
  async deleteById(id: string): Promise<boolean> {
    return (await this.entityModel.findByIdAndDelete(id)) !== null;
  }

  async upsert(
    entityFilterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<T>,
  ): Promise<T | null> {
    return this.entityModel
      .findOneAndUpdate(entityFilterQuery, updateEntityData, {
        new: true,
        upsert: true,
      })
      .exec();
  }
}
