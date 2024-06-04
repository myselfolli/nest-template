import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsSelectByString,
  FindOptionsWhere,
  ObjectLiteral,
  QueryBuilder,
  Repository,
  UpdateResult,
} from 'typeorm';

import { EntityWithOptionalRelations } from './repository.interface';
import { HttpException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseAbstractRepository<Entity extends ObjectLiteral> {
  private readonly saveDelayInMs = 40;

  private entity: Repository<Entity>;
  protected constructor(entity: Repository<Entity>) {
    this.entity = entity;
  }

  public getQueryBuilder(alias?: string): QueryBuilder<Entity> {
    return this.entity.createQueryBuilder(alias);
  }

  public async save(data: DeepPartial<Entity>): Promise<Entity> {
    const res = await this.entity.save(data);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  public async saveMany(data: DeepPartial<Entity>[]): Promise<Entity[]> {
    const res = await this.entity.save(data);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  /**
   * Find one entity from the database
   *
   * @param filterCondition The condition to filter the entity
   * @param error The error to throw if no entity is found
   * @returns The entity
   */
  public async findOneOrFail<
    SelectedRelations extends FindOptionsRelations<Entity>,
    Selects extends FindOptionsSelect<Entity> | FindOptionsSelectByString<Entity>,
  >(
    filterCondition: Omit<FindOneOptions<Entity>, 'relations' | 'select'> & {
      relations?: SelectedRelations;
      select?: Selects;
    },
    error: HttpException,
  ): Promise<EntityWithOptionalRelations<Entity, SelectedRelations, Selects>> {
    const dbRes = await this.findOne(filterCondition);
    if (!dbRes) {
      throw error;
    }

    return dbRes;
  }

  /**
   * Find one entity from the database
   *
   * @param filterCondition The condition to filter the entity
   * @returns The entity
   */
  public async findOne<
    SelectedRelations extends FindOptionsRelations<Entity>,
    Selects extends FindOptionsSelect<Entity> | FindOptionsSelectByString<Entity>,
  >(
    filterCondition: Omit<FindOneOptions<Entity>, 'relations' | 'select'> & {
      relations?: SelectedRelations;
      select?: Selects;
    },
  ): Promise<EntityWithOptionalRelations<Entity, SelectedRelations, Selects> | undefined> {
    const dbRes = (await this.entity.findOne(filterCondition)) as EntityWithOptionalRelations<
      Entity,
      SelectedRelations,
      Selects
    > | null;
    return dbRes || undefined;
  }

  /**
   * Find all entities from the database
   *
   * @param options The options to filter the entities
   * @returns An array of entities
   */
  public async findAll<
    SelectedRelations extends FindOptionsRelations<Entity>,
    Selects extends FindOptionsSelect<Entity> | FindOptionsSelectByString<Entity>,
  >(
    options?: FindManyOptions<Entity> & {
      select?: Selects;
      relations?: SelectedRelations;
    },
  ): Promise<EntityWithOptionalRelations<Entity, SelectedRelations, Selects>[]> {
    return (await this.entity.find(options)) as EntityWithOptionalRelations<Entity, SelectedRelations, Selects>[];
  }

  public async count(options?: FindManyOptions<Entity>): Promise<number> {
    return await this.entity.count(options);
  }

  public async deleteMany(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    const entities = await this.entity.find(options);
    const res = await this.entity.remove(entities);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }
  public async deleteOne(options: FindOneOptions<Entity>): Promise<Entity> {
    const entity = await this.entity.findOne(options);

    if (!entity) {
      throw new Error('Entity not found');
    }

    const res = await this.entity.remove(entity);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  public async deleteWhere(options: FindOptionsWhere<Entity>): Promise<Entity[]> {
    const entities = await this.entity.find({ where: options });
    const res = await this.entity.remove(entities as Entity[]);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  public async delete(data: Entity): Promise<Entity> {
    const res = await this.entity.remove(data);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  public async deleteById(id: string | number): Promise<DeleteResult> {
    const res = await this.entity.delete(id);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  public async updateById(id: string | number | object, data: QueryDeepPartialEntity<Entity>): Promise<UpdateResult> {
    const res = await this.entity.update(id, data);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  public async updateOne(
    options: FindOptionsWhere<Entity>,
    data: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult> {
    const res = await this.entity.update(options, data);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  public async updateMany(
    options: FindOptionsWhere<Entity>,
    data: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult> {
    const res = await this.entity.update(options, data);
    await new Promise((resolve) => setTimeout(resolve, this.saveDelayInMs));
    return res;
  }

  /**
   * Check if an entity exists with the given options
   *
   * @param options The options to check for (where)
   * @returns true if an entity exists with the given options, false otherwise
   */
  public async exists(options: FindOptionsWhere<Entity>): Promise<boolean> {
    const result = await this.entity.count({
      where: options,
    });
    return result > 0;
  }
}
