import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { cartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaTimes, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ModalBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MainImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
`;

const Thumbnail = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  transition: border-color 0.3s;
  
  &:hover {
    border-color: #667eea;
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Category = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  align-self: flex-start;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Price = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CurrentPrice = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #2ecc71;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Stars = styled.div`
  display: flex;
  gap: 0.1rem;
`;

const Star = styled(FaStar)`
  color: ${props => props.filled ? '#ffc107' : '#ddd'};
  font-size: 1rem;
`;

const RatingText = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const Stock = styled.div`
  font-size: 1rem;
  color: ${props => props.inStock ? '#2ecc71' : '#e74c3c'};
  font-weight: 500;
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const QuantityLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  font-weight: bold;
  min-width: 40px;
  text-align: center;
`;

const AddToCartButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
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

const ProductModal = ({ product, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const {
    _id,
    name,
    price,
    originalPrice,
    images,
    category,
    rating,
    numReviews,
    stock,
    description
  } = product || {};

  // Savatga qo'shish mutation
  const addToCartMutation = useMutation(
    () => cartAPI.addToCart(_id, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Mahsulot savatga qo\'shildi!');
        onClose();
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

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Savatga qo\'shish uchun tizimga kiring');
      return;
    }
    addToCartMutation.mutate();
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>

            <ModalBody>
              <ImageSection>
                <MainImage 
                  src={images?.[selectedImage] || 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={name}
                />
                {images && images.length > 1 && (
                  <ThumbnailContainer>
                    {images.map((image, index) => (
                      <Thumbnail
                        key={index}
                        src={image}
                        alt={`${name} ${index + 1}`}
                        active={index === selectedImage}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </ThumbnailContainer>
                )}
              </ImageSection>

              <ContentSection>
                <Category>{category}</Category>
                <Title>{name}</Title>
                
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
                  <RatingText>({numReviews} ta baho)</RatingText>
                </Rating>
                
                <Stock inStock={stock > 0}>
                  {stock > 0 ? `${stock} ta mavjud` : 'Tugagan'}
                </Stock>
                
                {description && (
                  <Description>{description}</Description>
                )}
                
                {stock > 0 && (
                  <>
                    <QuantitySection>
                      <QuantityLabel>Miqdor:</QuantityLabel>
                      <QuantityControl>
                        <QuantityButton
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          <FaMinus />
                        </QuantityButton>
                        
                        <Quantity>{quantity}</Quantity>
                        
                        <QuantityButton
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= stock}
                        >
                          <FaPlus />
                        </QuantityButton>
                      </QuantityControl>
                    </QuantitySection>
                    
                    <AddToCartButton
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaShoppingCart />
                      {addToCartMutation.isLoading ? 'Qo\'shilmoqda...' : 'Savatga qo\'shish'}
                    </AddToCartButton>
                  </>
                )}
              </ContentSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ProductModal; 