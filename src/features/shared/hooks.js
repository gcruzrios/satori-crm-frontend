import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { toast } from '@/components/ui/toast';

/**
 * Standard query/mutation hooks for a CRUD resource.
 *
 * @param {object} cfg
 * @param {string} cfg.key       react-query key root (usually the resource)
 * @param {ReturnType<import('./crud').createCrudApi>} cfg.api
 * @param {string} [cfg.labelSingular]
 */
export function createCrudHooks({ key, api, labelSingular = 'registro' }) {
  const listKey = (params) => [key, 'list', params ?? {}];
  const itemKey = (id) => [key, 'detail', id];

  function useList(params, options = {}) {
    return useQuery({
      queryKey: listKey(params),
      queryFn: () => api.list(params),
      placeholderData: keepPreviousData,
      ...options,
    });
  }

  function useItem(id, options = {}) {
    return useQuery({
      queryKey: itemKey(id),
      queryFn: () => api.get(id),
      enabled: !!id,
      ...options,
    });
  }

  function invalidateLists(queryClient) {
    return queryClient.invalidateQueries({ queryKey: [key] });
  }

  function useCreate(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data) => api.create(data),
      onSuccess: (created, vars, ctx) => {
        invalidateLists(queryClient);
        toast.success(`${capitalize(labelSingular)} creado correctamente`);
        options.onSuccess?.(created, vars, ctx);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
      ...stripHandled(options),
    });
  }

  function useUpdate(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }) => api.update(id, data),
      onSuccess: (updated, vars, ctx) => {
        invalidateLists(queryClient);
        queryClient.invalidateQueries({ queryKey: itemKey(vars.id) });
        toast.success('Cambios guardados');
        options.onSuccess?.(updated, vars, ctx);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
      ...stripHandled(options),
    });
  }

  function useRemove(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id) => api.remove(id),
      onSuccess: (res, id, ctx) => {
        invalidateLists(queryClient);
        toast.success(`${capitalize(labelSingular)} eliminado`);
        options.onSuccess?.(res, id, ctx);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
      ...stripHandled(options),
    });
  }

  /** Generic POST /{resource}/{id}/{verb} mutation (send, accept, pay, …). */
  function useAction(verb, { successMessage, ...options } = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data } = {}) => api.action(id, verb, data),
      onSuccess: (res, vars, ctx) => {
        invalidateLists(queryClient);
        queryClient.invalidateQueries({ queryKey: itemKey(vars?.id) });
        if (successMessage) toast.success(successMessage);
        options.onSuccess?.(res, vars, ctx);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
      ...stripHandled(options),
    });
  }

  return { useList, useItem, useCreate, useUpdate, useRemove, useAction, listKey, itemKey };
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// Drop caller callbacks we already invoke inside the wrapper's own handlers.
function stripHandled({ onSuccess: _os, onError: _oe, ...rest }) {
  return rest;
}
