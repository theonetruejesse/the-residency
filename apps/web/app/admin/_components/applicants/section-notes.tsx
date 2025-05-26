"use client";

import { useUser } from "@clerk/nextjs";
import type { Note, Id } from "@residency/api";
import { api } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import { Textarea } from "@residency/ui/components/textarea";
import { useMutation } from "convex/react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";

interface NotesSectionProps {
  notes: Note[];
  applicantId: Id<"applicants">;
}
export const NotesSection = ({ notes, applicantId }: NotesSectionProps) => {
  return (
    <div className="space-y-2">
      {notes.length !== 0 && (
        <div className="space-y-1">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
      <AddNote applicantId={applicantId} />
    </div>
  );
};

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.note);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editNote = useMutation(api.application.admin.editNote);

  const formatRelativeTime = (timestamp: number) => {
    return DateTime.fromMillis(timestamp).toRelative();
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return;

    setIsSubmitting(true);
    try {
      await editNote({
        noteId: note._id,
        note: editedContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(note.note);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditedContent(note.note);
    setIsEditing(true);
  };

  return (
    <div key={note._id} className="px-3 py-2 border rounded-lg bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h4 className="text-sm font-medium text-gray-900 lowercase">
            {note.creator}
          </h4>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(note._creationTime)}
          </p>
        </div>
        <NoteActions
          note={note}
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          canSave={
            editedContent.trim() !== "" && editedContent.trim() !== note.note
          }
        />
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mt-2">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[80px] text-sm"
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed">{note.note}</p>
      )}
    </div>
  );
};

interface NoteActionsProps {
  note: Note;
  isEditing: boolean;
  isSubmitting: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  canSave: boolean;
}

const NoteActions = ({
  note,
  isEditing,
  isSubmitting,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  canSave,
}: NoteActionsProps) => {
  const deleteNote = useMutation(api.application.admin.deleteNote);

  const user = useUser();
  const convexUserId = user.user?.publicMetadata.convexUserId;
  const isCreator = note.createdBy === convexUserId;

  if (!isCreator) return null;

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
          onClick={onCancelEdit}
          disabled={isSubmitting}
        >
          <X className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
          onClick={onSaveEdit}
          disabled={!canSave || isSubmitting}
        >
          <Check className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
        onClick={() => deleteNote({ noteId: note._id })}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
        onClick={onStartEdit}
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
};

interface AddNoteProps {
  applicantId: Id<"applicants">;
}

const AddNote = ({ applicantId }: AddNoteProps) => {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createNote = useMutation(api.application.admin.createNote);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await createNote({
        applicantId,
        note: newNote.trim(),
      });
      setNewNote("");
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-2">
      <Textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        className="min-h-[80px] text-sm pr-20"
      />
      <Button
        variant="secondary"
        onClick={handleSubmit}
        disabled={!newNote.trim() || isSubmitting}
        size="sm"
        className="absolute bottom-2 right-2 z-10"
      >
        {isSubmitting ? "adding..." : "add note"}
      </Button>
    </div>
  );
};
