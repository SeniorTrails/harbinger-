const { Sequelize, TableHints } = require('sequelize');
const { WebSearchModels } = require('azure-cognitiveservices-websearch');
// const { reject } = require('lodash');
// const { default: Reviews } = require('../../client/src/reviews');
require('dotenv').config();
// create a connection to localDB

const db_name = process.env.DB || 'harbinger';
const db_user = process.env.DB_User || 'root';
const db_pass = process.env.DB_Pass || '';
const db_host = process.env.HOST || 'localhost';

// Alternate between production db or local db
const db = process.env.PRODENV === 'gcloud' ? new Sequelize(db_name, db_user, db_pass, {
  host: `/cloudsql/${process.env.HOST}`,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    socketPath: `/cloudsql/${process.env.HOST}`,
  },
})
  : new Sequelize(db_name, db_user, db_pass, {
    host: db_host,
    dialect: 'mysql',
    logging: false,
  });

db.authenticate()
  .then(() => {
    console.log('database connected!!!!');
  })
  .catch((err) => console.error(err));

const Users = db.define('Users', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING(50),
  },
  serial: {
    type: Sequelize.STRING(100),
  },
  bio: {
    type: Sequelize.STRING(1000),
  },
  image: {
    type: Sequelize.STRING(250),
  },
});
Users.sync();

const Message = db.define('Message', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  id_sender: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
  id_recipient: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
  message: {
    type: Sequelize.STRING(2000),
  },
  date: {
    type: Sequelize.DATE,
  },
});

const Followed = db.define('Followed', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  id_follower: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
  id_author: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
});

const RevLike = db.define('RevLike', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  id_follower: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
  id_author: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
});

const Review = db.define('Review', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING(100),
  },
  likes: {
    type: Sequelize.INTEGER,
  },
  dislike: {
    type: Sequelize.INTEGER,
  },
  text: {
    type: Sequelize.STRING(2020),
  },
  rating: {
    type: Sequelize.INTEGER,
  },
  UserId: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
  WebUrlId: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
  date: {
    type: Sequelize.DATE,
  },
  photourl: {
    type: Sequelize.STRING(500),
  },
  hasRated: {
    type: Sequelize.STRING(9000),
  },
});
Review.sync();

const WebUrls = db.define('WebUrls', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  url: {
    type: Sequelize.STRING(500),
  },
});
WebUrls.sync();

