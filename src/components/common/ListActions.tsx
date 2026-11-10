import { PatientHistoryButton } from '../PatientHistoryModal'

export function ListActions({
  onEdit,
  onDelete,
  onAddAnamnese,
  onViewHistory,
  patientName,
}: {
  onEdit: () => void
  onDelete: () => void
  onAddAnamnese?: () => void
  onViewHistory?: () => void
  patientName?: string
}) {
  return (
    <span className="flex shrink-0">
      {onAddAnamnese && (
        <button
          aria-label={`Adicionar anamnese para ${patientName}`}
          className="rounded-md px-2 py-1 text-xl font-bold text-[#3f5c4f] transition hover:bg-[#3f5c4f] hover:text-white"
          onClick={onAddAnamnese}
          title="Adicionar anamnese"
          type="button"
        >
          🗒
        </button>
      )}
      {onViewHistory && (
        <PatientHistoryButton
          patientName={patientName ?? 'paciente'}
          onClick={onViewHistory}
        />
      )}
      <button className="rounded-md px-2 py-1 text-xl font-bold text-[#4f7161] transition hover:bg-[#3f5c4f] hover:text-white" type="button" onClick={onEdit}>✎</button>
      <button className="rounded-md px-2 py-1 text-xl font-bold text-red-800 transition hover:bg-red-800 hover:text-white" type="button" onClick={onDelete}>🗑</button>
    </span>
  )
}