import { notFound } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import type { Metadata } from 'next';
import type { XRayResult } from '../../../../lib/xray/types';
import XRayResultPage from './XRayResultPage';

async function getResult(id: string) {
  const { data } = await supabase
    .from('xray_results')
    .select('result_data')
    .eq('id', id)
    .maybeSingle();
  return data;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const data = await getResult(id);

  if (!data) return {};

  const result: XRayResult = data.result_data;
  const { identity, listing } = result;
  const title = [identity.year, identity.brand, identity.player, identity.parallel]
    .filter(Boolean).join(' ') + ' — Card X-Ray';
  const description = `X-Ray analysis of ${identity.player || listing.title}. See rarity rainbow, sold price comps, and card identity.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://slabstreet.com/xray/result/${id}`,
      images: listing.imageUrl ? [{ url: listing.imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: listing.imageUrl ? [listing.imageUrl] : [],
    },
    alternates: { canonical: `https://slabstreet.com/xray/result/${id}` },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getResult(id);

  if (!data) notFound();

  const result: XRayResult = data.result_data;
  return <XRayResultPage result={result} id={id} />;
}
