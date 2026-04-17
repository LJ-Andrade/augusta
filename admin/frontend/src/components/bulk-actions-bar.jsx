import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

export function BulkActionsBar({ 
  selectedCount, 
  onDelete, 
  onClear,
  deleteLabel,
  confirmMessage,
  isDeleting = false
}) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (selectedCount === 0) return null;

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background border border-border shadow-lg rounded-lg px-4 py-3 animate-in slide-in-from-bottom-4">
        <span className="text-sm font-medium">
          {t('common.bulk_selected', { count: selectedCount })}
        </span>
        <div className="h-4 w-px bg-border" />
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleteLabel || t('common.bulk_delete')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isDeleting}
        >
          <X className="h-4 w-4 mr-2" />
          {t('common.clear')}
        </Button>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('common.confirm_delete')}
        description={confirmMessage || t('common.bulk_delete_confirm', { count: selectedCount })}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
