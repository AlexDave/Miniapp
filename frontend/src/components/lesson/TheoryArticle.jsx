import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { paragraphPrefix } from '../../utils/theorySections';

function Callout({ kind, text }) {
  const isWarning = kind === 'warning';
  return (
    <Box
      px={4}
      py={3}
      borderLeft="3px solid"
      borderColor={isWarning ? 'orange.400' : 'yellow.400'}
      bg={isWarning ? 'orange.50' : 'yellow.50'}
      _dark={{
        bg: isWarning ? 'orange.900' : 'yellow.900',
        borderColor: isWarning ? 'orange.400' : 'yellow.400',
      }}
      borderRadius="0 8px 8px 0"
    >
      <HStack align="flex-start" spacing={2}>
        {isWarning
          ? <AlertTriangle size={14} color="#C05621" style={{ marginTop: 3, flexShrink: 0 }} />
          : <Lightbulb size={14} color="#B7791F" style={{ marginTop: 3, flexShrink: 0 }} />
        }
        <Text fontSize="sm" lineHeight="1.65" color="gray.700" _dark={{ color: 'gray.200' }}>
          {text}
        </Text>
      </HStack>
    </Box>
  );
}

export default function TheoryArticle({ sections }) {
  if (!sections?.length) {
    return (
      <Text fontSize="sm" color="gray.500">
        Текст материала пока не добавлен.
      </Text>
    );
  }

  return (
    <VStack spacing={5} align="stretch">
      {sections.map((sec, si) => (
        <VStack key={si} spacing={3} align="stretch">
          {sec.title ? (
            <Text fontSize="sm" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.200' }}>
              {sec.title}
            </Text>
          ) : null}
          {(sec.paragraphs ?? []).map((p, pi) => (
            <Text
              key={pi}
              fontSize="md"
              lineHeight="1.75"
              color="gray.700"
              _dark={{ color: 'gray.200' }}
            >
              {paragraphPrefix(p.type)}
              {p.text}
            </Text>
          ))}
          {(sec.callouts ?? []).map((c, ci) => (
            <Callout key={`c-${ci}`} kind={c.kind} text={c.text} />
          ))}
        </VStack>
      ))}
    </VStack>
  );
}
