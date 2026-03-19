'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, GripVertical, Pencil, Trash2, ExternalLink,
  Check, X, Link as LinkIcon, ToggleLeft, ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useProfileStore } from '@/lib/store';
import type { SocialLink } from '@/types';

// ─── Link Form ────────────────────────────────────────────────────────────────
interface LinkFormProps {
  initial?: Partial<SocialLink>;
  onSave: (data: Pick<SocialLink, 'title' | 'url'>) => void;
  onCancel: () => void;
}

function LinkForm({ initial, onSave, onCancel }: LinkFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error('Title and URL are required.');
      return;
    }
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
    onSave({ title: title.trim(), url: finalUrl });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onSubmit={handleSubmit}
      className="p-4 rounded-xl bg-void-100/60 border border-white/5 space-y-3"
    >
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Title (e.g. My Portfolio)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-void-200 border border-white/5 text-sm text-void-900 placeholder-void-500 focus:outline-none focus:border-shelby-500 focus:ring-1 focus:ring-shelby-500/30 transition-all"
          autoFocus
          maxLength={60}
        />
        <input
          type="url"
          placeholder="URL (e.g. https://yoursite.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-void-200 border border-white/5 text-sm text-void-900 placeholder-void-500 focus:outline-none focus:border-shelby-500 focus:ring-1 focus:ring-shelby-500/30 transition-all"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-sm text-void-700 hover:bg-void-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg bg-shelby-600 hover:bg-shelby-500 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
        >
          <Check size={13} /> Save
        </button>
      </div>
    </motion.form>
  );
}

// ─── Sortable Link Row ────────────────────────────────────────────────────────
interface LinkRowProps {
  link: SocialLink;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isEditing: boolean;
  onSave: (data: Pick<SocialLink, 'title' | 'url'>) => void;
  onCancelEdit: () => void;
}

function SortableLinkRow({ link, onEdit, onDelete, onToggle, isEditing, onSave, onCancelEdit }: LinkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <LinkForm key="form" initial={link} onSave={onSave} onCancel={onCancelEdit} />
        ) : (
          <motion.div
            key="row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`
              flex items-center gap-3 p-3 rounded-xl border transition-all
              ${link.active
                ? 'bg-void-100/40 border-white/5 hover:border-white/10'
                : 'bg-void-50/30 border-white/3 opacity-60'
              }
            `}
          >
            {/* Drag handle */}
            <button
              className="p-1 text-void-500 hover:text-void-700 cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </button>

            {/* Link icon */}
            <div className="w-8 h-8 rounded-lg bg-void-200 flex items-center justify-center shrink-0">
              <LinkIcon size={14} className="text-shelby-400" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-void-900 truncate">{link.title}</p>
              <p className="text-xs text-void-600 truncate">{link.url}</p>
            </div>

            {/* Clicks */}
            <span className="text-xs font-mono text-void-500 shrink-0">
              {link.clicks} clicks
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-void-500 hover:text-void-800 hover:bg-white/5 transition-colors"
                title="Open link"
              >
                <ExternalLink size={13} />
              </a>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-void-500 hover:text-void-800 hover:bg-white/5 transition-colors"
                title={link.active ? 'Deactivate' : 'Activate'}
              >
                {link.active ? <ToggleRight size={16} className="text-shelby-400" /> : <ToggleLeft size={16} />}
              </button>
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-void-500 hover:text-void-800 hover:bg-white/5 transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-void-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LinkManager() {
  const profile = useProfileStore((s) => s.profile);
  const addLink = useProfileStore((s) => s.addLink);
  const updateLink = useProfileStore((s) => s.updateLink);
  const removeLink = useProfileStore((s) => s.removeLink);
  const reorderLinks = useProfileStore((s) => s.reorderLinks);

  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const links = [...(profile?.links ?? [])].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    reorderLinks(reordered.map((l) => l.id));
  };

  const handleAdd = (data: Pick<SocialLink, 'title' | 'url'>) => {
    addLink(data);
    setAddingNew(false);
    toast.success('Link added!');
  };

  const handleEdit = (id: string, data: Pick<SocialLink, 'title' | 'url'>) => {
    updateLink(id, data);
    setEditingId(null);
    toast.success('Link updated.');
  };

  const handleDelete = (id: string) => {
    removeLink(id);
    toast('Link removed.', { icon: '🗑️' });
  };

  const handleToggle = (link: SocialLink) => {
    updateLink(link.id, { active: !link.active });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-void-900">Links</h3>
          <p className="text-sm text-void-600">{links.length} link{links.length !== 1 ? 's' : ''}</p>
        </div>
        {!addingNew && (
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-shelby-600 hover:bg-shelby-500 text-white text-sm font-medium transition-all"
          >
            <Plus size={14} /> Add Link
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {addingNew && (
          <LinkForm
            key="new-link-form"
            onSave={handleAdd}
            onCancel={() => setAddingNew(false)}
          />
        )}
      </AnimatePresence>

      {/* Sortable list */}
      {links.length === 0 && !addingNew ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="p-4 rounded-2xl bg-void-100/50">
            <LinkIcon size={24} className="text-void-500" />
          </div>
          <div>
            <p className="font-medium text-void-700">No links yet</p>
            <p className="text-sm text-void-500 mt-1">Add your first link to get started</p>
          </div>
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-shelby-500/30 text-shelby-400 hover:bg-shelby-500/10 text-sm transition-all"
          >
            <Plus size={14} /> Add your first link
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {links.map((link) => (
                <SortableLinkRow
                  key={link.id}
                  link={link}
                  isEditing={editingId === link.id}
                  onEdit={() => setEditingId(link.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={(data) => handleEdit(link.id, data)}
                  onDelete={() => handleDelete(link.id)}
                  onToggle={() => handleToggle(link)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
