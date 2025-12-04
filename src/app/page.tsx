"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

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
    id: "bus-black",
    name: "Bus Black",
    gradient: "linear-gradient(135deg, #1c1c1c, #2f2f2f)",
  },
  {
    id: "eth-blue",
    name: "ETH Blue",
    gradient: "linear-gradient(135deg, #3fa9f5, #2c8bd8)",
  },
  {
    id: "sunset",
    name: "Mumbai Sunset",
    gradient: "linear-gradient(160deg, #e2231a 0%, #ffd600 50%, #3fa9f5 100%)",
  },
];

export default function Home() {
  const [selectedBg, setSelectedBg] = useState<BgOption>(BG_OPTIONS[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 hero-grid" aria-hidden />
        <main className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-16 sm:px-10 lg:px-16">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="badge w-fit">
                Challenge 1 • ETHMumbai
                <span className="pill" style={{ background: "var(--bus-black)", color: "#fff" }}>
                  Deadline: Dec 7, 2025
                </span>
              </div>
              <h1
                className="text-4xl sm:text-5xl font-black leading-[1.05]"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Build an ETHMumbai avatar from any photo.
              </h1>
              <p className="text-lg text-zinc-700 max-w-2xl">
                Make it fun. Make it you. Make it Mumbai. Upload a photo, pick a backdrop, add the bus flair, and
                export a social-ready avatar. Win: BEST Hack Pass + $100 USDC.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="cta-button" onClick={handleUploadClick}>
                  Upload a photo
                </button>
                <a
                  className="cta-button secondary"
                  href="https://github.com/vaduvanathan/ethmumbai-avatar"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub
                </a>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
                <span className="pill">BEST Red #{"e2231a"}</span>
                <span className="pill">Bus Black #{"1c1c1c"}</span>
                <span className="pill">ETH Blue #{"3fa9f5"}</span>
                <span className="pill">Bus Yellow #{"ffd600"}</span>
              </div>
            </div>
            <div className="card w-full max-w-md p-6 pattern relative overflow-hidden">
              <div
                className="avatar-frame h-72 flex items-center justify-center"
                style={{ background: selectedBg.gradient }}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-white/85 text-center px-6">
                    <p className="text-lg font-semibold">Upload to preview</p>
                    <p className="text-sm opacity-90">We’ll wrap it in ETHMumbai colors and badges.</p>
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

          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="card p-6 flex flex-col gap-5">
              <div className="upload-drop" onClick={handleUploadClick}>
                <p className="font-semibold">Drop a photo or click to upload</p>
                <p className="text-sm text-zinc-600">We don’t store it. It stays in your browser.</p>
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
                  <p className="font-semibold">Choose a Mumbai-flavored backdrop.</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm text-zinc-700">Step 3</p>
                  <p className="font-semibold">Export and post with #ETHMumbai.</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm text-zinc-700">Bonus</p>
                  <p className="font-semibold">Best entry wins a Hack Pass + $100 USDC.</p>
                </div>
              </div>
            </div>

            <div className="card p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>
                Brand ingredients
              </h2>
              <ul className="text-sm text-zinc-700 leading-6">
                <li>Headlines: M PLUS Rounded 1c • Body: Inter Tight</li>
                <li>Palette: BEST Red #e2231a, Bus Black #1c1c1c, ETH Blue #3fa9f5, Bus Yellow #ffd600, Bus Green #00a859</li>
                <li>Logo: Keep clearspace; avoid off-brand backgrounds and distortions.</li>
              </ul>
              <div className="flex flex-wrap gap-2">
                {BG_OPTIONS.map((bg) => (
                  <span
                    key={bg.id}
                    className="pill"
                    style={{ background: "#fff", border: "1px solid #e5e5e5" }}
                  >
                    {bg.name}
                  </span>
                ))}
              </div>
              <p className="footer-note">Need the illustrated monogram? Add it as an overlay before export.</p>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold">Ready to share?</p>
                <p className="text-sm text-zinc-700">Post your avatar with #ETHMumbai and link back to the challenge.</p>
              </div>
              <div className="flex gap-3">
                <button className="cta-button" onClick={handleUploadClick}>
                  Generate Avatar
                </button>
                <button className="cta-button secondary" onClick={() => alert("Download coming soon")}>Download</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
