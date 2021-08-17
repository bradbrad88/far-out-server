"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class image_gallery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  image_gallery.init(
    {
      i: DataTypes.INTEGER,
      x: DataTypes.INTEGER,
      y: DataTypes.INTEGER,
      h: DataTypes.INTEGER,
      w: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "image_display",
    }
  );
  return image_gallery;
};
