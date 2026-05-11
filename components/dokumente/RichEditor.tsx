"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useEffect, useRef, useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ── Floating bubble toolbar ────────────────────────────────────────────────────
interface BubbleState { top: number; left: number; visible: boolean }

function FloatingToolbar({ editor, bubble }: { editor: Editor; bubble: BubbleState }) {
  if (!bubble.visible) return null;

  function btn(label: string, action: () => void, active?: boolean, display?: React.ReactNode) {
    return (
      <button
        key={label}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); action(); }}
        title={label}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
          active ? "bg-[#E8FF6B] text-[#0F0F0F]" : "text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#2A2A2A]"
        }`}
      >
        {display ?? label}
      </button>
    );
  }

  function sep() { return <div className="w-px h-4 bg-[#2A2A2A] shrink-0" />; }

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 bg-[#161616] border border-[#2A2A2A] rounded-xl px-1.5 py-1.5 shadow-2xl"
      style={{ top: bubble.top, left: bubble.left, transform: "translateX(-50%)" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {btn("Überschrift 1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }), <span className="font-bold">H1</span>)}
      {btn("Überschrift 2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }), <span className="font-bold">H2</span>)}
      {sep()}
      {btn("Fett", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), <strong>Fett</strong>)}
      {btn("Kursiv", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), <em>Kursiv</em>)}
      {btn("Unterstrichen", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"), <span className="underline">Unter</span>)}
      {btn("Durchgestrichen", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"), <span className="line-through">Durch</span>)}
      {sep()}
      {btn("Markieren", () => editor.chain().focus().toggleHighlight({ color: "#E8FF6B" }).run(), editor.isActive("highlight"),
        <span className="bg-[#E8FF6B] text-[#0F0F0F] px-1 rounded font-bold">Mark</span>)}
      {btn("Code", () => editor.chain().focus().toggleCode().run(), editor.isActive("code"),
        <span className="font-mono text-[10px] bg-[#1E1E1E] px-1 rounded">Code</span>)}
      {sep()}
      {btn("Links", () => editor.chain().focus().setTextAlign("left").run(), editor.isActive({ textAlign: "left" }))}
      {btn("Mitte", () => editor.chain().focus().setTextAlign("center").run(), editor.isActive({ textAlign: "center" }))}
      {btn("Rechts", () => editor.chain().focus().setTextAlign("right").run(), editor.isActive({ textAlign: "right" }))}
    </div>
  );
}

// ── Slash command menu ─────────────────────────────────────────────────────────
interface SlashItem {
  label: string;
  description: string;
  icon: string;
  action: (editor: Editor, from: number) => void;
}

const SLASH_ITEMS: SlashItem[] = [
  { label: "Überschrift 1", description: "Große Überschrift", icon: "H1",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleHeading({ level: 1 }).run() },
  { label: "Überschrift 2", description: "Mittlere Überschrift", icon: "H2",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleHeading({ level: 2 }).run() },
  { label: "Überschrift 3", description: "Kleine Überschrift", icon: "H3",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleHeading({ level: 3 }).run() },
  { label: "Aufzählung", description: "Liste mit Punkten", icon: "•",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleBulletList().run() },
  { label: "Nummerierte Liste", description: "Liste mit Zahlen", icon: "1.",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleOrderedList().run() },
  { label: "Aufgabenliste", description: "Liste mit Checkboxen", icon: "☐",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleTaskList().run() },
  { label: "Zitat", description: "Blockquote / Einrückung", icon: "❝",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleBlockquote().run() },
  { label: "Code-Block", description: "Mehrzeiliger Code", icon: "</>",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleCodeBlock().run() },
  { label: "Tabelle", description: "3×3 Tabelle einfügen", icon: "⊞",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { label: "Trennlinie", description: "Horizontale Linie", icon: "—",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).setHorizontalRule().run() },
];

function SlashMenu({ items, selectedIdx, position, onSelect }: {
  items: SlashItem[]; selectedIdx: number; position: { top: number; left: number } | null; onSelect: (item: SlashItem) => void;
}) {
  if (!position || items.length === 0) return null;
  return (
    <div
      className="fixed z-50 bg-[#161616] border border-[#2A2A2A] rounded-xl shadow-2xl p-1.5 min-w-[220px] max-h-72 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      <div className="text-[9px] text-[#444444] uppercase tracking-wider px-3 pb-1 pt-0.5">Block einfügen</div>
      {items.map((item, i) => (
        <button
          key={item.label}
          onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
            i === selectedIdx ? "bg-[#222222] text-[#EDEDED]" : "text-[#AAAAAA] hover:bg-[#1E1E1E] hover:text-[#EDEDED]"
          }`}
        >
          <span className="w-7 h-7 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs font-bold text-[#777777] shrink-0">
            {item.icon}
          </span>
          <div>
            <div className="text-sm font-medium leading-none">{item.label}</div>
            <div className="text-[10px] text-[#555555] mt-0.5">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Context menu (right-click) ─────────────────────────────────────────────────
