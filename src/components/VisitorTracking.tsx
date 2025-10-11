'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const VisitorTracking = () => {
  const pathname = usePathname();
  const sessionStartTime = useRef<number>(Date.now());
  const pageStartTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);
  const interactionCount = useRef<number>(0);

  // Generate or retrieve user ID
  const getUserId = () => {
    let userId = localStorage.getItem('visitor_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_user_id', userId);
    }
    return userId;
  };

  // Generate session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }
    return sessionId;
  };

  // Track scroll depth
  const trackScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollDepth.current = Math.max(scrollDepth.current, scrollPercent);
  };

  // Track user interactions
  const trackInteraction = (eventType: string, eventData: any) => {
    interactionCount.current++;
    
    // Temporarily disabled for performance
    // fetch('/api/track-interaction', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     userId: getUserId(),
    //     sessionId: getSessionId(),
    //     eventType,
    //     eventData,
    //     page: pathname,
    //     timestamp: new Date().toISOString()
    //   })
    // }).catch(() => {}); // Silent fail
  };

  useEffect(() => {
    pageStartTime.current = Date.now();
    
    // Track the page visit
    const trackVisit = async () => {
      try {
        const userAgent = navigator.userAgent;
        const referrer = document.referrer || null;
        const userId = getUserId();
        const sessionId = getSessionId();
        
        // Extract UTM parameters
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmCampaign = urlParams.get('utm_campaign');

        // Temporarily disabled for performance
        // await fetch('/api/track-visit', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     userId,
        //     sessionId,
        //     page: pathname,
        //     referrer,
        //     userAgent,
        //     utmSource,
        //     utmMedium,
        //     utmCampaign,
        //     timestamp: new Date().toISOString()
        //   })
        // });

        // Track page view interaction
        trackInteraction('page_view', {
          page: pathname,
          referrer,
          utmSource,
          utmMedium,
          utmCampaign
        });
      } catch (error) {
        console.log('Visit tracking failed:', error);
      }
    };

    // Set up event listeners for detailed tracking
    const handleScroll = () => trackScrollDepth();
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      trackInteraction('click', {
        elementId: target.id,
        elementTag: target.tagName,
        elementText: target.textContent?.slice(0, 100),
        elementClass: target.className,
        x: e.clientX,
        y: e.clientY
      });
    };

    const handleFormFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        trackInteraction('form_focus', {
          elementId: target.id,
          elementName: (target as HTMLInputElement).name,
          elementType: (target as HTMLInputElement).type
        });
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);
    document.addEventListener('focusin', handleFormFocus);

    // Track visit after a small delay
    const timer = setTimeout(trackVisit, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focusin', handleFormFocus);

      // Track page exit
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      
      // Send exit tracking (using sendBeacon for reliability)
      if (navigator.sendBeacon) {
        const exitData = JSON.stringify({
          userId: getUserId(),
          sessionId: getSessionId(),
          page: pathname,
          timeOnPage,
          scrollDepth: scrollDepth.current,
          interactionCount: interactionCount.current,
          exitPage: true
        });
        
        // navigator.sendBeacon('/api/track-exit', exitData);
      }
    };
  }, [pathname]);

  // This component renders nothing but tracks everything
  return null;
};

export default VisitorTracking;