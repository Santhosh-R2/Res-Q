import React from 'react'
import { FaRegMessage } from "react-icons/fa6";
import '../styles/EnquiriesDetails.css';
function EnquiriesDetails() {

    return (
        <div className='enquiry-wrapper'>
            <header className="enquiry-header">
                <div>
                    <h1>Enquiry Details</h1>
                </div>
                <button className="enquiry-badge">
                    <FaRegMessage /> Unread
                </button>
            </header>
            <div className='enquiry-details-body' >
                <h3 className='enquiry-subject'>General Enquiry</h3>
                <p className='enquiry-name'>John Doe</p>
                <p className='enquiry-email'>john.doe@example.com</p>
                <div className='enquiry-message-section'>
                    <h4>Message:</h4>
                    <p className='enquiry-message'>I need help with the app. I am having trouble logging in and would appreciate some assistance.</p>   
                </div>
            </div>
        </div>
    )
}

export default EnquiriesDetails
