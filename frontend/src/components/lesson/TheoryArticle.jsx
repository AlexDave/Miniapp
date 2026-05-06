import { Box, Text, VStack } from '@chakra-ui/react';
import TheoryStep from './TheoryStep';
import { paragraphPrefix } from '../../utils/theorySections';

function calloutToStep(callout) {
  const prefix = callout.kind === 'warning' ? '⚠️ ' : '';
  return {
    type: 'tip',
    content: prefix + callout.text,
  };
}

export default function TheoryArticle({ sections }) {
  if (!sections?.length) {
    return (
      <Text fontSize="sm" color="mutedFg">
        Текст материала пока не добавлен.
      </Text>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {sections.map((sec, si) => (
        <Box key={si}>
          {sec.title ? (
            <Text fontSize="sm" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.200' }} mb={3}>
              {sec.title}
            </Text>
          ) : null}
          <VStack spacing={3} align="stretch">
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
              <TheoryStep key={`c-${ci}`} step={calloutToStep(c)} />
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}
