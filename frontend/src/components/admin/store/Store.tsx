// Store.tsx
export function Store() {

  // 📌 기존 products → storeItems로 확장
  const storeItems = [
    {
      id: 1,
      name: "영화 예매권",
      category: "Entertainment",
      price: 15000,
      stock: 10,
      sold: 5,
      status: "ACTIVE"
    },
    {
      id: 2,
      name: "포인트 쿠폰",
      category: "Coupon",
      price: 10000,
      stock: 25,
      sold: 12,
      status: "ACTIVE"
    }
  ];

  return (
    <div className="space-y-6">
      {/* 제목 영역 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">상점 관리</h2>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm">
          아이템 추가
        </button>
      </div>

      {/* 테이블 UI 적용 */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">아이템명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">가격</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">재고</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">판매량</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {storeItems.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                    {item.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium">
                      {item.category}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-yellow-400 font-bold">
                    {item.price.toLocaleString()}P
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-white font-bold">{item.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-400 font-bold">{item.sold}</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      item.status === "ACTIVE"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                        수정
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
