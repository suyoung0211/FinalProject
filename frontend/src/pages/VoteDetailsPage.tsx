// // src/pages/VoteDetailPage.tsx
// import {
//   ArrowLeft,
//   Share2,
//   Bookmark,
// } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { Button } from "../components/ui/button";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";

// import { useAuth } from "../hooks/useAuth";

// import {
//   fetchVoteDetailFull, // AI Vote 상세 (GET /api/votes/{id}/detail)
//   participateVote, // AI Vote 참여
// } from "../api/voteApi";

// import {
//   fetchNormalVoteDetail, // NormalVote 상세
//   updateNormalVote, // NormalVote 수정
//   participateNormalVote, // NormalVote 참여
// } from "../api/normalVoteApi";

// import {
//   adminResolveVote,
//   adminResolveAndSettleVote,
//   adminSettleVote,
// } from "../api/adminAPI";

// import { VoteCommentSection } from "../components/vote/comments/VoteCommentSection";

// type VoteType = "AI" | "NORMAL";

// interface VoteDetailPageProps {
//   onBack: () => void;
//   marketId: number;
//   /** 어느 타입 상세인지 부모에서 넘겨준다 */
//   voteType: VoteType;
// }

// export function VoteDetailPage({
//   onBack,
//   marketId,
//   voteType,
// }: VoteDetailPageProps) {
//   const { user } = useAuth();
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   const [selectedTab, setSelectedTab] = useState<"chart" | "discussion">(
//     "chart"
//   );
//   const [selectedAmount, setSelectedAmount] = useState(100);
//   const [showVoteModal, setShowVoteModal] = useState<null | "YES" | "NO">(null);
//   const [voteComplete, setVoteComplete] = useState(false);

//   const [editMode, setEditMode] = useState(false);

//   const isAdmin =
//     user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

//   const isAIVote = voteType === "AI";
//   const isNormalVote = voteType === "NORMAL";

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [marketId, voteType]);

//   async function load() {
//     try {
//       setLoading(true);
//       let res;
//       if (voteType === "AI") {
//         res = await fetchVoteDetailFull(marketId);
//       } else {
//         res = await fetchNormalVoteDetail(marketId);
//       }
//       setData(res.data);
//     } catch (err) {
//       console.error(err);
//       setData(null);
//     } finally {
//       setLoading(false);
//       setEditMode(false);
//     }
//   }

//   // NormalVote 작성자인지 체크 (ownerId 또는 userId 둘 다 대응)
//   const isOwner = useMemo(() => {
//     if (!isNormalVote || !data || !user) return false;
//     const ownerId = data.ownerId ?? data.userId;
//     if (!ownerId) return false;
//     return ownerId === user.id;
//   }, [isNormalVote, data, user]);

//   if (loading) return <div className="text-white p-8">로딩중...</div>;
//   if (!data) return <div className="text-white p-8">데이터 없음</div>;

//   /* ---------------------------------------
//       공통: YES / NO Percent (AI Vote 전용)
//   ---------------------------------------- */
//   const firstOption = data.options?.[0];
//   const aiYesChoice = isAIVote
//     ? firstOption?.choices?.find((c: any) => c.text === "YES")
//     : null;
//   const aiNoChoice = isAIVote
//     ? firstOption?.choices?.find((c: any) => c.text === "NO")
//     : null;

//   const yesPercent = isAIVote ? aiYesChoice?.percent ?? 0 : 0;
//   const noPercent = isAIVote ? aiNoChoice?.percent ?? 0 : 0;

//   /* ---------------------------------------
//       Chart Data (AI Vote 차트)
//   ---------------------------------------- */
//   const chartData =
//     isAIVote && data.statistics?.changes
//       ? data.statistics.changes.map((ch: any) => ({
//           date: new Date(ch.time).toLocaleDateString("ko-KR", {
//             month: "2-digit",
//             day: "2-digit",
//           }),
//           yes: ch.yesPercent,
//           no: ch.noPercent,
//         }))
//       : [];