interface ContextMenuState { x: number; y: number; visible: boolean }

function ContextMenu({ editor, menu, onClose, onInsertImage }: {
  editor: Editor; menu: ContextMenuState; onClose: () => void; onInsertImage: () => void;
}) {
  if (!menu.visible) return null;

  function item(label: string, action: () => void, active?: boolean) {
    return (
      <button
        key={label}
        onMouseDown={(e) => { e.preventDefault(); action(); onClose(); }}
        className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
          active ? "text-[#E8FF6B] bg-[#1A1E0A]" : "text-[#CCCCCC] hover:bg-[#222222] hover:text-[#EDEDED]"
        }`}
      >
        {label}
      </button>
    );
  }

  function sep() { return <div className="my-1 border-t border-[#222222]" />; }

  const inTable = editor.isActive("table");

  return (
    <div
      className="fixed z-50 bg-[#161616] border border-[#2A2A2A] rounded-xl shadow-2xl p-1.5 min-w-[190px]"
      style={{ top: menu.y, left: menu.x }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="text-[9px] text-[#444444] uppercase tracking-wider px-3 pb-1 pt-0.5">Text formatieren</div>
      {item("Fett", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {item("Kursiv", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {item("Unterstrichen", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
      {item("Durchgestrichen", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
      {item("Markieren (gelb)", () => editor.chain().focus().toggleHighlight({ color: "#E8FF6B" }).run(), editor.isActive("highlight"))}
      {sep()}
      <div className="text-[9px] text-[#444444] uppercase tracking-wider px-3 pb-1">Einfügen</div>
      {item("Bild hochladen", onInsertImage)}
      {item("Tabelle 3×3", () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
      {item("Trennlinie", () => editor.chain().focus().setHorizontalRule().run())}
      {inTable && (
        <>
          {sep()}
          <div className="text-[9px] text-[#444444] uppercase tracking-wider px-3 pb-1">Tabelle</div>
          {item("Spalte hinzufügen", () => editor.chain().focus().addColumnAfter().run())}
          {item("Zeile hinzufügen", () => editor.chain().focus().addRowAfter().run())}
          {item("Spalte löschen", () => editor.chain().focus().deleteColumn().run())}
          {item("Zeile löschen", () => editor.chain().focus().deleteRow().run())}
          {item("Tabelle löschen", () => editor.chain().focus().deleteTable().run())}
        </>
      )}
      {sep()}
      {item("Rückgängig", () => editor.chain().focus().undo().run())}
      {item("Wiederholen", () => editor.chain().focus().redo().run())}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

  const [bubble, setBubble] = useState<BubbleState>({ top: 0, left: 0, visible: false });
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashIdx, setSlashIdx] = useState(0);
  const [slashPos, setSlashPos] = useState<{ top: number; left: number } | null>(null);
  const [slashSearch, setSlashSearch] = useState("");
  const [slashFrom, setSlashFrom] = useState(0);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        placeholder: placeholder ?? "Schreib hier… oder tippe / für Befehle",
        emptyEditorClass: "is-editor-empty",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content || "",
    editorProps: {
      attributes: { class: "tiptap-editor focus:outline-none min-h-[60vh] leading-relaxed" },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());

      // Slash menu detection
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 30), from);
      const slashMatch = textBefore.match(/\/(\w*)$/);
      if (slashMatch) {
        setSlashSearch(slashMatch[1].toLowerCase());
        setSlashIdx(0);
        setSlashFrom(from);
        const coords = editor.view.coordsAtPos(from);
        setSlashPos({ top: coords.bottom + 8, left: coords.left });
        setSlashOpen(true);
      } else {
        setSlashOpen(false);
      }
    },
    onSelectionUpdate({ editor }) {
      const { from, to } = editor.state.selection;
      if (from === to) {
        // No selection — hide bubble
        setBubble((b) => ({ ...b, visible: false }));
        return;
      }
      // Show bubble above selection
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const midX = (start.left + end.left) / 2;
      setBubble({ top: start.top - 60, left: midX, visible: true });
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!isInitialized.current && content) {
      editor.commands.setContent(content);
      isInitialized.current = true;
    }
  }, [editor, content]);

  // Slash menu keyboard nav
  const filteredSlash = SLASH_ITEMS.filter((i) =>
    i.label.toLowerCase().includes(slashSearch) || i.description.toLowerCase().includes(slashSearch)
  );

  useEffect(() => {
    if (!slashOpen || !editor) return;
    function onKey(e: KeyboardEvent) {
      const items = filteredSlash;
      if (e.key === "ArrowDown") { e.preventDefault(); setSlashIdx((i) => (i + 1) % items.length); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSlashIdx((i) => (i - 1 + items.length) % items.length); }
      if (e.key === "Enter" && items[slashIdx]) {
        e.preventDefault();
        items[slashIdx].action(editor!, slashFrom);
        setSlashOpen(false);
      }
      if (e.key === "Escape") setSlashOpen(false);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  // Close menus on outside click
  useEffect(() => {
    function close(e: MouseEvent) {
      setContextMenu((m) => ({ ...m, visible: false }));
      if (slashOpen) setSlashOpen(false);
    }
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [slashOpen]);

  // Hide bubble when clicking outside
  useEffect(() => {
    function hide() { setBubble((b) => ({ ...b, visible: false })); }
    document.addEventListener("mousedown", hide);
    return () => document.removeEventListener("mousedown", hide);
  }, []);

  const insertImage = useCallback(() => { fileInputRef.current?.click(); }, []);

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (ev) => { editor.chain().focus().setImage({ src: ev.target?.result as string }).run(); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 210);
    const y = Math.min(e.clientY, window.innerHeight - 340);
    setContextMenu({ x, y, visible: true });
  }

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      {/* Floating bubble toolbar */}
      <FloatingToolbar editor={editor} bubble={bubble} />

      {/* Slash command menu */}
      <SlashMenu
        items={filteredSlash}
        selectedIdx={slashIdx}
        position={slashOpen ? slashPos : null}
        onSelect={(item) => { item.action(editor, slashFrom); setSlashOpen(false); }}
      />

      {/* Right-click context menu */}
      <ContextMenu
        editor={editor}
        menu={contextMenu}
        onClose={() => setContextMenu((m) => ({ ...m, visible: false }))}
        onInsertImage={insertImage}
      />

      {/* Hidden image file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      {/* Keyboard shortcuts hint */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5 text-[10px] text-[#3A3A3A]">
        <span><kbd className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-1 font-mono text-[9px]">/</kbd> Befehle</span>
        <span>Rechtsklick → Menü</span>
        <span>Text markieren → Toolbar</span>
        <span><kbd className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-1 font-mono text-[9px]">Strg+B</kbd> Fett</span>
        <span><kbd className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-1 font-mono text-[9px]">Strg+I</kbd> Kursiv</span>
        <span><kbd className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-1 font-mono text-[9px]">Strg+Z</kbd> Rückgängig</span>
      </div>

      {/* Editor */}
      <div onContextMenu={handleContextMenu} onMouseDown={(e) => e.stopPropagation()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
