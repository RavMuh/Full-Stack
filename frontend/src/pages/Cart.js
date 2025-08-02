import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { cartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CartContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const CartIcon = styled(FaShoppingCart)`
  font-size: 2rem;
  color: #667eea;
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyCartIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const CartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 80px 1fr;
    gap: 0.5rem;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const ItemPrice = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #2ecc71;
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuantityButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &:hover {
    background: #f8f9fa;
    border-color: #667eea;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  font-weight: bold;
  min-width: 30px;
  text-align: center;
`;

const RemoveButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
  
  &:hover {
    background: #c0392b;
  }
`;

const CartSummary = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
    font-weight: bold;
    font-size: 1.2rem;
    color: #2ecc71;
  }
`;

const CheckoutButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
  
  &:hover {
    background: #27ae60;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ClearCartButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
  
  &:hover {
    background: #c0392b;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: #666;
`;

const Cart = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Savatni olish
  const { data: cartData, isLoading, error } = useQuery(
    'cart',
    cartAPI.getUserCart,
    {
      enabled: !!currentUser,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Savatdan mahsulotni o'chirish
  const removeMutation = useMutation(
    (productId) => cartAPI.removeFromCart(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Mahsulot savatdan o\'chirildi');
      },
      onError: () => {
        toast.error('Xatolik yuz berdi');
      }
    }
  );

  // Miqdorni yangilash
  const updateQuantityMutation = useMutation(
    ({ productId, quantity }) => cartAPI.updateCartItemQuantity(productId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Miqdor yangilandi');
      },
      onError: () => {
        toast.error('Xatolik yuz berdi');
      }
    }
  );

  // Savatni tozalash
  const clearCartMutation = useMutation(
    cartAPI.clearCart,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Savat tozalandi');
      },
      onError: () => {
        toast.error('Xatolik yuz berdi');
      }
    }
  );

  const handleRemoveItem = (productId) => {
    removeMutation.mutate(productId);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ productId, quantity: newQuantity });
  };

  const handleClearCart = () => {
    if (window.confirm('Savatni tozalashni xohlaysizmi?')) {
      clearCartMutation.mutate();
    }
  };

  const handleCheckout = () => {
    setLoading(true);
    // Checkout logic will be implemented
    setTimeout(() => {
      setLoading(false);
      toast.success('Buyurtma muvaffaqiyatli yaratildi!');
    }, 2000);
  };

  if (!currentUser) {
    return (
      <CartContainer>
        <EmptyCart>
          <EmptyCartIcon>🔒</EmptyCartIcon>
          <h3>Avtorizatsiya kerak</h3>
          <p>Savatni ko'rish uchun tizimga kiring</p>
        </EmptyCart>
      </CartContainer>
    );
  }

  if (isLoading) {
    return (
      <CartContainer>
        <LoadingContainer>
          Savat yuklanmoqda...
        </LoadingContainer>
      </CartContainer>
    );
  }

  if (error) {
    return (
      <CartContainer>
        <EmptyCart>
          <h3>Xatolik yuz berdi</h3>
          <p>{error.message}</p>
        </EmptyCart>
      </CartContainer>
    );
  }

  const { cart } = cartData || {};
  const { items = [], total = 0 } = cart || {};

  if (items.length === 0) {
    return (
      <CartContainer>
        <EmptyCart>
          <EmptyCartIcon>🛒</EmptyCartIcon>
          <h3>Savat bo'sh</h3>
          <p>Mahsulot qo'shish uchun do'konga qaytishingiz mumkin</p>
        </EmptyCart>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <Header>
        <CartIcon />
        <Title>Savat ({items.length})</Title>
      </Header>

      <CartGrid>
        <CartItems>
          {items.map((item) => (
            <CartItem key={item.product._id}>
              <ItemImage 
                src={item.product.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image'} 
                alt={item.product.name}
              />
              
              <ItemDetails>
                <div>
                  <ItemName>{item.product.name}</ItemName>
                  <ItemPrice>${item.price}</ItemPrice>
                </div>
                
                <QuantityControl>
                  <QuantityButton
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <FaMinus />
                  </QuantityButton>
                  
                  <Quantity>{item.quantity}</Quantity>
                  
                  <QuantityButton
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <FaPlus />
                  </QuantityButton>
                </QuantityControl>
              </ItemDetails>
              
              <ItemActions>
                <RemoveButton onClick={() => handleRemoveItem(item.product._id)}>
                  <FaTrash />
                </RemoveButton>
              </ItemActions>
            </CartItem>
          ))}
        </CartItems>

        <CartSummary>
          <SummaryTitle>Savat xulosasi</SummaryTitle>
          
          <SummaryRow>
            <span>Mahsulotlar ({items.length})</span>
            <span>${total.toFixed(2)}</span>
          </SummaryRow>
          
          <SummaryRow>
            <span>Yetkazib berish</span>
            <span>Bepul</span>
          </SummaryRow>
          
          <SummaryRow>
            <span>Jami</span>
            <span>${total.toFixed(2)}</span>
          </SummaryRow>
          
          <CheckoutButton
            onClick={handleCheckout}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Buyurtma berilmoqda...' : 'Buyurtma berish'}
          </CheckoutButton>
          
          <ClearCartButton onClick={handleClearCart}>
            Savatni tozalash
          </ClearCartButton>
        </CartSummary>
      </CartGrid>
    </CartContainer>
  );
};

export default Cart; 