import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Review from './Review.jsx';
import MakeComment from './MakeComment.jsx';
import DisplayComment from './DisplayComment.jsx';
import KeywordSearch from './KeywordSearch';
import {
  MyButton,
} from '../styles';

/**
 * A component for holding a list of the reviews. It makes the database call and
 *  maps the individual review components to the page. These are displayed on the
 * homepage.
 */
const ReviewList = ({ userId, userId4Comments }) => {
  const [reviews, setReviews] = useState([]);
  // Calls the sorting useEffect, call setSort([]) when you want to sort
  const [sort, setSort] = useState([]);
  const [reload, setReload] = useState([]);

  // Initially gets all the reviews
  useEffect(() => {
    axios({
      method: 'get',
      url: '/review/retrieve',
      params: {
        userId,
      },
    })
      .then(({ data }) => {
        setReviews(data);
        setSort([]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [reload]);

  // When sort is changed it sorts the current reviews
  useEffect(() => {
    const sortReviews = [...reviews]
      .sort((b, a) => ((+b.likes) - (+b.dislike)) - ((+a.likes) - (+a.dislike)));
    setReviews(sortReviews.reverse());
  }, [sort]);

  // Gets the reviews by the given tag
  const searchByTag = (tagObject) => {
    axios({
      method: 'get',
      url: '/review/keywords',
      params: tagObject,
    })
      .then(({ data }) => {
        setReviews(data);
        setSort([]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Calls the search by tag
  const onTagClick = (tagObject) => {
    searchByTag(tagObject);
  };

  // function to append new comments to displayComment component
  const appendComment = (comment, ReviewIndex) => {
    const updatedReviews = [...reviews];
    const updatedReview = { ...updatedReviews[ReviewIndex] };
    const updatedComments = [...updatedReview.Comment];
    updatedComments.push(comment);
    updatedReview.Comment = updatedComments;
    updatedReviews[ReviewIndex] = updatedReview;
    setReviews(updatedReviews);
  };

  // calls reload to clear keyword search filter
  const handleReset = () => {
    setReload([]);
  };

  return (
    <div>
      <div style={{
        marginTop: '20px',
      }}
      >
        <KeywordSearch passTagClick={onTagClick} userId={userId} />
        <div style={{
          textAlign: 'right',
          verticalAlign: '-20px',
          marginLeft: '15.5px',
          marginBottom: '8px',
          marginTop: '5px',
        }}
        >
          <button
            onClick={handleReset}
            onKeyDown={(e) => { if (e.keyCode === 13 || e.keyCode === 32) {handleReset(e.target.id)}; }}
          >
            <MyButton>
              clear search
            </MyButton>
          </button>
        </div>
      </div>
      <div>
        {!reviews.length ? 'No reviews to show.' : reviews.map((item, index) => (
          <div key={item.id}>
            <Review info={item} passTagClick={onTagClick} userId={userId} />
            <br />
            <DisplayComment comments={item.Comment} />
            <MakeComment
              ReviewIndex={index}
              appendComment={appendComment}
              userId4Comments={userId4Comments}
              ReviewId={item.id}
            />
          </div>
        ))}
    </div>
    </div>
  );
};

export default ReviewList;

ReviewList.propTypes = {
  userId: PropTypes.number,
};
