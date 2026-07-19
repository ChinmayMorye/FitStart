const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'db_fallback.json');

function initDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], dayHistories: [], exercises: [] }, null, 2));
  }
}

function readDb() {
  initDb();
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return { users: [], dayHistories: [], exercises: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Generate 24-character hexadecimal MongoDB-like IDs
function generateId() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Resolve nested object path retrieval (e.g. "journeyData.lastActiveDate")
function getValueByPath(obj, path) {
  if (!obj) return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

// Match database objects against advanced queries
function matchQuery(item, query) {
  if (!query || typeof query !== 'object') return true;
  const keys = Object.keys(query);
  return keys.every(k => {
    const itemVal = getValueByPath(item, k);
    const queryVal = query[k];
    
    // Support MongoDB comparison operators (e.g. { $gte: date })
    if (queryVal && typeof queryVal === 'object' && !Array.isArray(queryVal) && !(queryVal instanceof Date)) {
      const opKeys = Object.keys(queryVal);
      return opKeys.every(op => {
        const val = queryVal[op];
        if (op === '$gte') {
          return new Date(itemVal) >= new Date(val);
        }
        if (op === '$lte') {
          return new Date(itemVal) <= new Date(val);
        }
        if (op === '$gt') {
          return new Date(itemVal) > new Date(val);
        }
        if (op === '$lt') {
          return new Date(itemVal) < new Date(val);
        }
        if (op === '$ne') {
          return itemVal !== val;
        }
        return itemVal === val;
      });
    }
    
    // Normal ID check fallback
    if (k === '_id' || k === 'userId' || k.endsWith('_id') || k.endsWith('Id')) {
      return String(itemVal) === String(queryVal);
    }
    return itemVal === queryVal;
  });
}

function enableFallback() {
  // Override Mongoose connection readyState to make queries bypass buffering timeouts
  mongoose.connection.readyState = 1; // 1 = Connected
  
  const models = mongoose.models;
  
  Object.keys(models).forEach(modelName => {
    const model = models[modelName];
    const collectionName = modelName === 'User' ? 'users' : modelName === 'DayHistory' ? 'dayHistories' : 'exercises';
    
    // Find query
    model.find = function(query = {}) {
      const db = readDb();
      let list = db[collectionName] || [];
      list = list.filter(item => matchQuery(item, query));
      
      const chain = {
        select: function() { return this; },
        sort: function(sortOpts) {
          if (sortOpts && typeof sortOpts === 'object') {
            const field = Object.keys(sortOpts)[0];
            const direction = sortOpts[field]; // -1 = desc, 1 = asc
            list.sort((a, b) => {
              const valA = getValueByPath(a, field);
              const valB = getValueByPath(b, field);
              if (valA < valB) return -1 * direction;
              if (valA > valB) return 1 * direction;
              return 0;
            });
          }
          return this;
        },
        limit: function() { return this; },
        lean: function() { return this; },
        then: function(cb) {
          cb(list.map(x => wrapInstance(x, modelName)));
          return this;
        }
      };
      chain.then = chain.then.bind(chain);
      chain.select = chain.select.bind(chain);
      chain.sort = chain.sort.bind(chain);
      chain.limit = chain.limit.bind(chain);
      chain.lean = chain.lean.bind(chain);
      return chain;
    };
    
    // FindOne query
    model.findOne = function(query = {}) {
      const db = readDb();
      let list = db[collectionName] || [];
      let found = list.find(item => matchQuery(item, query));
      
      const chain = {
        select: function() { return this; },
        lean: function() { return this; },
        then: function(cb) {
          cb(found ? wrapInstance(found, modelName) : null);
          return this;
        }
      };
      chain.then = chain.then.bind(chain);
      chain.select = chain.select.bind(chain);
      chain.lean = chain.lean.bind(chain);
      return chain;
    };
    
    model.findById = function(id) {
      return model.findOne({ _id: id });
    };
    
    model.findByIdAndUpdate = function(id, update, options) {
      const db = readDb();
      let list = db[collectionName] || [];
      let found = list.find(x => String(x._id) === String(id));
      if (found) {
        const up = update.$set || update;
        Object.keys(up).forEach(k => {
          if (k.includes('.')) {
            const parts = k.split('.');
            let curr = found;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!curr[parts[i]]) curr[parts[i]] = {};
              curr = curr[parts[i]];
            }
            curr[parts[parts.length - 1]] = up[k];
          } else {
            found[k] = up[k];
          }
        });
        writeDb(db);
      }
      
      const chain = {
        then: function(cb) {
          cb(found ? wrapInstance(found, modelName) : null);
          return this;
        }
      };
      chain.then = chain.then.bind(chain);
      return chain;
    };
    
    model.countDocuments = function(query = {}) {
      const db = readDb();
      let list = db[collectionName] || [];
      list = list.filter(item => matchQuery(item, query));
      const count = list.length;
      return {
        then: function(cb) {
          cb(count);
          return this;
        }
      };
    };
    
    model.deleteMany = function() {
      const db = readDb();
      db[collectionName] = [];
      writeDb(db);
      return {
        then: function(cb) {
          cb();
          return this;
        }
      };
    };
    
    model.deleteOne = function(query = {}) {
      const db = readDb();
      let list = db[collectionName] || [];
      if (query && query._id) {
        db[collectionName] = list.filter(x => String(x._id) !== String(query._id));
        writeDb(db);
      }
      return {
        then: function(cb) {
          cb();
          return this;
        }
      };
    };
    
    model.create = async function(data) {
      const db = readDb();
      const list = db[collectionName] || [];
      const item = { _id: generateId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      list.push(item);
      writeDb(db);
      return wrapInstance(item, modelName);
    };
    
    model.insertMany = async function(arr) {
      const db = readDb();
      const list = db[collectionName] || [];
      const wrapped = arr.map(x => ({ _id: generateId(), ...x, createdAt: new Date().toISOString() }));
      db[collectionName] = list.concat(wrapped);
      writeDb(db);
      return wrapped.map(x => wrapInstance(x, modelName));
    };
  });
  
  // Wrap model saving lifecycle
  mongoose.Model.prototype.save = async function() {
    const modelName = this.constructor.modelName;
    const collectionName = modelName === 'User' ? 'users' : modelName === 'DayHistory' ? 'dayHistories' : 'exercises';
    const db = readDb();
    
    // Auto-hash raw password
    if (modelName === 'User' && this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    const plainData = typeof this.toObject === 'function' ? this.toObject() : { ...this };
    if (!plainData._id) plainData._id = generateId();
    
    let list = db[collectionName] || [];
    const idx = list.findIndex(x => String(x._id) === String(plainData._id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...plainData, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...plainData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    db[collectionName] = list;
    writeDb(db);
    return this;
  };
}

function wrapInstance(data, modelName) {
  if (!data) return null;
  const model = mongoose.models[modelName];
  const instance = new model(data);
  return instance;
}

module.exports = { enableFallback };
