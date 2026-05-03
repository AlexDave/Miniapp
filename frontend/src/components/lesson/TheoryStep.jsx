import { Box, Text, HStack, Image, AspectRatio } from '@chakra-ui/react';
import { Lightbulb, Info, AlertCircle } from 'lucide-react';
import LazyStepMedia from './LazyStepMedia';

const STEP_STYLES = {
  text: {
    bg: 'white',
    border: '1px solid',
    borderColor: 'gray.200',
    darkBg: 'gray.700',
    darkBorderColor: 'gray.600',
    icon: null,
  },
  tip: {
    bg: 'yellow.50',
    border: '1px solid',
    borderColor: 'yellow.200',
    darkBg: 'yellow.900',
    darkBorderColor: 'yellow.700',
    icon: <Lightbulb size={16} color="#B7791F" />,
    label: 'Совет',
    labelColor: 'yellow.700',
    darkLabelColor: 'yellow.300',
  },
  card: {
    bg: 'blue.50',
    border: '1px solid',
    borderColor: 'blue.200',
    darkBg: 'blue.900',
    darkBorderColor: 'blue.700',
    icon: <Info size={16} color="#2B6CB0" />,
    label: 'Важно',
    labelColor: 'blue.700',
    darkLabelColor: 'blue.300',
  },
  diagram: {
    bg: 'gray.50',
    border: '1px solid',
    borderColor: 'gray.300',
    darkBg: 'gray.700',
    darkBorderColor: 'gray.600',
    icon: <AlertCircle size={16} color="#4A5568" />,
    label: 'Схема',
    labelColor: 'gray.600',
    darkLabelColor: 'gray.300',
  },
  image: {
    bg: 'transparent',
    border: 'none',
    borderColor: 'transparent',
    darkBg: 'transparent',
    darkBorderColor: 'transparent',
    icon: null,
  },
};

function StepImage({ imageUrl, altText, role }) {
  if (!imageUrl) return null;

  if (role === 'hero') {
    return (
      <AspectRatio ratio={16 / 9} borderRadius="lg" overflow="hidden" mb={2}>
        <Image src={imageUrl} alt={altText ?? ''} objectFit="cover" loading="lazy" />
      </AspectRatio>
    );
  }

  return (
    <Box borderRadius="lg" overflow="hidden" mb={2}>
      <Image
        src={imageUrl}
        alt={altText ?? ''}
        w="100%"
        maxH="220px"
        objectFit="contain"
        loading="lazy"
      />
      {altText && role === 'caption' && (
        <Text fontSize="xs" color="mutedFg" textAlign="center" mt={1}>{altText}</Text>
      )}
    </Box>
  );
}

function DiagramContent({ content }) {
  try {
    const data = JSON.parse(content);

    if (data.type === 'sequence') {
      return (
        <Box>
          {data.items?.map((item, i) => (
            <HStack key={i} spacing={2} mb={i < data.items.length - 1 ? 1 : 0}>
              <Box
                w="22px"
                h="22px"
                bg="blue.500"
                color="white"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
                fontWeight="bold"
                flexShrink={0}
              >
                {i + 1}
              </Box>
              <Text fontSize="sm">{item}</Text>
            </HStack>
          ))}
        </Box>
      );
    }

    if (data.type === 'position' || data.type === 'distance') {
      return (
        <Box p={2} bg="white" _dark={{ bg: 'gray.700', borderColor: 'gray.600' }} borderRadius="md" border="1px dashed" borderColor="gray.300">
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }} fontStyle="italic">{data.label}</Text>
        </Box>
      );
    }

    return <Text fontSize="sm">{data.label ?? content}</Text>;
  } catch {
    return <Text fontSize="sm">{content}</Text>;
  }
}

export default function TheoryStep({ step }) {
  const style = STEP_STYLES[step.type] ?? STEP_STYLES.text;
  const isImageOnly = step.type === 'image';

  if (isImageOnly) {
    return (
      <Box>
        <StepImage imageUrl={step.image_url} altText={step.alt_text} role={step.image_role ?? 'hero'} />
        {step.content && (
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }} textAlign="center" lineHeight="1.6">{step.content}</Text>
        )}
      </Box>
    );
  }

  return (
    <Box
      p={3}
      bg={style.bg}
      _dark={{ bg: style.darkBg, borderColor: style.darkBorderColor }}
      border={style.border}
      borderColor={style.borderColor}
      borderRadius="lg"
    >
      {style.icon && (
        <HStack mb={1}>
          {style.icon}
          <Text fontSize="xs" fontWeight="semibold" color={style.labelColor} _dark={{ color: style.darkLabelColor }}>
            {style.label}
          </Text>
        </HStack>
      )}
      {step.media_url && step.media_type && (
        <LazyStepMedia
          mediaType={step.media_type}
          mediaUrl={step.media_url}
          posterUrl={step.poster_url}
          imageUrl={step.image_url}
          altText={step.alt_text}
        />
      )}
      {step.image_url && step.image_role === 'hero' && !step.media_url && (
        <StepImage imageUrl={step.image_url} altText={step.alt_text} role="hero" />
      )}
      {step.type === 'diagram' ? (
        <DiagramContent content={step.content} />
      ) : (
        <Text fontSize="sm" lineHeight="1.6">{step.content}</Text>
      )}
      {step.image_url && step.image_role !== 'hero' && (
        <Box mt={2}>
          <StepImage imageUrl={step.image_url} altText={step.alt_text} role={step.image_role ?? 'inline'} />
        </Box>
      )}
    </Box>
  );
}
