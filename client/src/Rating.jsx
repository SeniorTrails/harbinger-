import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

/**
 * Displays yellow and grey stars depending on the current rating.
 * @param {Boolean} selected whether or not current star is selected/active
 * @param {Function} onSelect onClick functionality to change rating
 */

const Star = ({ selected = false, onSelect = (x) => x }) => (
  <FaStar color={selected ? 'yellow' : 'grey'} onClick={onSelect} />
);

/**
 * Creates five stars depending on the current rating. onSelect provides
 * onClick functionality for users to change the rating, if and only if
 * they are on the review creation pane.
 * @param {Function} checkRating sets the current rating and tells the parent
 * element.
 * @param {Integer} defaultStars gets current rating from database if user is
 * not on review creation pane, otherwise, sets to 0.
 * @param {Boolean} alreadyRated passed in if user is on a pane that does not
 * allow stars to be rated, e.g. not on the review creation pane.
 */

export default function Rating({ checkRating, defaultStars, alreadyRated }) {
  const currentStars = defaultStars || 0;
  const [starsSelected, setStarsSelected] = useState(currentStars);
  useEffect(() => {
    if (checkRating) {
      checkRating(starsSelected);
    }
  }, [starsSelected]);
  return (
    <>
      {[...Array(5)].map((n, i) => (
        <Star
          key={i}
          selected={starsSelected > i}
          onSelect={() => { if (!alreadyRated) { setStarsSelected(i + 1); } }}
        />
      ))}
      &nbsp;
      {starsSelected}
      &nbsp;of 5 stars
    </>
  );
}