//   /* ---------------------------------------
//       NormalVote 선택지 비율 계산
//   ---------------------------------------- */
//   function getNormalChoicePercent(choice: any, option: any) {
//     const total = option.choices?.reduce(
//       (sum: number, c: any) => sum + (c.participantsCount ?? 0),
//       0
//     );
//     if (!total) return 0;
//     return Math.round(
//       ((choice.participantsCount ?? 0) / total) * 100
//     );
//   }

//   /* ---------------------------------------
//       수정 저장 (NormalVote 전용)
//   ---------------------------------------- */
//   async function handleSaveEdit() {
//     if (!isNormalVote) return;
//     try {
//       await updateNormalVote(data.id, {
//         title: data.title,
//         description: data.description,
//         category: data.category,
//         endAt: data.endAt,
//         options: data.options,
//       });
//       alert("수정 완료!");
//       await load();
//     } catch (e) {
//       console.error(e);
//       alert("수정 실패");
//     }
//   }

//   /* ---------------------------------------
//       관리자 패널 액션 (AI Vote 전용)
//   ---------------------------------------- */

//   const [adminCorrectChoiceId, setAdminCorrectChoiceId] = useState<
//     number | null
//   >(null);

//   async function handleAdminResolve(alsoSettle: boolean) {
//     if (!isAdmin || !isAIVote || !data?.voteId || !adminCorrectChoiceId) {
//       alert("정답 선택이 필요합니다.");
//       return;
//     }
//     try {
//       if (alsoSettle) {
//         await adminResolveAndSettleVote(data.voteId, {
//           correctChoiceId: adminCorrectChoiceId,
//         });
//       } else {
//         await adminResolveVote(data.voteId, {
//           correctChoiceId: adminCorrectChoiceId,
//         });
//       }
//       alert("관리자 처리 완료");
//       await load();
//     } catch (e) {
//       console.error(e);
//       alert("관리자 처리 실패");
//     }
//   }

//   async function handleAdminSettleOnly() {
//     if (!isAdmin || !isAIVote || !data?.voteId) return;
//     try {
//       await adminSettleVote(data.voteId);
//       alert("정산 완료");
//       await load();
//     } catch (e) {
//       console.error(e);
//       alert("정산 실패");
//     }
//   }

//   /* ---------------------------------------
//       참여 (AI Vote / NormalVote)
//   ---------------------------------------- */
//   async function handleParticipateAI(mode: "YES" | "NO") {
//     if (!user) {
//       alert("로그인이 필요합니다.");
//       return;
//     }
//     if (!aiYesChoice || !aiNoChoice) return;

//     const choiceId =
//       mode === "YES" ? aiYesChoice.choiceId : aiNoChoice.choiceId;

//     try {
//       await participateVote(data.voteId, choiceId, selectedAmount);
//       setShowVoteModal(null);
//       setVoteComplete(true);
//       await load();
//     } catch (e) {
//       console.error(e);
//       alert("투표 실패");
//     }
//   }

//   async function handleParticipateNormal(
//     optionId: number,
//     choiceId: number
//   ) {
//     if (!user) {
//       alert("로그인이 필요합니다.");
//       return;
//     }
//     try {
//       await participateNormalVote(data.id, choiceId);
//       alert("투표 완료");
//       await load();
//     } catch (e) {
//       console.error(e);
//       alert("투표 실패");
//     }
//   }

//   /* ---------------------------------------
//       헤더 + 공통 상단 카드
//   ---------------------------------------- */

//   const titleNode = editMode && isNormalVote && (isOwner || isAdmin) ? (
//     <input
//       value={data.title}
//       onChange={(e) =>
//         setData({ ...data, title: e.target.value })
//       }
//       className="w-full bg-white/10 text-white rounded-lg p-2 mb-4"
//     />
//   ) : (
//     <h1 className="text-3xl font-bold text-white mb-4">
//       {data.title}
//     </h1>
//   );

