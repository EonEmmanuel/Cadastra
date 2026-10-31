"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  ShieldCheck,
  Check,
  ExternalLink,
  Copy,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
}

export default function ApiSettingsModal({
  isOpen,
  onClose,
  apiBaseUrl,
}: ApiSettingsModalProps) {
  const [whatsappToken, setWhatsappToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [verifyToken, setVerifyToken] = useState("cadastra_cameroon_secret_token_2026");
  const [metaLlamaKey, setMetaLlamaKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState(`${apiBaseUrl}/api/webhook/whatsapp`);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  // Load saved config on mount
  useEffect(() => {
    if (!isOpen) return;

    // Load from localStorage first
    const savedToken = localStorage.getItem("cadastra_whatsapp_token") || "";
    const savedPhoneId = localStorage.getItem("cadastra_phone_number_id") || "";
    const savedVerifyToken = localStorage.getItem("cadastra_verify_token") || "cadastra_cameroon_secret_token_2026";
    const savedLlamaKey = localStorage.getItem("cadastra_llama_key") || "";

    if (savedToken) setWhatsappToken(savedToken);
    if (savedPhoneId) setPhoneNumberId(savedPhoneId);
    if (savedVerifyToken) setVerifyToken(savedVerifyToken);
    if (savedLlamaKey) setMetaLlamaKey(savedLlamaKey);

    // Fetch remote config status from backend
    fetch(`${apiBaseUrl}/api/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.webhook_url) setWebhookUrl(data.webhook_url);
        if (data.phone_number_id && !savedPhoneId) setPhoneNumberId(data.phone_number_id);
        if (data.whatsapp_verify_token && !savedVerifyToken) setVerifyToken(data.whatsapp_verify_token);
      })
      .catch(() => {});
  }, [isOpen, apiBaseUrl]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Save to localStorage
    localStorage.setItem("cadastra_whatsapp_token", whatsappToken);
    localStorage.setItem("cadastra_phone_number_id", phoneNumberId);
    localStorage.setItem("cadastra_verify_token", verifyToken);
    localStorage.setItem("cadastra_llama_key", metaLlamaKey);

    // Sync with backend API
    try {
      const res = await fetch(`${apiBaseUrl}/api/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_token: whatsappToken,
          phone_number_id: phoneNumberId,
          whatsapp_verify_token: verifyToken,
          meta_llama_key: metaLlamaKey,
          webhook_url: webhookUrl,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.warn("Could not sync with backend config endpoint", e);
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPing = async () => {
    setTestStatus("Testing...");
    try {
      const res = await fetch(`${apiBaseUrl}/health`);
      if (res.ok) {
        const data = await res.json();
        setTestStatus(`OK: ${data.engine} (${data.status})`);
      } else {
        setTestStatus(`Erreur HTTP: ${res.status}`);
      }
    } catch {
      setTestStatus("Erreur: Serveur FastAPI inaccessible sur " + apiBaseUrl);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      {/* Outer Shell */}
      <div className="w-full max-w-xl p-2 rounded-3xl bg-white/[0.02] ring-1 ring-white/[0.08] shadow-2xl font-sans">
        {/* Inner Surface */}
        <div className="rounded-2xl bg-[#090A0E] p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center">
                <Key className="w-4 h-4 text-[#00DF8F]" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-white tracking-tight">
                  Configuration Clés API & Webhook
                </h3>
                <p className="text-xs text-zinc-400">
                  Meta WhatsApp Cloud API & Modèles d&apos;Analyse
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

          {/* Body Fields */}
          <div className="space-y-4">
            {/* Webhook Callback URL */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-zinc-300">
                  URL de Rappel Webhook (Meta Developer Portal)
                </label>
                <span className="text-[10px] font-mono text-zinc-500">GET/POST</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 bg-white/[0.03] ring-1 ring-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:ring-[#00DF8F]/50 transition"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white transition flex items-center gap-1.5 shrink-0"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00DF8F]" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Collez cette URL dans la configuration du produit WhatsApp sur{" "}
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00DF8F] hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  Meta for Developers <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>

            {/* Webhook Verify Token */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02]">
              <label className="text-xs font-medium text-zinc-300">
                Jeton de Vérification Webhook (`hub.verify_token`)
              </label>
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder="cadastra_cameroon_secret_token_2026"
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:ring-[#00DF8F]/50 transition"
              />
            </div>

            {/* WhatsApp Permanent Access Token */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-zinc-300">
                  Jeton d&apos;Accès WhatsApp Cloud API (`WHATSAPP_TOKEN`)
                </label>
                <span className="text-[10px] font-mono text-zinc-500">Bearer Token</span>
              </div>
              <input
                type="password"
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
                placeholder="EAA..."
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:ring-[#00DF8F]/50 transition"
              />
            </div>

            {/* Phone Number ID */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02]">
              <label className="text-xs font-medium text-zinc-300">
                Identifiant Numéro WhatsApp (`PHONE_NUMBER_ID`)
              </label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="ex: 104829104820194"
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:ring-[#00DF8F]/50 transition"
              />
            </div>

            {/* Meta Llama Key */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02]">
              <label className="text-xs font-medium text-zinc-300">
                Clé API Meta Llama / Modèle de Vision (Facultatif)
              </label>
              <input
                type="password"
                value={metaLlamaKey}
                onChange={(e) => setMetaLlamaKey(e.target.value)}
                placeholder="gsk_... / Modal Key"
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:ring-[#00DF8F]/50 transition"
              />
            </div>

            {/* Test Status info */}
            {testStatus && (
              <div className="p-3 rounded-xl bg-white/[0.04] text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>{testStatus}</span>
                <button
                  onClick={handleTestPing}
                  className="text-xs text-[#00DF8F] hover:underline"
                >
                  Re-tester
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleTestPing}
              className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tester Connexion</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full hover:bg-white/[0.06] text-xs font-medium text-zinc-400 hover:text-white transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-full bg-[#00DF8F] hover:bg-[#00c77f] text-[#08090C] font-semibold text-xs transition shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Enregistré !</span>
                  </>
                ) : (
                  <span>Enregistrer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
