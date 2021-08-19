"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("image_gallery", "aspect_ratio", {
      type: Sequelize.FLOAT(11),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("image_gallery", "aspect_ratio");
  },
};
