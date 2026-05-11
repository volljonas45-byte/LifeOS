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
import { FontFamily } from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Extension } from "@tiptap/core";
import { useEffect, useRef, useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";

// ── Custom FontSize inline mark ────────────────────────────────────────────────
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize?.replace("px", "") || null,
          renderHTML: (attrs) => {
            if (!attrs.fontSize) return {};
            return { style: `font-size: ${attrs.fontSize}px` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const FONT_OPTIONS = [
  { label: "Standard (Inter)",     value: "Inter, sans-serif" },
  { label: "Serif (Playfair)",     value: "var(--font-playfair), serif" },
  { label: "Lesbar (Lora)",        value: "var(--font-lora), serif" },
  { label: "Rund (Nunito)",        value: "var(--font-nunito), sans-serif" },
  { label: "Mono (Code)",          value: "var(--font-source-code), monospace" },
];

const SIZE_OPTIONS = [
  { label: "Klein",    value: "12" },
  { label: "Normal",   value: "16" },
  { label: "Groß",     value: "20" },
  { label: "Sehr groß",value: "28" },
  { label: "Riesig",   value: "36" },
];

// ── Color palettes ─────────────────────────────────────────────────────────────
const TEXT_COLORS = [
  { label: "Standard",   value: null,      swatch: "#DDDDDD" },
  { label: "Weiß",       value: "#FFFFFF",  swatch: "#FFFFFF" },
  { label: "Grau",       value: "#888888",  swatch: "#888888" },
  { label: "Rot",        value: "#F87171",  swatch: "#F87171" },
  { label: "Orange",     value: "#FB923C",  swatch: "#FB923C" },
  { label: "Gelb",       value: "#FCD34D",  swatch: "#FCD34D" },
  { label: "Grün",       value: "#4ADE80",  swatch: "#4ADE80" },
  { label: "Türkis",     value: "#2DD4BF",  swatch: "#2DD4BF" },
  { label: "Blau",       value: "#60A5FA",  swatch: "#60A5FA" },
  { label: "Violett",    value: "#A78BFA",  swatch: "#A78BFA" },
  { label: "Pink",       value: "#F472B6",  swatch: "#F472B6" },
  { label: "Gelb-Grün",  value: "#E8FF6B",  swatch: "#E8FF6B" },
];

const HIGHLIGHT_COLORS = [
  { label: "Kein",       value: null,      swatch: "transparent", border: "#444" },
  { label: "Gelb",       value: "#FEF08A",  swatch: "#FEF08A" },
  { label: "Grün",       value: "#BBF7D0",  swatch: "#BBF7D0" },
  { label: "Blau",       value: "#BFDBFE",  swatch: "#BFDBFE" },
  { label: "Pink",       value: "#FBCFE8",  swatch: "#FBCFE8" },
  { label: "Orange",     value: "#FED7AA",  swatch: "#FED7AA" },
  { label: "Lila",       value: "#DDD6FE",  swatch: "#DDD6FE" },
  { label: "Rot",        value: "#FECACA",  swatch: "#FECACA" },
  { label: "Neon-Grün",  value: "#E8FF6B",  swatch: "#E8FF6B" },
  { label: "Dunkel",     value: "#1E293B",  swatch: "#1E293B", border: "#334155" },
];

// ── Reusable color grid dropdown ───────────────────────────────────────────────
function ColorPicker({ colors, onSelect, label, currentColor }: {
  colors: { label: string; value: string | null; swatch: string; border?: string }[];
  onSelect: (val: string | null) => void;
  label: string;
  currentColor?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const active = colors.find((c) => c.value && c.value.toLowerCase() === (currentColor ?? "").toLowerCase());

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#2A2A2A] whitespace-nowrap"
        title={label}
      >
        {/* Color preview dot */}
        <span
          className="w-3 h-3 rounded-full border border-[#444]"
          style={{ background: active?.swatch ?? (label === "Farbe" ? "#DDDDDD" : "transparent") }}
        />
        {label} ▾
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-[#161616] border border-[#2A2A2A] rounded-xl shadow-2xl p-2 z-50 w-[168px]">
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {colors.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                onMouseDown={(e) => { e.preventDefault(); onSelect(c.value); setOpen(false); }}
                className="w-7 h-7 rounded-lg transition-transform hover:scale-110 border"
                style={{
                  background: c.swatch,
                  borderColor: c.border ?? (c.value ? "transparent" : "#444"),
                  outline: active?.value === c.value ? "2px solid #E8FF6B" : "none",
                  outlineOffset: "1px",
                }}
              />
            ))}
          </div>
          <div className="border-t border-[#222] pt-1.5">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(null); setOpen(false); }}
              className="w-full text-left px-2 py-1 text-[10px] text-[#555555] hover:text-[#AAAAAA] rounded"
            >
              Zurücksetzen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Floating bubble toolbar ────────────────────────────────────────────────────
interface BubbleState { top: number; left: number; visible: boolean }

function FloatingToolbar({ editor, bubble, toolbarRef }: { editor: Editor; bubble: BubbleState; toolbarRef: React.RefObject<HTMLDivElement | null> }) {
  const [showFonts, setShowFonts] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  if (!bubble.visible) return null;

  // Get current colors from editor marks
  const currentTextColor = editor.getAttributes("textStyle").color ?? null;
  const currentHighlight = editor.getAttributes("highlight").color ?? null;

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

  function sep() { return <div key={Math.random()} className="w-px h-4 bg-[#2A2A2A] shrink-0" />; }

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 bg-[#161616] border border-[#2A2A2A] rounded-xl px-1.5 py-1.5 shadow-2xl"
      style={{ top: bubble.top, left: bubble.left, transform: "translateX(-50%)" }}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {/* Font family picker */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setShowFonts((v) => !v); setShowSizes(false); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#2A2A2A] whitespace-nowrap"
        >
          Schriftart ▾
        </button>
        {showFonts && (
          <div className="absolute top-full mt-1 left-0 bg-[#161616] border border-[#2A2A2A] rounded-xl shadow-2xl p-1 min-w-[180px] z-50">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setFontFamily(f.value).run(); setShowFonts(false); }}
                style={{ fontFamily: f.value }}
                className="w-full text-left px-3 py-1.5 text-sm text-[#CCCCCC] hover:bg-[#222222] hover:text-[#EDEDED] rounded-lg"
              >
                {f.label}
              </button>
            ))}
            <div className="border-t border-[#222222] my-1" />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetFontFamily().run(); setShowFonts(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-[#666666] hover:bg-[#222222] hover:text-[#AAAAAA] rounded-lg">
              Zurücksetzen
            </button>
          </div>
        )}
      </div>

      {/* Font size picker */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setShowSizes((v) => !v); setShowFonts(false); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#2A2A2A] whitespace-nowrap"
        >
          Größe ▾
        </button>
        {showSizes && (
          <div className="absolute top-full mt-1 left-0 bg-[#161616] border border-[#2A2A2A] rounded-xl shadow-2xl p-1 min-w-[140px] z-50">
            {SIZE_OPTIONS.map((s) => (
              <button key={s.value} type="button"
                onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).setFontSize(s.value).run(); setShowSizes(false); }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-[#CCCCCC] hover:bg-[#222222] hover:text-[#EDEDED]"
                style={{ fontSize: `${s.value}px` }}>
                {s.label}
              </button>
            ))}
            <div className="border-t border-[#222222] my-1" />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).unsetFontSize().run(); setShowSizes(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-[#666666] hover:bg-[#222222] hover:text-[#AAAAAA] rounded-lg">
              Zurücksetzen
            </button>
          </div>
        )}
      </div>

      {sep()}

      {/* Text color */}
      <ColorPicker
        label="Farbe"
        colors={TEXT_COLORS}
        currentColor={currentTextColor}
        onSelect={(val) => {
          if (val) editor.chain().focus().setColor(val).run();
          else editor.chain().focus().unsetColor().run();
        }}
      />

      {/* Highlight color */}
      <ColorPicker
        label="Marker"
        colors={HIGHLIGHT_COLORS}
        currentColor={currentHighlight}
        onSelect={(val) => {
          if (val) editor.chain().focus().setHighlight({ color: val }).run();
          else editor.chain().focus().unsetHighlight().run();
        }}
      />

      {sep()}

      {/* Text formatting */}
      {btn("Fett", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), <strong>Fett</strong>)}
      {btn("Kursiv", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), <em>Kursiv</em>)}
      {btn("Unterstrichen", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"), <span className="underline">Unter</span>)}
      {btn("Durchgestrichen", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"), <span className="line-through">Durch</span>)}
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
  { label: "Überschrift 1", description: "Großer Titel für den Abschnitt", icon: "H1",
    action: (e, f) => e.chain().focus().deleteRange({ from: f - 1, to: f }).toggleHeading({ level: 1 }).run() },
  { label: "Überschrift 2", description: "Mittlere Zwischenüberschrift", icon: "H2",
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
      className="fixed z-50 bg-[#161616] border border-[#2A2A2A] rounded-xl shadow-2xl p-1.5 min-w-[240px] max-h-72 overflow-y-auto"
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
  function sep() { return <div key={Math.random()} className="my-1 border-t border-[#222222]" />; }

  const inTable = editor.isActive("table");

  return (
    <div
      className="fixed z-50 bg-[#161616] border border-[#2A2A2A] rounded-xl shadow-2xl p-1.5 min-w-[200px]"
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
  const toolbarRef = useRef<HTMLDivElement | null>(null);

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
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        placeholder: placeholder ?? "Schreib hier… oder tippe / für Blöcke",
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

      // Slash menu
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
        // Don't immediately hide — the toolbar mousedown may have collapsed
        // the selection momentarily before re-applying it.
        // We rely on the outside-click listener instead.
        return;
      }
      const startCoords = editor.view.coordsAtPos(from);
      const endCoords = editor.view.coordsAtPos(to);
      const midX = (startCoords.left + endCoords.left) / 2;
      setBubble({ top: startCoords.top - 60, left: midX, visible: true });
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!isInitialized.current && content) {
      editor.commands.setContent(content);
      isInitialized.current = true;
    }
  }, [editor, content]);

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

  useEffect(() => {
    function close() { setContextMenu((m) => ({ ...m, visible: false })); setSlashOpen(false); }
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    function hideOnClickOutside(e: MouseEvent) {
      // Don't hide when clicking inside the toolbar itself
      if (toolbarRef.current?.contains(e.target as Node)) return;
      // Hide after pointer up so we can check if selection still exists
      requestAnimationFrame(() => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        if (from === to) setBubble((b) => ({ ...b, visible: false }));
      });
    }
    document.addEventListener("mouseup", hideOnClickOutside);
    return () => document.removeEventListener("mouseup", hideOnClickOutside);
  }, [editor]);

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
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 360);
    setContextMenu({ x, y, visible: true });
  }

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      <FloatingToolbar editor={editor} bubble={bubble} toolbarRef={toolbarRef} />
      <SlashMenu
        items={filteredSlash}
        selectedIdx={slashIdx}
        position={slashOpen ? slashPos : null}
        onSelect={(item) => { item.action(editor, slashFrom); setSlashOpen(false); }}
      />
      <ContextMenu
        editor={editor}
        menu={contextMenu}
        onClose={() => setContextMenu((m) => ({ ...m, visible: false }))}
        onInsertImage={insertImage}
      />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      {/* Hints */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5 text-[10px] text-[#3A3A3A]">
        <span><kbd className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-1 font-mono text-[9px]">/</kbd> Blöcke</span>
        <span>Text markieren → Schriftart & Größe</span>
        <span>Rechtsklick → Menü</span>
        <span><kbd className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-1 font-mono text-[9px]">Strg+B/I/Z</kbd></span>
      </div>

      <div onContextMenu={handleContextMenu} onMouseDown={(e) => e.stopPropagation()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
