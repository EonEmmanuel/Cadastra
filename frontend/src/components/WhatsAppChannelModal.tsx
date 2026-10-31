"use client";

import React, { useState } from "react";
import {
  X,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Send,
  Smartphone,
  ShieldCheck,
  Terminal,
} from "lucide-react";

interface WhatsAppChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
}

export default function WhatsAppChannelModal({
  isOpen,
  onClose,
  apiBaseUrl,
}: WhatsAppChannelModalProps) {
  const [copiedSample, setCopiedSample] = useState(false);
  const [customMsg, setCustomMsg] = useState(
    "Vérifier coordonnées géodésiques: B1: 583420, 446100 B2: 583455, 446100 B3: 583455, 446072 B4: 583420, 446072 surface: 980 m2"
  );
  const [webhookLog, setWebhookLog] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const samplePrompt = "PLAN-OFFICIEL Localité: Douala B1: 583420, 446100 B2: 583455, 446100 B3: 583455, 446072 B4: 583420, 446072 surface: 980 m2";

  const handleCopySample = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleTestWebhookDirectly = async () => {
    setIsSending(true);
    setWebhookLog("Envoi de la requête au webhook WhatsApp...");
    try {
      const res = await fetch(`${apiBaseUrl}/api/webhook/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry: [
            {
              id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "+237690000000",
                      phone_number_id: "104829104820194",
                    },
                    messages: [
                      {
                        from: "237699112233",
                        id: `wamid.${Date.now()}`,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        type: "text",
                        text: { body: customMsg },
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWebhookLog(JSON.stringify(data, null, 2));
      } else {
        setWebhookLog(`Erreur HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (e: any) {
      setWebhookLog(`Erreur de connexion: ${e.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
      {/* Outer Shell */}
      <div className="w-full max-w-2xl p-2 rounded-3xl bg-white/[0.02] ring-1 ring-white/[0.08] shadow-2xl">
        {/* Inner Surface */}
        <div className="rounded-2xl bg-[#090A0E] p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#25D366]/15 ring-1 ring-[#25D366]/30 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-white tracking-tight">
                  Canal WhatsApp Terrain (Meta Cloud API)
                </h3>
                <p className="text-xs text-zinc-400">
                  Protocole de vérification cadastrale directe sur smartphone
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Workflow Tonal Cards (Zero Lines) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] space-y-1">
              <span className="font-mono text-[10px] text-[#00DF8F] font-bold block tracking-wider">
                01. LEVÉ TERRAIN
              </span>
              <p className="text-white font-medium">Capture des Bornes</p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Le géomètre envoie les coordonnées du plan par WhatsApp.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] space-y-1">
              <span className="font-mono text-[10px] text-[#00DF8F] font-bold block tracking-wider">
                02. MOTEUR GEODÉSIQUE
              </span>
              <p className="text-white font-medium">Contrôle Autonome</p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Calcul instantané Gauss-Shoelace et détection des superficies fictives.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] space-y-1">
              <span className="font-mono text-[10px] text-[#00DF8F] font-bold block tracking-wider">
                03. CERTIFICAT MINDCAF
              </span>
              <p className="text-white font-medium">Rapport PDF SHA-256</p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Réponse instantanée avec lien de téléchargement officiel.
              </p>
            </div>
          </div>

          {/* Action to open in WhatsApp */}
          <div className="p-4 rounded-2xl bg-[#25D366]/[0.08] ring-1 ring-[#25D366]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-black flex items-center justify-center shrink-0 shadow-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">
                  Tester directement sur votre smartphone WhatsApp
                </h4>
                <p className="text-[11px] text-zinc-300">
                  Envoyez un message texte avec les coordonnées pour déclencher le webhook.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(customMsg)}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold text-xs transition flex items-center gap-1.5 shrink-0 shadow-xl"
            >
              <span>Ouvrir WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Webhook Live Payload Tester */}
          <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#00DF8F]" />
                <span className="font-semibold text-zinc-200">
                  Simulateur de Charge Utile Webhook (Meta Cloud API)
                </span>
              </div>
              <button
                onClick={handleCopySample}
                className="text-[11px] text-zinc-400 hover:text-white transition flex items-center gap-1"
              >
                {copiedSample ? (
                  <>
                    <Check className="w-3 h-3 text-[#00DF8F]" />
                    <span className="text-[#00DF8F]">Exemple copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copier exemple</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                rows={2}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] rounded-xl p-3 text-xs font-mono text-zinc-200 outline-none focus:ring-[#00DF8F]/50 transition resize-none"
              />

              <button
                onClick={handleTestWebhookDirectly}
                disabled={isSending}
                className="w-full py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-200 hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#00DF8F]" />
                <span>Exécuter la requête Webhook `/api/webhook/whatsapp`</span>
              </button>
            </div>

            {/* Response Console */}
            {webhookLog && (
              <div className="rounded-xl bg-[#050608] ring-1 ring-white/[0.06] p-3 text-[11px] font-mono text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {webhookLog}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
