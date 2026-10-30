"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCheck, FileText, Download, ShieldCheck, ShieldAlert } from "lucide-react";

interface WhatsAppBotSimulatorProps {
  onTriggerProfile: (filename: string) => void;
}

export default function WhatsAppBotSimulator({ onTriggerProfile }: WhatsAppBotSimulatorProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string; pdf?: boolean }>>([
    {
      sender: "bot",
      text: "👋 Bonjour ! Bienvenue sur le service de vérification cadastrale autonome *Cadastra-Cameroon* (MINDCAF).\n\nEnvoyez la photo d'un plan de bornage ou tapez le numéro du dossier pour vérifier la superficie et détecter les fraudes foncières.",
      time: "10:30",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setIsTyping(true);

    // Call backend WhatsApp webhook endpoint
    try {
      const res = await fetch("http://localhost:8000/api/webhook/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_phone: "+237699112233",
          message_text: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = {
          sender: "bot" as const,
          text: data.reply_message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          pdf: true,
        };
        setMessages((prev) => [...prev, botMsg]);

        // Also update main dashboard if matched
        if (textToSend.toLowerCase().includes("fraud") || textToSend.toLowerCase().includes("fictive")) {
          onTriggerProfile("douala_yassa_fraud_superficie.json");
        } else if (textToSend.toLowerCase().includes("odza") || textToSend.toLowerCase().includes("yaounde")) {
          onTriggerProfile("yaounde_odza_utm32n.json");
        } else {
          onTriggerProfile("douala_yassa_utm32n.json");
        }
      }
    } catch (e) {
      // Local fallback simulation
      setTimeout(() => {
        const isFraudQuery = textToSend.toLowerCase().includes("fraud");
        const botMsg = {
          sender: "bot" as const,
          text: isFraudQuery
            ? "🚨 *ALERTE : SUSPICION DE FRAUDE / SUPERFICIE FICTIVE*\n\nSuperficie déclarée : 1,500.00 m²\nSuperficie réelle mesurée : 980.00 m²\nÉcart : +53.1% de surface inexistante !\n\n⚠️ Ne signez aucun acte notarié avant contre-expertise !"
            : "✅ *PLAN CONFORME AUX NORMES MINDCAF*\n\nSuperficie calculée : 980.00 m²\nÉcart : 0.00% (Tolérance respectée)\nStatut : Approuvé pour transaction foncière.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          pdf: true,
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 600);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
      {/* WhatsApp Chat Header */}
      <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
            🇨🇲
          </div>
          <div>
            <h4 className="font-bold text-xs">Cadastra-Cameroon Verification Bot</h4>
            <p className="text-[10px] text-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              WhatsApp Cloud API Officiel
            </p>
          </div>
        </div>

        <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded text-white/80">
          +237 690 CADASTRE
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#ECE5DD]/40">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-2.5 text-xs shadow-sm whitespace-pre-line ${
                m.sender === "user"
                  ? "bg-[#DCF8C6] text-slate-900 rounded-tr-none"
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
              }`}
            >
              {m.text}
              {m.pdf && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Certificat_Audit.pdf
                  </span>
                  <span>MINDCAF Certifié</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                <span>{m.time}</span>
                {m.sender === "user" && <CheckCheck className="w-3 h-3 text-blue-500" />}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1 bg-white p-2 rounded-lg text-slate-400 text-xs w-20">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-100">●</span>
            <span className="animate-bounce delay-200">●</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Exemples :</span>
        <button
          onClick={() => handleSend("Vérifier plan Douala Yassa TF 48291")}
          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap shrink-0"
        >
          Douala Yassa Conforme
        </button>
        <button
          onClick={() => handleSend("Alerte fraude superficie fictive Douala 1500m2")}
          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-red-700 font-semibold whitespace-nowrap shrink-0"
        >
          Tester Fraude Superficie
        </button>
        <button
          onClick={() => handleSend("Vérifier plan Yaoundé Odza 5 bornes")}
          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap shrink-0"
        >
          Yaoundé Odza
        </button>
      </div>

      {/* Input Bar */}
      <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Envoyez coordonnées B1..Bn ou texte du plan..."
          className="flex-1 text-xs px-3 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          onClick={() => handleSend()}
          className="w-8 h-8 rounded-full bg-[#075E54] text-white flex items-center justify-center hover:bg-[#128C7E] transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
