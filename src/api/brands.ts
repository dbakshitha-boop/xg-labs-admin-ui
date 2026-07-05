import { createRestApi } from '../lib/apiClient';
import { Brand } from '../types';

export const brandsApi = createRestApi<Brand>('brands');
