import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis'; 

// Images
// Ensure you have a relevant image here. If not, the code handles it gracefully.
import contactImage from '../../assets/AboutImg/helping.jpg'; 

import '../styles/ContactUs.css';

gsap.registerPlugin(ScrollTrigger);

function ContactUs() {
  const comp = useRef(null); // Scope ref

  useLayoutEffect(() => {
    // 1. SETUP LENIS (SMOOTH SCROLL)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical', 
      smooth: true,
      smoothTouch: false,
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

    // 2. GSAP CONTEXT (Lag Fix)
    let ctx = gsap.context(() => {
      
      // A. Header Text Stagger
      gsap.fromTo(".cnt-header-content > *",
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          stagger: 0.15, 
          ease: "power3.out",
          delay: 0.2 
        }
      );

      // B. Main Columns (Info & Form) Floating Up
      gsap.fromTo(".cnt-col",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2, // Left col appears, then right col
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cnt-container",
            start: "top 85%", // Triggers slightly before element enters view
          }
        }
      );

      // C. Info Details (Icons) Pop In
      gsap.fromTo(".cnt-detail-row",
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)", // Slight bounce effect
          delay: 0.5, // Wait for column to appear first
          scrollTrigger: {
            trigger: ".cnt-info-card",
            start: "top 80%",
          }
        }
      );

      // D. Image Reveal (Clip Path)
      gsap.fromTo(".cnt-img-wrapper",
        { clipPath: "inset(0% 0% 100% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "power4.out",
          delay: 0.4,
          scrollTrigger: {
            trigger: ".cnt-info-col",
            start: "top 80%",
          }
        }
      );

    }, comp);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="cnt-page-wrapper" ref={comp}>
      
      {/* --- HEADER --- */}
      <div className="cnt-header">
        <div className="cnt-header-bg"></div>
        <div className="cnt-header-content">
          <span className="cnt-subtitle">Get in Touch</span>
          <h1>We're here to help</h1>
          <p>Have a question about the ResQ-Link ecosystem? Want to partner with us?</p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="cnt-container">
        <div className="cnt-row">
          
          {/* LEFT COLUMN: INFO & IMAGE */}
          <div className="cnt-col cnt-info-col">
            <div className="cnt-info-card">
              <h3>Contact Information</h3>
              <p className="cnt-info-desc">
                For immediate emergency assistance, please use the SOS button in the app. 
                For general inquiries, reach out below.
              </p>
              
              <div className="cnt-detail-row">
                <div className="cnt-icon">📍</div>
                <div>
                  <strong>Headquarters</strong>
                  <p>123 Resilience Blvd, Tech City, India</p>
                </div>
              </div>

              <div className="cnt-detail-row">
                <div className="cnt-icon">📞</div>
                <div>
                  <strong>Emergency Hotline</strong>
                  <p>+91 987 654 3210</p>
                </div>
              </div>

              <div className="cnt-detail-row">
                <div className="cnt-icon">✉️</div>
                <div>
                  <strong>Email Support</strong>
                  <p>help@resqlink.org</p>
                </div>
              </div>
            </div>

            {/* Decorative Image */}
            <div className="cnt-img-wrapper">
              <img src={contactImage} alt="Support Team" className="cnt-side-img" />
              <div className="cnt-img-overlay"></div>
            </div>
          </div>

          {/* RIGHT COLUMN: FORM */}
          <div className="cnt-col cnt-form-col">
            <form className="cnt-form" onSubmit={(e) => e.preventDefault()}>
              <h3>Send a Message</h3>
              
              <div className="cnt-input-group">
                <div className="cnt-input-wrapper">
                  <label>First Name</label>
                  <input type="text" placeholder="John" />
                </div>
                <div className="cnt-input-wrapper">
                  <label>Last Name</label>
                  <input type="text" placeholder="Doe" />
                </div>
              </div>

              <div className="cnt-input-wrapper">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" />
              </div>

              <div className="cnt-input-wrapper">
                <label>Subject</label>
                <select>
                  <option>General Inquiry</option>
                  <option>Volunteer Registration Issue</option>
                  <option>NGO Partnership</option>
                  <option>Report a Bug</option>
                </select>
              </div>

              <div className="cnt-input-wrapper">
                <label>Message</label>
                <textarea rows="5" placeholder="How can we help you?"></textarea>
              </div>

              <button type="submit" className="cnt-submit-btn">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ContactUs;