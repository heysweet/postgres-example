const express = require('express');
const Sequelize = require('sequelize');
const app = express();

const PORT = 3000;

app.use(express.json());
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  });
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const User = sequelize.define('user', {
  // attributes
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING
    // allowNull defaults to true
  }
  },
  {
    // options
  }
);

// Note: using `force: true` will drop the table if it already exists
// Now the `users` table in the database corresponds to the model definition
User.sync({ force: true }); 
app.get('/', (req, res) => res.json({ message: 'Hello World' }));
app.post('/user', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    // Returns the new user that is created in the database
    res.json({ user: newUser });
  } catch(error) {
    console.error(error);
  }
});

app.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId
  try {
    const user = await User.findAll({
      where: {
        id: userId
      }
    });
    res.json({ user });
  } catch(error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`
}));