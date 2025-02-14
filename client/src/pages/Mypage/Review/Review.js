import React, { useState, useEffect } from 'react';
import './Review.scss';
import axios from 'axios';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config/contansts';
import BasicRating from '../../../components/Rating/BasicRating';
import { errHandler } from "../../../utils/globalFunction";
import { useRecoilState } from "recoil";
import { loginState } from "../../../recoil/atoms/State";


const Review = () => {
  const navigate = useNavigate();
  const [islogin, setIslogin] = useRecoilState(loginState); //useState와 거의 비슷한 사용법
  const { id } = useParams();
  const [book, setBook] = useState({});
  const [reviewValue, setReviewValue] = useState({
    reviewTitle: '',
    reviewContent: '',
  });
  const [ratingValue, setRatingValue] = useState(0);


  useEffect(() => {
    axios.get(`${API_URL}/api/book?book_id=${id}`)
    .then(res => {
      console.log("setBook : ", res.data[0]);
      setBook(res.data[0]);
    })
    .catch((err) => {
      console.error(err);
    });
  }, []);

  const handleSubmit = async () => {
    console.log("reviewValue : ", reviewValue);
    console.log("ratingValue : ", ratingValue);
    const reviewData = {
      review_title: reviewValue.reviewTitle,
      review_content: reviewValue.reviewContent,
      review_rating: ratingValue,
      book_id: id,
    }
    try {
      const res = await axios.post(`${API_URL}/api/review`, reviewData);
      navigate('/mypage');
      
    } catch (error) {
      const {reLogin} = errHandler(error);
      if (reLogin === true) {
        setIslogin(false);
      }
    }
  }

  const handleClose = () => {
    navigate('/mypage');
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewValue((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className='reivew-container-kjh'>
      <img src={API_URL+book.book_img_url}></img>
      <h2>책 제목 : {book.book_name}</h2>
      <form className='review-form-kjh'>
        <label htmlFor="">제목 : </label>
        <input 
          type='text'
          name='reviewTitle'
          value={reviewValue.reviewTitle}
          onChange={handleInputChange}
          />
        <label htmlFor="">내용 : </label>
        <textarea 
          name='reviewContent'
          value={reviewValue.reviewContent}
          onChange={handleInputChange}
        />
        <label htmlFor="">별점 : </label>
        <BasicRating
          ratingValue = {ratingValue}
          setRatingValue = {setRatingValue}
        />
      </form>
      <button className='review_cancell-kjh' type='button' onClick={handleClose}>취소</button>
      <button className='review_button-kjh' type='submit' onClick={handleSubmit}>완료</button>
    </div>
  )
}


export default Review;