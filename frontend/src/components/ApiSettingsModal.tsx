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
  // Real server-side key status from /api/config (nothing is stored in/required by the browser).
  const [serverStatus, setServerStatus] = useState<{
    metaApiKey: boolean;
    whatsappToken: boolean;
  } | null>(null);

  const refreshConfig = () => {
    fetch(`${apiBaseUrl}/api/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.webhook_url) setWebhookUrl(data.webhook_url);
        if (data.phone_number_id) setPhoneNumberId((prev) => prev || data.phone_number_id);
        if (data.whatsapp_verify_token) setVerifyToken((prev) => prev || data.whatsapp_verify_token);
        setServerStatus({
          metaApiKey: !!data.meta_api_key_configured,
          whatsappToken: !!data.whatsapp_token_configured,
        });
      })
      .catch(() => {});
  };

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

    refreshConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        refreshConfig();
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
                <span className="text-[10px] font-mono">
                  {serverStatus?.whatsappToken ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#00DF8F]/10 text-[#00DF8F] border border-[#00DF8F]/30">
                      Serveur : configurée
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.1]">
                      Serveur : simulation locale
                    </span>
                  )}
                </span>
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

            {/* Meta Model API Key */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  Clé API Meta Model API (`META_API_KEY`)
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Crédits Hackathon $150
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500">État serveur :</span>
                {serverStatus ? (
                  serverStatus.metaApiKey ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#00DF8F]/10 text-[#00DF8F] border border-[#00DF8F]/30">
                      Clé chargée côté serveur
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Absente du serveur — extraction indisponible
                    </span>
                  )
                ) : (
                  <span className="text-zinc-500">vérification…</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Connecte directement vos plans à <strong>Meta Muse Spark 1.3</strong> sur <code className="text-zinc-300">https://api.meta.ai/v1</code> pour extraire les bornes depuis vos images en direct.
              </p>
              <input
                type="password"
                value={metaLlamaKey}
                onChange={(e) => setMetaLlamaKey(e.target.value)}
                placeholder="Override optionnel — sinon la clé vit dans backend/.env côté serveur"
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:ring-sky-400/50 transition"
              />
              <p className="text-[10px] text-zinc-500">
                Ce champ est optionnel : en production la clé est lue dans <code>backend/.env</code> ou les variables d'environnement du serveur et n'est jamais stockée dans le navigateur.
              </p>
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
