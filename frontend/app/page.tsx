"use client"; // 이 코드는 브라우저에서 작동한다는 뜻이에요.

import { useState, useEffect } from "react";

export default function BoardPage() {
  // 1. 상태 변수 만들기 (데이터를 담아두는 바구니)
  const [data, setData] = useState<any>({ posts: [], totalPages: 0 }); // 백엔드에서 받은 데이터
  const [page, setPage] = useState(1); // 현재 몇 페이지인지
  const [search, setSearch] = useState(""); // 검색창에 친 글자

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 2. 백엔드에서 데이터를 가져오는 함수 (가져와서 바구니에 담기)
  const fetchPosts = async () => {
    const res = await fetch(`/api/posts?page=${page}&search=${search}`);
    const result = await res.json();
    setData(result); // 바구니(data)에 결과물 넣기
  };

  // 3. 페이지가 처음 열릴 때, 그리고 페이지 번호가 바뀔 때마다 실행하기
  useEffect(() => {
    fetchPosts();
  }, [page]);

  // --- 글쓰기 함수 추가 ---
  const handleWrite = async () => {
    if (!title || !content) return alert("제목과 내용을 입력해주세요!");

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    alert("글이 작성되었습니다!");
    clearModal();
    fetchPosts();
  };

  const clearModal = () => {
    setTitle("");
    setContent("");
    setIsModalOpen(false);
  }

  // 4. 화면에 어떻게 보여줄지 그리기 (HTML이랑 비슷해요)
  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">나의 게시판</h1>
        {/* 글쓰기 모달 열기 버튼 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          새 글 작성
        </button>
      </div>

      {/* 검색 바 */}
      <div className="flex gap-2 mb-8">
        <input
          className="border border-gray-300 p-2 flex-1 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="제목으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => { setPage(1); fetchPosts(); }}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition"
        >
          검색
        </button>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {data.posts && data.posts.map((post: any) => (
          <div key={post.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition">
            <h3 className="font-bold text-xl text-blue-600 mb-1">{post.title}</h3>
            <p className="text-gray-600">{post.content}</p>
          </div>
        ))}
      </div>

      {/* 페이지 번호 버튼 */}
      <div className="flex justify-center items-center gap-2 mt-10 mb-20">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-30 text-white"
        >
          이전
        </button>

        {/* 숫자 버튼들 */}
        {Array.from({ length: data.totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`w-10 h-10 rounded-full border transition ${
              page === i + 1
                ? "bg-blue-600 text-white border-blue-600 font-bold"
                : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, data.totalPages))}
          disabled={page === data.totalPages || data.totalPages === 0}
          className="px-3 py-1 border rounded disabled:opacity-30 text-white"
        >
          다음
        </button>
      </div>

      {/* 모달창 (isModalOpen이 true일 때만 보임) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">새로운 이야기 작성</h2>
            <input
              className="w-full border p-3 rounded-lg mb-4 text-black focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full border p-3 rounded-lg mb-6 text-black h-32 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={clearModal}
                className="px-5 py-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleWrite}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}