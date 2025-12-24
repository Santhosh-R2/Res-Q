import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis'; 
import helping from '../../assets/AboutImg/helping.jpg';
import packing from '../../assets/AboutImg/packing.jpg';
import volunters from '../../assets/AboutImg/volunters.jpg';
import '../styles/AboutUs.css';

gsap.registerPlugin(ScrollTrigger);

function AboutUs() {
  const comp = useRef(null);

  useLayoutEffect(() => {
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

    let ctx = gsap.context(() => {
      
      const tlHero = gsap.timeline();
      tlHero.fromTo(".About-hero-content > *",
        { y: 100, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 1.2,
          stagger: 0.15,
          ease: "power4.out",
          delay: 0.2
        }
      );

      const sections = gsap.utils.toArray('.About-content-section');

      sections.forEach((section) => {
        const imgWrapper = section.querySelector('.About-img-wrapper');
        const img = section.querySelector('.About-image');
        const textItems = section.querySelectorAll('.About-text-container > *');

        gsap.fromTo(img,
          { scale: 1.3, y: -40 },
          {
            scale: 1,
            y: 40,
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
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
            }
          }
        );

        gsap.fromTo(textItems,
          { y: 40, opacity: 0 },
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

      gsap.fromTo(".About-full-width-img", 
        { scale: 1.2, y: -50 },
        { 
          scale: 1,
          y: 50,
          ease: "none",
          scrollTrigger: {
            trigger: ".About-team-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );

      gsap.fromTo(".About-stat-box",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".About-stat-grid",
            start: "top 90%",
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
    <div className="About-page-wrapper" ref={comp}>
      
      <div className="About-hero-section">
        <div className="About-hero-bg"></div>
        <div className="About-hero-content">
          <span className="About-hero-badge">About Us</span>
          <h1 className="About-title">Bridging Chaos<br />& Coordination</h1>
          <p className="About-subtitle">
            ResQ-Link isn't just an app. It's a decentralized nervous system designed to save lives when infrastructure fails.
          </p>
        </div>
      </div>

      <div className="About-content-section">
        <div className="About-container">
          <div className="About-row">
            <div className="About-col About-img-col">
              <div className="About-img-wrapper">
                <img src={helping} alt="Helping hands" className="About-image" />
              </div>
            </div>
            <div className="About-col About-text-container">
              <span className="About-tag">Our Story</span>
              <h2>Born from Necessity</h2>
              <p>
                During recent floods, we witnessed a massive disconnect. People wanted to help, 
                and victims were crying out, but there was no central link.
              </p>
              <p>
                ResQ-Link acts as a <strong>Decentralized Ecosystem</strong>. We believe that in a disaster, 
                every second counts, and information is as valuable as water.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="About-content-section About-reverse">
        <div className="About-container">
          <div className="About-row">
            <div className="About-col About-text-container">
              <span className="About-tag">Our Values</span>
              <h2>Radical Transparency</h2>
              <p>
                Donation scams destroy trust. That's why we built the 
                <strong> Inventory Management System</strong>.
              </p>
              <p>
                When you donate via ResQ-Link, you aren't throwing money into a black hole. 
                You are fulfilling a specific request—like "50 Medical Kits"—and 
                tracking it until it reaches the hands of those in need.
              </p>
            </div>
            <div className="About-col About-img-col">
              <div className="About-img-wrapper">
                <img src={packing} alt="Packing supplies" className="About-image" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="About-team-section">
        <div className="About-container About-center-text">
          <span className="About-tag">The Heroes</span>
          <h2>Powered by People</h2>
          <p className="About-desc-lg">
            Algorithms optimize the route, but volunteers drive the rescue. 
            Our platform empowers everyday citizens to become first responders.
          </p>
          
          <div className="About-hero-image-wrapper">
               <img src={volunters} alt="Group of volunteers" className="About-full-width-img" />
          </div>

          <div className="About-stat-grid">
             <div className="About-stat-box">
                <h3>10k+</h3>
                <span>Lives Impacted</span>
             </div>
             <div className="About-stat-box">
                <h3>500+</h3>
                <span>Volunteers</span>
             </div>
             <div className="About-stat-box">
                <h3>24/7</h3>
                <span>Active Response</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AboutUs;