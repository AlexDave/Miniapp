import {
  Box,
  Container,
  Flex,
  Grid,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Moon, Sun, PawPrint } from 'lucide-react';
import HomeHeaderSummary from './HomeHeaderSummary';

const HEADER_PY = 3;

/**
 * Единый хедер приложения: логотип | плашка имя / серия / косточки | действия.
 */
export default function SiteHeader({ toggleColorMode, colorMode }) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');

  return (
    <Box
      as="header"
      borderBottom="1px solid"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={20}
      backdropFilter="blur(10px)"
      bg={headerBg}
    >
      <Container maxW="container.xl" px={4}>
        <Grid
          templateColumns="minmax(0,1fr) auto minmax(0,1fr)"
          alignItems="center"
          columnGap={{ base: 1, sm: 2 }}
          py={HEADER_PY}
        >
          <Box minW={0}>
            <Flex align="center" gap={3} minW={0}>
              <Flex
                w={8}
                h={8}
                bg="purple.500"
                borderRadius="full"
                align="center"
                justify="center"
                flexShrink={0}
                aria-hidden
              >
                <PawPrint size={20} color="white" strokeWidth={2} aria-hidden />
              </Flex>
              <Text fontSize="xl" fontWeight="bold" color="purple.600" noOfLines={1}>
                DogCourse
              </Text>
            </Flex>
          </Box>

          <Box justifySelf="center" minW={0}>
            <HomeHeaderSummary variant="inline" />
          </Box>

          <Flex align="center" gap={2} justify="flex-end">
            <IconButton
              icon={colorMode === 'light' ? <Moon size={22} /> : <Sun size={22} />}
              variant="ghost"
              size="lg"
              minW="44px"
              minH="44px"
              color={iconColor}
              onClick={toggleColorMode}
              aria-label="Переключить светлую или тёмную тему"
            />
          </Flex>
        </Grid>
      </Container>
    </Box>
  );
}
