import { useQuery } from '@tanstack/react-query';
import { getPatientRecords } from '../../services/apiMedicalRecords';

export function usePatientMedicalRecords(patientId: string | undefined) {
	const { data: records = [], isPending } = useQuery({
		queryKey: ['medical-records', 'patient', patientId],
		queryFn: () => getPatientRecords(patientId!),
		enabled: !!patientId,
	});

	return { records, isPending };
}
