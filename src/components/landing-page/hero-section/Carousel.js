// components/Carousel.js
import React from 'react';
import Slider from 'react-slick';

const Carousel = ({ images }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="carousel-item">
            <img src={image} alt={`carousel-image-${index}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
