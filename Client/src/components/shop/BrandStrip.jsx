import { axiosClient } from '../../AxiosClient/axios';
import './brandstrip.css';
import { useEffect, useState, useMemo, useRef } from 'react';

export default function BrandStrip() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dupCount, setDupCount] = useState(2); // default duplicate factor
  const trackRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const fetchSponsors = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/api/sponsors`);
        if (!ignore) {
          const data = Array.isArray(res.data?.data) ? res.data.data : [];
            // filter active and with some visual asset or name
          setSponsors(data.filter(s => s.isActive !== false));
        }
      } catch (e) {
        if (!ignore) setError('Unable to load brands');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchSponsors();
    return () => { ignore = true };
  }, []);

  // Compute duplicated array based on required duplication factor
  const loopSponsors = useMemo(() => {
    if (sponsors.length === 0) return [];
    const arr = [];
    for (let i = 0; i < dupCount; i++) arr.push(...sponsors);
    return arr;
  }, [sponsors, dupCount]);

  // Recalculate duplication count to ensure track width > container width * 2 (for smooth loop)
  useEffect(() => {
    if (!trackRef.current || !measureRef.current || sponsors.length === 0) return;
    // Use a microtask to allow DOM update
    const rAF = requestAnimationFrame(() => {
      try {
        if (!measureRef.current || !trackRef.current) return;
        const containerWidth = measureRef.current.offsetWidth;
        // Approx width per item: take first image element
        const itemEls = trackRef.current.querySelectorAll('.brand-item');
        if (!itemEls.length) return;
        const firstWidth = itemEls[0].offsetWidth || 150;
        const baseTrackWidth = firstWidth * sponsors.length;
        // Need total width at least 2 * container width for continuous effect
        const required = containerWidth * 2;
        const neededFactor = Math.ceil(required / baseTrackWidth);
        setDupCount(Math.max(2, neededFactor));
      } catch (e) {
        // Silent fail; retain previous duplication count
      }
    });
    return () => cancelAnimationFrame(rAF);
  }, [sponsors]);

  // Recalculate on resize
  useEffect(() => {
    if (!measureRef.current) return;
    const ro = new ResizeObserver(() => {
      if (sponsors.length === 0) return;
      if (!measureRef.current || !trackRef.current) return;
      try {
        const containerWidth = measureRef.current.offsetWidth;
        const itemEls = trackRef.current.querySelectorAll('.brand-item') || [];
        if (!itemEls.length) return;
        const firstWidth = itemEls[0].offsetWidth || 150;
        const baseTrackWidth = firstWidth * sponsors.length;
        const required = containerWidth * 2;
        const neededFactor = Math.ceil(required / baseTrackWidth);
        setDupCount(Math.max(2, neededFactor));
      } catch (e) {
        // ignore measurement errors
      }
    });
    if (measureRef.current) ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, [sponsors]);

  return (
    <section className="relative bg-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center text-sm font-semibold tracking-widest text-neutral-600 mb-10">
          {loading ? 'LOADING BRANDS…' : error ? 'BRANDS UNAVAILABLE' : sponsors.length > 0 ? 'TRUSTED BY OUR SPONSORS' : 'NO SPONSORS YET'}
        </h2>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      <div className="brand-marquee relative" ref={measureRef}>
        <div className="brand-track" ref={trackRef}>
          {loading && (
            <div className="h-14 flex items-center gap-4 px-6 text-xs text-neutral-500">
              <span className="animate-pulse">Loading…</span>
            </div>
          )}
          {!loading && !error && sponsors.length > 0 && loopSponsors.map((s, i) => {
            const label = s.name || 'Sponsor';
            const src = s.logoUrl || `https://placehold.co/160x60?text=${encodeURIComponent(label)}`;
            return (
              <div key={s._id ? s._id + '-' + i : label + '-' + i} className="brand-item grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all">
                <img
                  src={src}
                  alt={`${label} logo`}
                  loading="lazy"
                  className="h-10 md:h-14 object-contain"
                  onError={(e) => { e.currentTarget.src = `https://placehold.co/160x60?text=${encodeURIComponent(label)}`; e.currentTarget.style.opacity = '0.4'; }}
                />
              </div>
            );
          })}
          {!loading && error && (
            <div className="h-14 flex items-center px-6 text-xs text-red-500">{error}</div>
          )}
        </div>
      </div>
    </section>
  );
}

