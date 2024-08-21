import { merge } from "lodash-es";
import { dbCollection, upsert, updateOne } from "#src/common/db/mongodb.js";

export class Repository {}

export class MongoRepository extends Repository {
  constructor(collection) {
    super();
    this.collection = collection;
  }

  getCollection() {
    return this.collection;
  }

  prepare(parameters) {
    return Object.keys(parameters).reduce((query, parameterName) => {
      const value = parameters[parameterName];

      if (!value || (Array.isArray(value) && value.length === 0)) {
        return query;
      }

      if (parameterName.substring(0, 1) !== "$" && Array.isArray(value)) {
        return {
          ...query,
          [parameterName]: { $in: [...value] },
        };
      }

      return { ...query, [parameterName]: parameters[parameterName] };
    }, {});
  }

  async create(data) {
    return await dbCollection(this.getCollection()).insertOne({
      ...data,
      _meta: merge({}, { created_on: new Date(), updated_on: new Date() }, data._meta),
    });
  }

  async deleteOne(query) {
    const queryPrepared = this.prepare(query);
    return await dbCollection(this.getCollection()).deleteOne(queryPrepared);
  }

  async updateOne(query, data) {
    const queryPrepared = this.prepare(query);
    return await updateOne(dbCollection(this.getCollection()), queryPrepared, {
      $set: data,
    });
  }

  async upsert(query, data, onInsertData = null) {
    const queryPrepared = this.prepare(query);
    return await upsert(dbCollection(this.getCollection()), queryPrepared, {
      ...(onInsertData ? { $setOnInsert: onInsertData } : {}),
      $set: data,
    });
  }

  async findAll() {
    return dbCollection(this.getCollection()).find({}).stream();
  }

  // eslint-disable-next-line no-unused-vars
  async first(query) {
    const queryPrepared = this.prepare(query);
    return dbCollection(this.getCollection()).find(queryPrepared).limit(1).next();
  }

  async _findAndPaginate(query, options) {
    let page = options.page || 1;
    let limit = options.limit || 10;
    let skip = (page - 1) * limit;

    let total = await dbCollection(this.getCollection()).countDocuments(query);

    return {
      // return the collections as a stream
      find: dbCollection(this.getCollection())
        .find(query, options.projection ? { projection: options.projection } : {})
        .sort(options.sort || {})
        .skip(skip)
        .limit(limit)
        .stream(),
      pagination: {
        page,
        items_par_page: limit,
        nombre_de_page: Math.ceil(total / limit) || 1,
        total,
      },
    };
  }

  async findAndPaginate(query, options = { page: 1, limit: 10 }) {
    const queryPrepared = this.prepare(query);
    return await this._findAndPaginate(queryPrepared, {
      ...options,
    });
  }

  async exist(query) {
    const queryPrepared = this.prepare(query);
    return (await this.first(queryPrepared)) ? true : false;
  }

  async find(query = {}) {
    const queryPrepared = this.prepare(query);
    return dbCollection(this.getCollection()).find(queryPrepared).stream();
  }
}
