import { useState } from "react";
import { Edit, Ban, Trash2, CheckCircle } from "lucide-react";
import EditUserModal from "./EditUserModal";
import { updateAdminUserApi } from "../../../api/adminAPI";

interface Props {
  userId: number;
  userData: {
    id: number;
    loginId: string;
    nickname: string;
    level: number;
    points: number;
    profileBackground?: string | null;
    profileImage?: string | null;
    role: string;
    status: string;
    verificationEmail: string;
    createdAt: string;
  };
  onUpdate: () => void;
  onEdit: () => void;
}

export default function UserActionButtons({
  userId,
  userData,
  onUpdate,
  onEdit,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = () => setIsModalOpen(true);

  // 상태 코드 → 한글 매핑
  const statusLabel = {
    ACTIVE: "활성화",
    INACTIVE: "비활성화",
    DELETED: "삭제"
  } as const;

  const updateStatus = async (newStatus: "ACTIVE" | "INACTIVE" | "DELETED") => {
    if (!confirm(`사용자를 ${statusLabel[newStatus]} 하시겠습니까?`)) return;
    setLoading(true);

    try {
      await updateAdminUserApi(userId, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error(err);
      alert("변경 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onEdit}
          disabled={loading}
          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={() => updateStatus("ACTIVE")}
          disabled={loading}
          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400"
        >
          <CheckCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => updateStatus("INACTIVE")}
          disabled={loading}
          className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
        >
          <Ban className="w-4 h-4" />
        </button>

        <button
          onClick={() => updateStatus("DELETED")}
          disabled={loading}
          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isModalOpen && (
        <EditUserModal
          userId={userId}
          userData={userData}
          onClose={() => setIsModalOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
