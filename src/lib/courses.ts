import { CourseItem } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_COURSES = 'djantahub_cached_courses';

export const FALLBACK_COURSES: CourseItem[] = [
  {
    id: 'course-1',
    title: 'Maîtriser les Outils d’IA sur Smartphone',
    category: 'Intelligence Artificielle',
    duration: '15 min',
    description: 'Techniques pour formuler des instructions précises, rédiger des courriers impeccables et synthétiser des documents lourds sans ordinateur.',
    modules: [
      'Principes de base du prompt appliqué aux démarches administratives',
      'Structuration de lettres de motivation et mémoires académiques',
      'Synthèse rapide de cours et création de fiches de révision'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
    isPremium: false
  },
  {
    id: 'course-2',
    title: 'Vente Professionnelle sur WhatsApp à Lomé',
    category: 'Commerce & Freelance',
    duration: '20 min',
    description: 'Comment transformer ses statuts WhatsApp en vitrine commerciale crédible, instaurer la confiance et formaliser ses ventes par reçu.',
    modules: [
      'Scénarisation des statuts WhatsApp sans surcharger ses contacts',
      'Gestion des relances commerciales avec courtoisie',
      'Émission systématique de reçus pour sécuriser les règlements T-Money'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    isPremium: true
  },
  {
    id: 'course-3',
    title: 'Lancer une Prestation de Micro-Services à 0 FCFA',
    category: 'Entrepreneuriat Étudiant',
    duration: '15 min',
    description: 'Méthodologie pour proposer des prestations de mise en page, correction de documents et formalisation administrative depuis son téléphone.',
    modules: [
      'Sélection des 3 prestations les plus demandées sur le marché local',
      'Tarification équilibrée en FCFA sans dévaloriser son savoir-faire',
      'Acquisition des 10 premiers clients dans son cercle universitaire'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    isPremium: true
  }
];

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}

export function getYouTubeThumbnailUrl(url?: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export async function fetchCourses(): Promise<CourseItem[]> {
  // 1. Lire d'abord le cache local (pour affichage instantané sans attendre le réseau)
  let cached: CourseItem[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSES);
    if (raw) {
      cached = JSON.parse(raw);
    }
  } catch {
    // ignore
  }

  // 2. Si Supabase est configuré, tenter de rafraîchir en arrière-plan
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: CourseItem[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category || 'Général',
          duration: item.duration || '15 min',
          description: item.description || '',
          videoUrl: item.video_url || undefined,
          isPremium: Boolean(item.is_premium)
        }));

        localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(mapped));
        return mapped;
      }
    } catch {
      // mode hors-ligne ou erreur réseau, on utilise le cache
    }
  }

  return cached.length > 0 ? cached : FALLBACK_COURSES;
}
