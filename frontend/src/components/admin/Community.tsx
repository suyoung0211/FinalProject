// Community.tsx
export function Community() {
  const posts = [
    { id: 1, user: '홍길동', title: '이번 주 영화 추천', comments: 5 },
    { id: 2, user: '김철수', title: 'AI 뉴스 제목 개선', comments: 3 },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">커뮤니티 관리</h2>
      <ul className="space-y-2">
        {posts.map(post => (
          <li key={post.id} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
            <span>{post.title} - {post.user}</span>
            <span className="text-gray-400">{post.comments} 댓글</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
