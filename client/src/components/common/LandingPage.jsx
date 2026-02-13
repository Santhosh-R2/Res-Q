import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis'; 
import disaster from '../../assets/LandingImg/disaster.jpg';
import figters from '../../assets/LandingImg/figters.jpg';
import landscape from '../../assets/LandingImg/landscape.jpg'; 
import naturedisaster from '../../assets/LandingImg/naturedisaster.jpg';
import rescue from '../../assets/LandingImg/rescue.jpg';
import { Link } from 'react-router-dom';

import '../styles/LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const comp = useRef(null); 

  useLayoutEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical', 
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, 
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    
    let ctx = gsap.context(() => {
      
      const tlHero = gsap.timeline();
      tlHero.fromTo(".Landing-hero-content > *", 
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

      const sections = gsap.utils.toArray('.Landing-zig-zag-section');

      sections.forEach((section) => {
        const imgWrapper = section.querySelector('.Landing-img-wrapper');
        const img = section.querySelector('.Landing-feature-img');
        const textItems = section.querySelectorAll('.Landing-text-wrapper > *');

        gsap.fromTo(img,
          { scale: 1.3, y: -50 }, 
          {
            scale: 1,
            y: 50,
            ease: "none", 
            scrollTrigger: {
              trigger: imgWrapper,
              start: "top bottom", 
              end: "bottom top",   
              scrub: true,        
            }
          }
        );

        gsap.fromTo(imgWrapper,
          { clipPath: "inset(0% 0% 100% 0%)", opacity: 0 }, 
          {
            clipPath: "inset(0% 0% 0% 0%)", 
            opacity: 1,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 75%", 
            }
          }
        );

        gsap.fromTo(textItems, 
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1, 
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
            }
          }
        );
      });

    }, comp); 

    return () => {
      ctx.revert(); 
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="Landing-page-wrapper" ref={comp}>
      
      <section className="Landing-hero-section">
        <div className="Landing-hero-bg" style={{ backgroundImage: `url(${rescue})` }}></div>
        <div className="Landing-hero-overlay"></div>

        <div className="Landing-hero-content">
          <div className="Landing-badge">AI-Powered Response</div>
          <h1>ResQ-Link</h1>
          <h2>Decentralized Disaster Ecosystem</h2>
          <p>The bridge between distress and rescue. Real-time coordination for Victims, Volunteers, and NGOs.</p>
          <div className="Landing-hero-buttons">
          <Link to="/login">  <button className="Landing-btn Landing-btn-primary">Request Help (SOS)</button></Link>
          <Link to="/register">  <button className="Landing-btn Landing-btn-outline">Join Mission</button></Link>
          </div>
        </div>
      </section>

      <section className="Landing-zig-zag-section">
        <div className="Landing-container">
          <div className="Landing-row">
            <div className="Landing-col Landing-img-column">
              <div className="Landing-img-wrapper">
                <img src={disaster} alt="Disaster Chaos" className="Landing-feature-img" />
              </div>
            </div>
            <div className="Landing-col Landing-text-wrapper">
              <span className="Landing-section-subtitle">The Challenge</span>
              <h3>The Chaos of Crisis</h3>
              <p>
                Traditional disaster management is fragmented. Victims scream into the void of social media while NGOs operate in silos. This leads to <strong>information bottlenecks</strong>.
              </p>
              <div className="Landing-stat-box">
                <h4>60%</h4>
                <span>Delayed Response Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="Landing-zig-zag-section Landing-reverse">
        <div className="Landing-container">
          <div className="Landing-row">
            <div className="Landing-col Landing-img-column">
              <div className="Landing-img-wrapper">
                <img src={naturedisaster} alt="AI Technology" className="Landing-feature-img" />
              </div>
            </div>
            <div className="Landing-col Landing-text-wrapper">
              <span className="Landing-section-subtitle">Our Solution</span>
              <h3>AI-Driven Coordination</h3>
              <p>
                ResQ-Link uses <strong>Deep Learning (CNN)</strong> to analyze disaster images and auto-prioritize severity. Our "Offline-First" PWA ensures SOS signals go through.
              </p>
              <ul className="Landing-feature-list">
                <li>Real-time Geospatial Mapping</li>
                <li>Automated Triage System</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="Landing-zig-zag-section">
        <div className="Landing-container">
          <div className="Landing-row">
            <div className="Landing-col Landing-img-column">
              <div className="Landing-img-wrapper">
                <img src={figters} alt="Volunteers" className="Landing-feature-img" />
              </div>
            </div>
            <div className="Landing-col Landing-text-wrapper">
              <span className="Landing-section-subtitle">Ground Force</span>
              <h3>The "Uber" for Rescue</h3>
              <p>
                We replace manual call centers with algorithmic routing. Using the <strong>Haversine Algorithm</strong>, we connect the nearest volunteers to victims instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="Landing-zig-zag-section Landing-reverse">
        <div className="Landing-container">
          <div className="Landing-row">
            <div className="Landing-col Landing-img-column">
              <div className="Landing-img-wrapper">
                <img src={landscape} alt="Community" className="Landing-feature-img" />
              </div>
            </div>
            <div className="Landing-col Landing-text-wrapper">
              <span className="Landing-section-subtitle">Transparent Aid</span>
              <h3>Targeted Donations</h3>
              <p>
                Don't just send money—fulfill specific needs. Our Inventory Management System allows donors to pledge specific items like blankets or medicine.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="Landing-cta-footer">
        <div className="Landing-cta-content">
          <h2>Ready to save lives?</h2>
          <p>Join the network today.</p>
          <button className="Landing-btn Landing-btn-primary Landing-large">Launch App</button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;