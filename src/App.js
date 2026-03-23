import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import ToolBar from './components/ToolBar/ToolBar';
import MenuSideBar from './components/MenuSideBar/MenuSideBar';
import HomePage from './components/pages/HomePage/HomePage';
import BidsCenter from './components/pages/BidsCenter/BidsCenter';
import MyProfilePage from './components/pages/MyProfilePage/MyProfilePage';
import MakeABidPage from './components/pages/MakeABidPage/MakeABidPage';
import AddItemModal from './components/pages/MyProfilePage/AddItemModal/AddItemModal';
import SignUpModal from './components/SignUpModal/SignUpModal';
import SignInModal from './components/SignInModal/SignInModal';
//import DataInitializer from './components/admin/DataInitializer';
import { onUserStateChanged } from './services/authService';
import FirebaseDataService from './services/firebaseDataService';

function App() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDistance, setSelectedDistance] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const handleApply = (distance, interests) => {
    setSelectedDistance(distance);
    setSelectedInterests(interests);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    // מאזין לשינויים במשתמש המחובר
    const unsubscribe = onUserStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // בדוק אם המשתמש קיים ב-Firestore
        const existingUser = await FirebaseDataService.getUserByEmail(firebaseUser.email);
        if (existingUser) {
          setUser(existingUser);
          setIsSignedIn(true);
        } else {
          // המשתמש לא קיים ב-Firestore, נמתין ל-flow של ההרשמה
          setUser(null);
          setIsSignedIn(false);
        }
      } else {
        setUser(null);
        setIsSignedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">

      <ToolBar
        toggleMenu={toggleMenu}
        isSignedIn={isSignedIn}
        user={user}
        onSignUpClick={() => setIsSignUpModalOpen(true)}
        onSignInClick={() => setIsSignInModalOpen(true)}
        search={search}
        setSearch={setSearch}
        selectedDistance={selectedDistance}
        setSelectedDistance={setSelectedDistance}
        selectedInterests={selectedInterests}
        setSelectedInterests={setSelectedInterests}
        onApply={handleApply}
        userInterests={user?.interests || []}
      />

      {isSignUpModalOpen && (
        <SignUpModal
          onClose={() => {
            setIsSignUpModalOpen(false);
            setGoogleUserData(null);
          }}
          onComplete={async (userInfo) => {
            // ודא שיש interests, טלפון, תמונה וכו'
            let photoURL = userInfo.photo;
            const uid = userInfo.uid || (userInfo.email ? userInfo.email.replace(/[^a-zA-Z0-9]/g, '_') : Date.now().toString());
            if (userInfo.photo && userInfo.photo instanceof File && userInfo.email) {
              photoURL = await FirebaseDataService.uploadProfilePhotoToStorage(uid, userInfo.photo);
            }
            // שמור את כל הפרטים ב-Firestore
            const userData = await FirebaseDataService.addUserIfNotExists({
              ...userInfo,
              uid,
              photoURL: photoURL || userInfo.photoURL || '',
              interests: userInfo.interests || [],
              phone: userInfo.phone || '',
            });
            setUser(userData);
            setIsSignedIn(true);
            setIsSignUpModalOpen(false);
            setGoogleUserData(null);
          }}
          defaultName={googleUserData?.displayName || googleUserData?.name || ''}
          defaultEmail={googleUserData?.email || ''}
          defaultPhone={googleUserData?.phoneNumber || ''}
          defaultPhoto={googleUserData?.photoURL || ''}
          defaultAvatarColor={googleUserData?.avatarColor || ''}
          hideGoogleButton={!!googleUserData}
        />
      )}

      {isSignInModalOpen && (
        <SignInModal
          onClose={() => setIsSignInModalOpen(false)}
          onGoogleSignIn={async (googleUser) => {
            // בדוק אם המשתמש כבר קיים לפי אימייל
            const existingUser = await FirebaseDataService.getUserByEmail(googleUser.email);
            if (existingUser) {
              setUser(existingUser);
              setIsSignedIn(true);
              setIsSignInModalOpen(false);
              setGoogleUserData(null);
              return;
            }
            // אם לא קיים, פתח את מסך ההרשמה להשלמת פרטים
            setGoogleUserData(googleUser);
            setIsSignInModalOpen(false);
            setIsSignUpModalOpen(true);
          }}
        />
      )}

      {isMenuOpen && (
        <MenuSideBar
          onClose={toggleMenu}
          openAddModal={() => {
            setIsAddModalOpen(true);
            setIsMenuOpen(false);
          }}
          onLogout={async () => {
            try {
              await import('./services/authService').then(m => m.logout());
            } catch (e) {}
            setUser(null);
            setIsSignedIn(false);
            navigate('/'); // נווט לדף הראשי אחרי logout
          }}
        />
      )}

      {isAddModalOpen && (
        <AddItemModal onClose={() => setIsAddModalOpen(false)} user={user} />
      )}

      <Routes>
        <Route path="/" element={<HomePage user={user} search={search} setSearch={setSearch} selectedDistance={selectedDistance} setSelectedDistance={setSelectedDistance} selectedInterests={selectedInterests} setSelectedInterests={setSelectedInterests} onApply={handleApply} userInterests={user?.interests || []} />} />
        <Route path="/discover" element={<HomePage user={user} search={search} setSearch={setSearch} selectedDistance={selectedDistance} setSelectedDistance={setSelectedDistance} selectedInterests={selectedInterests} setSelectedInterests={setSelectedInterests} onApply={handleApply} userInterests={user?.interests || []} />} />
        <Route path="/bids-center" element={<BidsCenter />} />
        <Route path="/profile" element={<MyProfilePage user={user} onUserUpdate={handleUserUpdate} />} />
        <Route path="/make-a-bid/:itemId" element={<MakeABidPage user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
