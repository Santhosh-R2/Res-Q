import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FiWind, FiDroplet, FiActivity, FiThermometer, FiShield, FiPlus, FiMinus, 
  FiAlertTriangle, FiXCircle, FiBox 
} from "react-icons/fi";
import '../styles/SafetyTips.css';

gsap.registerPlugin(ScrollTrigger);

const tipsData = [
  {
    id: 1,
    title: "Flood Safety",
    icon: <FiDroplet />,
    color: "#3b82f6", 
    summary: "Stay high, stay dry. Avoid electrical hazards.",
    steps: [
      "Move to higher ground immediately.",
      "Do not walk or drive through moving water.",
      "Turn off electricity and gas mains.",
      "Avoid contact with floodwater (it may be contaminated).",
      "Listen to battery-operated radio for updates."
    ]
  },
  {
    id: 2,
    title: "Earthquake Protocol",
    icon: <FiActivity />,
    color: "#a855f7", 
    summary: "Drop, Cover, and Hold On.",
    steps: [
      "DROP to the ground; take COVER under a sturdy table.",
      "HOLD ON until the shaking stops.",
      "Stay away from glass, windows, and heavy furniture.",
      "If outdoors, stay away from buildings and power lines.",
      "Expect aftershocks."
    ]
  },
  {
    id: 3,
    title: "Fire Emergency",
    icon: <FiThermometer />,
    color: "#ef4444", 
    summary: "Get out, stay out. Call for help.",
    steps: [
      "Crawl low under smoke to escape.",
      "Touch doors with back of hand before opening.",
      "Use stairs, never elevators.",
      "If clothes catch fire: Stop, Drop, and Roll.",
      "Designate a meeting place outside."
    ]
  },
  {
    id: 4,
    title: "Cyclone / Hurricane",
    icon: <FiWind />,
    color: "#06b6d4", 
    summary: "Secure your home. Stay indoors.",
    steps: [
      "Board up windows or use storm shutters.",
      "Stay in an interior room without windows.",
      "Keep an emergency kit ready (water, food, torch).",
      "Avoid using phone unless urgent.",
      "Wait for official 'All Clear' signal."
    ]
  },
  {
    id: 5,
    title: "Medical Emergency",
    icon: <FiShield />,
    color: "#10b981",
    summary: "Check surroundings. Apply First Aid.",
    steps: [
      "Assess the scene for danger before approaching.",
      "Check response: Shake shoulders and shout.",
      "Call emergency services immediately.",
      "If bleeding: Apply direct pressure with clean cloth.",
      "If unconscious and breathing: Place in recovery position.",
      "Perform CPR only if trained and necessary."
    ]
  },
  {
    id: 6,
    title: "Building Collapse",
    icon: <FiAlertTriangle />, 
    color: "#f59e0b", 
    summary: "Protect your head. Signal for help.",
    steps: [
      "If inside: Get under a sturdy desk or doorframe.",
      "Protect your head and neck with your arms.",
      "Do NOT light a match (gas leaks are likely).",
      "Tap on pipes or walls so rescuers can hear you.",
      "Cover your mouth with cloth to avoid inhaling dust."
    ]
  },
  {
    id: 7,
    title: "Violence / Active Threat",
    icon: <FiXCircle />, 
    color: "#be123c", 
    summary: "Run, Hide, Fight.",
    steps: [
      "RUN: Escape if you can. Leave belongings behind.",
      "HIDE: If you can't run, lock doors and silence phone.",
      "FIGHT: As a last resort, act aggressively to incapacitate threat.",
      "Keep hands visible when law enforcement arrives.",
      "Do not make sudden movements."
    ]
  },
  {
    id: 8,
    title: "General Preparedness",
    icon: <FiBox />, 
    color: "#64748b", 
    summary: "Always be ready for the unexpected.",
    steps: [
      "Keep a 'Go-Bag' packed (Documents, Meds, Cash).",
      "Memorize important phone numbers.",
      "Share your location with trusted contacts.",
      "Keep a portable power bank charged.",
      "Identify the nearest shelter or safe zone."
    ]
  }
];

function SafetyTips() {
  const [activeId, setActiveId] = useState(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(headerRef.current, 
      { y: -50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(cardsRef.current, 
      { y: 50, opacity: 0 }, 
      { 
        y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)",
        scrollTrigger: { trigger: ".tips-grid", start: "top 80%" }
      }
    );
  }, []);

  const toggleCard = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="safety-wrapper">
      
      <header className="safety-header" ref={headerRef}>
        <div className="icon-badge"><FiShield /></div>
        <h1>Survival Protocols</h1>
        <p>Expert guidelines to keep you safe during critical emergencies.</p>
      </header>

      <div className="tips-grid">
        {tipsData.map((tip, index) => (
          <div 
            key={tip.id} 
            className={`tip-card ${activeId === tip.id ? 'active' : ''}`}
            ref={el => cardsRef.current[index] = el}
            onClick={() => toggleCard(tip.id)}
            style={{ borderLeftColor: tip.color }}
          >
            
            <div className="tip-summary">
              <div className="tip-icon-box" style={{ color: tip.color, background: `${tip.color}20` }}>
                {tip.icon}
              </div>
              <div className="tip-text">
                <h3>{tip.title}</h3>
                <p>{tip.summary}</p>
              </div>
              <div className="toggle-icon">
                {activeId === tip.id ? <FiMinus /> : <FiPlus />}
              </div>
            </div>

            <div className="tip-details">
              <div className="detail-inner">
                <h4>Immediate Actions:</h4>
                <ul>
                  {tip.steps.map((step, idx) => (
                    <li key={idx}>
                      <span className="step-num">{idx + 1}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default SafetyTips;