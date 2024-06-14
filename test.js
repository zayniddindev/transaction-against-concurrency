const axios = require("axios");

async function register() {
  return await axios.post("http://localhost:3000/register", {
    email: "johndoe@gmail.com",
  });
}

(async () => {
  for (let i = 0; i < 5; i++) {
    register()
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err.response?.data));
  }
})(); // Surprise! We have 5 johndoe@gmail.com's in db
