'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      this.belongsTo(models.Company, { foreignKey: 'company_id' });
    }
  }
  Document.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    file_name: DataTypes.STRING,
    file_url: DataTypes.STRING,
    status: DataTypes.STRING,
    company_id: DataTypes.UUID,
    auto_summary: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Document',
  });
  return Document;
};