export const extractList = (data) => {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.data) ? data.data :
    Array.isArray(data?.result) ? data.result :
      Array.isArray(data?.items) ? data.items : [];
};

export const normalizeUser = (user) => {
  const id = user?.id ?? user?.userId ?? user?.usuarioId ?? user?.Id ?? '';
  const nombre = user?.nombre ?? user?.name ?? user?.first_name ?? user?.firstName ?? '';
  const apellido = user?.apellido ?? user?.last_name ?? user?.lastName ?? '';
  const fullName = `${String(nombre).trim()} ${String(apellido).trim()}`.trim() ||
    user?.username || user?.email || `Usuario ${id}`;
  return {
    id: String(id),
    name: fullName,
    rol: user?.rol ?? user?.role ?? '',
    avatarUrl: user?.avatarUrl ?? user?.avatar_url ?? null,
    raw: user
  };
};

export const normalizeMessage = (msg) => ({
  id: msg.id ?? msg._id ?? msg.messageId ?? msg.mensajeId ?? Math.random().toString(36),
  from: String(msg.from ?? msg.sender ?? msg.de ?? msg.emisorId ?? msg.emisor ?? ''),
  to: String(msg.to ?? msg.receiver ?? msg.para ?? msg.receptorId ?? msg.receptor ?? ''),
  content: msg.content ?? msg.text ?? msg.body ?? msg.mensaje ?? msg.contenido ?? '',
  createdAt: msg.createdAt ?? msg.created_at ?? msg.fecha ?? new Date().toISOString(),
  read: Boolean(msg.read ?? msg.leido ?? false),
  raw: msg,
});

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
};
