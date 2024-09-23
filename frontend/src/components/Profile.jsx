import React, { useState, useRef } from 'react';
import { Box, Avatar, Heading, Text, Button, VStack, Input, HStack, IconButton } from '@chakra-ui/react';
import { FaEdit } from 'react-icons/fa';

function Profile() {
  const [petName, setPetName] = useState('Ваш питомец'); // Кличка питомца
  const [avatarUrl, setAvatarUrl] = useState(null); // URL загруженной аватарки
  const [avatarPreview, setAvatarPreview] = useState(null); // Предпросмотр аватарки
  const [isEditingName, setIsEditingName] = useState(false); // Режим редактирования имени
  const fileInputRef = useRef(); // Референс для инпута загрузки файла

  // Обработчик загрузки аватарки
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик для изменения клички питомца
  const handlePetNameChange = (event) => {
    setPetName(event.target.value);
  };

  // Обработчик нажатия на аватарку для загрузки изображения
  const handleAvatarClick = () => {
    fileInputRef.current.click(); // Имитируем нажатие на скрытый input для загрузки файла
  };

  // Обработчик сохранения изменений имени питомца
  const savePetName = () => {
    setIsEditingName(false); // Отключаем режим редактирования
  };

  // Обработчик покупки полного пакета курсов
  const handleBuyFullPackage = () => {
    alert('Полный пакет курсов приобретен!');
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh">
      <VStack spacing={6} align="center">
        {/* Аватарка пользователя */}
        <Avatar
          size="2xl"
          src={avatarPreview || avatarUrl}
          name={petName}
          onClick={handleAvatarClick} // Нажатие на аватарку
          cursor="pointer"
        />

        {/* Скрытый input для загрузки файла */}
        <Input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          ref={fileInputRef}
          style={{ display: 'none' }} // Скрываем инпут
        />

        {/* Кличка питомца и кнопка редактирования */}
        <HStack>
          {isEditingName ? (
            <Input
              value={petName}
              onChange={handlePetNameChange}
              placeholder="Введите кличку питомца"
              bg="white"
              maxW="300px"
              borderColor="purple.200"
              onBlur={savePetName} // Сохранить при выходе из поля
              autoFocus
            />
          ) : (
            <>
              <Heading size="lg" color="purple.700">{petName}</Heading>
              <IconButton
                icon={<FaEdit />}
                colorScheme="purple"
                size="sm"
                onClick={() => setIsEditingName(true)} // Включаем режим редактирования
                aria-label="Редактировать кличку"
              />
            </>
          )}
        </HStack>

        {/* Кнопка для покупки полного пакета курсов */}
        <Button colorScheme="purple" size="lg" onClick={handleBuyFullPackage}>
          Купить полный пакет курсов
        </Button>
      </VStack>
    </Box>
  );
}

export default Profile;
