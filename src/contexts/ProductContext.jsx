import { createContext, useContext } from 'react';

export const ProductContext = createContext({ activeProduct: 'widget', setActiveProduct: () => {} });
export function useProduct() {
  return useContext(ProductContext);
}
