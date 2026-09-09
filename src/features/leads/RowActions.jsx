import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/components/ui/confirm';
import { useDeleteLead } from './hooks';

export function LeadRowActions({ lead, onConvert }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();
  const del = useDeleteLead();

  const alreadyConverted = lead.status === 'converted';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
          aria-label="Acciones"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate(`/leads/${lead.id}`)}>
          <Eye className="size-4" /> Ver
        </DropdownMenuItem>
        {can('leads:write') && (
          <DropdownMenuItem onSelect={() => navigate(`/leads/${lead.id}/edit`)}>
            <Pencil className="size-4" /> Editar
          </DropdownMenuItem>
        )}
        {can('leads:convert') && !alreadyConverted && (
          <DropdownMenuItem onSelect={() => onConvert(lead)}>
            <ArrowRightLeft className="size-4" /> Convertir
          </DropdownMenuItem>
        )}
        {can('leads:delete') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tone="danger"
              onSelect={async () => {
                const ok = await confirm({
                  title: 'Eliminar lead',
                  description:
                    'El lead se archivará (borrado lógico). Podrás recuperarlo si es necesario.',
                  confirmText: 'Eliminar',
                  tone: 'danger',
                });
                if (ok) del.mutate(lead.id);
              }}
            >
              <Trash2 className="size-4" /> Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
