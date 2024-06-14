const express = require("express");
const pg = require("pg").Pool;

const app = express();
app.use(express.json());
const dbClient = new pg({ host: "localhost", user: "root", password: "1234", database: "test" });

async function $transaction(f) {
  try {
    // start db transaction
    await dbClient.query("BEGIN");
    await dbClient.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    // execute main function
    const result = await f();

    // commit db transaction
    await dbClient.query("COMMIT");

    return result;
  } catch (error) {
    await dbClient.query("ROLLBACK");
    throw error;
  }
}

async function checkEmailExist(email) {
  const users = await dbClient.query(
    `SELECT id
    FROM users
    WHERE email = $1
    LIMIT 1`,
    [email]
  );
  return users.rowCount > 0;
}

async function registerUser(email) {
  return await dbClient.query(
    `INSERT INTO users (email)
     VALUES ($1)
     RETURNING id`,
    [email]
  );
}

app.post("/register", async (req, res) => {
  // get email from request body
  const { email } = req.body;

  try {
    await $transaction(async () => {
      // simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // check if email is not taken
      const emailExist = await checkEmailExist(email);
      if (emailExist) {
        throw "Email already exist";
      }

      // register new user
      await registerUser(email);
    });

    return res.json({ data: "User registered successfully!" });
  } catch (error) {
    console.error(error);
    return res.json({ error });
  }
});

async function main() {
  try {
    await dbClient.connect();
    app.listen(3000, () => console.log("NEW server is running on port 3000"));
  } catch (error) {
    console.error(error);
  }
}

main();
