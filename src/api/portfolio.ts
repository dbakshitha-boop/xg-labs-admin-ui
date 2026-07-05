import { createRestApi } from '../lib/apiClient';
import { Portfolio } from '../types';

export const portfoliosApi = createRestApi<Portfolio>('portfolios');
