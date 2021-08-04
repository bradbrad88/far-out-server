fs = require("fs");
const prompt = require("prompt");
prompt.message = "";
const dbProperties = {
  properties: {
    host: {
      default: "localhost",
      required: true,
    },
    port: {
      pattern: /^\d+$/,
      message: "Port must consist of digits only",
      default: "5432",
      required: true,
      type: "string",
    },
    username: {
      message: "database username",
      warning: "database username is required",
      default: "postgres",
      required: true,
    },
    db: {
      message: "database name",
      warning: "database name is required",
      default: "FarOutDevelopment",
      required: true,
    },
    password: {
      message: "password",
      warning: "password is required",
      hidden: true,
      replace: "*",
      required: true,
    },
  },
};

const clientProperties = {
  properties: {
    awsId: { required: true, message: "aws key ID" },
    awsKey: { required: true, message: "aws secret key" },
    googleId: { required: true, message: "google id" },
    googleKey: { required: true, message: "google secret" },
    jwt: { required: true, message: "jwt secret" },
  },
};

const getClient = async () => {
  try {
    console.log("**** Client Services ****");
    const { awsId, awsKey, googleId, googleKey, jwt } = await prompt.get(
      clientProperties
    );
    return { awsId, awsKey, googleId, googleKey, jwt };
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

const getDotEnvData = (
  { host, port, username, db, password },
  { awsId, awsKey, googleId, googleKey, jwt }
) =>
  `
DB_HOST=${host}
DB_USER=${username}
DB_PASS=${password}
DB_DATABASE=${db}
DB_PORT=${port}
AWS_KEY_ID=${awsId}
AWS_SECRET_KEY=${awsKey}
REGION=ap-southeast-2
GOOGLE_CLIENT_ID=${googleId}
GOOGLE_CLIENT_SECRET=${googleKey}
JWT_SECRET=${jwt}
`;

const writeDotEnv = (config, client) => {
  fs.writeFile("./.env", getDotEnvData(config, client), err => {
    if (err) console.log(err);
  });
};

prompt.start();

(async () => {
  const config = await getConfig();
  const client = await getClient();
  writeDotEnv(config, client);
})();
