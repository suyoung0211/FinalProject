// components/profile/UserProfileTrigger.tsx
import { ReactNode, useState } from "react";
import UserProfileModal from "./UserProfileModal";

interface UserProfileTriggerProps {
  userId: number;
  children: ReactNode;
}

export default function UserProfileTrigger({
  userId,
  children,
}: UserProfileTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        className="cursor-pointer hover:underline"
      >
        {children}
      </span>

      <UserProfileModal
        userId={userId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
