const express = require("express");
const pg = require("pg").Pool;

const app = express();
app.use(express.json());
const dbClient = new pg({ host: "localhost", user: "root", password: "1234", database: "test" });

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
  // simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // get email from request body
  const { email } = req.body;

  // check if email is not taken
  const emailExist = await checkEmailExist(email);
  if (emailExist) return res.status(400).json({ error: "Email already exist" });

  // register new user
  await registerUser(email);

  return res.status(201).json({ data: "User registered successfully!" });
});

async function main() {
  try {
    await dbClient.connect();
    app.listen(3000, () => console.log("OLD server is running on port 3000"));
  } catch (error) {
    console.error(error);
  }
}

main();
