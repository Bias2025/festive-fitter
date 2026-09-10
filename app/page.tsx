'use client';

import { useMemo, useRef, useState } from 'react';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const seasonOutfits = useMemo(() => outfitsBySeason(season), [season]);
  const categories = useMemo(() => categoriesInSeason(season), [season]);
  const outfits = useMemo(
    () => (category === 'all' ? seasonOutfits : seasonOutfits.filter((o) => o.category === category)),
    [seasonOutfits, category]
  );
  const selectedOutfit = OUTFITS.find((o) => o.id === selectedOutfitId) || null;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
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

  return (
    <div data-season={season} className="page">
      <header className="header">
        <span className="kicker">
          Upload a photo, pick something from the rack, and see the outfit on you before you buy it,
          sew it, or talk yourself out of it.
        </span>
        <h1>
          StyleMy<span className="accent">Season</span>
        </h1>

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
          <div className="booth" onClick={() => fileInputRef.current?.click()}>
            {displayImage ? (
              <img src={displayImage} alt={resultUrl ? 'You in the selected outfit' : 'Your uploaded photo'} />
            ) : (
              <div className="prompt">
                <strong>Step into the booth</strong>
                Tap to upload a clear, front-facing photo
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} />
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
            {status === 'done' && resultUrl && (
              <a className="download-link" href={resultUrl} download target="_blank" rel="noreferrer">
                Download this look
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
