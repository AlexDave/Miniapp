const { MongoClient } = require('mongodb');
const config = require('../config');

class Database {
  constructor() {
    this.client = new MongoClient(config.database.uri);
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(config.database.dbName);
      this.isConnected = true;
      console.log('✅ Подключение к MongoDB успешно');
      return this.db;
    } catch (err) {
      console.error('❌ Ошибка подключения к MongoDB:', err);
      console.log('⚠️  Сервер запускается без подключения к базе данных');
      this.isConnected = false;
      return null;
    }
  }

  async getDb() {
    if (!this.isConnected) {
      await this.connect();
    }
    if (!this.isConnected) {
      throw new Error('База данных не подключена');
    }
    return this.db;
  }

  async close() {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 Соединение с MongoDB закрыто');
    }
  }

  // Методы для работы с коллекциями
  async getCollection(collectionName) {
    const db = await this.getDb();
    return db.collection(collectionName);
  }

  async findOne(collectionName, query) {
    const collection = await this.getCollection(collectionName);
    return collection.findOne(query);
  }

  async find(collectionName, query = {}) {
    const collection = await this.getCollection(collectionName);
    return collection.find(query).toArray();
  }

  async insertOne(collectionName, document) {
    const collection = await this.getCollection(collectionName);
    return collection.insertOne(document);
  }

  async updateOne(collectionName, filter, update) {
    const collection = await this.getCollection(collectionName);
    return collection.updateOne(filter, update);
  }
}

// Создаем единственный экземпляр базы данных
const database = new Database();

module.exports = database;
