import { useEffect, useState } from "react";
import {
  fetchRecommendedIssues,
  fetchLatestIssues,
} from "../api/issueApi";

export function useIssueList() {
  const [recommended, setRecommended] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const r = await fetchRecommendedIssues();
      const l = await fetchLatestIssues();
      setRecommended(r.data || []);
      setLatest(l.data || []);
    } catch (e) {
      console.error("이슈 로딩 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  return { recommended, latest, loading };
}
