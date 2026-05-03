import { Navigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { useProfile } from '../../hooks/useProfile';

/** Пока анкета не завершена — редирект на мастер знакомства. */
export default function OnboardingGate({ children }) {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Center minH="40vh">
        <Spinner color="purple.500" size="lg" />
      </Center>
    );
  }

  if (profile && profile.onboardingCompleted !== true) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
