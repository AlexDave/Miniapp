import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Skeleton,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRoutes, useSelectRoute, usePauseRoute, useResumeRoute } from '../../hooks/useRoutes';
import RouteCard from './RouteCard';
import RouteProgressMap from './RouteProgressMap';

export default function RoutesScreen() {
  const toast = useToast();
  const { data, isLoading, isError, error, refetch, isFetching } = useRoutes();
  const routes = data?.routes ?? [];
  const routePaused = data?.route_paused === true;
  const isPro = data?.is_pro === true;
  const selectRoute = useSelectRoute();
  const pauseRoute = usePauseRoute();
  const resumeRoute = useResumeRoute();
  const muted = useColorModeValue('gray.600', 'gray.400');
  const [selectingKey, setSelectingKey] = useState(null);

  const selectedRoute = routes.find((r) => r.is_selected);

  async function handleSelect(routeKey) {
    const r = routes.find((x) => x.key === routeKey);
    if (r?.requires_pro && !isPro) {
      toast({
        title: 'Нужен Pro',
        description: 'Оформите подписку в профиле (Telegram Stars), затем выберите маршрут снова.',
        status: 'info',
        duration: 5000,
      });
      return;
    }
    setSelectingKey(routeKey);
    try {
      await selectRoute.mutateAsync(routeKey);
    } catch (e) {
      if (e?.response?.status === 403) {
        toast({
          title: 'Нужен Pro',
          description: e?.response?.data?.error || 'Маршрут только по подписке.',
          status: 'warning',
        });
      }
    } finally {
      setSelectingKey(null);
    }
  }

  if (isLoading) {
    return (
      <Box px={2} py={6}>
        <VStack spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="140px" borderRadius="2xl" w="100%" />
          ))}
        </VStack>
      </Box>
    );
  }

  if (isError) {
    const msg =
      error?.response?.data?.error ||
      error?.message ||
      'Не удалось загрузить маршруты';
    return (
      <Box pb={24} px={2}>
        <VStack spacing={4} py={10} align="stretch">
          <Text fontSize="lg" fontWeight="bold">Маршруты</Text>
          <Box textAlign="center" py={6}>
            <Text color="red.500" fontSize="sm" mb={3}>
              {msg}
            </Text>
            <Button
              size="sm"
              colorScheme="purple"
              onClick={() => refetch()}
              isLoading={isFetching}
            >
              Повторить
            </Button>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <Box pb={24} px={2}>
      <VStack spacing={5} align="stretch">
        <Button
          as={RouterLink}
          to="/profile"
          variant="ghost"
          size="sm"
          alignSelf="flex-start"
          leftIcon={<ArrowLeft size={16} />}
        >
          Профиль
        </Button>
        <Box>
          <Text fontSize="lg" fontWeight="bold">Маршруты</Text>
          <Text fontSize="sm" color={muted} mt={1}>
            Персональный путь по навыкам вашей собаки
          </Text>
          <Text fontSize="xs" color={muted} mt={2}>
            Чтобы сменить маршрут, выберите другой в списке ниже.
          </Text>
        </Box>

        {routePaused && selectedRoute && (
          <Box
            px={3}
            py={3}
            bg="orange.50"
            borderRadius="xl"
            border="1px solid"
            borderColor="orange.200"
            _dark={{
              bg: 'orange.900',
              borderColor: 'orange.600',
            }}
          >
            <Text fontSize="sm" fontWeight="semibold" color="orange.800" mb={2} _dark={{ color: 'orange.100' }}>
              Маршрут на паузе
            </Text>
            <Text fontSize="xs" color={muted} mb={3}>
              Напоминания и фокус по шагам приостановлены. Прогресс сохраняется.
            </Text>
            <Button
              size="sm"
              colorScheme="orange"
              borderRadius="lg"
              isLoading={resumeRoute.isLoading}
              onClick={() => resumeRoute.mutate()}
            >
              Продолжить
            </Button>
          </Box>
        )}

        {selectedRoute && (
          <Box
            px={3}
            py={2.5}
            bg="purple.50"
            borderRadius="xl"
            border="1px solid"
            borderColor="purple.100"
            opacity={routePaused ? 0.85 : 1}
            _dark={{
              bg: 'purple.900',
              borderColor: 'purple.600',
            }}
          >
            <HStack spacing={2} align="flex-start" mb={2}>
              <Text fontSize="lg" aria-hidden>{selectedRoute.icon}</Text>
              <Box flex={1}>
                <Text
                  fontSize="xs"
                  color="purple.600"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  _dark={{ color: 'purple.200' }}
                >
                  Ваш маршрут
                </Text>
                <Text fontSize="sm" fontWeight="semibold" _dark={{ color: 'gray.100' }}>
                  {selectedRoute.title}
                </Text>
                <Box mt={1.5}>
                  <RouteProgressMap route={selectedRoute} variant="block" />
                </Box>
              </Box>
              <Text fontSize="sm" color="purple.600" fontWeight="bold" _dark={{ color: 'purple.200' }}>
                {selectedRoute.progress_pct ?? 0}%
              </Text>
            </HStack>
            {!routePaused && (
              <Button
                size="xs"
                variant="outline"
                colorScheme="purple"
                borderRadius="md"
                isLoading={pauseRoute.isLoading}
                onClick={() => pauseRoute.mutate()}
              >
                Поставить на паузу
              </Button>
            )}
          </Box>
        )}

        <VStack spacing={3} align="stretch">
          {routes.map((route, i) => (
            <motion.div
              key={route.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <RouteCard
                route={route}
                isSelected={route.is_selected}
                isSelecting={selectingKey === route.key}
                isProUser={isPro}
                onSelect={() => handleSelect(route.key)}
              />
            </motion.div>
          ))}
        </VStack>

        {routes.length === 0 && (
          <Box textAlign="center" py={12} px={2}>
            <Text fontSize="3xl" mb={3}>🗺️</Text>
            <Text color={muted} fontSize="sm" mb={2}>
              Список маршрутов пуст.
            </Text>
            {import.meta.env.DEV && (
              <Text fontSize="xs" color={muted}>
                Заполните БД: в папке backend выполните npm run db:seed
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
