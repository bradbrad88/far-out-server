"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      await queryInterface.removeColumn("image_display", "display_order"),
      await queryInterface.removeColumn("image_display", "emphasize"),
      await queryInterface.renameColumn("image_display", "image_id", "i"),
      await queryInterface.bulkDelete("image_display"),
      await queryInterface.addColumn("image_display", "x", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      await queryInterface.addColumn("image_display", "y", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      await queryInterface.addColumn("image_display", "h", Sequelize.INTEGER),
      await queryInterface.addColumn("image_display", "w", Sequelize.INTEGER),
      await queryInterface.addColumn("image_display", "img_pos", Sequelize.STRING),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      await queryInterface.renameColumn("image_display", "i", "image_id"),
      await queryInterface.removeColumn("image_display", "x"),
      await queryInterface.removeColumn("image_display", "y"),
      await queryInterface.removeColumn("image_display", "w"),
      await queryInterface.removeColumn("image_display", "h"),
      await queryInterface.removeColumn("image_display", "img_pos"),
      await queryInterface.addColumn(
        "image_display",
        "display_order",
        Sequelize.INTEGER
      ),
      await queryInterface.addColumn(
        "image_display",
        "emphasize",
        Sequelize.INTEGER
      ),
    ]);
  },
};
