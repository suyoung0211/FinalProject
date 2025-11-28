// Store.tsx
export function Store() {
  const products = [
    { id: 1, name: '영화 예매권', stock: 10 },
    { id: 2, name: '포인트 쿠폰', stock: 25 },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">상점 관리</h2>
      <ul className="space-y-2">
        {products.map(product => (
          <li key={product.id} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
            <span>{product.name}</span>
            <span className="text-gray-400">{product.stock}개 남음</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
