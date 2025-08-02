import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import AddProductModal from '../components/AddProductModal';
import { FaSearch, FaPlus } from 'react-icons/fa';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.8rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #667eea;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.8rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: #667eea;
  }
`;

const FilterButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
  
  &:hover {
    background: #5a6fd8;
  }
`;

const AddProductButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
  
  &:hover {
    background: #27ae60;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

// LoadingContainer ni olib tashladik

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: #e74c3c;
`;

const NoProducts = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.2rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid #e1e5e9;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #667eea;
    background: ${props => props.active ? '#5a6fd8' : '#f8f9fa'};
  }
`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { currentUser } = useAuth();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);

  // URL parametrlarini yangilash
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params);
  }, [filters, currentPage, setSearchParams]);

  // Mahsulotlarni olish
  const { data, isLoading, error } = useQuery(
    ['products', filters, currentPage],
    () => productsAPI.getAllProducts({ ...filters, page: currentPage }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 daqiqa
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search already handled by URL params
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  // Loading qismini olib tashladik

  if (error) {
    return (
      <ProductsContainer>
        <ErrorContainer>
          Xatolik yuz berdi: {error.message}
        </ErrorContainer>
      </ProductsContainer>
    );
  }

  const { products = [], totalPages = 1, total = 0 } = data || {};

  return (
    <ProductsContainer>
      <Header>
        <Title>Mahsulotlar ({total})</Title>
        
        <SearchBar>
          <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1 }}>
            <SearchInput
              type="text"
              placeholder="Mahsulotlarni qidirish..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <FilterButton type="submit">
              <FaSearch />
            </FilterButton>
          </form>
        </SearchBar>
        
        <FilterContainer>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Barcha kategoriyalar</option>
            <option value="electronics">Elektronika</option>
            <option value="clothing">Kiyim-kechak</option>
            <option value="books">Kitoblar</option>
            <option value="home">Uy jihozlari</option>
            <option value="sports">Sport</option>
            <option value="other">Boshqalar</option>
          </Select>
          
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="createdAt">Yangi</option>
            <option value="price">Narx</option>
            <option value="name">Nomi</option>
            <option value="rating">Baholash</option>
          </Select>
          
          <Select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">Kamayish</option>
            <option value="asc">O'sish</option>
          </Select>
          
          <AddProductButton
            onClick={handleAddProduct}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaPlus />
            Mahsulot qo'shish
          </AddProductButton>
        </FilterContainer>
      </Header>

      {products.length === 0 ? (
        <NoProducts>
          <h3>Mahsulot topilmadi</h3>
          <p>Boshqa filtrlarni sinab ko'ring</p>
        </NoProducts>
      ) : (
        <ProductsGrid>
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </ProductsGrid>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Oldingi
          </PageButton>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PageButton
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </PageButton>
          ))}
          
          <PageButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Keyingi
          </PageButton>
        </Pagination>
      )}

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </ProductsContainer>
  );
};

export default Products; 