//   const descriptionNode =
//     editMode && isNormalVote && (isOwner || isAdmin) ? (
//       <textarea
//         value={data.description ?? ""}
//         onChange={(e) =>
//           setData({ ...data, description: e.target.value })
//         }
//         className="w-full bg-white/10 text-white rounded-lg p-2 mb-6"
//       />
//     ) : data.description ? (
//       <p className="text-gray-300 leading-relaxed mb-6">
//         {data.description}
//       </p>
//     ) : null;

//   const totalParticipants =
//     data.totalParticipants ?? data.totalParticipantsCount ?? 0;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Header */}
//       <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Button
//                 onClick={onBack}
//                 variant="ghost"
//                 className="text-white hover:bg-white/10"
//               >
//                 <ArrowLeft className="w-5 h-5 mr-2" /> 뒤로
//               </Button>

//               <div className="h-6 w-px bg-white/20" />

//               <span className="text-white font-semibold">
//                 Mak&apos;gora
//               </span>
//               <span className="text-xs text-gray-400 ml-2">
//                 {isAIVote ? "AI 마켓" : "설문형 일반투표"}
//               </span>
//             </div>

//             <div className="flex items-center gap-2">
//               <Button
//                 variant="ghost"
//                 className="text-white hover:bg-white/10"
//               >
//                 <Share2 className="w-5 h-5" />
//               </Button>
//               <Button
//                 variant="ghost"
//                 className="text-white hover:bg-white/10"
//               >
//                 <Bookmark className="w-5 h-5" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* LEFT MAIN CONTENT */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* TOP INFO CARD */}
//           <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
//                 <span className="text-sm text-purple-300 font-medium">
//                   {data.category}
//                 </span>
//               </div>

//               {(isOwner || isAdmin) && isNormalVote && (
//                 <button
//                   onClick={() => setEditMode((prev) => !prev)}
//                   className="ml-auto px-3 py-1 rounded-full text-xs bg-white/10 text-white hover:bg-white/20"
//                 >
//                   {editMode ? "수정 종료" : "수정하기"}
//                 </button>
//               )}
//             </div>

//             {titleNode}
//             {descriptionNode}

//             {/* Summary Stats */}
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               <div className="bg-white/5 rounded-xl p-4">
//                 <div className="text-gray-400 text-sm">참여자</div>
//                 <div className="text-white font-bold text-lg">
//                   {totalParticipants}
//                 </div>
//               </div>

//               {isAIVote && (
//                 <div className="bg-white/5 rounded-xl p-4">
//                   <div className="text-gray-400 text-sm">
//                     총 포인트
//                   </div>
//                   <div className="text-white font-bold text-lg">
//                     {data.totalPoints ?? 0}
//                   </div>
//                 </div>
//               )}

//               <div className="bg-white/5 rounded-xl p-4">
//                 <div className="text-gray-400 text-sm">상태</div>
//                 <div className="text-white font-bold text-lg">
//                   {data.status}
//                 </div>
//               </div>
//               <div className="bg-white/5 rounded-xl p-4">
//                 <div className="text-gray-400 text-sm">마감일</div>
//                 <div className="text-white font-bold text-sm">
//                   {data.endAt
//                     ? new Date(data.endAt).toLocaleString()
//                     : "-"}
//                 </div>
//               </div>
//             </div>

//             {/* 정답 / 정산 / 보상 상태 표시 (AI Vote 전용) */}
//             {isAIVote && (
//               <div className="mt-6 space-y-3">
//                 {/* 정답 */}
//                 {data.correctChoiceId ? (
//                   <div className="bg-purple-900/30 border border-purple-500/40 text-purple-200 p-4 rounded-xl">
//                     <span className="font-semibold">
//                       정답 공개됨:
//                     </span>
//                     <span className="text-white ml-2">
//                       {
//                         data.options
//                           ?.flatMap((opt: any) => opt.choices)
//                           ?.find(
//                             (c: any) =>
//                               c.choiceId === data.correctChoiceId
//                           )?.text
//                       }
//                     </span>
//                   </div>
//                 ) : (
//                   <div className="bg-gray-800 text-gray-300 p-4 rounded-xl">
//                     정답이 아직 공개되지 않았습니다.
//                   </div>
//                 )}

