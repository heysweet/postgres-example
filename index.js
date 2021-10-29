const express = require('express');
const Sequelize = require('sequelize');
const app = express();

const PORT = 3000;

app.use(express.json());
const sequelize = new Sequelize('postgres://username:password@localhost:5432/dbname');
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Pageview = sequelize.define('pageview', {
    // attributes
    timeStamp: {
      primaryKey: true,
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    ipAddress: {
      type: Sequelize.INET,
      allowNull: false
    },
    page: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    // options
  }
);

function getIp(req) {
  return req.headers['x-forwarded-for'] ||
     req.socket.remoteAddress ||
     null;
}

async function asyncTrackPageview(pageName, req, res) {
  try {
    const newPageview = new Pageview({page: pageName, ipAddress: getIp(req)});
    await newPageview.save();
    return newPageview;
  } catch(error) {
    console.error(error);
  }
}

// Note: using `force: true` will drop the table if it already exists
// Now the `users` table in the database corresponds to the model definition
Pageview.sync({ force: true }); 

// CREATE
app.get('/', (req, res) => {
  asyncTrackPageview('home', req, res);
  // Returns the new user that is created in the database
  res.json({ message: 'Hello World' })
});

// UPDATE
app.get('/manipulate', (req, res) => {
  // DO SOMETHING
});

// READ
app.get('/pageviews/notrack', async (req, res) => {
  const pageViews = await Pageview.findAll({
    where: {
      ipAddress: getIp(req)
    }
  });
  console.log(pageViews);
  res.json({ pageViews });
});

// CREATE + READ
app.get('/pageviews', async (req, res) => {
  await asyncTrackPageview('pageviews', req, res);
  const pageViews = await Pageview.findAll({
    where: {
      ipAddress: getIp(req)
    }
  });
  console.log(pageViews);
  res.json({ pageViews });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});