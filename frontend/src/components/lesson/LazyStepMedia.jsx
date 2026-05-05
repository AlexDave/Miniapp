import { useState, useEffect, useRef } from 'react';
import { Box, Image, AspectRatio, Text } from '@chakra-ui/react';
import { resolveLessonMediaUrl } from '../../utils/lessonMediaUrl';

/** YouTube в шаге теории: embed/watch — в <video> не воспроизводится, нужен iframe */
export function toYoutubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const u = url.trim();
  if (/youtube\.com\/embed\//i.test(u) || /youtube-nocookie\.com\/embed\//i.test(u)) return u;
  const watch = u.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/i);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  return '';
}

function useInView(rootMargin = '120px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { rootMargin, threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);
  return [ref, inView];
}

export default function LazyStepMedia({
  mediaType,
  mediaUrl,
  posterUrl,
  imageUrl,
  altText,
}) {
  const [failed, setFailed] = useState(false);
  const [ref, inView] = useInView();
  const resolved = resolveLessonMediaUrl(mediaUrl);
  const resolvedPoster = posterUrl ? resolveLessonMediaUrl(posterUrl) : '';
  const fallbackImg = imageUrl ? resolveLessonMediaUrl(imageUrl) : resolvedPoster;

  const alt = altText || 'Иллюстрация к шагу';

  if (!mediaUrl || failed) {
    if (fallbackImg) {
      return (
        <AspectRatio ratio={16 / 9} borderRadius="lg" overflow="hidden" mb={2}>
          <Image src={fallbackImg} alt={alt} objectFit="cover" loading="lazy" />
        </AspectRatio>
      );
    }
    if (failed) {
      return (
        <Box mb={2} py={3} px={2} bg="gray.100" borderRadius="lg" textAlign="center">
          <Text fontSize="xs" color="gray.600">
            Видео не загрузилось — попробуйте позже или проверьте сеть.
          </Text>
        </Box>
      );
    }
    return null;
  }

  if (mediaType === 'gif') {
    return (
      <Box ref={ref} borderRadius="lg" overflow="hidden" mb={2}>
        {inView ? (
          <Image
            src={resolved}
            alt={alt}
            w="100%"
            maxH="240px"
            objectFit="contain"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <AspectRatio ratio={16 / 9} maxH="200px">
            <Box bg="gray.100" borderRadius="md" />
          </AspectRatio>
        )}
      </Box>
    );
  }

  if (mediaType === 'image') {
    return (
      <Box ref={ref} borderRadius="lg" overflow="hidden" mb={2}>
        {inView ? (
          <Image
            src={resolved}
            alt={alt}
            w="100%"
            maxH="220px"
            objectFit="contain"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <AspectRatio ratio={16 / 9} maxH="200px">
            <Box bg="gray.100" borderRadius="md" />
          </AspectRatio>
        )}
      </Box>
    );
  }

  if (mediaType === 'video') {
    const ytEmbed = toYoutubeEmbedUrl(resolved);
    if (ytEmbed) {
      return (
        <Box ref={ref} mb={2}>
          <AspectRatio ratio={16 / 9} borderRadius="lg" overflow="hidden">
            {inView ? (
              <iframe
                src={ytEmbed}
                title={alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            ) : (
              <Box bg="gray.100" w="100%" h="100%" />
            )}
          </AspectRatio>
        </Box>
      );
    }
    return (
      <Box ref={ref} mb={2}>
        <AspectRatio ratio={16 / 9} borderRadius="lg" overflow="hidden">
          {inView ? (
            <video
              src={resolved}
              poster={resolvedPoster || undefined}
              muted
              playsInline
              loop
              autoPlay
              controls
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setFailed(true)}
            />
          ) : (
            <Box bg="gray.100" w="100%" h="100%" />
          )}
        </AspectRatio>
      </Box>
    );
  }

  return null;
}