//                 {/* 정산 상태 */}
//                 {data.isResolved && (
//                   <div className="bg-blue-900/30 border border-blue-500/40 text-blue-100 p-4 rounded-xl">
//                     문제 해결 완료 (Resolved)
//                   </div>
//                 )}

//                 {/* 보상 지급 상태 */}
//                 {data.isRewarded && (
//                   <div className="bg-green-900/30 border border-green-500/40 text-green-100 p-4 rounded-xl">
//                     보상 지급 완료!
//                   </div>
//                 )}

//                 {/* 정산 요약 */}
//                 {data.settlementSummary && (
//                   <div className="bg-white/5 border border-white/20 p-4 rounded-xl text-gray-200 text-sm whitespace-pre-line">
//                     {data.settlementSummary}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* 관리자 패널 (AI Vote 전용) */}
//             {isAdmin && isAIVote && (
//               <div className="mt-6 bg-purple-900/30 border border-purple-500/40 rounded-xl p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-purple-200 font-semibold">
//                     관리자 패널
//                   </h3>
//                   <span className="text-xs text-purple-200/70">
//                     정답 선택 / 정산
//                   </span>
//                 </div>

//                 {/* 정답 선택 */}
//                 <div className="flex flex-wrap gap-2">
//                   {data.options?.flatMap((opt: any) =>
//                     opt.choices?.map((c: any) => (
//                       <button
//                         key={c.choiceId}
//                         onClick={() =>
//                           setAdminCorrectChoiceId(c.choiceId)
//                         }
//                         className={`px-3 py-1 rounded-full text-xs border ${
//                           adminCorrectChoiceId === c.choiceId
//                             ? "bg-purple-500 text-white border-purple-300"
//                             : "bg-black/30 text-purple-100 border-purple-500/40"
//                         }`}
//                       >
//                         #{c.choiceId} {c.text ?? c.choiceText}
//                       </button>
//                     ))
//                   )}
//                 </div>

//                 <div className="grid grid-cols-3 gap-2 text-xs">
//                   <button
//                     onClick={() => handleAdminResolve(false)}
//                     className="px-2 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
//                   >
//                     ✔ 정답만 설정
//                   </button>
//                   <button
//                     onClick={() => handleAdminResolve(true)}
//                     className="px-2 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
//                   >
//                     ⚡ 정답 + 정산
//                   </button>
//                   <button
//                     onClick={handleAdminSettleOnly}
//                     className="px-2 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//                   >
//                     💰 정산만 재실행
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* 수정 저장 버튼 (NormalVote 전용 + 작성자/관리자 + editMode) */}
//             {editMode && isNormalVote && (isOwner || isAdmin) && (
//               <div className="mt-4 flex gap-2 justify-end">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setEditMode(false);
//                     load();
//                   }}
//                 >
//                   취소
//                 </Button>
//                 <Button
//                   className="bg-purple-600 text-white"
//                   onClick={handleSaveEdit}
//                 >
//                   수정 저장
//                 </Button>
//               </div>
//             )}
//           </div>

//           {/* TABS */}
//           <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
//             <div className="flex border-b border-white/10">
//               {["chart", "discussion"].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() =>
//                     setSelectedTab(tab as "chart" | "discussion")
//                   }
//                   className={`flex-1 px-6 py-4 font-medium ${
//                     selectedTab === tab
//                       ? "bg-purple-600/30 text-white border-b-2 border-purple-500"
//                       : "text-gray-400 hover:text-white hover:bg-white/5"
//                   }`}
//                 >
//                   {tab === "chart"
//                     ? isAIVote
//                       ? "차트"
//                       : "결과 분포"
//                     : "토론"}
//                 </button>
//               ))}
//             </div>

