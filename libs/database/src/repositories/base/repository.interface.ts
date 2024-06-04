import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsSelectByString,
  ObjectLiteral,
} from 'typeorm';

export type BetterFindOneOptions<
  T extends ObjectLiteral,
  SelectedRelations extends FindOptionsRelations<T> = FindOptionsRelations<T>,
  Selects extends FindOptionsSelect<T> | FindOptionsSelectByString<T> = FindOptionsSelect<T>,
> = Omit<FindOneOptions<T>, 'relations' | 'select'> & {
  relations?: SelectedRelations;
  select?: Selects;
};

export type BetterFindManyOptions<
  T extends ObjectLiteral,
  SelectedRelations extends FindOptionsRelations<T> = FindOptionsRelations<T>,
  Selects extends FindOptionsSelect<T> | FindOptionsSelectByString<T> = FindOptionsSelect<T>,
> = Omit<FindManyOptions<T>, 'relations' | 'select'> & {
  relations?: SelectedRelations;
  select?: Selects;
};

type ExcludeString<T extends string, U extends string> = T extends U ? never : T;
type IsEmptyObject<T> = keyof T extends never ? true : false;
type Relations<Entity extends ObjectLiteral> = Exclude<
  {
    [K in keyof Entity]: Entity[K] extends ObjectLiteral | undefined
      ? Entity[K] extends Date
        ? never
        : K extends string
          ? K
          : never
      : never;
  }[keyof Entity],
  undefined
>;

type EntityWithoutRelations<Entity extends ObjectLiteral> = Omit<Entity, Relations<Entity>>;

type ConditionalEntityWithoutRelations<
  Entity extends ObjectLiteral,
  Selects extends FindOptionsSelect<Entity> | FindOptionsSelectByString<Entity> | undefined,
> =
  IsEmptyObject<Selects> extends true
    ? EntityWithoutRelations<Entity>
    : Selects extends FindOptionsSelect<Entity>
      ? EntityWithOptionalsByObject<Entity, Selects>
      : Selects extends FindOptionsSelectByString<Entity>
        ? EntityWithOptionalsByString<Entity, Selects>
        : EntityWithoutRelations<Entity>;

type EntityWithOptionalsByObject<Entity extends ObjectLiteral, Selects extends FindOptionsSelect<Entity>> = Omit<
  Partial<Entity>,
  FilterSelects<Selects, Entity> | Relations<Entity>
> &
  Pick<Entity, FilterSelects<Selects, Entity>>;
type EntityWithOptionalsByString<
  Entity extends ObjectLiteral,
  Selects extends FindOptionsSelectByString<Entity>,
> = Omit<Partial<Entity>, Selects[number] | Relations<Entity>> & Pick<Entity, Selects[number]>;

type EntityRelationsWithoutSelected<
  Entity extends ObjectLiteral,
  SelectedRelations extends FindOptionsRelations<Entity>,
> = Pick<
  Partial<Entity>,
  ExcludeString<
    Relations<Entity>,
    FilterRelationsTrue<SelectedRelations, Entity> | FilterRelationsObjects<SelectedRelations, Entity>
  >
>;

type OnlySelectedRelations<
  Entity extends ObjectLiteral,
  SelectedRelations extends FindOptionsRelations<Entity>,
> = Required<Pick<Entity, FilterRelationsTrue<SelectedRelations, Entity>>> &
  PickedRelationsNested<Entity, SelectedRelations>;

/**
 * The entity with all relations set to optional, except the ones that are selected in the findOptions.relations.
 * This will also set the properties to optional, according to the findOptions.select
 */
export type EntityWithOptionalRelations<
  Entity extends ObjectLiteral,
  SelectedRelations extends FindOptionsRelations<Entity>,
  Selects extends FindOptionsSelect<Entity> | FindOptionsSelectByString<Entity> | undefined,
> = ConditionalEntityWithoutRelations<Entity, Selects> &
  EntityRelationsWithoutSelected<Entity, SelectedRelations> &
  OnlySelectedRelations<Entity, SelectedRelations>;

/**
 * FilterRelations iterates through the properties of the object and filters them to extract the ones that are set to true or an object.
 */
type FilterRelationsTrue<T extends FindOptionsRelations<Entity>, Entity extends ObjectLiteral> = {
  [K in keyof T]: T[K] extends true ? (K extends string ? K : never) : never;
}[keyof T];

type FilterRelationsObjects<T extends FindOptionsRelations<Entity>, Entity extends ObjectLiteral> = {
  [K in keyof T]: T[K] extends object ? (K extends string ? K : never) : never;
}[keyof T];

type FilterSelects<T extends FindOptionsSelect<Entity>, Entity extends ObjectLiteral> = {
  [K in keyof T]: T[K] extends true | object ? (K extends string ? K : never) : never;
}[keyof T];

type PickedRelationsNested<Entity extends ObjectLiteral, SelectedRelations extends FindOptionsRelations<Entity>> = {
  [P in keyof SelectedRelations]: P extends keyof Entity
    ? SelectedRelations[P] extends object
      ? Exclude<Entity[P], undefined> extends Array<infer I>
        ? I extends ObjectLiteral
          ? EntityWithOptionalRelations<I, SelectedRelations[P], undefined>[]
          : never
        : EntityWithOptionalRelations<Exclude<Entity[P], undefined>, SelectedRelations[P], undefined>
      : unknown
    : never;
};
