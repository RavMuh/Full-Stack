import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { cartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaEye, FaShoppingCart } from 'react-icons/fa';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ProductModal from './ProductModal';

const Card = styled(motion.div)`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Content = styled.div`
  padding: 1rem;
`;

const Category = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const Title = styled.h3`
  margin: 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  cursor: pointer;
  
  &:hover {
    color: #667eea;
  }
`;

const Price = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const CurrentPrice = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: #2ecc71;
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.5rem 0;
`;

const Stars = styled.div`
  display: flex;
  gap: 0.1rem;
`;

const Star = styled(FaStar)`
  color: ${props => props.filled ? '#ffc107' : '#ddd'};
  font-size: 0.9rem;
`;

const RatingText = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const Stock = styled.div`
  font-size: 0.8rem;
  color: ${props => props.inStock ? '#2ecc71' : '#e74c3c'};
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const AddToCartButton = styled(motion.button)`
  flex: 1;
  padding: 0.8rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  
  &:hover {
    background: #5a6fd8;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ViewButton = styled(motion.button)`
  padding: 0.8rem;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #e9ecef;
    border-color: #667eea;
    color: #667eea;
  }
`;

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    _id,
    name,
    price,
    originalPrice,
    images,
    category,
    rating,
    numReviews,
    stock
  } = product;

  // Savatga qo'shish mutation
  const addToCartMutation = useMutation(
    () => cartAPI.addToCart(_id, 1),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Mahsulot savatga qo\'shildi!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
      }
    }
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} filled={i <= rating} />
      );
    }
    return stars;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Savatga qo\'shish uchun tizimga kiring');
      return;
    }
    addToCartMutation.mutate();
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ImageContainer onClick={handleCardClick}>
          <ProductImage 
            src={images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
            alt={name}
          />
          <Overlay>
            <ActionButton onClick={handleQuickView}>
              <FaEye />
            </ActionButton>
          </Overlay>
        </ImageContainer>
        
        <Content>
          <Category>{category}</Category>
          <Title onClick={handleCardClick}>{name}</Title>
          
          <Price>
            <CurrentPrice>${price}</CurrentPrice>
            {originalPrice && originalPrice > price && (
              <OriginalPrice>${originalPrice}</OriginalPrice>
            )}
          </Price>
          
          <Rating>
            <Stars>
              {renderStars(rating)}
            </Stars>
            <RatingText>({numReviews})</RatingText>
          </Rating>
          
          <Stock inStock={stock > 0}>
            {stock > 0 ? `${stock} ta mavjud` : 'Tugagan'}
          </Stock>
          
          <ButtonGroup>
            <AddToCartButton
              onClick={handleAddToCart}
              disabled={addToCartMutation.isLoading || stock === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaShoppingCart />
              {addToCartMutation.isLoading ? 'Qo\'shilmoqda...' : 'Savatga qo\'shish'}
            </AddToCartButton>
            
            <ViewButton
              onClick={handleQuickView}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEye />
            </ViewButton>
          </ButtonGroup>
        </Content>
      </Card>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ProductCard; 