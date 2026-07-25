"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const languages = [
  { code: "ko", flag: "🇰🇷", label: "한국어", available: true },
  { code: "en", flag: "🇺🇸", label: "ENGLISH · 준비 중", available: false },
] as const;

export function LanguageSwitch() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const selectedLanguage = languages.find((item) => item.code === language) ?? languages[0];

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="언어 선택"
        className="flex h-8 items-center gap-1 rounded-md border border-white/10 px-2 text-[9px] text-zinc-400 transition hover:bg-white/5 hover:text-white sm:text-[10px]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="text-xs">{selectedLanguage.flag}</span>
        <span>{selectedLanguage.label}</span>
        <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <>
          <button aria-label="언어 메뉴 닫기" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} type="button" />
          <div aria-label="언어 선택 메뉴" className="absolute right-0 top-10 z-50 w-32 rounded-md border border-white/10 bg-[#101217] p-1.5 shadow-2xl" role="menu">
            {languages.map((item) => {
              const isSelected = item.code === language;

              return (
                <button
                  aria-checked={isSelected}
                  aria-disabled={!item.available}
                  className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[10px] transition ${isSelected ? "bg-white/8 text-white" : item.available ? "text-zinc-400 hover:bg-white/5 hover:text-white" : "cursor-not-allowed text-zinc-700"}`}
                  disabled={!item.available}
                  key={item.code}
                  onClick={() => {
                    setLanguage(item.code);
                    setOpen(false);
                  }}
                  role="menuitemradio"
                  type="button"
                >
                  <span aria-hidden="true" className="text-sm">{item.flag}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
