const axios = require("axios");
const chai = require("chai");
const expect = chai.expect;
const jwt = require("jsonwebtoken");
const Test = require("./test.config.js");
const { sequelize } = require("../database/instance.js");

const ax = axios.create({
  baseURL: "http://localhost:5000",
});

describe("SurveyResponses endpoint", () => {
  before(async () => {
    // Reset the database before running these tests
    await Test.resetDb();

    // Create 3 survey responses
    await sequelize.models.SurveyResponse.create({
      userId: 1,
      data: { technology: ["JS", "React"] },
    });
    await sequelize.models.SurveyResponse.create({
      userId: 2,
      data: { technology: ["Java", "Spring", "VS Code"] },
    });
    await sequelize.models.SurveyResponse.create({
      userId: 3,
      data: { technology: ["MySql"] },
    });
    return Promise.resolve();
  });

  it("GET /survey-responses should return survey responses", async () => {
    // Create a JWT signed with the RSA private key
    const token = jwt.sign(
      {
        userId: 3,
      },
      Test.rsaPrivateKey,
      { algorithm: "RS256" }
    );

    // Perform a GET request to /survey-responses
    const { data, status } = await ax.get("/survey-responses", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    // Check that the server returns a 200 status code
    expect(status).to.equal(200);

    // Check that the body has a surveyResponse array
    expect(data.surveyResponses).to.exist;

    // Check that the surveyResponse array has 1 surveyResponses in it
    expect(data.surveyResponses.length).to.equal(1);

    // Check that the surveyResponses have the correct structure
    const surveyResponse = data.surveyResponses[0];
    expect(surveyResponse.userId).to.equal(3);
    expect(surveyResponse.data).to.exist;
    return Promise.resolve();
  });

  it("GET /survey-responses should return 401 if JWT is signed with wrong key", async () => {
    // Create a JWT signed with a different RSA private key
    const token = jwt.sign(
      {
        userId: 3,
      },
      `-----BEGIN RSA PRIVATE KEY-----
MIIBOwIBAAJBALHlFNfHdfCq4stiIZyTmkawfJXgGSXHHy9L2YmcDYoeoL/ljIXn
PX4/d4AgABq6NTKJEoIm661Ay1VYjErpY4cCAwEAAQJBAJ2XS6yP1So7qCf2KcJ0
e6INrIB1ArIVwMl8Txz5soDcfe8h3X6w7/GshWG//DcnTXsosMnYPbkhGord1nQP
85kCIQDyW5SHAY0mSyYUjZpFrq/dEyDEGiq26DpT8C1w3DlBwwIhALvolEEU+dMt
NMF7Bj8Y/8oi1BP/AlCs62TM9gLt8FbtAiEA5FW2BNBIXMi2cuzKaVZgqGeqGjgR
AEyhD44cMdW6OCMCIF0n3metaHTi0mahAOXDFPw27ADFyXYJY+FjIwssvpu5AiAy
j54LxJp8HjQXvbs/Tr7OSu3CEK7pc9uTZ6RkyD1oGw==
-----END RSA PRIVATE KEY-----`,
      {
        algorithm: "RS256",
      }
    );

    let res = {};
    try {
      // Perform a GET request to /survey-responses
      await ax.get("/survey-responses", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      res = error.response;
    }
    // Check that the server returned a 401 status code
    expect(res.status).to.equal(401);
    expect(res.data).to.equal("Unauthorized");
    return Promise.resolve();
  });

  it("GET /survey-responses should return 401 if no authorization header is present", async () => {
    let res = {};
    try {
      // Perform a GET request to /survey-responses
      await ax.get("/survey-responses");
    } catch (error) {
      res = error.response;
    }
    // Check that the server returned a 401 status code
    expect(res.status).to.equal(401);
    expect(res.data).to.equal("Unauthorized");
    return Promise.resolve();
  });

  it("POST /survey-responses should create a survey response", async () => {
    // Create a JWT and sign it with the RSA private key
    const token = jwt.sign(
      {
        userId: 11,
      },
      Test.rsaPrivateKey,
      { algorithm: "RS256" }
    );

    const payload = {
      data: {
        favoriteColor: "green",
        technology: ["Vue", "Node.js"],
      },
    };

    // Perform a POST request to /survey-responses
    const { data, status } = await ax.post("/survey-responses", payload, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    // Check that the server returns a 200 status code
    expect(status).to.equal(200);

    // Check that the surveyResponse is returned
    expect(data.id).to.exist;
    expect(data.userId).to.equal(11);
    expect(data.data).to.deep.equal(payload.data);

    // Check that a surveyResponse was created in the database
    const surveyResponse = await sequelize.models.SurveyResponse.findOne({
      where: { id: data.id },
    });
    expect(surveyResponse).to.exist;
    expect(surveyResponse.userId).to.equal(11);
    expect(surveyResponse.data).to.deep.equal(payload.data);

    return Promise.resolve();
  });

  it("POST /survey-responses should return 401 if the authorization header is missing", async () => {
    const payload = {
      data: {
        favoriteColor: "red",
        technology: ["Angular.js"],
      },
    };

    let res = {};
    try {
      // Perform a POST request to /survey-responses
      await ax.post("/survey-responses", payload);
    } catch (error) {
      res = error.response;
    }
    // Check that the server returned a 401 status code
    expect(res.status).to.equal(401);
    expect(res.data).to.equal("Unauthorized");

    return Promise.resolve();
  });

  it("POST /survey-responses should return 401 if JWT is expired", async () => {
    // Create an expired JWT signed with the RSA private key
    const token = jwt.sign(
      {
        userId: 22,
      },
      Test.rsaPrivateKey,
      {
        algorithm: "RS256",
        expiresIn: -1,
      }
    );

    const payload = {
      data: {
        favoriteColor: "red",
        technology: ["Angular.js"],
      },
    };

    let res = {};
    try {
      // Perform a POST request to /survey-responses
      const { data, status } = await ax.post("/survey-responses", payload, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      res = error.response;
    }
    // Check that the server returned a 401 status code
    expect(res.status).to.equal(401);
    expect(res.data).to.equal("Unauthorized");

    return Promise.resolve();
  });

  it("POST /survey-responses should return 401 if JWT is signed with wrong key", async () => {
    // Create a JWT signed with a different RSA private key
    const token = jwt.sign(
      {
        userId: 22,
      },
      `-----BEGIN RSA PRIVATE KEY-----
MIIBOwIBAAJBALHlFNfHdfCq4stiIZyTmkawfJXgGSXHHy9L2YmcDYoeoL/ljIXn
PX4/d4AgABq6NTKJEoIm661Ay1VYjErpY4cCAwEAAQJBAJ2XS6yP1So7qCf2KcJ0
e6INrIB1ArIVwMl8Txz5soDcfe8h3X6w7/GshWG//DcnTXsosMnYPbkhGord1nQP
85kCIQDyW5SHAY0mSyYUjZpFrq/dEyDEGiq26DpT8C1w3DlBwwIhALvolEEU+dMt
NMF7Bj8Y/8oi1BP/AlCs62TM9gLt8FbtAiEA5FW2BNBIXMi2cuzKaVZgqGeqGjgR
AEyhD44cMdW6OCMCIF0n3metaHTi0mahAOXDFPw27ADFyXYJY+FjIwssvpu5AiAy
j54LxJp8HjQXvbs/Tr7OSu3CEK7pc9uTZ6RkyD1oGw==
-----END RSA PRIVATE KEY-----`,
      {
        algorithm: "RS256",
      }
    );

    const payload = {
      data: {
        favoriteColor: "red",
        technology: ["Angular.js"],
      },
    };

    let res = {};
    try {
      // Perform a POST request to /survey-responses
      const { data, status } = await ax.post("/survey-responses", payload, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      res = error.response;
    }
    // Check that the server returned a 401 status code
    expect(res.status).to.equal(401);
    expect(res.data).to.equal("Unauthorized");

    return Promise.resolve();
  });
});
