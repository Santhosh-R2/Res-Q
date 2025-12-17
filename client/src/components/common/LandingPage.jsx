import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis'; 

// Import Images (Keep your existing imports)
import disaster from '../../assets/LandingImg/disaster.jpg';
import figters from '../../assets/LandingImg/figters.jpg';
import landscape from '../../assets/LandingImg/landscape.jpg'; 
import naturedisaster from '../../assets/LandingImg/naturedisaster.jpg';
import rescue from '../../assets/LandingImg/rescue.jpg';

// Import CSS
import '../styles/LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const comp = useRef(null); // Create a ref for the root component

  useLayoutEffect(() => {
    // 1. SETUP LENIS (SMOOTH SCROLL)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical', 
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, // Keep false on mobile to prevent lag
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. GSAP CONTEXT (The React Safe Zone)
    let ctx = gsap.context(() => {
      
      // --- HERO ANIMATION ---
      const tlHero = gsap.timeline();
      tlHero.fromTo(".hero-content > *", 
        { y: 50, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        { 
          y: 0, 
          opacity: 1, 
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 1.2, 
          stagger: 0.2, 
          ease: "power3.out",
          delay: 0.2
        }
      );

      // --- SECTION ANIMATIONS (Parallax & Reveals) ---
      const sections = gsap.utils.toArray('.zig-zag-section');

      sections.forEach((section) => {
        const imgWrapper = section.querySelector('.img-wrapper');
        const img = section.querySelector('.feature-img');
        const textItems = section.querySelectorAll('.text-wrapper > *');

        // A. Image Parallax Effect (High-end feel)
        // The image starts zoomed in (1.3) and scales down to 1 while moving vertically
        gsap.fromTo(img,
          { scale: 1.3, y: -50 }, 
          {
            scale: 1,
            y: 50,
            ease: "none", // Linear ease is best for parallax
            scrollTrigger: {
              trigger: imgWrapper,
              start: "top bottom", // Start when top of img hits bottom of viewport
              end: "bottom top",   // End when bottom of img hits top of viewport
              scrub: true,         // Link animation progress to scroll bar
            }
          }
        );

        // B. Image Reveal (Clip Path)
        // This makes the image container appear cleanly
        gsap.fromTo(imgWrapper,
          { clipPath: "inset(0% 0% 100% 0%)", opacity: 0 }, // Hidden at bottom
          {
            clipPath: "inset(0% 0% 0% 0%)", // Fully visible
            opacity: 1,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 75%", // Start animation when section is 75% down the screen
            }
          }
        );

        // C. Text Stagger Animation
        gsap.fromTo(textItems, 
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1, // Animate lines one by one
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
            }
          }
        );
      });

    }, comp); // Scope selector to this component

    // CLEANUP
    return () => {
      ctx.revert(); // Kills all GSAP animations created in this context
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="landing-page-wrapper" ref={comp}>
      
      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        {/* Parallax Background Layer */}
        <div className="hero-bg" style={{ backgroundImage: `url(${rescue})` }}></div>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="badge">AI-Powered Response</div>
          <h1>ResQ-Link</h1>
          <h2>Decentralized Disaster Ecosystem</h2>
          <p>The bridge between distress and rescue. Real-time coordination for Victims, Volunteers, and NGOs.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Request Help (SOS)</button>
            <button className="btn btn-outline">Join Mission</button>
          </div>
        </div>
      </section>

      {/* --- SECTION 1 --- */}
      <section className="zig-zag-section">
        <div className="container">
          <div className="row">
            <div className="col img-column">
              <div className="img-wrapper">
                <img src={disaster} alt="Disaster Chaos" className="feature-img" />
              </div>
            </div>
            <div className="col text-wrapper">
              <span className="section-subtitle">The Challenge</span>
              <h3>The Chaos of Crisis</h3>
              <p>
                Traditional disaster management is fragmented. Victims scream into the void of social media while NGOs operate in silos. This leads to <strong>information bottlenecks</strong>.
              </p>
              <div className="stat-box">
                <h4>60%</h4>
                <span>Delayed Response Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2 --- */}
      <section className="zig-zag-section reverse">
        <div className="container">
          <div className="row">
            <div className="col img-column">
              <div className="img-wrapper">
                <img src={naturedisaster} alt="AI Technology" className="feature-img" />
              </div>
            </div>
            <div className="col text-wrapper">
              <span className="section-subtitle">Our Solution</span>
              <h3>AI-Driven Coordination</h3>
              <p>
                ResQ-Link uses <strong>Deep Learning (CNN)</strong> to analyze disaster images and auto-prioritize severity. Our "Offline-First" PWA ensures SOS signals go through.
              </p>
              <ul className="feature-list">
                <li>Real-time Geospatial Mapping</li>
                <li>Automated Triage System</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3 --- */}
      <section className="zig-zag-section">
        <div className="container">
          <div className="row">
            <div className="col img-column">
              <div className="img-wrapper">
                <img src={figters} alt="Volunteers" className="feature-img" />
              </div>
            </div>
            <div className="col text-wrapper">
              <span className="section-subtitle">Ground Force</span>
              <h3>The "Uber" for Rescue</h3>
              <p>
                We replace manual call centers with algorithmic routing. Using the <strong>Haversine Algorithm</strong>, we connect the nearest volunteers to victims instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4 --- */}
      <section className="zig-zag-section reverse">
        <div className="container">
          <div className="row">
            <div className="col img-column">
              <div className="img-wrapper">
                <img src={landscape} alt="Community" className="feature-img" />
              </div>
            </div>
            <div className="col text-wrapper">
              <span className="section-subtitle">Transparent Aid</span>
              <h3>Targeted Donations</h3>
              <p>
                Don't just send money—fulfill specific needs. Our Inventory Management System allows donors to pledge specific items like blankets or medicine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="cta-footer">
        <div className="cta-content">
          <h2>Ready to save lives?</h2>
          <p>Join the network today.</p>
          <button className="btn btn-primary large">Launch App</button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;