import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Users as UsersIcon, MoreHorizontal, Pencil, UserX, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fullName, pruneEmpty } from '@/lib/utils';
import { USER_ROLE_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar } from '@/components/ui/avatar';
import { DataTable } from '@/components/tables/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/components/ui/confirm';
import { FormGrid } from '@/components/forms/Field';
import { TextField, SelectField, SwitchField } from '@/components/forms/fields';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useDeleteUser,
} from './hooks';

// El rol "admin" se administra fuera de esta pantalla: no se puede asignar
// desde el formulario ni editar/borrar usuarios administradores aquí.
const ASSIGNABLE_ROLE_OPTIONS = USER_ROLE_OPTIONS.filter((o) => o.value !== 'admin');

const createSchema = z.object({
  first_name: z.string().trim().min(1, 'Requerido'),
  last_name: z.string().trim().min(1, 'Requerido'),
  email: z.string().trim().email('Email no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.string().min(1),
});
const editSchema = z.object({
  first_name: z.string().trim().min(1, 'Requerido'),
  last_name: z.string().trim().min(1, 'Requerido'),
  email: z.string().trim().email('Email no válido'),
  role: z.string().min(1),
  is_active: z.boolean(),
});

function UserModal({ open, onOpenChange, user, onSaved }) {
  const isEdit = !!user?.id;
  const create = useCreateUser({ onSuccess: done });
  const update = useUpdateUser({ onSuccess: done });

  const form = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'sales',
      is_active: true,
    },
  });
  const { register, control, handleSubmit, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!open) return;
    reset(
      isEdit
        ? {
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            email: user.email ?? '',
            password: '',
            role: user.role ?? 'sales',
            is_active: user.is_active ?? true,
          }
        : {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            role: 'sales',
            is_active: true,
          },
    );
  }, [open, isEdit, user, reset]);

  function done() {
    onOpenChange(false);
    onSaved?.();
  }

  const onSubmit = handleSubmit((values) => {
    if (isEdit) {
      update.mutate({
        id: user.id,
        data: pruneEmpty({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          role: values.role,
          is_active: values.is_active,
        }),
      });
    } else {
      create.mutate(pruneEmpty(values));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate>
          <DialogBody className="space-y-4">
            <FormGrid>
              <TextField name="first_name" label="Nombre" register={register} required error={errors.first_name?.message} />
              <TextField name="last_name" label="Apellido" register={register} required error={errors.last_name?.message} />
            </FormGrid>
            <TextField name="email" label="Email" type="email" register={register} required error={errors.email?.message} />
            {!isEdit && (
              <TextField
                name="password"
                label="Contraseña temporal"
                type="password"
                register={register}
                required
                error={errors.password?.message}
              />
            )}
            <SelectField name="role" label="Rol" control={control} options={ASSIGNABLE_ROLE_OPTIONS} error={errors.role?.message} />
            {isEdit && (
              <SwitchField name="is_active" control={control} label="Usuario activo" />
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {isEdit ? 'Guardar' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UsersPage() {
  const { can } = useAuth();
  const confirm = useConfirm();
  const [modal, setModal] = useState(null); // 'new' | { user } | null
  const query = useUsers({ page: 1, pageSize: 100 });
  const deactivate = useDeactivateUser();
  const deleteUser = useDeleteUser();

  const columns = [
    {
      key: 'name',
      header: 'Usuario',
      primary: true,
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={fullName(u) || u.email} size="sm" />
          <div>
            <p className="font-medium text-gray-800 dark:text-white/90">{fullName(u)}</p>
            <p className="text-theme-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      cell: (u) => <StatusBadge value={u.role} options={USER_ROLE_OPTIONS} />,
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (u) => (
        <Badge tone={u.is_active !== false ? 'success' : 'gray'}>
          {u.is_active !== false ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      actions: true,
      align: 'right',
      cell: (u) =>
        can('users:write') &&
        u.role !== 'admin' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Acciones">
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setModal({ user: u })}>
                <Pencil className="size-4" /> Editar
              </DropdownMenuItem>
              {u.is_active !== false && (
                <DropdownMenuItem
                  onSelect={async () => {
                    const ok = await confirm({
                      title: 'Desactivar usuario',
                      description: `${fullName(u)} ya no podrá iniciar sesión.`,
                      confirmText: 'Desactivar',
                      tone: 'danger',
                    });
                    if (ok) deactivate.mutate(u.id);
                  }}
                >
                  <UserX className="size-4" /> Desactivar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                tone="danger"
                onSelect={async () => {
                  const ok = await confirm({
                    title: 'Borrar usuario',
                    description: `Esta acción eliminará a ${fullName(u)} de forma permanente.`,
                    confirmText: 'Borrar',
                    tone: 'danger',
                  });
                  if (ok) deleteUser.mutate(u.id);
                }}
              >
                <Trash2 className="size-4" /> Borrar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Miembros del equipo con acceso al CRM."
        breadcrumbs={[{ label: 'Configuración' }, { label: 'Usuarios' }]}
        actions={
          can('users:write') && (
            <Button onClick={() => setModal('new')}>
              <Plus className="size-4" /> Nuevo usuario
            </Button>
          )
        }
      />
      <Card className="p-4 sm:p-5">
        <DataTable
          columns={columns}
          rows={query.data?.items ?? []}
          isLoading={query.isLoading}
          error={query.isError ? query.error : null}
          onRetry={query.refetch}
          emptyIcon={UsersIcon}
          emptyTitle="Sin usuarios"
        />
      </Card>

      <UserModal
        open={modal === 'new' || !!modal?.user}
        user={modal?.user}
        onOpenChange={(o) => !o && setModal(null)}
        onSaved={() => query.refetch()}
      />
    </>
  );
}

export default UsersPage;
