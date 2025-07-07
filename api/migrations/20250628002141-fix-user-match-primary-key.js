"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Elimina restricciones únicas si existen
    try {
      await queryInterface.removeConstraint("UserMatch", "UserMatch_userAuth0Id_key");
    } catch (e) {}
    try {
      await queryInterface.removeConstraint("UserMatch", "UserMatch_matchId_key");
    } catch (e) {}

    // Elimina la clave primaria actual si existe
    try {
      await queryInterface.removeConstraint("UserMatch", "UserMatch_pkey");
    } catch (e) {}

    // Agrega la clave primaria compuesta
    await queryInterface.addConstraint("UserMatch", {
      fields: ["userAuth0Id", "matchId"],
      type: "primary key",
      name: "UserMatch_pkey"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("UserMatch", "UserMatch_pkey");
  }
};