// Banner.js
import React from 'react';

const Banner = () => {
  return (
    <div className="banner p-8 flex justify-center">
      {/* Image Section with proper width and height adjustment */}
      <div className="image-section" >
        <img src="/bannerwishlist.jpg" alt="Wishlist Banner" className="w-full h-auto object-cover" style={{ width: '100%', height: 'auto' }} />
      </div>
    </div>
  );
};

export default Banner;