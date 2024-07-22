import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../redux/userSlice';
import io from 'socket.io-client';

const CheckPasswordPage = () => {
  const [data, setData] = useState({
    password: "",
    userId: ""
  });
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!location?.state?.name) {
      navigate('/email');
    }

    const socket = io(process.env.REACT_APP_BACKEND_URL, {
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('tokenExpired', async () => {
      try {
        // Yêu cầu làm mới token
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/refresh-token`, {}, { withCredentials: true });
        const newToken = response.data.token;

        // Cập nhật token mới vào localStorage và Redux store
        dispatch(setToken(newToken));
        localStorage.setItem('token', newToken);

        // Cập nhật token trong socket
        socket.auth.token = newToken;
        socket.connect();
        console.log("làm mới token")
      } catch (error) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        navigate('/login');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, navigate, location]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;

    try {
      const response = await axios.post(URL, {
        userId: location?.state?._id,
        password: data.password
      }, { withCredentials: true });

      toast.success(response.data.message);

      if (response.data.success) {
        dispatch(setToken(response?.data?.token));
        localStorage.setItem('token', response?.data?.token);

        setData({
          password: "",
        });
        navigate('/');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto'>
        <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
          <Avatar
            width={70}
            height={70}
            name={location?.state?.name}
            imageUrl={location?.state?.profile_pic}
          />
          <h2 className='font-semibold text-lg mt-1'>{location?.state?.name}</h2>
        </div>
        <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='password'>Password :</label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='enter your password'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>
          <button className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'>
            Login
          </button>
        </form>
        <p className='my-3 text-center'><Link to={"/forgot-password"} className='hover:text-primary font-semibold'>Forgot password ?</Link></p>
      </div>
    </div>
  );
};

export default CheckPasswordPage;
