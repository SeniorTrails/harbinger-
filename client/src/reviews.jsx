import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Rating from './Rating.jsx';
import PhotoUpload from './PhotoUpload.jsx';
import {
  MyButton,
  Background,
  LikeBG,
  DisLikeBG,
  ImageBG,
  TitleBox,
} from '../styles';

// WHERE YOU WRITE REVIEWS

function Reviews(props) {
  const { register, handleSubmit } = useForm();
  const [reviews, setRev] = useState([]);
  const [starsSelected, setStarsSelected] = useState(0);
  const [redirect, setRedirect] = useState(false);
  const [file, setFile] = useState(null);

  let siteURL = window.location.href.split('site=');
  siteURL = siteURL[1];
  useEffect(() => {
    axios
      .post('/review/url', { weburl: siteURL })
      .then(() =>
        axios.get('/review/url').then(({ data }) => {
          const revArray = [];
          data[1].forEach((review, index) => {
            review.username = data[0][index];
            review.webUrl = data[2][index];
            review.image = data[3][index];
            review.rating = data[4][index];
            revArray.push(review);
          });
          setRev(revArray);
        })
      )
      .catch((err) => console.error(err));
  }, []);
  const updateLike = (reviewId, type) => {
    axios
      .put(`/review/update/type=${type}`, {
        reviewId,
      })
      .then(() => {
        console.log('posted');
      });
  };

  /**
   * Handles what happens when the file is changed
   * @param {Event} e event of a changing file
   */
  const fileChangeHandler = (e) => {
    setFile(null);
    e.persist();
    if (e.target.files) {
      const newImage = {
        name: e.target.files[0].name,
        url: URL.createObjectURL(e.target.files[0]),
        file: e.target.files[0],
      };
      setFile(newImage);
    }
  };

  // Submits a review
  const onSubmit = (data) => {
    const formData = new FormData();
    let config;
    if (!file) {
      config = {
        method: 'post',
        url: `https://screenshotapi.net/api/v1/screenshot?url=${siteURL}&token=${process.env.SCREENSHOT_API}`,
      };
    } else {
      formData.append('file', file.file);
      config = {
        method: 'post',
        url: '/review/upload',
        data: formData,
        headers: { 'Content-type': 'multipart/form-data' },
      };
    }
    axios(config)
      .then((response) => {
        const photourl = response.data.screenshot || response.data.url;
        console.log(photourl);
        return axios.post('/review/submit', {
          text: data,
          weburl: siteURL,
          photourl,
          title: document.getElementById('title').value,
          keyword: document.getElementById('keyword').value,
          rating: starsSelected,
        });
      })
      .then(() => {
        console.log('review posted!');
        setRedirect(true);
      })
      .catch((err) => {
        console.error(err);
      });

    // axios
    //   .post('/review/submit', {
    //     text: data,
    //     weburl: siteURL,
    //     title: document.getElementById('title').value,
    //     keyword: document.getElementById('keyword').value,
    //     rating: starsSelected,
    //   })
    //   .then(() => {
    //     console.log('review posted!');
    //     setRedirect(true);
    //   });
  };

  const userLogout = () => {
    axios.get('/logout').then(() => {
      window.location = '/';
    });
  };

  const checkRating = (stars) => {
    setStarsSelected(stars);
  };

  return (
    <div>
      {!redirect ? null : <Redirect to="/me" />}
      <Background style={{ height: '10px' }}>
        <h1 style={{ color: 'white', display: 'inline-block' }}>
          Leave a Review For {siteURL.split('//')[1].split('.com')[0]}
        </h1>
        <Link to="/">
          <h1 style={{ display: 'inline-block', marginLeft: '500px' }}>
            Back to Homepage
          </h1>
        </Link>
      </Background>
      {reviews.map((review) => {
        let count = 0;
        return (
          <div>
            <ImageBG width="200">
              <div>
                <img
                  src={review.image}
                  alt="Title Box"
                  style={{
                    position: 'absolute',
                    marginBottom: '20px',
                    boxShadow: '0 3px 10px 2px gray',
                  }}
                  width="150px"
                  height="150px"
                />
                <TitleBox>
                  <h1
                    style={{ marginLeft: '200px', padding: '0px' }}>
                    {review.title}
                  </h1>
                </TitleBox>
                <h4 style={{ marginLeft: '170px', padding: '0px' }}>
                  {' '}
                  Written By:
                  {review.username}
                </h4>
                <a
                  href={review.webUrl}
                  style={{ marginLeft: '170px', padding: '0px' }}
                >
                  {review.webUrl}
                </a>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'inline-block', marginLeft: '20px' }}>
                    <LikeBG>
                      <h4>
                        Likes:
                        {review.likes}
                      </h4>
                    </LikeBG>
                    <DisLikeBG>
                      <h4>
                        {' '}
                        Dislikes:
                        {review.dislike}
                      </h4>
                    </DisLikeBG>
                  </div>
                  <div
                    style={{
                      maxWidth: '700px',
                      marginLeft: '50px',
                      marginBottom: '30px',
                      position: 'absolute',
                      padding: '12px',
                      display: 'inline-block',
                    }}
                  >
                    {review.text}
                  </div>
                </div>
                <img
                  height="10"
                  alt="background"
                  style={{ marginTop: '20px' }}
                />
              </div>
            </ImageBG>
            <button
              type="submit"
              onClick={() => {
                if (count === 0) {
                  updateLike(review.id, 'like');
                  count = +1;
                }
              }}
            >
              <MyButton>Helpful</MyButton>
            </button>
            <button
              type="submit"
              onClick={() => {
                if (count === 0) {
                  updateLike(review.id, 'dislike');
                  count = +1;
                }
              }}
            >
              <MyButton>Unhelpful</MyButton>
            </button>
          </div>
        );
      })}
      <div style={{ marginLeft: '10px', marginRight: '10px', backgroundColor: '#9ACD32' }}>
        <h1>Write Review</h1>
        <input id="title" type="text" placeholder="Title your Review" />
        <br />
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Review:</label>
          <br />
          <textarea ref={register} name="message" />
          <br />
          <div>
            <Rating checkRating={checkRating} />
          </div>
          <div>
            Add keywords/tags to help users find reviews!
          </div>
          <input id="keyword" type="text" placeholder="enter keywords separated by commas" style={{ width: '250px' }} />
          <br />
          <PhotoUpload changeHandler={fileChangeHandler} file={file} />
          <button style={{ marginBottom: '50px' }}>
            <MyButton>Submit Review</MyButton>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Reviews;
