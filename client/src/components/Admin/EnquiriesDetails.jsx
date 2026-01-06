import React from 'react'
import axiosInstance from '../api/baseUrl'
import { useParams,Navigate, useNavigate } from 'react-router-dom'
import { FaRegMessage } from "react-icons/fa6";
import '../styles/EnquiriesDetails.css';
import { toast, ToastContainer } from 'react-toastify';
function EnquiriesDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [enquiry, setEnquiry] = React.useState([])

    const [loading, setLoading] = React.useState(true);
    const fetchEnquiry = async () => {
        try {
            const response = await axiosInstance.get(`/contact/${id}`);
            setEnquiry(response.data);
        } catch (err) {
            toast.error("Error fetching enquiry details", err);
        } finally {
            setLoading(false);
        }
    }
    React.useEffect(() => { fetchEnquiry(); }, []);

    const updateStatus = () => {
        axiosInstance.put(`/contact/${id}/status`, { status: 'read' })
            .then(() => {
                toast.success("Enquiry marked as read");
                navigate('/enquiries');
            })
            .catch((error) => {
                toast.error("Error updating enquiry status", error);
            });
    }
    if (loading) return <div className="enquiry-details-loader"><div className="enquiry-details-spinner"></div></div>;

    return (

        <div className='enquiry-wrapper'>
            <ToastContainer />
            <header className="enquiry-header">
                <div>
                    <h1>Enquiry Details</h1>
                </div>
                <button onClick={updateStatus} className="enquiry-badge">
                    <FaRegMessage /> Unread
                </button>
            </header>
            <div className='enquiry-details-body' >
                <h3 className='enquiry-subject'>{enquiry.subject}</h3>
                <p className='enquiry-name'>{enquiry.firstName} {enquiry.lastName}</p>
                <p className='enquiry-email'>{enquiry.email}</p>
                <div className='enquiry-message-section'>
                    <h4>Message:</h4>
                    <p className='enquiry-message'>{enquiry.message}</p>
                </div>
            </div>
        </div>
    )
}

export default EnquiriesDetails
