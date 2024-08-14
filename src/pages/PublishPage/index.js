import { useParams, useLocation } from 'react-router-dom';
import './index.css'

function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


function PublishPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    const title = localStorage.getItem(`newsTitle-${id}`);
    const content = localStorage.getItem(`newsContent-${id}`);
    const currentDate = getCurrentDate();
    
    
    return (
        <div className='news-container' style={{overflowY: 'hidden'}}>
            <div className='news-title'>{title}</div>
            <div className='news-date'>{currentDate}</div>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    )
}

export default PublishPage