//             <div className="p-6">
//               {/* ---------- CHART / RESULT TAB ---------- */}
//               {selectedTab === "chart" && (
//                 <div>
//                   {isAIVote ? (
//                     <div className="h-64 mb-6">
//                       <ResponsiveContainer
//                         width="100%"
//                         height="100%"
//                       >
//                         <AreaChart data={chartData}>
//                           <defs>
//                             <linearGradient
//                               id="colorYes"
//                               x1="0"
//                               y1="0"
//                               x2="0"
//                               y2="1"
//                             >
//                               <stop
//                                 offset="5%"
//                                 stopColor="#22c55e"
//                                 stopOpacity={0.3}
//                               />
//                               <stop
//                                 offset="95%"
//                                 stopColor="#22c55e"
//                                 stopOpacity={0}
//                               />
//                             </linearGradient>
//                             <linearGradient
//                               id="colorNo"
//                               x1="0"
//                               y1="0"
//                               x2="0"
//                               y2="1"
//                             >
//                               <stop
//                                 offset="5%"
//                                 stopColor="#ef4444"
//                                 stopOpacity={0.3}
//                               />
//                               <stop
//                                 offset="95%"
//                                 stopColor="#ef4444"
//                                 stopOpacity={0}
//                               />
//                             </linearGradient>
//                           </defs>

//                           <XAxis dataKey="date" stroke="#aaa" />
//                           <YAxis stroke="#aaa" />
//                           <Tooltip />

//                           <Area
//                             type="monotone"
//                             dataKey="yes"
//                             stroke="#22c55e"
//                             strokeWidth={2}
//                             fill="url(#colorYes)"
//                           />
//                           <Area
//                             type="monotone"
//                             dataKey="no"
//                             stroke="#ef4444"
//                             strokeWidth={2}
//                             fill="url(#colorNo)"
//                           />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>
//                   ) : (
//                     // NormalVote 결과 분포
//                     <div className="space-y-4">
//                       {data.options?.map((opt: any) => (
//                         <div
//                           key={opt.optionId}
//                           className="bg-white/5 rounded-xl p-4 border border-white/10"
//                         >
//                           <p className="text-white font-semibold mb-3">
//                             {opt.optionTitle}
//                           </p>
//                           {opt.choices?.map((ch: any) => {
//                             const percent =
//                               getNormalChoicePercent(ch, opt);
//                             return (
//                               <div
//                                 key={ch.choiceId}
//                                 className="mb-2"
//                               >
//                                 <div className="flex justify-between text-xs text-gray-300 mb-1">
//                                   <span>
//                                     {ch.choiceText}
//                                   </span>
//                                   <span>
//                                     {ch.participantsCount ?? 0}
//                                     명 ({percent}%)
//                                   </span>
//                                 </div>
//                                 <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
//                                   <div
//                                     className="h-full bg-purple-500"
//                                     style={{
//                                       width: `${percent}%`,
//                                     }}
//                                   />
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* ---------- DISCUSSION TAB ---------- */}
//               {selectedTab === "discussion" && (
//                 <VoteCommentSection
//                   targetType={isAIVote ? "VOTE" : "NORMAL"}
//                   targetId={isAIVote ? data.voteId : data.id}
//                 />
//               )}
//             </div>
//           </div>

//           {/* 활동 로그 (AI Vote 전용) */}
//           {isAIVote && data.activityLog?.length > 0 && (
//             <div className="bg-white/5 border border-white/10 rounded-xl p-6">
//               <h3 className="text-white font-semibold mb-4">
//                 활동 로그 (Activity Log)
//               </h3>
//               <div className="space-y-2 text-sm text-gray-300">
//                 {data.activityLog.map((log: string, idx: number) => (
//                   <div
//                     key={idx}
//                     className="bg-black/20 p-2 rounded-lg"
//                   >
//                     {log}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* RIGHT SIDEBAR */}
//         <div className="lg:col-span-1">
//           {isAIVote ? (
//             <AIVoteSidebar
//               yesPercent={yesPercent}
//               noPercent={noPercent}
//               selectedAmount={selectedAmount}
//               setSelectedAmount={setSelectedAmount}
//               setShowVoteModal={setShowVoteModal}
//               myParticipation={data.myParticipation}
//               options={data.options ?? []}
//             />
//           ) : (
//             <NormalVoteSidebar
//               options={data.options ?? []}
//               onParticipate={handleParticipateNormal}
//             />
//           )}
//         </div>
//       </div>

