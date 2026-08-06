import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL;

export default function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken) {
      navigate('/auth/login');
      return;
    }

    // 1. Save tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken || '');

    // 2. Fetch user from backend using token
    axios
      .get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        const user = res.data.data;
        console.log("--user|", user);
        
        // 3. Set Redux state
        dispatch(
          setUser({
              id: user.id,
              name: user.fullName,
              email: user.email,
              role: user.role,
              avatar: ''
          })
        );

        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/auth/login');
      });
  }, []);

  return <div>Signing in...</div>;
}