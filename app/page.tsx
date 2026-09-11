'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Category, OUTFITS, Season, categoriesInSeason, outfitsBySeason, sceneFor } from '@/lib/outfits';

type Status = 'idle' | 'loading' | 'error' | 'done';
type CategoryFilter = Category | 'all';

const CATEGORY_LABELS: Record<Category, string> = {
  costume: 'Costumes',
  pyjamas: 'Pyjamas',
  sweater: 'Sweaters',
  dress: 'Dresses',
  suiting: 'Suiting',
  outerwear: 'Outerwear',
  loungewear: 'Loungewear',
  accessory: 'Accessories'
};

export default function Home() {
  const [season, setSeason] = useState<Season>('halloween');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [festiveScene, setFestiveScene] = useState(true);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feature-detect after mount only — `navigator` doesn't exist during SSR.
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const seasonOutfits = useMemo(() => outfitsBySeason(season), [season]);
  const categories = useMemo(() => categoriesInSeason(season), [season]);
  const outfits = useMemo(
    () => (category === 'all' ? seasonOutfits : seasonOutfits.filter((o) => o.category === category)),
    [seasonOutfits, category]
  );
  const selectedOutfit = OUTFITS.find((o) => o.id === selectedOutfitId) || null;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Allow re-picking the same file later.
    e.target.value = '';
    if (!file) return;
    setPhotoFile(file);
    setResultUrl(null);
    setStatus('idle');
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSeasonChange(next: Season) {
    setSeason(next);
    setCategory('all');
    setSelectedOutfitId(null);
  }

  function handleCategoryChange(next: CategoryFilter) {
    setCategory(next);
    setSelectedOutfitId(null);
  }

  async function handleTryOn() {
    if (!photoFile || !selectedOutfit) return;
    setStatus('loading');
    setErrorMsg(null);
    setResultUrl(null);

    try {
      const form = new FormData();
      form.append('photo', photoFile);
      form.append('outfitPrompt', selectedOutfit.prompt);
      form.append('outfitId', selectedOutfit.id);
      if (festiveScene) form.append('scene', sceneFor(selectedOutfit));

      const res = await fetch('/api/tryon', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong generating the image.');
      }

      setResultUrl(data.imageUrl);
      setStatus('done');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
      setStatus('error');
    }
  }

  const displayImage = resultUrl || photoPreview;

  const shareText = selectedOutfit
    ? `Check out my ${selectedOutfit.label} look from Style My Season!`
    : 'Check out my look from Style My Season!';

  const shareLinks = useMemo(() => {
    if (!resultUrl) return null;
    const url = encodeURIComponent(resultUrl);
    const text = encodeURIComponent(shareText);
    return {
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      pinterest: `https://www.pinterest.com/pin/create/button/?url=${url}&media=${url}&description=${text}`,
      email: `mailto:?subject=${encodeURIComponent('My Style My Season look')}&body=${text}%20${url}`
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultUrl, shareText]);

  async function handleNativeShare() {
    if (!resultUrl) return;
    setShareStatus('sharing');
    const shareData: ShareData = { title: 'My Style My Season look', text: shareText, url: resultUrl };

    try {
      // Best effort: attach the actual image so it can be posted directly
      // (Instagram Stories, Messages, etc.), not just linked.
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const file = new File([blob], 'style-my-season-look.png', { type: blob.type || 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ ...shareData, files: [file] });
        setShareStatus('idle');
        return;
      }
    } catch {
      // Fall through and try a link-only share instead.
    }

    try {
      await navigator.share(shareData);
      setShareStatus('idle');
    } catch {
      // User cancelled, or sharing isn't possible right now — not an error worth surfacing.
      setShareStatus('idle');
    }
  }

  return (
    <div data-season={season} className="page">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8l3.5 4L9 6l3 5 3-5 3.5 6L21 8l-1.6 10.2a1 1 0 0 1-1 .8H4.6a1 1 0 0 1-1-.8L2 8zm2.8 12.8h14.4v1.2H4.8v-1.2z" />
            </svg>
          </span>
          <span className="brand-word">
            <h1 style={{ font: 'inherit', margin: 0 }}>Style My Season</h1>
          </span>
        </div>
        <span className="kicker">
          Upload a photo, pick something from the rack, and see the outfit on you before you buy it,
          sew it, or talk yourself out of it.
        </span>

        <div className="season-toggle" role="group" aria-label="Season">
          <button aria-pressed={season === 'halloween'} onClick={() => handleSeasonChange('halloween')}>
            Halloween
          </button>
          <button aria-pressed={season === 'christmas'} onClick={() => handleSeasonChange('christmas')}>
            Christmas
          </button>
        </div>
      </header>

      <div className="studio">
        <div>
          <div
            className="booth"
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFilePicker();
              }
            }}
          >
            {displayImage ? (
              <img src={displayImage} alt={resultUrl ? 'You in the selected outfit' : 'Your uploaded photo'} />
            ) : (
              <div className="prompt">
                <strong>Step into the booth</strong>
                Tap to upload a clear, front-facing photo
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
          <div className="booth-label">
            {photoFile ? photoFile.name : 'JPG or PNG, one person, plain background works best'}
          </div>
        </div>

        <div>
          <div className="rail-heading">
            <h2>This year&rsquo;s rack</h2>
            <span className="rail-count">{outfits.length} pieces</span>
          </div>

          {categories.length > 1 && (
            <div className="category-filter" role="group" aria-label="Category">
              <button aria-pressed={category === 'all'} onClick={() => handleCategoryChange('all')}>
                All
              </button>
              {categories.map((c) => (
                <button key={c} aria-pressed={category === c} onClick={() => handleCategoryChange(c)}>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          )}

          <div className="rail">
            {outfits.map((outfit) => (
              <button
                key={outfit.id}
                className="garment"
                aria-pressed={selectedOutfitId === outfit.id}
                onClick={() => setSelectedOutfitId(outfit.id)}
              >
                <span className="garment-img">
                  <img src={outfit.preview || outfit.thumbnail} alt={outfit.label} loading="lazy" />
                  {!outfit.preview && <span className="garment-tag">preview</span>}
                </span>
                <span className="name">{outfit.label}</span>
              </button>
            ))}
          </div>

          <label className="scene-toggle">
            <input
              type="checkbox"
              checked={festiveScene}
              onChange={(e) => setFestiveScene(e.target.checked)}
            />
            <span>
              Set the {season === 'halloween' ? 'Halloween' : 'Christmas'} scene
              <em>
                {festiveScene
                  ? ' — puts you in a matching backdrop'
                  : ' — keeps your original background'}
              </em>
            </span>
          </label>

          <div className="action-row">
            <button
              className="try-btn"
              disabled={!photoFile || !selectedOutfit || status === 'loading'}
              onClick={handleTryOn}
            >
              {status === 'loading' ? 'Fitting...' : 'Try it on'}
            </button>

            {status === 'loading' && (
              <span className="status-text">This usually takes 10-20 seconds.</span>
            )}
            {status === 'error' && <span className="status-text error">{errorMsg}</span>}
          </div>

          {status === 'done' && resultUrl && shareLinks && (
            <div className="share-row">
              <a className="download-link" href={resultUrl} download target="_blank" rel="noreferrer">
                Download this look
              </a>

              {canNativeShare && (
                <button
                  type="button"
                  className="share-btn"
                  onClick={handleNativeShare}
                  disabled={shareStatus === 'sharing'}
                >
                  <ShareIcon />
                  {shareStatus === 'sharing' ? 'Sharing…' : 'Share'}
                </button>
              )}

              <span className="share-divider" aria-hidden="true" />

              <a
                className="icon-btn"
                href={shareLinks.x}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on X"
                title="Share on X"
              >
                <XIcon />
              </a>
              <a
                className="icon-btn"
                href={shareLinks.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on Facebook"
                title="Share on Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                className="icon-btn"
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
              >
                <WhatsAppIcon />
              </a>
              <a
                className="icon-btn"
                href={shareLinks.pinterest}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on Pinterest"
                title="Share on Pinterest"
              >
                <PinterestIcon />
              </a>
              <a className="icon-btn" href={shareLinks.email} aria-label="Share by email" title="Share by email">
                <MailIcon />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3.6a1 1 0 0 0-1.7-.7l-4 4A1 1 0 0 0 8 8.6h2.2V15a1 1 0 1 0 2 0V8.6H12l1-1V3.6zM6 10a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2a1 1 0 1 0 0 2h2v7H6v-7h2a1 1 0 0 0 0-2H6z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2H21.5l-7.5 8.57L22.8 22h-6.9l-5.4-6.98L4.3 22H1.04l8.03-9.18L1.5 2h7.07l4.88 6.4L18.244 2zm-1.21 18h1.83L7.06 4h-1.9l11.87 16z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 9.5V7.6c0-.9.2-1.3 1.4-1.3H17V3h-2.7C11.3 3 10 4.6 10 7.3v2.2H8V13h2v8h4v-8h2.6l.4-3.5H14z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1s-.6.8-.7.9c-.1.1-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4c0-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.4 3.8 3.4.5.2.9.4 1.3.5.5.2 1 .1 1.4-.1.4-.2 1.4-.6 1.6-1.1.2-.5.2-.9.1-1.1 0-.1-.2-.2-.4-.3z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a10 10 0 0 0-3.6 19.3c0-.8 0-1.7.2-2.5l1.4-6s-.3-.7-.3-1.7c0-1.6 1-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-.9 3.9-.3 1.1.6 2.1 1.7 2.1 2.1 0 3.5-2.6 3.5-5.8 0-2.4-1.6-4.2-4.6-4.2-3.3 0-5.4 2.5-5.4 5.2 0 .9.3 1.6.7 2.1.2.2.2.3.1.5l-.3 1c-.1.3-.3.4-.6.3-1.6-.7-2.3-2.4-2.3-4.4 0-3.3 2.8-7.2 8.2-7.2 4.4 0 7.3 3.2 7.3 6.6 0 4.5-2.5 7.9-6.1 7.9-1.2 0-2.4-.7-2.7-1.4l-.8 3c-.2.9-.6 1.8-1 2.5A10 10 0 1 0 12 2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.4 2 7.1 5.6a1 1 0 0 0 1 0L19.6 7H4.4zM4 17h16V8.9l-6.9 5.4a3 3 0 0 1-3.2 0L4 8.9V17z" />
    </svg>
  );
}