//       {/* Vote Modal + Complete Modal (AI Vote 전용) */}
//       {isAIVote && showVoteModal && (
//         <VoteModal
//           mode={showVoteModal}
//           amount={selectedAmount}
//           yesPercent={yesPercent}
//           noPercent={noPercent}
//           onClose={() => setShowVoteModal(null)}
//           onConfirm={handleParticipateAI}
//         />
//       )}

//       {isAIVote && voteComplete && (
//         <VoteCompleteModal
//           amount={selectedAmount}
//           onClose={() => setVoteComplete(false)}
//         />
//       )}
//     </div>
//   );
// }

// /* ---------------------------------------
//    AIVote Sidebar (포인트 배팅 + 내 참여 정보)
// ---------------------------------------- */

// interface AIVoteSidebarProps {
//   yesPercent: number;
//   noPercent: number;
//   selectedAmount: number;
//   setSelectedAmount: (v: number) => void;
//   setShowVoteModal: (v: null | "YES" | "NO") => void;
//   myParticipation?: any;
//   options: any[];
// }

// function AIVoteSidebar({
//   yesPercent,
//   noPercent,
//   selectedAmount,
//   setSelectedAmount,
//   setShowVoteModal,
//   myParticipation,
//   options,
// }: AIVoteSidebarProps) {
//   // 내 참여한 choice 텍스트 찾기
//   const myChoiceText =
//     myParticipation?.choiceId &&
//     options
//       ?.flatMap((opt: any) => opt.choices)
//       ?.find((c: any) => c.choiceId === myParticipation.choiceId)
//       ?.text;

//   return (
//     <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 sticky top-24 space-y-6">
//       <h3 className="text-white font-semibold mb-2">포인트 배팅</h3>

//       {/* YES / NO buttons */}
//       <button
//         onClick={() => setShowVoteModal("YES")}
//         className="w-full bg-green-600/70 text-white rounded-xl p-4"
//       >
//         YES — {yesPercent}%
//       </button>

//       <button
//         onClick={() => setShowVoteModal("NO")}
//         className="w-full bg-red-600/70 text-white rounded-xl p-4"
//       >
//         NO — {noPercent}%
//       </button>

//       {/* Amount buttons */}
//       <div className="grid grid-cols-3 gap-2">
//         {[50, 100, 250, 500, 1000].map((amt) => (
//           <button
//             key={amt}
//             onClick={() => setSelectedAmount(amt)}
//             className={`p-2 rounded-lg ${
//               amt === selectedAmount
//                 ? "bg-purple-600 text-white"
//                 : "bg-white/10 text-gray-300"
//             }`}
//           >
//             {amt}pt
//           </button>
//         ))}
//       </div>

//       <input
//         type="number"
//         value={selectedAmount}
//         onChange={(e) =>
//           setSelectedAmount(Number(e.target.value) || 0)
//         }
//         className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white"
//       />

//       {/* 내 참여 정보 */}
//       {myParticipation?.hasParticipated && (
//         <div className="bg-purple-800/40 border border-purple-500/30 rounded-xl p-4 space-y-2 mt-2">
//           <h3 className="text-white font-semibold text-sm">
//             내 참여 정보
//           </h3>

//           <div className="text-gray-300 text-xs space-y-1">
//             <div>
//               <span className="text-gray-400">선택:</span>{" "}
//               <span className="text-white font-semibold">
//                 {myChoiceText ?? "-"}
//               </span>
//             </div>
//             <div>
//               <span className="text-gray-400">배팅 포인트:</span>{" "}
//               {myParticipation.pointsBet}pt
//             </div>
//             <div>
//               <span className="text-gray-400">예상 배당률:</span>{" "}
//               {myParticipation.expectedOdds}x
//             </div>
//             <div>
//               <span className="text-gray-400">예상 보상:</span>{" "}
//               {myParticipation.expectedReward}pt
//             </div>
//             {myParticipation.votedAt && (
//               <div>
//                 <span className="text-gray-400">참여 시간:</span>{" "}
//                 {new Date(
//                   myParticipation.votedAt
//                 ).toLocaleString()}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------------------------------------
//    NormalVote Sidebar (설문형 투표, 포인트 X)
// ---------------------------------------- */

