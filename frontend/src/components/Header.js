import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { cartAPI } from '../services/api';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  position: relative;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

const CartLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const CartBadge = styled.span`
  background: #ff4757;
  color: white;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 1rem;
  }
`;

const MobileNavLink = styled(Link)`
  display: block;
  color: #333;
  text-decoration: none;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Savat ma'lumotlarini olish
  const { data: cartData } = useQuery(
    'cart',
    cartAPI.getUserCart,
    {
      enabled: !!currentUser,
      staleTime: 5 * 60 * 1000,
    }
  );

  const cartItemsCount = cartData?.cart?.items?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">
          🛍️ Online Do'kon
        </Logo>

        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Mahsulotlarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon />
          </form>
        </SearchContainer>

        <NavLinks>
          <NavLink to="/products">Mahsulotlar</NavLink>
          
          {currentUser ? (
            <>
              <CartLink to="/cart">
                <FaShoppingCart />
                {cartItemsCount > 0 && (
                  <CartBadge>{cartItemsCount}</CartBadge>
                )}
              </CartLink>
              <NavLink to="/profile">
                <FaUser />
              </NavLink>
              <IconButton onClick={handleLogout}>
                Chiqish
              </IconButton>
            </>
          ) : (
            <>
              <NavLink to="/login">Kirish</NavLink>
              <NavLink to="/register">Ro'yxatdan o'tish</NavLink>
            </>
          )}
        </NavLinks>

        <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </MobileMenuButton>
      </Nav>

      <MobileMenu isOpen={isMobileMenuOpen}>
        <MobileNavLink to="/products">Mahsulotlar</MobileNavLink>
        
        {currentUser ? (
          <>
            <MobileNavLink to="/cart">
              Savat {cartItemsCount > 0 && `(${cartItemsCount})`}
            </MobileNavLink>
            <MobileNavLink to="/profile">Profil</MobileNavLink>
            <MobileNavLink to="/" onClick={handleLogout}>Chiqish</MobileNavLink>
          </>
        ) : (
          <>
            <MobileNavLink to="/login">Kirish</MobileNavLink>
            <MobileNavLink to="/register">Ro'yxatdan o'tish</MobileNavLink>
          </>
        )}
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header; 