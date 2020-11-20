const { sequelize, modelNames } = require("../database/instance.js");

const Test = {};

const resetTable = (modelName) => {
  if (!sequelize.models[modelName]) throw `modelName ${modelName} undefined`;
  return sequelize.models[modelName].sync({ force: true, logging: false });
};

Test.resetDb = async () => {
  let deferreds = [];
  modelNames.map((name) => {
    deferreds.push(resetTable(name));
  });
  return Promise.all(deferreds);
};

Test.rsaPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIBOwIBAAJBAJ8PxdNGVwO0Wl4irLuYyrYvNCHMO2ZcTb8cVka/B0xrWTAX/G+7
l1fA7aEWX7/OJsAXkD4aEp3e/d3rNFH/KacCAwEAAQJBAJy/B1zPeVpONauEkiIA
TOtCEyanQ3X4yijlvOPUxlV3+awUq+f8/spS8lCeBtGLYPXdfaib1CvcDpvuZ8nV
mmECIQDWOxh1/d3YkKWUPHML0k88tdSHYKZNrOL2NBL/zWb5FwIhAL4TA+zWYQSv
BfUeyvoXfxIeNtwEZkTnqRdxmdCKK43xAiEAi4fv9aHEpXIItlTs5a0z+KnBY+86
Qesx5AOkwEFLKT8CICbX2fh/gwoi/nOuXEqpnJVGSW3DFGdGdF7PH2Dnq6jxAiBv
x/s4QxfQhYvhPMXisV1PYQ0O2VMMBe4PO7Ioi4xMqQ==
-----END RSA PRIVATE KEY-----`;

module.exports = Test;
