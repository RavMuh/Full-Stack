  import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { productsAPI } from '../services/api';
import { FaTimes, FaUpload, FaSpinner } from 'react-icons/fa';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

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
  max-width: 500px;
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
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const ImageUploadContainer = styled.div`
  border: 2px dashed #e1e5e9;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: border-color 0.3s;
  cursor: pointer;
  
  &:hover {
    border-color: #667eea;
  }
  
  &.has-image {
    border-color: #2ecc71;
  }
`;

const UploadIcon = styled(FaUpload)`
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  color: #666;
  margin: 0;
`;

const ImagePreview = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PreviewImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e1e5e9;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
`;

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SubmitButton = styled(motion.button)`
  flex: 1;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: #5a6fd8;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(motion.button)`
  flex: 1;
  padding: 1rem;
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #e9ecef;
    border-color: #667eea;
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

const AddProductModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'electronics',
    brand: '',
    stock: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mahsulot qo'shish mutation
  const addProductMutation = useMutation(
    (productData) => productsAPI.createProduct(productData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Mahsulot muvaffaqiyatli qo\'shildi!');
        handleClose();
      },
      onError: (error) => {
        console.error('Add product error:', error);
        const message = error.response?.data?.message || 'Mahsulot qo\'shishda xatolik';
        setError(message);
        toast.error(message);
      }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xatolik xabarini tozalash
    if (error) {
      setError('');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Faqat rasm fayllarini qabul qilish
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast.error('Faqat rasm fayllarini yuklashingiz mumkin');
      return;
    }

    // Har bir rasmni base64 ga o'tkazish
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Ro'yxatdan o'tmagan foydalanuvchilar uchun xabar
    if (!currentUser) {
      setError('Mahsulot qo\'shish uchun avval tizimga kiring');
      toast.error('Mahsulot qo\'shish uchun avval tizimga kiring');
      return;
    }

    // Validatsiya
    if (!formData.name.trim()) {
      setError('Mahsulot nomi kiritish majburiy');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setError('Narx kiritish majburiy va 0 dan katta bo\'lishi kerak');
      return;
    }

    if (!formData.stock || formData.stock < 0) {
      setError('Zaxira miqdori 0 dan katta yoki teng bo\'lishi kerak');
      return;
    }

    if (formData.images.length === 0) {
      setError('Kamida bitta rasm yuklashingiz kerak');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock)
      };

      await addProductMutation.mutateAsync(productData);
    } catch (error) {
      // Error already handled in mutation
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'electronics',
      brand: '',
      stock: '',
      images: []
    });
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalContent
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={handleClose}>
              <FaTimes />
            </CloseButton>

            <ModalBody>
              <Title>Yangi mahsulot qo'shish</Title>
              
              {!currentUser && (
                <ErrorMessage>
                  ⚠️ Mahsulot qo'shish uchun avval tizimga kiring. 
                  <br />
                  <a href="/login" style={{ color: '#667eea', textDecoration: 'underline' }}>
                    Login sahifasiga o'tish
                  </a>
                </ErrorMessage>
              )}
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Mahsulot nomi *</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Mahsulot nomini kiriting"
                    disabled={loading || !currentUser}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Tavsif</Label>
                  <TextArea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mahsulot haqida ma'lumot"
                    disabled={loading || !currentUser}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Narx *</Label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={loading || !currentUser}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Asl narx</Label>
                  <Input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={loading || !currentUser}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Kategoriya</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={loading || !currentUser}
                  >
                    <option value="electronics">Elektronika</option>
                    <option value="clothing">Kiyim</option>
                    <option value="books">Kitoblar</option>
                    <option value="home">Uy</option>
                    <option value="sports">Sport</option>
                    <option value="other">Boshqa</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Brend</Label>
                  <Input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Brend nomi"
                    disabled={loading || !currentUser}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Zaxira miqdori *</Label>
                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    disabled={loading || !currentUser}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Rasmlar *</Label>
                  <ImageUploadContainer
                    className={formData.images.length > 0 ? 'has-image' : ''}
                    onClick={() => {
                      if (currentUser) {
                        document.getElementById('image-upload').click();
                      }
                    }}
                    style={{ 
                      cursor: currentUser ? 'pointer' : 'not-allowed',
                      opacity: currentUser ? 1 : 0.6
                    }}
                  >
                    <UploadIcon />
                    <UploadText>
                      {formData.images.length > 0 
                        ? `${formData.images.length} ta rasm yuklandi` 
                        : 'Rasm yuklash uchun bosing yoki faylni tashlang'
                      }
                    </UploadText>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={loading || !currentUser}
                    />
                  </ImageUploadContainer>

                  {formData.images.length > 0 && (
                    <ImagePreview>
                      {formData.images.map((image, index) => (
                        <ImageContainer key={index}>
                          <PreviewImage src={image} alt={`Preview ${index + 1}`} />
                          <RemoveImageButton
                            onClick={() => removeImage(index)}
                            disabled={loading || !currentUser}
                          >
                            ×
                          </RemoveImageButton>
                        </ImageContainer>
                      ))}
                    </ImagePreview>
                  )}
                </FormGroup>

                <ButtonGroup>
                  <CancelButton
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Bekor qilish
                  </CancelButton>
                  
                  <SubmitButton
                    type="submit"
                    disabled={loading || !currentUser}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="fa-spin" />
                        Qo'shilmoqda...
                      </>
                    ) : (
                      'Mahsulot qo\'shish'
                    )}
                  </SubmitButton>
                </ButtonGroup>
              </Form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal; 