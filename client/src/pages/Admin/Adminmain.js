import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AListbar from './AComponent/AListbar.js';
import './Adminmain.scss';
import AChart from './AComponent/AChart.js';
import AHeader from './AComponent/AHeader.js';
import ALogin from './ALogin/ALogin.js';
import ABanner from './ABanner/ABanner.js';
import ABook from './ABook/ABook.js'
import AFaq from './AFaq/AFaq.js';
import AUser from './AUser/AUser.js';
import AEvent from './AEvent/AEvent.js';
import AReview from './AReview/ARevirw.js';
import ALoans from './ALoans/ALoans.js';
import { getCookie } from '../../utils/cookie.js';

const AdminMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("location: ", location);
    if(!getCookie('login')){
      alert('다시 로그인 해주세요');
      navigate('/admin/login');
    }
  }, [location]);



  return (
    // <div id='Admin' style={{ display: 'flex', flexDirection: 'column'}}>
    <div id='Admin' >
      <AListbar id='Listbar' />
      <AHeader id='Header' />
      <div className='AdminMain' style={{padding: ' 0 0 100px'}}>
        <Routes>
          <Route path='/' element={<AChart></AChart>}></Route>
          <Route path='/login' element={<ALogin />} />
          <Route path='/faq/faq' element={<AFaq />} />
          <Route path='/banner/banner' element={<ABanner />} />
          <Route path='/event/event' element={<AEvent />} />
          <Route path='/loans/loans' element={<ALoans />} />
          <Route path='/book/book' element={<ABook />} />
          <Route path='/user/user' element={<AUser />} />
          <Route path='/review/review' element={<AReview />} />
        </Routes>
      </div>
    </div>
  );
};


export default AdminMain;
