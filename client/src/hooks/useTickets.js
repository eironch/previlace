import useSWR, { mutate } from "swr";
import apiClient from "../services/apiClient";

const fetcher = (url) => apiClient.get(url).then((res) => res.data);

export function useTickets() {
  // Fetch student tickets
  const useStudentTickets = (status) => {
    const params = status && status !== "all" ? `?status=${status}` : "";
    const { data, error, isLoading } = useSWR(
      `/inquiry-tickets/student${params}`,
      fetcher
    );

    // Handle both array and object wrapper responses
    const tickets = Array.isArray(data) 
      ? data 
      : (data?.tickets || data?.data || []);

    return {
      tickets,
      isLoading,
      isError: error,
    };
  };

  // Fetch instructor tickets
  const useInstructorTickets = (status, subjectId) => {
    let query = "";
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (subjectId) params.append("subjectId", subjectId);
    if (params.toString()) query = `?${params.toString()}`;

    const { data, error, isLoading } = useSWR(
      `/inquiry-tickets/instructor${query}`,
      fetcher
    );

    const tickets = Array.isArray(data) 
      ? data 
      : (data?.tickets || data?.data || []);

    return {
      tickets,
      isLoading,
      isError: error,
    };
  };

  // Fetch single ticket
  const useTicket = (id) => {
    const { data, error, isLoading } = useSWR(
      id ? `/inquiry-tickets/${id}` : null,
      fetcher
    );

    return {
      ticket: data,
      isLoading,
      isError: error,
    };
  };

  // Global mutate helper
  const refreshTickets = () => {
    mutate((key) => typeof key === 'string' && key.startsWith('/inquiry-tickets'));
  };

  return {
    useStudentTickets,
    useInstructorTickets,
    useTicket,
    refreshTickets,
  };
}
