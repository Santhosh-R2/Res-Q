import React from 'react'
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';

import '../styles/Enquiries.css';
import { FaRegMessage } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { Link } from 'react-router-dom';



function Enquiries() {
  const [enquiries, setEnquiries] = React.useState([])
  const [loading, setLoading] = React.useState(true);
  const fetchEnquiries = async () => {
    try {
      const response = await axiosInstance.get('/contact');
      setEnquiries(response.data);
      console.log(response.data);
    } catch (error) {
      toast.error("Error fetching enquiries",error);
    }
    finally {
      setLoading(false);
    }
  }
  React.useEffect(() => { fetchEnquiries(); }, []);

  if (loading) return <div className="unread-enquiries-loader"><div className="unread-enquiries-spinner"></div></div>;

  return (
    <div className='enquiries-wrapper'>
      <header className="enquiries-header">
        <div>
          <h1>Enquiries</h1>
        </div>
        <div className="enquiries-count-badge">
          <FaRegMessage /> {enquiries.length} Unread
        </div>
      </header>
      <div className='unread-enquiries-grid'>
        {enquiries.length === 0 ? (
          <div className='unread-enquiries-empty'>
            <FiCheckCircle />
            <h3>No Unread Enquiries</h3>
          </div>
        ) : (
          enquiries.map((enquiry) => (
            <Link to={`/enquiries/${enquiry._id}` } key={enquiry._id} className='enquiries-nav-link'>
              <div className='unread-enquiry-card' >
                <div className='unread-enquiry-card-header'>
                  <span className='unread-enquiry-badge'>
                    {enquiry.subject}
                  </span>
                  <p className='unread-enquiry-author'>{enquiry.firstName} {enquiry.lastName}</p>




                </div>
              </div>
            </Link>
              ))
        )}

            </div>

    </div>
      )
}

      export default Enquiries
