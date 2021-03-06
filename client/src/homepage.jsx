import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Search from './search.jsx';
import KeywordSearch from './KeywordSearch';
import ReviewList from './ReviewList.jsx';
import searchLogo from '../assets/imgs/searchLogo.png';
import {
  MyButton,
  Background,
  logoTitle,
  userPictureStyle,
  userNameStyle,
} from '../styles';

// Displays the homepage
function HomePage() {
  const [user, setUser] = useState([]);

  // Sets the initial user state
  useEffect(() => {
    axios.get('/good')
      .then(({ data }) => {
        setUser(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Logs out the user
  const userLogout = () => {
    axios.get('/logout')
      .then(() => {
        setUser({});
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <div>
        <Background>
          <img src={searchLogo} width="30%" height="30%" alt="logo" />
          <h2 style={logoTitle}>
            {/* Harbinger */}
          </h2>
          <img alt="user" src={user.image} style={userPictureStyle} />
          <Link to="/me">
            <h2 style={userNameStyle}>
              {user.username}
            </h2>
          </Link>
          <MyButton onClick={userLogout}>Logout</MyButton>
        </Background>
      </div>
      <Search />
      <Background style={{ marginLeft: '600px' }}>
        <h2>Top Best Reviews</h2>
      </Background>
      <ReviewList userId4Comments={user.id} />
    </div>
  );
}

export default HomePage;