// function NormalVoteSidebar({
//   options,
//   onParticipate,
// }: {
//   options: any[];
//   onParticipate: (optionId: number, choiceId: number) => void;
// }) {
//   return (
//     <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 sticky top-24 space-y-4">
//       <h3 className="text-white font-semibold">
//         설문 참여하기
//       </h3>

//       {options.map((opt: any) => (
//         <div
//           key={opt.optionId}
//           className="bg-black/30 rounded-xl p-4 border border-white/10"
//         >
//           <p className="text-white font-semibold mb-3">
//             {opt.optionTitle}
//           </p>
//           <div className="space-y-2">
//             {opt.choices?.map((ch: any) => (
//               <button
//                 key={ch.choiceId}
//                 onClick={() =>
//                   onParticipate(opt.optionId, ch.choiceId)
//                 }
//                 className="w-full flex justify-between items-center bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 text-sm"
//               >
//                 <span>{ch.choiceText}</span>
//                 <span className="text-xs text-gray-300">
//                   {ch.participantsCount ?? 0}명
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ---------------------------------------
//    VoteModal & CompleteModal (AI Vote)
// ---------------------------------------- */

// function VoteModal({
//   mode,
//   amount,
//   yesPercent,
//   noPercent,
//   onClose,
//   onConfirm,
// }: {
//   mode: "YES" | "NO";
//   amount: number;
//   yesPercent: number;
//   noPercent: number;
//   onClose: () => void;
//   onConfirm: (m: "YES" | "NO") => void;
// }) {
//   const percent = mode === "YES" ? yesPercent : noPercent;
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
//       <div className="bg-slate-900 p-8 rounded-2xl border border-white/20 w-full max-w-md">
//         <h2 className="text-white text-2xl font-bold mb-6">
//           {mode} 투표 확인
//         </h2>

//         <div className="bg-white/5 rounded-xl p-4 mb-6">
//           <div className="text-gray-400 text-sm">배팅 포인트</div>
//           <div className="text-white text-3xl font-bold">
//             {amount}pt
//           </div>

//           <div className="mt-4">
//             <div className="flex justify-between text-gray-400">
//               <span>현재 확률</span>
//               <span className="text-white">{percent}%</span>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-3">
//           <Button
//             onClick={onClose}
//             variant="outline"
//             className="flex-1"
//           >
//             취소
//           </Button>
//           <Button
//             onClick={() => onConfirm(mode)}
//             className="flex-1 bg-purple-600 text-white"
//           >
//             투표 확정
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function VoteCompleteModal({
//   amount,
//   onClose,
// }: {
//   amount: number;
//   onClose: () => void;
// }) {
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
//       <div className="bg-slate-900 p-8 rounded-2xl border border-white/20 w-full max-w-md">
//         <h2 className="text-white text-2xl font-bold mb-6">
//           투표 완료 🎉
//         </h2>

//         <div className="bg-white/5 rounded-xl p-4 mb-6">
//           <div className="text-gray-400 text-sm">배팅 포인트</div>
//           <div className="text-white text-3xl font-bold">
//             {amount}pt
//           </div>
//         </div>

//         <Button
//           onClick={onClose}
//           className="w-full bg-purple-600 text-white"
//         >
//           확인
//         </Button>
//       </div>
//     </div>
//   );
// }
//   export function VoteDetailRouteWrapper() {
//   const navigate = useNavigate();
//   const { voteId } = useParams();
//   const location = useLocation();

//   // VoteType 전달: state로 전달되었으면 그대로 사용, 없으면 AI 기본값
//   const voteType = (location.state?.voteType ?? "AI") as "AI" | "NORMAL";

//   return (
//     <VoteDetailPage
//       onBack={() => navigate(-1)}
//       marketId={Number(voteId)}
//       voteType={voteType}
//     />
//   );
// }