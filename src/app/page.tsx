"use client";

import { useMemo, useRef, useState } from "react";
import NextImage from "next/image";

type BgOption = {
  id: string;
  name: string;
  gradient: string;
};

const BG_OPTIONS: BgOption[] = [
  {
    id: "best-red",
    name: "BEST Red",
    gradient: "linear-gradient(135deg, #e2231a, #ff5a3d)",
  },
  {
    id: "sunset",
    name: "Mumbai Sunset",
    gradient: "linear-gradient(160deg, #e2231a 0%, #ffd600 50%, #3fa9f5 100%)",
  },
];

type GradientStops = string[];

export default function Home() {
  const [selectedBg, setSelectedBg] = useState<BgOption>(BG_OPTIONS[0]);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const overlayBadge = useMemo(
    () => (
      <div className="overlay-chip">
        <span role="img" aria-label="bus">
          🚌
        </span>
        ETHMumbai Style
      </div>
    ),
    []
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setResultUrl(null);
    setStatus("Uploading and styling with Gemini…");
    setIsLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
          prompt:
            "Restyle this portrait into an ETHMumbai-branded avatar with BEST Red (#e2231a), Bus Black (#1c1c1c), ETH Blue (#3fa9f5), Bus Yellow (#ffd600), Bus Green (#00a859). Add subtle BEST bus or Mumbai skyline cues, keep likeness, bright friendly finish, crisp edges.",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gemini error");
      }

      const out = `data:${data.mimeType};base64,${data.imageBase64}`;
      setResultUrl(out);
      setStatus("Avatar styled. Ready to download.");
    } catch (err: any) {
      console.log("Error styling image:", err);
      console.error(err);
      setStatus("Could not style image. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const gradientStopsFor = (bg: BgOption): GradientStops => {
    switch (bg.id) {
      case "best-red":
        return ["#e2231a", "#ff5a3d"];
      case "bus-black":
        return ["#1c1c1c", "#2f2f2f"];
      case "eth-blue":
        return ["#3fa9f5", "#2c8bd8"];
      case "sunset":
        return ["#e2231a", "#ffd600", "#3fa9f5"];
      default:
        return ["#e2231a", "#ff5a3d"];
    }
  };

  const handleDownload = async () => {
    if (!resultUrl && !sourceUrl) {
      alert("Upload and style a photo first.");
      return;
    }

    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      const url = (resultUrl || sourceUrl) as string;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = reject;
        img.src = url;
      });

      const size = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Background gradient
      const stops = gradientStopsFor(selectedBg);
      const grad = ctx.createLinearGradient(0, 0, size, size);
      stops.forEach((stop, i) => {
        const t = stops.length === 1 ? 0 : i / (stops.length - 1);
        grad.addColorStop(t, stop);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Draw image, cover style
      const scale = Math.max(size / img.width, size / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (size - drawW) / 2;
      const dy = (size - drawH) / 2;
      ctx.save();
      ctx.beginPath();
      const radius = 40;
      roundRect(ctx, 0, 0, size, size, radius);
      ctx.clip();
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();

      // Overlay badge
      const badgeX = 28;
      const badgeY = size - 88;
      const badgeW = 240;
      const badgeH = 54;
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "#000";
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#fff";
      ctx.font = "600 22px 'Inter', sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText("🚌 ETHMumbai Style", badgeX + 16, badgeY + badgeH / 2 + 1);

      // White border stroke
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      roundRect(ctx, 12, 12, size - 24, size - 24, 32);
      ctx.stroke();

      const link = document.createElement("a");
      link.download = "ethmumbai-avatar.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Could not generate download. Try another image or refresh.");
    }
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 hero-grid" aria-hidden />
        <main className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-16 sm:px-10 lg:px-16">
          <header className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 max-w-2xl fade-up" style={{ animationDelay: "0.05s" }}>
              <h1
                className="text-4xl sm:text-5xl font-black leading-[1.05]"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Glow up your photo into an ETHMumbai avatar.
              </h1>
              <p className="text-lg text-zinc-200/90 max-w-2xl">
                Upload. Hit style. Get an on-brand, Mumbai-dripped avatar — Gemini handles the art. Keep your vibe,
                add the BEST bus energy.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="cta-button glow" onClick={handleUploadClick} disabled={isLoading}>
                  {isLoading ? "Styling…" : "Upload & Style"}
                </button>
                <button className="cta-button secondary" onClick={handleDownload} disabled={!resultUrl && !sourceUrl}>
                  Download
                </button>
              </div>
              {status && <p className="text-sm text-zinc-400">{status}</p>}
              {isLoading && <div className="loading-bar" />}
              <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
                <span className="pill">BEST Red #e2231a</span>
                <span className="pill">Bus Black #1c1c1c</span>
                <span className="pill">ETH Blue #3fa9f5</span>
              </div>
            </div>

            <div className="card w-full max-w-md p-4 pattern relative overflow-hidden fade-up" style={{ animationDelay: "0.15s" }}>
              <div
                className="avatar-frame h-80 flex items-center justify-center"
                style={{ background: selectedBg.gradient }}
              >
                {resultUrl ? (
                  <NextImage src={resultUrl} alt="Styled avatar" fill className="object-cover" />
                ) : sourceUrl ? (
                  <NextImage src={sourceUrl} alt="Source" fill className="object-cover" />
                ) : (
                  <div className="text-white/85 text-center px-6">
                    <p className="text-lg font-semibold">Upload to style</p>
                    <p className="text-sm opacity-90">Gemini will apply the ETHMumbai look automatically.</p>
                  </div>
                )}
                {overlayBadge}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {BG_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    className={`bg-option ${selectedBg.id === bg.id ? "selected" : ""}`}
                    style={{ background: bg.gradient }}
                    onClick={() => setSelectedBg(bg)}
                    aria-label={`Select background ${bg.name}`}
                  />
                ))}
              </div>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="card p-6 flex flex-col gap-5">
              <div className="upload-drop" onClick={handleUploadClick}>
                <p className="font-semibold">Drop a photo or click to upload</p>
                <p className="text-sm text-zinc-600">We don’t store it. Gemini styles it on the fly.</p>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm text-zinc-700">Step 1</p>
                  <p className="font-semibold">Upload your selfie or portrait.</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm text-zinc-700">Step 2</p>
                  <p className="font-semibold">Gemini restyles with ETHMumbai palette.</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm text-zinc-700">Step 3</p>
                  <p className="font-semibold">Download and share with #ETHMumbai.</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm text-zinc-700">Tips</p>
                  <p className="font-semibold">Use clear, well-lit portraits for best results.</p>
                </div>
              </div>
            </div>

            <div className="card p-6 flex flex-col gap-4 fade-up" style={{ animationDelay: "0.35s" }}>
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>
                ETHMumbai look
              </h2>
              <ul className="text-sm text-zinc-300 leading-6">
                <li>Palette: BEST Red #e2231a, Bus Black #1c1c1c, ETH Blue #3fa9f5, Bus Yellow #ffd600.</li>
                <li>Motifs: BEST bus cues, skyline silhouettes, rounded friendly forms.</li>
                <li>Keep likeness: faces should stay recognizable.</li>
              </ul>
              <div className="flex flex-wrap gap-2">
                {BG_OPTIONS.map((bg) => (
                  <span
                    key={bg.id}
                    className="pill"
                    style={{ background: "#111", color: "#fff", border: "1px solid #222" }}
                  >
                    {bg.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
