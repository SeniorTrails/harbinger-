const { Router } = require('express');

const { saveReviewComments, getReviewComments, getUserById } = require('../db/database');

const reviewComments = Router();

/**
 * this route allows users to POST their comments on other users website reviews
 * saveReviewComments(body) - db helper function takes 3 input parameters
 * {Params} = (message, idUser, idReview)
 *  note - all input params can be found req.body
 * returns = object with table fields {"id", "message", "updatedAt", "createdAt"}
 */

reviewComments.post('/comments', (req, res) => {
  const { message, UserId, ReviewId } = req.body;
  saveReviewComments(message, UserId, ReviewId)
    .then((savedComment) => {
      // res.send(savedComment);
      getUserById(UserId)
        .then((user) => {
          savedComment.User = user;
          // console.log(savedComment.User);
          res.send({ savedComment, user });
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      res.status(500);
      res.send(error);
    });
});

/**
 * this route allows client side to GET the comments users have made on other users website reviews
 * getReviewComments() - db helper function takes no inputs
 * returns = object with all Comment table fields:
 * {"id",* "message", "UserId", "ReviewId", "createdAt","updatedAt", "Review", "User"}
 */

reviewComments.get('/comments', (req, res) => {
  getReviewComments()
    .then((rComments) => {
      res.send(rComments);
    })
    .catch((error) => {
      res.status(500);
      res.send(error);
    });
});

module.exports = {
  reviewComments,
};
