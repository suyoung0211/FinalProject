import { useNavigate } from "react-router-dom";
import { ProfilePage } from "./ProfilePage";

export function ProfilePageWrapper() {
  const navigate = useNavigate();
  return (
    <ProfilePage onBack={() => navigate(-1)} />
  );
}