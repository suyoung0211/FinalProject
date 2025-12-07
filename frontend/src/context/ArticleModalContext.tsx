import { createContext, useContext, useState } from "react";

interface ArticleModalContextType {
  open: boolean;
  articleId: number | null;
  openModal: (id: number) => void;
  closeModal: () => void;
}

// 🔥 초기값도 타입에 맞게 "더미 함수" 넣기
const ArticleModalContext = createContext<ArticleModalContextType>({
  open: false,
  articleId: null,
  openModal: () => {},
  closeModal: () => {},
});
interface ArticleModalProviderProps {
  children: React.ReactNode;
}

export function ArticleModalProvider({ children }: ArticleModalProviderProps) {
  const [open, setOpen] = useState(false);
  const [articleId, setArticleId] = useState<number | null>(null);

  const openModal = (id: number) => {
    setArticleId(id);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setArticleId(null);
  };

  return (
    <ArticleModalContext.Provider value={{ open, articleId, openModal, closeModal }}>
      {children}
    </ArticleModalContext.Provider>
  );
}

// Hook
export function useArticleModal() {
  return useContext(ArticleModalContext);
}
