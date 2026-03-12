import { useQuery } from '@tanstack/react-query';
import { getDoctors } from '../../services/apiUsers';
import type { User } from '../../types';

export function useDoctors() {
  const { data, isPending } = useQuery({
    queryKey: ['doctors-all'],
    queryFn: () => getDoctors({}),
  });

  return { doctors: (data?.data ?? []) as User[], isPending };
}
