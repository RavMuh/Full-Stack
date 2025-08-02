import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginCard = styled(motion.div)`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background: #5a6fd8;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: white;
  color: #333;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: border-color 0.3s;
  
  &:hover {
    border-color: #667eea;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e1e5e9;
  }
  
  span {
    padding: 0 1rem;
    color: #666;
    font-size: 0.9rem;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Xatolik xabarini tozalash
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validatsiya
    if (!formData.email.trim()) {
      setError('Email kiritish majburiy');
      return;
    }

    if (!formData.password) {
      setError('Parol kiritish majburiy');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Kirish muvaffaqiyatli bo'lsa, mahsulotlar sahifasiga o'tish
      navigate('/products');
    } catch (error) {
      console.error('Login error:', error);
      // Xatolik xabarini ko'rsatish
      setError(error.message || 'Kirishda xatolik yuz berdi. Email va parolni tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      // Google bilan kirish muvaffaqiyatli bo'lsa, mahsulotlar sahifasiga o'tish
      navigate('/products');
    } catch (error) {
      console.error('Google login error:', error);
      // Google xatoligini ko'rsatish
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Google oynasi yopildi. Qayta urinib ko\'ring.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Google oynasi bloklangan. Popup blocker ni o\'chiring.');
      } else {
        setError('Google bilan kirishda xatolik yuz berdi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Kirish</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form
         onSubmit={handleSubmit}
         >
          <InputGroup>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </InputGroup>
          
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Parol"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle> 
          </InputGroup>
          
          <Button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </Button>
        </Form>
        
        <Divider>
          <span>yoki</span>
        </Divider>
        
        <GoogleButton
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaGoogle />
          Google bilan kirish
        </GoogleButton>
        
        <LinkText>
          Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
        </LinkText>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 