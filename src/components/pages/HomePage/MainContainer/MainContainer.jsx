import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ItemCard } from '../../../ItemCard/ItemCard';
import ItemPage from '../../ItemPage/ItemPage';
import DataService from '../../../../services/dataService';
import FirebaseDataService from '../../../../services/firebaseDataService';
import { getProfileImageUrl } from '../../../../utils/profileImageUtils';
import './MainContainer.css';

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lon2 !== 'number'
  ) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

export const MainContainer = ({ user, search = '', selectedDistance = '', selectedInterests = [], userInterests = [] }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [visibleItems, setVisibleItems] = useState(12); // Show first 12 items initially
  const [userItems, setUserItems] = useState([]); // Store user's items for mutual match checking



  // Helper function to compare items by relevance (interests and search)
  const compareItemsByRelevance = useCallback((a, b, searchTerm) => {
    // Check if items match user interests
    const aMatchesInterests = userInterests && userInterests.length > 0 ? 
      userInterests.includes(a.category) : false;
    const bMatchesInterests = userInterests && userInterests.length > 0 ? 
      userInterests.includes(b.category) : false;
    
    // Check if items match search criteria
    const aMatchesSearch = searchTerm ? 
      ((a.name && a.name.toLowerCase().includes(searchTerm)) ||
       (a.description && a.description.toLowerCase().includes(searchTerm))) : false;
    const bMatchesSearch = searchTerm ? 
      ((b.name && b.name.toLowerCase().includes(searchTerm)) ||
       (b.description && b.description.toLowerCase().includes(searchTerm))) : false;
    
    // Priority order: user interests first, then search matches
    if (aMatchesInterests && !bMatchesInterests) return -1;
    if (!aMatchesInterests && bMatchesInterests) return 1;
    
    // If both match interests or neither matches, check search
    if (aMatchesSearch && !bMatchesSearch) return -1;
    if (!aMatchesSearch && bMatchesSearch) return 1;
    
    return 0; // If both match or neither matches, maintain current order
  }, [userInterests]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setVisibleItems(12); // Reset pagination when search changes
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Load more items function
  const loadMoreItems = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleItems(prev => prev + 12);
      setLoadingMore(false);
    }, 500); // Small delay for better UX
  }, []);

  // Reset visible items when filters change
  useEffect(() => {
    setVisibleItems(12);
  }, [selectedDistance, selectedInterests]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const allItems = await DataService.getItemsWithUsers();
        // Filter out items belonging to the logged-in user (by uid or email)
        const filtered = user && (user.uid || user.email)
          ? allItems.filter(item =>
              item.userId !== user.uid &&
              item.userEmail !== user.email
            )
          : allItems;
        setItems(filtered);
      } catch (err) {
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [user]);

  // Load user's items for mutual match checking
  useEffect(() => {
    const fetchUserItems = async () => {
      if (user && (user.uid || user.email)) {
        try {
          const items = await FirebaseDataService.getUserItems(user.uid || user.email);
          console.log('Loaded user items:', items);
          setUserItems(items);
        } catch (err) {
          console.error('Failed to load user items:', err);
        }
      }
    };
    fetchUserItems();
  }, [user]);

  // Memoize filtered and processed items to avoid recalculations
  const processedItems = useMemo(() => {
    // Simple text search filter (name or description)
    const lowerSearch = debouncedSearch.toLowerCase();
    let filteredItems = lowerSearch
      ? items.filter(item =>
          (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
          (item.description && item.description.toLowerCase().includes(lowerSearch))
        )
      : items;

    // Distance filter
    if (selectedDistance) {
      filteredItems = filteredItems.filter(item => {
        if (
          user && user.lat && user.lng &&
          item.user && item.user.lat && item.user.lng
        ) {
          const dist = getDistanceFromLatLonInKm(
            parseFloat(user.lat),
            parseFloat(user.lng),
            parseFloat(item.user.lat),
            parseFloat(item.user.lng)
          );
          return dist <= parseFloat(selectedDistance);
        }
        // If no location info, exclude from results when filtering by distance
        return false;
      });
    }

    // Interests filter
    if (selectedInterests && selectedInterests.length > 0) {
      filteredItems = filteredItems.filter(item => selectedInterests.includes(item.category));
    }



    // Enhanced sorting with mutual match support
    if (user && user.lat && user.lng) {
      filteredItems.sort((a, b) => {
        const distA = getDistanceFromLatLonInKm(
          parseFloat(user.lat),
          parseFloat(user.lng),
          parseFloat(a.user?.lat || 0),
          parseFloat(a.user?.lng || 0)
        );
        const distB = getDistanceFromLatLonInKm(
          parseFloat(user.lat),
          parseFloat(user.lng),
          parseFloat(b.user?.lat || 0),
          parseFloat(b.user?.lng || 0)
        );
        
        // Handle cases where distance calculation fails
        if (distA === null && distB === null) return 0;
        if (distA === null) return 1; // Put items without location at the end
        if (distB === null) return -1;
        

        
        // First compare by relevance (interests and search)
        const relevanceComparison = compareItemsByRelevance(a, b, debouncedSearch.toLowerCase());
        if (relevanceComparison !== 0) return relevanceComparison;
        
        // If relevance is equal, sort by distance
        return distA - distB; // Sort from nearest to farthest
      });
    } else {
      // If no user location, prioritize user interests and search matches
      const lowerSearch = debouncedSearch.toLowerCase();
      if (lowerSearch || (userInterests && userInterests.length > 0)) {
        filteredItems.sort((a, b) => compareItemsByRelevance(a, b, lowerSearch));
      }
    }

      // Pre-calculate distances and mutual match status for display
  return filteredItems.map(item => {
    let distance = '';
    if (user && user.lat && user.lng && item.user && item.user.lat && item.user.lng) {
      const dist = getDistanceFromLatLonInKm(
        parseFloat(user.lat),
        parseFloat(user.lng),
        parseFloat(item.user.lat),
        parseFloat(item.user.lng)
      );
      if (typeof dist === 'number' && !isNaN(dist)) {
        distance = dist.toFixed(1) + ' km';
      }
    }
    
    // Check for mutual match (always check, not just when personalized is enabled)
    let isMutualMatch = false;
    if (user && userInterests && userInterests.length > 0 && userItems.length > 0) {
      const itemMatchesUserInterests = userInterests.includes(item.category);
      const sellerInterests = item.user?.interests || [];
      
      if (itemMatchesUserInterests && sellerInterests.length > 0) {
        // Check if user has items that match seller's interests
        const userHasMatchingItems = userItems.some(userItem => 
          sellerInterests.includes(userItem.category)
        );
        
        isMutualMatch = userHasMatchingItems;
      }
    }
    
    return {
      ...item,
      displayDistance: distance,
      profileImageUrl: getProfileImageUrl(item.user),
      isMutualMatch
    };
  });
  }, [items, debouncedSearch, selectedDistance, selectedInterests, user, userItems, compareItemsByRelevance, userInterests]);

  // Get visible items for pagination
  const displayedItems = processedItems.slice(0, visibleItems);
  const hasMoreItems = visibleItems < processedItems.length;

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!hasMoreItems || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMoreItems, loadMoreItems, loadingMore]);

  if (loading) return (
    <div className="items-container">
      <div className="loading-container">
        <div className="loading-text">
          <div className="loading-spinner"></div>
          Loading items...
        </div>
      </div>
    </div>
  );
  if (error) return (
    <div className="items-container">
      <div className="error-container">
        <div>
          <div className="error-icon">⚠️</div>
          {error}
          <br />
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="items-container">
      {search !== debouncedSearch && (
        <div className="search-loading">
          <div className="search-spinner"></div>
          Searching...
        </div>
      )}
      
      {displayedItems.length === 0 ? (
        <div className="empty-state">
          <div>
            <div className="empty-icon">🔍</div>
            No items found.
            <br />
            <span className="empty-subtitle">
              {search || selectedDistance || selectedInterests.length > 0
                ? 'Try adjusting your search criteria.'
                : 'No items are available at the moment.'
              }
            </span>
          </div>
        </div>
      ) : (
        <>
          {displayedItems.map((item, index) => (
            <div key={item.id || index} onClick={() => setSelectedItem(item)}>
              <ItemCard
                imageUrl={item.imageUrl}
                name={item.name}
                category={item.category}
                listedSince={item.listedSince}
                profileImage={item.profileImageUrl}
                distance={item.displayDistance}
                userName={item.user?.name || item.userName}
                isMutualMatch={item.isMutualMatch}
                userSwaps={item.user?.swaps || 0}
              />
            </div>
          ))}
          
          {hasMoreItems && (
            <div 
              id="scroll-sentinel"
              className="load-more-container"
            >
              {loadingMore && (
                <div className="loading-spinner"></div>
              )}
            </div>
          )}
          
          {!hasMoreItems && processedItems.length > 0 && (
            <div className="items-summary">
              Showing all {processedItems.length} items
            </div>
          )}
        </>
      )}

      {selectedItem && (
        <ItemPage item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};
