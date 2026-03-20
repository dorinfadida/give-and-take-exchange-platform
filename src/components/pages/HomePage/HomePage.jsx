import React from 'react';
import { MainContainer } from './MainContainer/MainContainer';
import './HomePage.css';

export const HomePage = ({ user, search, setSearch, selectedDistance, setSelectedDistance, selectedInterests, setSelectedInterests, onApply, userInterests }) => {
  return (
    <div className='home-page'>
      <div className="entry-banner">
        <img src="/6.png" alt="giveNtake banner" className="entry-image" />
      </div>

      <div className="homepage-container">
        {/* <SearchBar search={search} setSearch={setSearch} /> */}
        <MainContainer 
          user={user} 
          search={search} 
          selectedDistance={selectedDistance} 
          selectedInterests={selectedInterests} 
          userInterests={userInterests} 
        />
        <h3 id="items-bottomline">Join Now And Start Swapping!</h3>
      </div>
    </div>
  );
};

export default HomePage;