const Keyword = db.define('Keyword', {
  KeywordId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  keyword: {
    type: Sequelize.STRING(100),
  },
  ReviewId: {
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
}, { timestamps: false });
Keyword.sync();

// created new table in DB to persist users comments on other users website reviews
const Comment = db.define('Comment', {
  id: { // sequelize id number auto generated
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  message: { // users typed comment on reviews
    type: Sequelize.STRING(256),
  },
  UserId: { // id number of specific user making comment
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
  // figure out what other fields are needed in this table and what other tables it must connect to
  ReviewId: { // id number of review to link user comment with
    type: Sequelize.INTEGER,
    foreignKey: true,
  },
});
Comment.sync();

Review.belongsTo(Users, { as: 'User', constraints: false });
Review.belongsTo(WebUrls, { as: 'WebUrl', constraints: false });
Keyword.belongsTo(Review, { as: 'Keyword', constraints: false });
Review.hasMany(Keyword, { as: 'keywords' });
// create join between Comment & Users tables
Review.hasMany(Comment, { as: 'Comment', constraints: false });
// create join between Comment & Review tables
Comment.belongsTo(Users, { as: 'User', constraints: false });
db.sync();

// helper function to save users review comments to the "Comments" table in the harbinger DB
const saveReviewComments = (message, idUser, idReview) => Comment.create({
  message,
  UserId: idUser,
  ReviewId: idReview,
});

/**
 * Database helper to find reviews by keyword
 */
const findArticleByKeyWord = (keywordObj) => Keyword.findAll({
  where: {
    keyword: keywordObj.keyword,
  },
})
  .then((data) => {
    if (data === null) {
      console.log('KEYWORD NOT FOUND');
    } else {
      const id = data.map((result) => result.dataValues.ReviewId);
      const userId = keywordObj.userId;
      const where = !userId ? { id } : { userId, id };
      return Review.findAll({
        where ,
        include: [{ model: Users, as: 'User' }, { model: WebUrls, as: 'WebUrl' }, { model: Keyword, as: 'keywords' }, { model: Comment, as: 'Comment', include: [{ model: Users, as: 'User' }] }],
        order: [
          ['keywords', 'keyword'],
          ['Comment', 'createdAt', 'ASC'],
        ],
        limit: 50,
      })
        .then((data) => data)
        .catch((err) => console.log(err, 'SOMETHING WENT WRONG'));
    }
  })
  .catch((err) => console.log('ERROR: ', err));

const saveOrFindKeyWord = (keyword, idReview) => Keyword.create({ keyword, ReviewId: idReview })
  .then((data) => data)
  .catch((err) => console.log(err));

const saveOrFindWebUrl = (url) => WebUrls.findOne({ where: { url } })
  .then((data) => {
    if (data === null) {
      console.log('webURL created!');
      return WebUrls.create({ url });
    }
    return data;
  })
  .catch((err) => console.log(err));

const saveUsers = (username, serial, bio, image) => Users.findOne({ where: { serial } }).then((data) => {
  if (data === null) {
    return Users.create({
      username,
      serial,
      bio,
      image,
    });
  }
});

const getUser = (id) => Users.findOne({ where: { serial: id } });

/**
 * Database helper to find user by their user id number
 */
const getUserById = (id) => Users.findOne({ where: { id }, raw: true });

//NOT USED
const getUserReviews = (userId) => new Promise((resolve, reject) => {
  Review.findAll({ where: {}, include: [{ model: Users, as: 'User' }, { model: WebUrls, as: 'WebUrl' }, { model: Keyword, as: 'keywords' }] })
    .then((data) => {
      resolve(data);
    })
    .catch((err) => {
      reject(err);
    });
});


const saveReview = (username, title, text, weburl, keyword, rating, photourl, hasRated) => {
  let idUser;
  let idWeb;
  return new Promise((resolve, reject) => {
    saveOrFindWebUrl(weburl).then((data) => {
      idWeb = data.dataValues.id;
      Users.findOne({ where: { username } }).then((data) => {
        idUser = data.id;
        return Review.create({
          likes: 0,
          dislike: 0,
          UserId: idUser,
          title,
          text,
          rating,
          WebUrlId: idWeb,
          date: new Date(),
          photourl,
          hasRated,
        }).then((data) => resolve(data));
      });
    });
  });
};

const findUserAndUpdateBio = (serial, bio) => Users.findOne({ where: { serial } }).then((user) => user
  .update({ bio })
  .then((data) => data)
  .catch((err) => console.log(err)));
const findUserAndUpdateImage = (serial, image) => Users.findOne({ where: { serial } })
  .then((user) => user.update({ image }))
  .then((data) => data)
  .catch((err) => console.log(err));

/**
 * Database helper to find the reviews joins with User, WebUrl, and Keywords
 * @param {number} userId if no userId is passed finds all reviews
 */
const findTopReviews = (userId) => new Promise((resolve, reject) => {
  const where = !userId ? {} : { userId };
  Review.findAll({ where , include: [{ model: Users, as: 'User' }, { model: WebUrls, as: 'WebUrl' }, { model: Keyword, as: 'keywords' }, { model: Comment, as: 'Comment', include: [{ model: Users, as: 'User' }] }],
    order: [
      ['keywords', 'keyword'],
      ['Comment', 'createdAt', 'ASC'],
    ],
  })
    .then((data) => {
      resolve(data);
    })
    .catch((err) => {
      console.log(err);
      reject(err);
    });
});

// db helper function to GET review comments from "Comments" table in the harbinger DB
const getReviewComments = () => new Promise((resolve, reject) => {
  Comment.findAll({ include: [{ model: Review, as: 'Review' }, { model: Users, as: 'User' }] })
    .then((comments) => {
      resolve(comments);
    })
    .catch((error) => {
      reject(error);
    });
});

const updateLikeInReview = (req) => new Promise((resolve, reject) => {
  const { body } = req;
  const { reviewId } = body;
  Review.findOne({ where: { id: reviewId } })
    .then((review) => {
      const { likes, hasRated } = review;
      const arrayHasRated = hasRated.split(',');
      if (!(arrayHasRated.includes((req.user).toString()))) {
        const updatedHasRated = `${hasRated}, ${req.user}`;
        review.update({ likes: likes + 1, hasRated: updatedHasRated }).then(() => {
          resolve(true);
        });
      } else {
        resolve(false);
      }
    })
    .catch(() => {
      reject();
    });
});

const updateDislikeInReview = (req) => new Promise((resolve, reject) => {
  const { body } = req;
  const { reviewId } = body;
  Review.findOne({ where: { id: reviewId } })
    .then((review) => {
      const { hasRated, dislike } = review;
      const arrayHasRated = hasRated.split(',');
      if (!(arrayHasRated.includes((req.user).toString()))) {
        const updatedHasRated = `${hasRated}, ${req.user}`;
        review.update({ dislike: dislike + 1, hasRated: updatedHasRated }).then(() => {
          resolve(true);
        });
      } else {
        resolve(false);
      }
    })
    .catch(() => {
      reject();
    });
});

const findUserAndUpdateUsername = (serial, username) => Users.findOne({ where: { serial } }).then((user) => user
  .update({ username })
  .then((data) => data)
  .catch((err) => console.log(err)));

const getWebUrls = (webIds) => WebUrls.findAll({
  where: {
    id: webIds,
  },
});

module.exports = {
  db,
  getUser,
  getUserById,
  getReviewComments,
  saveUsers,
  saveOrFindKeyWord,
  saveOrFindWebUrl,
  saveReviewComments,
  saveReview,
  findUserAndUpdateBio,
  findUserAndUpdateImage,
  findArticleByKeyWord,
  findTopReviews,
  updateLikeInReview,
  updateDislikeInReview,
  getUserReviews,
  findUserAndUpdateUsername,
  getWebUrls,
};
