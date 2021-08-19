"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("image_display", "img_pos"),
      queryInterface.addColumn("image_display", "position", {
        type: Sequelize.JSON,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("image_display", "position"),
      queryInterface.addColumn("image_display", "img_pos", Sequelize.STRING),
    ]);
  },
};
